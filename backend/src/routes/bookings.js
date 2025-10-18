// ===========================================
// backend/src/routes/bookings.js
// Booking Management Routes - COMPLETO
// ===========================================

const express = require('express');
const { prisma } = require('../config/database');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const logger = require('../utils/logger');
const dayjs = require('dayjs');

const router = express.Router();

// ============================================
// 🆕 ROUTE MANCANTE: /my-bookings
// ============================================

// @route   GET /api/bookings/my-bookings
// @desc    Get current user's bookings
// @access  Private
router.get('/my-bookings', authenticateToken, async (req, res) => {
  try {
    const {
      status,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sortBy = 'startTime',
      sortOrder = 'desc'
    } = req.query;

    const userId = req.user.id;
    const organizationId = req.user.organizationId;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    let whereClause = {
      organizationId,
      userId // Only user's own bookings
    };

    // Handle multiple statuses (e.g., "PENDING,CONFIRMED")
    if (status) {
      const statuses = status.split(',').map(s => s.trim());
      whereClause.status = { in: statuses };
    }

    if (startDate) {
      whereClause.startTime = {
        ...(whereClause.startTime || {}),
        gte: new Date(startDate)
      };
    }

    if (endDate) {
      whereClause.endTime = {
        ...(whereClause.endTime || {}),
        lte: new Date(endDate)
      };
    }

    // Get bookings
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: whereClause,
        include: {
          field: {
            select: {
              id: true,
              name: true,
              fieldType: true,
              surfaceType: true,
              location: true
            }
          },
          payments: {
            select: {
              id: true,
              amount: true,
              status: true,
              paymentMethod: true,
              processedAt: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
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
    logger.error('Get my bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your bookings'
    });
  }
});

// ============================================
// EXISTING ROUTES
// ============================================

// @route   GET /api/bookings
// @desc    Get bookings with filters
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      fieldId,
      userId,
      status,
      page = 1,
      limit = 20,
      sortBy = 'startTime',
      sortOrder = 'asc'
    } = req.query;

    const organizationId = req.user.organizationId;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    let whereClause = {
      organizationId
    };

    // Role-based filtering
    if (req.user.role === 'MEMBER') {
      whereClause.userId = req.user.id;
    } else if (userId && ['ADMIN', 'MANAGER', 'INSTRUCTOR'].includes(req.user.role)) {
      whereClause.userId = userId;
    }

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

    if (fieldId) {
      whereClause.fieldId = fieldId;
    }

    if (status) {
      whereClause.status = status;
    }

    // Get bookings
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
          },
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
          [sortBy]: sortOrder
        },
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
    logger.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        field: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        payments: true
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check access rights
    if (
      booking.organizationId !== req.user.organizationId ||
      (req.user.role === 'MEMBER' && booking.userId !== req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { booking }
    });

  } catch (error) {
    logger.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking'
    });
  }
});

// @route   POST /api/bookings
// @desc    Create new booking
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      fieldId,
      startTime,
      endTime,
      participants,
      notes
    } = req.body;

    const userId = req.user.id;
    const organizationId = req.user.organizationId;

    // Get field details
    const field = await prisma.field.findUnique({
      where: { 
        id: fieldId,
        organizationId
      }
    });

    if (!field || !field.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Field not found or not available'
      });
    }

    // Check for conflicts
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        fieldId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [
          {
            AND: [
              { startTime: { lte: new Date(startTime) } },
              { endTime: { gt: new Date(startTime) } }
            ]
          },
          {
            AND: [
              { startTime: { lt: new Date(endTime) } },
              { endTime: { gte: new Date(endTime) } }
            ]
          }
        ]
      }
    });

    if (conflictingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Time slot not available'
      });
    }

    // Calculate price
    const duration = dayjs(endTime).diff(dayjs(startTime), 'minute');
    const basePrice = (duration / 60) * field.pricePerHour;
    const totalAmount = basePrice;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        organizationId,
        fieldId,
        userId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: 'PENDING',
        paymentStatus: 'PENDING',
        basePrice,
        totalAmount,
        participants: participants || [],
        notes
      },
      include: {
        field: {
          select: {
            id: true,
            name: true,
            fieldType: true
          }
        }
      }
    });

    logger.info(`Booking created: ${booking.id} by user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { booking }
    });

  } catch (error) {
    logger.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking'
    });
  }
});

// @route   POST /api/bookings/:id/cancel
// @desc    Cancel booking
// @access  Private
router.post('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Get booking
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { field: true }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check permissions
    const canCancel = 
      booking.userId === req.user.id ||
      ['ADMIN', 'MANAGER'].includes(req.user.role);

    if (!canCancel) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if already cancelled
    if (booking.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    // Cancel booking
    const cancelledBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledById: req.user.id,
        cancellationReason: reason
      },
      include: {
        field: {
          select: {
            id: true,
            name: true,
            fieldType: true
          }
        }
      }
    });

    logger.info(`Booking cancelled: ${id} by user ${req.user.id}`);

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { booking: cancelledBooking }
    });

  } catch (error) {
    logger.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking'
    });
  }
});

module.exports = router;