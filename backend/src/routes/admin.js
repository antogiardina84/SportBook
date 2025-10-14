// src/routes/admin.js - Admin Panel Routes

const express = require('express');
const { prisma } = require('../config/database');
const { authenticateToken, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');
const bcrypt = require('bcryptjs');

const router = express.Router();

// All routes require ADMIN role
router.use(authenticateToken, authorize('ADMIN', 'SUPER_ADMIN'));

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard', async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalBookings,
      totalRevenue,
      activeFields,
      recentBookings,
      topFields,
      userGrowth
    ] = await Promise.all([
      // Total users
      prisma.user.count({
        where: { organizationId, isActive: true }
      }),
      // Total bookings
      prisma.booking.count({
        where: { organizationId }
      }),
      // Total revenue
      prisma.payment.aggregate({
        where: {
          organizationId,
          status: 'COMPLETED'
        },
        _sum: { amount: true }
      }),
      // Active fields
      prisma.field.count({
        where: { organizationId, isActive: true }
      }),
      // Recent bookings
      prisma.booking.findMany({
        where: { organizationId },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          },
          field: {
            select: {
              name: true,
              fieldType: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      // Top fields by booking count
      prisma.booking.groupBy({
        by: ['fieldId'],
        where: {
          organizationId,
          createdAt: { gte: thirtyDaysAgo }
        },
        _count: true,
        orderBy: {
          _count: { fieldId: 'desc' }
        },
        take: 5
      }),
      // User growth (last 30 days)
      prisma.user.groupBy({
        by: ['createdAt'],
        where: {
          organizationId,
          createdAt: { gte: thirtyDaysAgo }
        },
        _count: true
      })
    ]);

    // Get field names for top fields
    const fieldIds = topFields.map(f => f.fieldId);
    const fields = await prisma.field.findMany({
      where: { id: { in: fieldIds } },
      select: { id: true, name: true, fieldType: true }
    });

    const topFieldsWithNames = topFields.map(tf => {
      const field = fields.find(f => f.id === tf.fieldId);
      return {
        fieldId: tf.fieldId,
        fieldName: field?.name || 'Unknown',
        fieldType: field?.fieldType || 'Unknown',
        bookingCount: tf._count
      };
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalBookings,
          totalRevenue: totalRevenue._sum.amount || 0,
          activeFields
        },
        recentBookings: recentBookings.map(booking => ({
          id: booking.id,
          customer: `${booking.user.firstName} ${booking.user.lastName}`,
          field: booking.field.name,
          fieldType: booking.field.fieldType,
          startTime: booking.startTime,
          status: booking.status,
          amount: booking.totalAmount
        })),
        topFields: topFieldsWithNames,
        userGrowth: userGrowth.length
      }
    });

  } catch (error) {
    logger.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
});

// @route   GET /api/admin/settings
// @desc    Get organization settings
// @access  Private (Admin only)
router.get('/settings', async (req, res) => {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: req.user.organizationId },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logoUrl: true,
        website: true,
        phone: true,
        email: true,
        address: true,
        settings: true,
        paymentConfig: true,
        emailConfig: true,
        smsConfig: true,
        businessHours: true,
        timezone: true,
        subscriptionPlan: true,
        subscriptionStatus: true
      }
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Hide sensitive data
    if (organization.paymentConfig) {
      organization.paymentConfig = {
        ...organization.paymentConfig,
        stripeSecretKey: organization.paymentConfig.stripeSecretKey ? '***HIDDEN***' : null
      };
    }

    if (organization.emailConfig) {
      organization.emailConfig = {
        ...organization.emailConfig,
        password: organization.emailConfig.password ? '***HIDDEN***' : null
      };
    }

    res.json({
      success: true,
      data: { organization }
    });

  } catch (error) {
    logger.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings'
    });
  }
});

// @route   PUT /api/admin/settings
// @desc    Update organization settings
// @access  Private (Admin only)
router.put('/settings', async (req, res) => {
  try {
    const {
      name,
      description,
      website,
      phone,
      email,
      address,
      businessHours,
      timezone,
      settings
    } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (website) updateData.website = website;
    if (phone) updateData.phone = phone;
    if (email) updateData.email = email;
    if (address) updateData.address = address;
    if (businessHours) updateData.businessHours = businessHours;
    if (timezone) updateData.timezone = timezone;
    if (settings) updateData.settings = settings;

    const updatedOrg = await prisma.organization.update({
      where: { id: req.user.organizationId },
      data: updateData
    });

    logger.info(`Organization settings updated: ${updatedOrg.id} by ${req.user.id}`);

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: { organization: updatedOrg }
    });

  } catch (error) {
    logger.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    });
  }
});

// @route   PUT /api/admin/payment-config
// @desc    Update payment configuration
// @access  Private (Admin only)
router.put('/payment-config', async (req, res) => {
  try {
    const {
      stripePublishableKey,
      stripeSecretKey,
      stripeAccountId,
      currency,
      taxRate,
      acceptCash,
      acceptBankTransfer
    } = req.body;

    const organization = await prisma.organization.findUnique({
      where: { id: req.user.organizationId },
      select: { paymentConfig: true }
    });

    const updatedConfig = {
      ...(organization.paymentConfig || {}),
      stripePublishableKey: stripePublishableKey || organization.paymentConfig?.stripePublishableKey,
      stripeSecretKey: stripeSecretKey || organization.paymentConfig?.stripeSecretKey,
      stripeAccountId: stripeAccountId || organization.paymentConfig?.stripeAccountId,
      currency: currency || 'EUR',
      taxRate: taxRate !== undefined ? taxRate : 0.22,
      acceptCash: acceptCash !== undefined ? acceptCash : true,
      acceptBankTransfer: acceptBankTransfer !== undefined ? acceptBankTransfer : true,
      updatedAt: new Date()
    };

    await prisma.organization.update({
      where: { id: req.user.organizationId },
      data: {
        paymentConfig: updatedConfig
      }
    });

    logger.info(`Payment config updated for organization: ${req.user.organizationId}`);

    // Hide sensitive data in response
    const safeConfig = {
      ...updatedConfig,
      stripeSecretKey: updatedConfig.stripeSecretKey ? '***HIDDEN***' : null
    };

    res.json({
      success: true,
      message: 'Payment configuration updated successfully',
      data: { paymentConfig: safeConfig }
    });

  } catch (error) {
    logger.error('Update payment config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment configuration'
    });
  }
});

// @route   PUT /api/admin/email-config
// @desc    Update email configuration
// @access  Private (Admin only)
router.put('/email-config', async (req, res) => {
  try {
    const {
      provider,
      smtpHost,
      smtpPort,
      smtpSecure,
      smtpUser,
      smtpPassword,
      fromEmail,
      fromName
    } = req.body;

    const organization = await prisma.organization.findUnique({
      where: { id: req.user.organizationId },
      select: { emailConfig: true }
    });

    const updatedConfig = {
      ...(organization.emailConfig || {}),
      provider: provider || 'smtp',
      smtpHost,
      smtpPort: smtpPort || 587,
      smtpSecure: smtpSecure !== undefined ? smtpSecure : true,
      smtpUser,
      smtpPassword: smtpPassword || organization.emailConfig?.smtpPassword,
      fromEmail,
      fromName,
      updatedAt: new Date()
    };

    await prisma.organization.update({
      where: { id: req.user.organizationId },
      data: {
        emailConfig: updatedConfig
      }
    });

    logger.info(`Email config updated for organization: ${req.user.organizationId}`);

    // Hide password in response
    const safeConfig = {
      ...updatedConfig,
      smtpPassword: updatedConfig.smtpPassword ? '***HIDDEN***' : null
    };

    res.json({
      success: true,
      message: 'Email configuration updated successfully',
      data: { emailConfig: safeConfig }
    });

  } catch (error) {
    logger.error('Update email config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update email configuration'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users for organization
// @access  Private (Admin only)
router.get('/users', async (req, res) => {
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
          emailVerifiedAt: true,
          lastLoginAt: true,
          loginCount: true,
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

// @route   POST /api/admin/users
// @desc    Create new user (admin)
// @access  Private (Admin only)
router.post('/users', async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      role = 'MEMBER'
    } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, first name and last name are required'
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        organizationId: req.user.organizationId
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        organizationId: req.user.organizationId,
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        phone,
        role,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    logger.info(`User created by admin: ${user.id} by ${req.user.id}`);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user }
    });

  } catch (error) {
    logger.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user
// @access  Private (Admin only)
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      phone,
      role,
      isActive
    } = req.body;

    // Check if user exists and belongs to organization
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

    // Prevent admin from deactivating themselves
    if (id === req.user.id && isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        updatedAt: true
      }
    });

    logger.info(`User updated by admin: ${id} by ${req.user.id}`);

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

// @route   DELETE /api/admin/users/:id
// @desc    Delete user (soft delete)
// @access  Private (Admin only)
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Check if user exists and belongs to organization
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

    // Check for active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        userId: id,
        status: { in: ['PENDING', 'CONFIRMED'] },
        startTime: { gte: new Date() }
      }
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete user with ${activeBookings} active bookings`
      });
    }

    // Soft delete by deactivating
    await prisma.user.update({
      where: { id },
      data: { isActive: false }
    });

    logger.info(`User deactivated by admin: ${id} by ${req.user.id}`);

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });

  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

// @route   GET /api/admin/reports/revenue
// @desc    Get revenue report
// @access  Private (Admin only)
router.get('/reports/revenue', async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const payments = await prisma.payment.findMany({
      where: {
        organizationId: req.user.organizationId,
        status: 'COMPLETED',
        processedAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      select: {
        amount: true,
        processedAt: true,
        paymentMethod: true,
        booking: {
          select: {
            field: {
              select: {
                name: true,
                fieldType: true
              }
            }
          }
        }
      }
    });

    // Group payments by date
    const grouped = {};
    payments.forEach(payment => {
      const date = payment.processedAt.toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = {
          date,
          revenue: 0,
          count: 0,
          byMethod: {},
          byFieldType: {}
        };
      }
      grouped[date].revenue += parseFloat(payment.amount);
      grouped[date].count += 1;

      // Group by payment method
      if (!grouped[date].byMethod[payment.paymentMethod]) {
        grouped[date].byMethod[payment.paymentMethod] = 0;
      }
      grouped[date].byMethod[payment.paymentMethod] += parseFloat(payment.amount);

      // Group by field type
      const fieldType = payment.booking?.field?.fieldType || 'UNKNOWN';
      if (!grouped[date].byFieldType[fieldType]) {
        grouped[date].byFieldType[fieldType] = 0;
      }
      grouped[date].byFieldType[fieldType] += parseFloat(payment.amount);
    });

    const report = Object.values(grouped).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    const totalRevenue = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const totalTransactions = payments.length;

    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalTransactions,
          averageTransaction: totalTransactions > 0 ? totalRevenue / totalTransactions : 0
        },
        report
      }
    });

  } catch (error) {
    logger.error('Get revenue report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate revenue report'
    });
  }
});

module.exports = router;