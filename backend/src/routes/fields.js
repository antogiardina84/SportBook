// ===========================================
// src/routes/fields.js - Field Management Routes
// ===========================================

const express = require('express');
const { prisma } = require('../config/database');
const { authenticateToken, authorize, requireOrgAccess } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/fields
// @desc    Get all fields for organization
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      type, 
      isActive, 
      page = 1, 
      limit = 20,
      search 
    } = req.query;

    const organizationId = req.user.organizationId;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    let whereClause = { organizationId };

    if (type) {
      whereClause.fieldType = type;
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    if (search) {
      whereClause.name = {
        contains: search,
        mode: 'insensitive'
      };
    }

    const [fields, total] = await Promise.all([
      prisma.field.findMany({
        where: whereClause,
        orderBy: [
          { isActive: 'desc' },
          { name: 'asc' }
        ],
        skip,
        take: parseInt(limit)
      }),
      prisma.field.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: {
        fields,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    logger.error('Get fields error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fields'
    });
  }
});

// @route   GET /api/fields/:id
// @desc    Get single field
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const field = await prisma.field.findFirst({
      where: {
        id,
        organizationId: req.user.organizationId
      }
    });

    if (!field) {
      return res.status(404).json({
        success: false,
        message: 'Field not found'
      });
    }

    res.json({
      success: true,
      data: { field }
    });

  } catch (error) {
    logger.error('Get field error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch field'
    });
  }
});

// @route   POST /api/fields
// @desc    Create new field
// @access  Private (Admin/Manager only)
router.post('/', 
  authenticateToken, 
  authorize('ADMIN', 'MANAGER'), 
  validate(schemas.createField), 
  async (req, res) => {
    try {
      const fieldData = {
        ...req.body,
        organizationId: req.user.organizationId
      };

      const field = await prisma.field.create({
        data: fieldData
      });

      logger.info(`Field created: ${field.id} by user ${req.user.id}`);

      res.status(201).json({
        success: true,
        message: 'Field created successfully',
        data: { field }
      });

    } catch (error) {
      logger.error('Create field error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create field'
      });
    }
  }
);

// @route   PUT /api/fields/:id
// @desc    Update field
// @access  Private (Admin/Manager only)
router.put('/:id', 
  authenticateToken, 
  authorize('ADMIN', 'MANAGER'), 
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if field exists and belongs to organization
      const existingField = await prisma.field.findFirst({
        where: {
          id,
          organizationId: req.user.organizationId
        }
      });

      if (!existingField) {
        return res.status(404).json({
          success: false,
          message: 'Field not found'
        });
      }

      // Remove organizationId from update data to prevent changes
      delete updateData.organizationId;

      const updatedField = await prisma.field.update({
        where: { id },
        data: updateData
      });

      logger.info(`Field updated: ${id} by user ${req.user.id}`);

      res.json({
        success: true,
        message: 'Field updated successfully',
        data: { field: updatedField }
      });

    } catch (error) {
      logger.error('Update field error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update field'
      });
    }
  }
);

// @route   DELETE /api/fields/:id
// @desc    Delete field (soft delete by setting inactive)
// @access  Private (Admin only)
router.delete('/:id', 
  authenticateToken, 
  authorize('ADMIN'), 
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check if field exists and belongs to organization
      const field = await prisma.field.findFirst({
        where: {
          id,
          organizationId: req.user.organizationId
        }
      });

      if (!field) {
        return res.status(404).json({
          success: false,
          message: 'Field not found'
        });
      }

      // Check if field has active bookings
      const activeBookings = await prisma.booking.count({
        where: {
          fieldId: id,
          status: {
            in: ['PENDING', 'CONFIRMED']
          },
          startTime: {
            gte: new Date()
          }
        }
      });

      if (activeBookings > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete field with ${activeBookings} active bookings`
        });
      }

      // Soft delete by setting inactive
      const deletedField = await prisma.field.update({
        where: { id },
        data: { isActive: false }
      });

      logger.info(`Field deactivated: ${id} by user ${req.user.id}`);

      res.json({
        success: true,
        message: 'Field deactivated successfully',
        data: { field: deletedField }
      });

    } catch (error) {
      logger.error('Delete field error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete field'
      });
    }
  }
);

// @route   GET /api/fields/:id/bookings
// @desc    Get bookings for a specific field
// @access  Private (Admin/Manager/Instructor)
router.get('/:id/bookings', 
  authenticateToken, 
  authorize('ADMIN', 'MANAGER', 'INSTRUCTOR'), 
  async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        startDate, 
        endDate, 
        status,
        page = 1,
        limit = 50
      } = req.query;

      // Check if field belongs to organization
      const field = await prisma.field.findFirst({
        where: {
          id,
          organizationId: req.user.organizationId
        }
      });

      if (!field) {
        return res.status(404).json({
          success: false,
          message: 'Field not found'
        });
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Build where clause
      let whereClause = { fieldId: id };

      if (startDate) {
        whereClause.startTime = {
          gte: new Date(startDate)
        };
      }

      if (endDate) {
        whereClause.endTime = {
          lte: new Date(endDate)
        };
      }

      if (status) {
        whereClause.status = status;
      }

      const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
          where: whereClause,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true
              }
            }
          },
          orderBy: {
            startTime: 'asc'
          },
          skip,
          take: parseInt(limit)
        }),
        prisma.booking.count({ where: whereClause })
      ]);

      res.json({
        success: true,
        data: {
          field: {
            id: field.id,
            name: field.name,
            fieldType: field.fieldType
          },
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
      logger.error('Get field bookings error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch field bookings'
      });
    }
  }
);

// @route   GET /api/fields/:id/availability-calendar
// @desc    Get availability calendar for field
// @access  Private
router.get('/:id/availability-calendar', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { month, year } = req.query;

    const field = await prisma.field.findFirst({
      where: {
        id,
        organizationId: req.user.organizationId
      }
    });

    if (!field) {
      return res.status(404).json({
        success: false,
        message: 'Field not found'
      });
    }

    // Default to current month if not specified
    const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    const startDate = dayjs(`${targetYear}-${targetMonth}-01`).startOf('month');
    const endDate = startDate.endOf('month');

    // Get all bookings for the month
    const bookings = await prisma.booking.findMany({
      where: {
        fieldId: id,
        status: {
          in: ['PENDING', 'CONFIRMED']
        },
        startTime: {
          gte: startDate.toDate(),
          lte: endDate.toDate()
        }
      },
      select: {
        startTime: true,
        endTime: true,
        status: true,
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    // Group bookings by date
    const calendar = {};
    let currentDate = startDate;

    while (currentDate.isSameOrBefore(endDate)) {
      const dateKey = currentDate.format('YYYY-MM-DD');
      const dayBookings = bookings.filter(booking =>
        dayjs(booking.startTime).format('YYYY-MM-DD') === dateKey
      );

      calendar[dateKey] = {
        date: dateKey,
        dayOfWeek: currentDate.format('dddd'),
        bookings: dayBookings.map(booking => ({
          startTime: booking.startTime,
          endTime: booking.endTime,
          status: booking.status,
          customer: `${booking.user.firstName} ${booking.user.lastName}`
        })),
        available: field.isActive && dayBookings.length === 0
      };

      currentDate = currentDate.add(1, 'day');
    }

    res.json({
      success: true,
      data: {
        field: {
          id: field.id,
          name: field.name,
          fieldType: field.fieldType,
          availableFrom: field.availableFrom,
          availableUntil: field.availableUntil
        },
        month: targetMonth,
        year: targetYear,
        calendar
      }
    });

  } catch (error) {
    logger.error('Get availability calendar error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch availability calendar'
    });
  }
});

module.exports = router;