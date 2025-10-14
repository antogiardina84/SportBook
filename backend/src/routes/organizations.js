// backend/src/routes/organizations.js

const express = require('express');
const { prisma } = require('../config/database');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const logger = require('../utils/logger');
const slugify = require('slugify');

const router = express.Router();

// @route   GET /api/organizations
// @desc    Get all organizations (SUPER_ADMIN only)
// @access  Private (Super Admin)
router.get('/', authenticateToken, authorize('SUPER_ADMIN'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status) {
      whereClause.subscriptionStatus = status;
    }

    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          slug: true,
          email: true,
          phone: true,
          subscriptionPlan: true,
          subscriptionStatus: true,
          subscriptionEndsAt: true,
          createdAt: true,
          _count: {
            select: {
              users: true,
              fields: true,
              bookings: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.organization.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: {
        organizations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    logger.error('Get organizations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch organizations'
    });
  }
});

// @route   GET /api/organizations/:id
// @desc    Get single organization
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check access
    if (req.user.role !== 'SUPER_ADMIN' && req.user.organizationId !== id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            fields: true,
            bookings: true,
            payments: true
          }
        }
      }
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    res.json({
      success: true,
      data: { organization }
    });

  } catch (error) {
    logger.error('Get organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch organization'
    });
  }
});

// @route   POST /api/organizations
// @desc    Create new organization
// @access  Private (Super Admin)
router.post('/', 
  authenticateToken, 
  authorize('SUPER_ADMIN'), 
  validate(schemas.createOrganization), 
  async (req, res) => {
    try {
      const {
        name,
        description,
        website,
        phone,
        email,
        address,
        timezone,
        businessHours,
        subscriptionPlan = 'basic'
      } = req.body;

      // Generate slug
      const slug = slugify(name, { lower: true, strict: true });

      // Check if slug exists
      const existingOrg = await prisma.organization.findUnique({
        where: { slug }
      });

      if (existingOrg) {
        return res.status(400).json({
          success: false,
          message: 'Organization with this name already exists'
        });
      }

      // Create organization
      const organization = await prisma.organization.create({
        data: {
          name,
          slug,
          description,
          website,
          phone,
          email,
          address,
          timezone: timezone || 'Europe/Rome',
          businessHours: businessHours || {
            monday: { open: '08:00', close: '22:00' },
            tuesday: { open: '08:00', close: '22:00' },
            wednesday: { open: '08:00', close: '22:00' },
            thursday: { open: '08:00', close: '22:00' },
            friday: { open: '08:00', close: '22:00' },
            saturday: { open: '09:00', close: '20:00' },
            sunday: { open: '09:00', close: '18:00' }
          },
          subscriptionPlan,
          subscriptionStatus: 'ACTIVE',
          trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
          createdBy: req.user.id
        }
      });

      logger.info(`Organization created: ${organization.id} by ${req.user.id}`);

      res.status(201).json({
        success: true,
        message: 'Organization created successfully',
        data: { organization }
      });

    } catch (error) {
      logger.error('Create organization error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create organization'
      });
    }
  }
);

// @route   PUT /api/organizations/:id
// @desc    Update organization
// @access  Private (Admin)
router.put('/:id', authenticateToken, authorize('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check access
    if (req.user.role !== 'SUPER_ADMIN' && req.user.organizationId !== id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const {
      name,
      description,
      website,
      phone,
      email,
      address,
      timezone,
      businessHours
    } = req.body;

    const updateData = {};
    if (name) {
      updateData.name = name;
      updateData.slug = slugify(name, { lower: true, strict: true });
    }
    if (description !== undefined) updateData.description = description;
    if (website) updateData.website = website;
    if (phone) updateData.phone = phone;
    if (email) updateData.email = email;
    if (address) updateData.address = address;
    if (timezone) updateData.timezone = timezone;
    if (businessHours) updateData.businessHours = businessHours;

    const organization = await prisma.organization.update({
      where: { id },
      data: updateData
    });

    logger.info(`Organization updated: ${id} by ${req.user.id}`);

    res.json({
      success: true,
      message: 'Organization updated successfully',
      data: { organization }
    });

  } catch (error) {
    logger.error('Update organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update organization'
    });
  }
});

// @route   DELETE /api/organizations/:id
// @desc    Delete organization (soft delete)
// @access  Private (Super Admin)
router.delete('/:id', authenticateToken, authorize('SUPER_ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if organization has active subscriptions
    const activeUsers = await prisma.user.count({
      where: {
        organizationId: id,
        isActive: true
      }
    });

    if (activeUsers > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete organization with ${activeUsers} active users`
      });
    }

    // Soft delete
    await prisma.organization.update({
      where: { id },
      data: {
        subscriptionStatus: 'CANCELLED'
      }
    });

    logger.info(`Organization deleted: ${id} by ${req.user.id}`);

    res.json({
      success: true,
      message: 'Organization deleted successfully'
    });

  } catch (error) {
    logger.error('Delete organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete organization'
    });
  }
});

// @route   GET /api/organizations/:id/stats
// @desc    Get organization statistics
// @access  Private (Admin)
router.get('/:id/stats', authenticateToken, authorize('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check access
    if (req.user.role !== 'SUPER_ADMIN' && req.user.organizationId !== id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const [
      totalUsers,
      totalFields,
      totalBookings,
      totalRevenue,
      activeBookings
    ] = await Promise.all([
      prisma.user.count({
        where: { organizationId: id, isActive: true }
      }),
      prisma.field.count({
        where: { organizationId: id, isActive: true }
      }),
      prisma.booking.count({
        where: { organizationId: id }
      }),
      prisma.payment.aggregate({
        where: {
          organizationId: id,
          status: 'COMPLETED'
        },
        _sum: { amount: true }
      }),
      prisma.booking.count({
        where: {
          organizationId: id,
          status: { in: ['PENDING', 'CONFIRMED'] },
          startTime: { gte: new Date() }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalFields,
        totalBookings,
        totalRevenue: totalRevenue._sum.amount || 0,
        activeBookings
      }
    });

  } catch (error) {
    logger.error('Get organization stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch organization statistics'
    });
  }
});

module.exports = router;