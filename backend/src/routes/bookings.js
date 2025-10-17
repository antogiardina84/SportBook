// src/routes/bookings.js - Booking Management Routes

const express = require('express');
const { prisma } = require('../config/database');
const { authenticateToken, authorize, requireOrgAccess } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const logger = require('../utils/logger');
const { sendNotification } = require('../utils/notifications');
const { calculateBookingPrice } = require('../utils/pricing');
const dayjs = require('dayjs');

const router = express.Router();

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
        payments: true,
        documents: true,
        cancelledByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
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
router.post('/', authenticateToken, validate(schemas.createBooking), async (req, res) => {
  try {
    const {
      fieldId,
      startTime,
      endTime,
      participants,
      notes,
      specialRequests
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

    const bookingStart = dayjs(startTime);
    const bookingEnd = dayjs(endTime);
    const duration = bookingEnd.diff(bookingStart, 'minute');

    // Validate booking duration
    if (duration < field.minBookingDuration) {
      return res.status(400).json({
        success: false,
        message: `Minimum booking duration is ${field.minBookingDuration} minutes`
      });
    }

    if (duration > field.maxBookingDuration) {
      return res.status(400).json({
        success: false,
        message: `Maximum booking duration is ${field.maxBookingDuration} minutes`
      });
    }

    // Check if booking is in the future
    if (bookingStart.isBefore(dayjs())) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book in the past'
      });
    }

    // Check advance booking limit
    const advanceLimit = dayjs().add(field.advanceBookingDays, 'day');
    if (bookingStart.isAfter(advanceLimit)) {
      return res.status(400).json({
        success: false,
        message: `Cannot book more than ${field.advanceBookingDays} days in advance`
      });
    }

    // Check field availability hours
    const startHour = bookingStart.format('HH:mm');
    const endHour = bookingEnd.format('HH:mm');
    
    if (startHour < field.availableFrom || endHour > field.availableUntil) {
      return res.status(400).json({
        success: false,
        message: `Field is only available from ${field.availableFrom} to ${field.availableUntil}`
      });
    }

    // Check for conflicts with existing bookings
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        fieldId,
        status: {
          in: ['PENDING', 'CONFIRMED']
        },
        OR: [
          {
            startTime: {
              lt: endTime
            },
            endTime: {
              gt: startTime
            }
          }
        ]
      }
    });

    if (conflictingBookings.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Field is not available at the requested time',
        conflicts: conflictingBookings.map(booking => ({
          id: booking.id,
          startTime: booking.startTime,
          endTime: booking.endTime
        }))
      });
    }

    // Calculate pricing
    const pricingDetails = await calculateBookingPrice({
      field,
      startTime: bookingStart.toDate(),
      endTime: bookingEnd.toDate(),
      userId,
      organizationId
    });

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        organizationId,
        fieldId,
        userId,
        startTime: bookingStart.toDate(),
        endTime: bookingEnd.toDate(),
        basePrice: pricingDetails.basePrice,
        discountAmount: pricingDetails.discountAmount,
        taxAmount: pricingDetails.taxAmount,
        totalAmount: pricingDetails.totalAmount,
        participants: participants || [],
        notes,
        specialRequests,
        status: 'PENDING',
        paymentStatus: 'PENDING'
      },
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
            email: true
          }
        }
      }
    });

    // Send confirmation notification
    await sendNotification({
      userId,
      type: 'email',
      title: 'Booking Confirmation',
      message: `Your booking for ${field.name} on ${bookingStart.format('YYYY-MM-DD HH:mm')} has been created.`,
      bookingId: booking.id
    });

    logger.info(`Booking created: ${booking.id} by user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { 
        booking,
        pricing: pricingDetails
      }
    });

  } catch (error) {
    logger.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking'
    });
  }
});

// @route   PUT /api/bookings/:id
// @desc    Update booking
// @access  Private
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, specialRequests, participants } = req.body;

    // Get existing booking
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      include: { field: true }
    });

    if (!existingBooking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check permissions
    const canEdit = 
      existingBooking.userId === req.user.id ||
      ['ADMIN', 'MANAGER'].includes(req.user.role);

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if booking can be modified
    if (existingBooking.status === 'CANCELLED' || existingBooking.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify cancelled or completed bookings'
      });
    }

    // Check if within cancellation window
    const bookingStart = dayjs(existingBooking.startTime);
    const hoursUntilBooking = bookingStart.diff(dayjs(), 'hour');
    
    if (hoursUntilBooking < existingBooking.field.cancellationHours) {
      return res.status(400).json({
        success: false,
        message: `Cannot modify booking within ${existingBooking.field.cancellationHours} hours of start time`
      });
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        notes,
        specialRequests,
        participants: participants || existingBooking.participants
      },
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
            email: true
          }
        }
      }
    });

    logger.info(`Booking updated: ${id} by user ${req.user.id}`);

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: { booking: updatedBooking }
    });

  } catch (error) {
    logger.error('Update booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking'
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
      include: { 
        field: true,
        payments: {
          where: { status: 'COMPLETED' }
        }
      }
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

    // Check cancellation policy
    const bookingStart = dayjs(booking.startTime);
    const hoursUntilBooking = bookingStart.diff(dayjs(), 'hour');
    
    let refundAmount = 0;
    if (hoursUntilBooking >= booking.field.cancellationHours) {
      // Full refund if cancelled within policy
      refundAmount = booking.totalAmount;
    } else {
      // Partial or no refund based on organization policy
      // This could be configurable per organization
      refundAmount = 0;
    }

    // Update booking
    const cancelledBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledBy: req.user.id,
        cancellationReason: reason,
        refundAmount
      },
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
            email: true
          }
        }
      }
    });

    // Process refund if applicable
    if (refundAmount > 0 && booking.payments.length > 0) {
      // Create refund payment record
      await prisma.payment.create({
        data: {
          organizationId: booking.organizationId,
          userId: booking.userId,
          bookingId: booking.id,
          amount: -refundAmount,
          currency: 'EUR',
          status: 'PENDING',
          description: `Refund for cancelled booking ${booking.id}`
        }
      });

      // TODO: Process actual refund via payment provider (Stripe)
    }

    // Send notification
    await sendNotification({
      userId: booking.userId,
      type: 'email',
      title: 'Booking Cancelled',
      message: `Your booking for ${booking.field.name} on ${bookingStart.format('YYYY-MM-DD HH:mm')} has been cancelled.`,
      bookingId: booking.id
    });

    logger.info(`Booking cancelled: ${id} by user ${req.user.id}, refund: ${refundAmount}`);

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { 
        booking: cancelledBooking,
        refundAmount
      }
    });

  } catch (error) {
    logger.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking'
    });
  }
});

// @route   POST /api/bookings/:id/confirm
// @desc    Confirm booking (admin/manager only)
// @access  Private
router.post('/:id/confirm', authenticateToken, authorize('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
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
            email: true
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.organizationId !== req.user.organizationId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (booking.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Only pending bookings can be confirmed'
      });
    }

    // Update booking status
    const confirmedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CONFIRMED'
      },
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
            email: true
          }
        }
      }
    });

    // Send confirmation notification
    await sendNotification({
      userId: booking.userId,
      type: 'email',
      title: 'Booking Confirmed',
      message: `Your booking for ${booking.field.name} on ${dayjs(booking.startTime).format('YYYY-MM-DD HH:mm')} has been confirmed.`,
      bookingId: booking.id
    });

    logger.info(`Booking confirmed: ${id} by user ${req.user.id}`);

    res.json({
      success: true,
      message: 'Booking confirmed successfully',
      data: { booking: confirmedBooking }
    });

  } catch (error) {
    logger.error('Confirm booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm booking'
    });
  }
});

// @route   GET /api/bookings/availability/:fieldId
// @desc    Check field availability
// @access  Private
router.get('/availability/:fieldId', authenticateToken, async (req, res) => {
  try {
    const { fieldId } = req.params;
    const { date, duration = 60 } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required'
      });
    }

    const field = await prisma.field.findUnique({
      where: { 
        id: fieldId,
        organizationId: req.user.organizationId
      }
    });

    if (!field || !field.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Field not found or not available'
      });
    }

    const selectedDate = dayjs(date);
    const startOfDay = selectedDate.startOf('day');
    const endOfDay = selectedDate.endOf('day');

    // Get existing bookings for the date
    const existingBookings = await prisma.booking.findMany({
      where: {
        fieldId,
        status: {
          in: ['PENDING', 'CONFIRMED']
        },
        startTime: {
          gte: startOfDay.toDate(),
          lte: endOfDay.toDate()
        }
      },
      select: {
        startTime: true,
        endTime: true,
        status: true
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    // Generate available time slots
    const availableSlots = [];
    const fieldStart = selectedDate.hour(parseInt(field.availableFrom.split(':')[0]))
                                  .minute(parseInt(field.availableFrom.split(':')[1]));
    const fieldEnd = selectedDate.hour(parseInt(field.availableUntil.split(':')[0]))
                                .minute(parseInt(field.availableUntil.split(':')[1]));

    let currentTime = fieldStart;
    const slotDuration = parseInt(duration);

    while (currentTime.add(slotDuration, 'minute').isSameOrBefore(fieldEnd)) {
      const slotEnd = currentTime.add(slotDuration, 'minute');
      
      // Check if slot conflicts with existing bookings
      const hasConflict = existingBookings.some(booking => {
        const bookingStart = dayjs(booking.startTime);
        const bookingEnd = dayjs(booking.endTime);
        
        return (
          currentTime.isBefore(bookingEnd) && 
          slotEnd.isAfter(bookingStart)
        );
      });

      if (!hasConflict && currentTime.isAfter(dayjs())) {
        availableSlots.push({
          startTime: currentTime.toISOString(),
          endTime: slotEnd.toISOString(),
          available: true
        });
      }

      currentTime = currentTime.add(slotDuration, 'minute');
    }

    res.json({
      success: true,
      data: {
        field: {
          id: field.id,
          name: field.name,
          fieldType: field.fieldType
        },
        date: selectedDate.format('YYYY-MM-DD'),
        duration: slotDuration,
        availableSlots,
        existingBookings: existingBookings.map(booking => ({
          startTime: booking.startTime,
          endTime: booking.endTime,
          status: booking.status
        }))
      }
    });

  } catch (error) {
    logger.error('Check availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check availability'
    });
  }
});

module.exports = router;
