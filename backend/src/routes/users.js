// backend/src/routes/users.js

const express = require('express');
const { prisma } = require('../config/database');
const { authenticateToken, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

const router = express.Router();

// Configure multer for avatar upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and JPG images are allowed'));
    }
  }
});

// @route   GET /api/users
// @desc    Get users (with filters)
// @access  Private (Admin/Manager)
router.get('/', authenticateToken, authorize('ADMIN', 'MANAGER', 'INSTRUCTOR'), async (req, res) => {
  try {
    const {
      role,
      isActive,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = {
      organizationId: req.user.organizationId
    };

    if (role) whereClause.role = role;
    if (isActive !== undefined) whereClause.isActive = isActive === 'true';
    
    if (search) {
      whereClause.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          avatarUrl: true,
          emailVerifiedAt: true,
          lastLoginAt: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.user.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check access
    const canView = 
      req.user.id === id ||
      ['ADMIN', 'MANAGER'].includes(req.user.role);

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        id,
        organizationId: req.user.organizationId
      },
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
        isActive: true,
        emailVerifiedAt: true,
        phoneVerifiedAt: true,
        lastLoginAt: true,
        loginCount: true,
        emergencyContact: true,
        medicalNotes: req.user.id === id || req.user.role === 'ADMIN',
        preferences: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            bookings: true,
            memberships: true
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
    logger.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check access
    const canEdit = 
      req.user.id === id ||
      ['ADMIN', 'MANAGER'].includes(req.user.role);

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        id,
        organizationId: req.user.organizationId
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const {
      firstName,
      lastName,
      phone,
      dateOfBirth,
      gender,
      emergencyContact,
      medicalNotes,
      preferences,
      role,
      isActive
    } = req.body;

    const updateData = {};
    
    // Fields any user can update for themselves
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
    if (gender) updateData.gender = gender;
    if (emergencyContact) updateData.emergencyContact = emergencyContact;
    if (medicalNotes !== undefined) updateData.medicalNotes = medicalNotes;
    if (preferences) updateData.preferences = preferences;

    // Fields only admin can update
    if (['ADMIN'].includes(req.user.role)) {
      if (role) updateData.role = role;
      if (isActive !== undefined) updateData.isActive = isActive;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        gender: true,
        role: true,
        isActive: true,
        updatedAt: true
      }
    });

    logger.info(`User updated: ${id} by ${req.user.id}`);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: updatedUser }
    });

  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

// @route   POST /api/users/:id/avatar
// @desc    Upload user avatar
// @access  Private
router.post('/:id/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check access
    if (req.user.id !== id && !['ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Process image with sharp
    const filename = `avatar-${id}-${Date.now()}.jpg`;
    const uploadsDir = path.join(__dirname, '../../uploads/avatars');
    
    // Create directory if it doesn't exist
    await fs.mkdir(uploadsDir, { recursive: true });

    const filepath = path.join(uploadsDir, filename);

    await sharp(req.file.buffer)
      .resize(200, 200, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 90 })
      .toFile(filepath);

    // Update user avatar URL
    const avatarUrl = `/uploads/avatars/${filename}`;
    
    await prisma.user.update({
      where: { id },
      data: { avatarUrl }
    });

    logger.info(`Avatar uploaded for user: ${id}`);

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: { avatarUrl }
    });

  } catch (error) {
    logger.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar'
    });
  }
});

// @route   GET /api/users/:id/bookings
// @desc    Get user bookings
// @access  Private
router.get('/:id/bookings', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, startDate, endDate, page = 1, limit = 20 } = req.query;

    // Check access
    const canView = 
      req.user.id === id ||
      ['ADMIN', 'MANAGER', 'INSTRUCTOR'].includes(req.user.role);

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = {
      userId: id,
      organizationId: req.user.organizationId
    };

    if (status) whereClause.status = status;
    
    if (startDate || endDate) {
      whereClause.startTime = {};
      if (startDate) whereClause.startTime.gte = new Date(startDate);
      if (endDate) whereClause.startTime.lte = new Date(endDate);
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: whereClause,
        include: {
          field: {
            select: {
              id: true,
              name: true,
              fieldType: true
            }
          }
        },
        orderBy: { startTime: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.booking.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    logger.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user bookings'
    });
  }
});

// @route   GET /api/users/:id/memberships
// @desc    Get user memberships
// @access  Private
router.get('/:id/memberships', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check access
    const canView = 
      req.user.id === id ||
      ['ADMIN', 'MANAGER'].includes(req.user.role);

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const memberships = await prisma.membership.findMany({
      where: {
        userId: id,
        organizationId: req.user.organizationId
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { memberships }
    });

  } catch (error) {
    logger.error('Get user memberships error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user memberships'
    });
  }
});

module.exports = router;