// backend/src/routes/auth.js - Authentication Routes

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const { prisma } = require('../config/database');
const { validate, schemas } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');
const { sendEmail } = require('../utils/email');
const { generateTokens, verifyRefreshToken } = require('../utils/jwt');

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again later.',
    retryAfter: '15 minutes'
  }
});

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', validate(schemas.registerUser), async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, organizationId } = req.body;

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true, subscriptionStatus: true, name: true }
    });

    if (!organization) {
      return res.status(400).json({
        success: false,
        message: 'Organization not found'
      });
    }

    if (organization.subscriptionStatus !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Organization subscription is not active'
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        organizationId
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
        phone,
        organizationId,
        role: 'MEMBER'
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    const { accessToken, refreshToken } = generateTokens(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        loginCount: { increment: 1 }
      }
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    logger.info(`User registered: ${email} for organization ${organization.name}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userWithoutPassword,
        accessToken
      }
    });

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', authLimiter, validate(schemas.loginUser), async (req, res) => {
  try {
    const { email, password, organizationSlug } = req.body;

    let whereClause = {
      email: email.toLowerCase(),
      isActive: true
    };

    if (organizationSlug) {
      whereClause.organization = {
        slug: organizationSlug,
        subscriptionStatus: 'ACTIVE'
      };
    }

    const user = await prisma.user.findFirst({
      where: whereClause,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            subscriptionStatus: true
          }
        }
      }
    });

    if (!user) {
      logger.warn(`Failed login attempt for email: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed attempts'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      const failedAttempts = user.failedLoginAttempts + 1;
      const lockAccount = failedAttempts >= 5;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: failedAttempts,
          lockedUntil: lockAccount ? new Date(Date.now() + 30 * 60 * 1000) : null
        }
      });

      logger.warn(`Failed login attempt ${failedAttempts} for user: ${user.id}`);

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (user.organization.subscriptionStatus !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Organization subscription is not active'
      });
    }

    const { accessToken, refreshToken } = generateTokens(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        loginCount: { increment: 1 },
        failedLoginAttempts: 0,
        lockedUntil: null
      }
    });

    const { passwordHash, failedLoginAttempts, lockedUntil, ...userWithoutSensitiveData } = user;

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    logger.info(`User logged in: ${user.email} (${user.id})`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutSensitiveData,
        accessToken
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not provided'
      });
    }

    const decoded = verifyRefreshToken(refreshToken);
    
    const user = await prisma.user.findUnique({
      where: { 
        id: decoded.userId,
        isActive: true
      },
      include: {
        organization: {
          select: {
            id: true,
            subscriptionStatus: true
          }
        }
      }
    });

    if (!user || user.organization.subscriptionStatus !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      data: {
        accessToken
      }
    });

  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Token refresh failed'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    res.clearCookie('refreshToken');

    logger.info(`User logged out: ${req.user.id}`);

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', passwordResetLimiter, async (req, res) => {
  try {
    const { email, organizationSlug } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    let whereClause = {
      email: email.toLowerCase(),
      isActive: true
    };

    if (organizationSlug) {
      whereClause.organization = {
        slug: organizationSlug
      };
    }

    const user = await prisma.user.findFirst({
      where: whereClause,
      include: {
        organization: true
      }
    });

    const successResponse = {
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent.'
    };

    if (!user) {
      return res.json(successResponse);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetTokenExpires
      }
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&org=${user.organization.slug}`;
    
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request - SportBook',
      template: 'password-reset',
      data: {
        firstName: user.firstName,
        resetUrl,
        organizationName: user.organization.name,
        expiresIn: '1 hour'
      }
    });

    logger.info(`Password reset requested for user: ${user.id}`);

    res.json(successResponse);

  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset request failed'
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password, organizationSlug } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and password are required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    let whereClause = {
      passwordResetToken: token,
      passwordResetExpires: {
        gt: new Date()
      },
      isActive: true
    };

    if (organizationSlug) {
      whereClause.organization = {
        slug: organizationSlug
      };
    }

    const user = await prisma.user.findFirst({
      where: whereClause
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(password, saltRounds);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
        failedLoginAttempts: 0,
        lockedUntil: null
      }
    });

    logger.info(`Password reset completed for user: ${user.id}`);

    res.json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed'
    });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change password for authenticated user
// @access  Private
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, passwordHash: true }
    });

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    const saltRounds = 12;
    const updatedPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: updatedPasswordHash }
    });

    logger.info(`Password changed for user: ${user.id}`);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password change failed'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        gender: true,
        avatarUrl: true,
        role: true,
        permissions: true,
        isActive: true,
        lastLoginAt: true,
        loginCount: true,
        emailVerifiedAt: true,
        phoneVerifiedAt: true,
        emergencyContact: true,
        medicalNotes: true,
        preferences: true,
        createdAt: true,
        updatedAt: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            subscriptionStatus: true,
            businessHours: true,
            timezone: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      dateOfBirth,
      gender,
      emergencyContact,
      medicalNotes,
      preferences
    } = req.body;

    if (firstName && (firstName.length < 2 || firstName.length > 50)) {
      return res.status(400).json({
        success: false,
        message: 'First name must be between 2 and 50 characters'
      });
    }

    if (lastName && (lastName.length < 2 || lastName.length > 50)) {
      return res.status(400).json({
        success: false,
        message: 'Last name must be between 2 and 50 characters'
      });
    }

    if (phone && !/^\+?[1-9]\d{6,14}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
    if (gender) updateData.gender = gender;
    if (emergencyContact) updateData.emergencyContact = emergencyContact;
    if (medicalNotes !== undefined) updateData.medicalNotes = medicalNotes;
    if (preferences) updateData.preferences = preferences;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        gender: true,
        avatarUrl: true,
        role: true,
        emergencyContact: true,
        medicalNotes: true,
        preferences: true,
        updatedAt: true
      }
    });

    logger.info(`Profile updated for user: ${req.user.id}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });

  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

module.exports = router;