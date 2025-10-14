// src/routes/payments.js - Payment Processing Routes

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { prisma } = require('../config/database');
const { authenticateToken, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');
const { sendNotification } = require('../utils/notifications');

const router = express.Router();

// @route   POST /api/payments/create-payment-intent
// @desc    Create Stripe payment intent for booking
// @access  Private
router.post('/create-payment-intent', authenticateToken, async (req, res) => {
  try {
    const { bookingId, savePaymentMethod = false } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
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
            email: true,
            firstName: true,
            lastName: true
          }
        },
        organization: {
          select: {
            id: true,
            name: true,
            paymentConfig: true
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

    // Check if user owns the booking
    if (booking.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if booking can be paid
    if (booking.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot pay for cancelled booking'
      });
    }

    if (booking.paymentStatus === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already paid'
      });
    }

    // Get or create Stripe customer
    let stripeCustomerId = null;
    const existingPayment = await prisma.payment.findFirst({
      where: {
        userId: req.user.id,
        stripePaymentIntentId: { not: null }
      }
    });

    if (existingPayment && existingPayment.metadata?.stripeCustomerId) {
      stripeCustomerId = existingPayment.metadata.stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        email: booking.user.email,
        name: `${booking.user.firstName} ${booking.user.lastName}`,
        metadata: {
          userId: booking.user.id,
          organizationId: booking.organization.id
        }
      });
      stripeCustomerId = customer.id;
    }

    // Create payment intent
    const paymentIntentData = {
      amount: Math.round(booking.totalAmount * 100), // Convert to cents
      currency: 'eur',
      customer: stripeCustomerId,
      metadata: {
        bookingId: booking.id,
        userId: booking.userId,
        organizationId: booking.organizationId,
        fieldName: booking.field.name,
        bookingDate: booking.startTime.toISOString()
      },
      description: `Payment for ${booking.field.name} booking on ${booking.startTime.toLocaleDateString()}`,
      receipt_email: booking.user.email
    };

    // Add setup future usage if saving payment method
    if (savePaymentMethod) {
      paymentIntentData.setup_future_usage = 'on_session';
    }

    // Use organization's Stripe account if configured
    const stripeAccount = booking.organization.paymentConfig?.stripeAccountId;
    const requestOptions = stripeAccount ? { stripeAccount } : {};

    const paymentIntent = await stripe.paymentIntents.create(
      paymentIntentData,
      requestOptions
    );

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        organizationId: booking.organizationId,
        userId: booking.userId,
        bookingId: booking.id,
        amount: booking.totalAmount,
        currency: 'EUR',
        paymentMethod: 'card',
        stripePaymentIntentId: paymentIntent.id,
        status: 'PENDING',
        description: `Payment for ${booking.field.name} booking`,
        metadata: {
          stripeCustomerId,
          stripeAccount: stripeAccount || null
        }
      }
    });

    // Update booking with payment intent ID
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentIntentId: paymentIntent.id
      }
    });

    logger.info(`Payment intent created: ${paymentIntent.id} for booking ${booking.id}`);

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: booking.totalAmount,
        currency: 'EUR',
        booking: {
          id: booking.id,
          fieldName: booking.field.name,
          startTime: booking.startTime,
          endTime: booking.endTime
        }
      }
    });

  } catch (error) {
    logger.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/payments/confirm-payment
// @desc    Confirm payment and update booking status
// @access  Private
router.post('/confirm-payment', authenticateToken, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID is required'
      });
    }

    // Get payment record
    const payment = await prisma.payment.findFirst({
      where: {
        stripePaymentIntentId: paymentIntentId,
        userId: req.user.id
      },
      include: {
        booking: {
          include: {
            field: true,
            user: true
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Get payment intent from Stripe
    const stripeAccount = payment.metadata?.stripeAccount;
    const requestOptions = stripeAccount ? { stripeAccount } : {};
    
    const paymentIntent = await stripe.paymentIntents.retrieve(
      paymentIntentId,
      requestOptions
    );

    if (paymentIntent.status === 'succeeded') {
      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          processedAt: new Date(),
          stripeChargeId: paymentIntent.latest_charge
        }
      });

      // Update booking status
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: {
          paymentStatus: 'COMPLETED',
          status: 'CONFIRMED'
        }
      });

      // Send confirmation notification
      await sendNotification({
        userId: payment.userId,
        type: 'email',
        title: 'Payment Confirmed',
        message: `Your payment of €${payment.amount} for ${payment.booking.field.name} has been processed successfully.`,
        bookingId: payment.bookingId
      });

      logger.info(`Payment confirmed: ${paymentIntentId} for booking ${payment.bookingId}`);

      res.json({
        success: true,
        message: 'Payment confirmed successfully',
        data: {
          payment: {
            id: payment.id,
            amount: payment.amount,
            status: 'COMPLETED'
          },
          booking: {
            id: payment.booking.id,
            status: 'CONFIRMED',
            paymentStatus: 'COMPLETED'
          }
        }
      });

    } else {
      // Payment failed or still pending
      const status = paymentIntent.status === 'canceled' ? 'CANCELLED' : 'FAILED';
      
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status,
          failureReason: paymentIntent.last_payment_error?.message || 'Payment not completed'
        }
      });

      res.status(400).json({
        success: false,
        message: 'Payment not completed',
        data: {
          paymentStatus: paymentIntent.status,
          error: paymentIntent.last_payment_error?.message
        }
      });
    }

  } catch (error) {
    logger.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment'
    });
  }
});

// @route   GET /api/payments
// @desc    Get user payments
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      status,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    let whereClause = {};

    // Role-based filtering
    if (req.user.role === 'MEMBER') {
      whereClause.userId = req.user.id;
    } else {
      whereClause.organizationId = req.user.organizationId;
    }

    if (status) {
      whereClause.status = status;
    }

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate);
      if (endDate) whereClause.createdAt.lte = new Date(endDate);
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: whereClause,
        include: {
          booking: {
            include: {
              field: {
                select: {
                  id: true,
                  name: true,
                  fieldType: true
                }
              }
            }
          },
          membership: {
            select: {
              id: true,
              name: true,
              membershipType: true
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
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.payment.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    logger.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments'
    });
  }
});

// @route   GET /api/payments/:id
// @desc    Get single payment
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            field: true
          }
        },
        membership: true,
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

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check access rights
    const hasAccess = 
      payment.userId === req.user.id ||
      (payment.organizationId === req.user.organizationId && 
       ['ADMIN', 'MANAGER'].includes(req.user.role));

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { payment }
    });

  } catch (error) {
    logger.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment'
    });
  }
});

// @route   POST /api/payments/:id/refund
// @desc    Process refund
// @access  Private (Admin/Manager only)
router.post('/:id/refund', 
  authenticateToken, 
  authorize('ADMIN', 'MANAGER'), 
  async (req, res) => {
    try {
      const { id } = req.params;
      const { amount, reason } = req.body;

      const payment = await prisma.payment.findUnique({
        where: { id },
        include: {
          booking: true
        }
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      if (payment.organizationId !== req.user.organizationId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      if (payment.status !== 'COMPLETED') {
        return res.status(400).json({
          success: false,
          message: 'Can only refund completed payments'
        });
      }

      // Validate refund amount
      const refundAmount = amount || payment.amount;
      const maxRefund = payment.amount - payment.refundedAmount;

      if (refundAmount > maxRefund) {
        return res.status(400).json({
          success: false,
          message: `Maximum refund amount is €${maxRefund}`
        });
      }

      // Process refund with Stripe
      const stripeAccount = payment.metadata?.stripeAccount;
      const requestOptions = stripeAccount ? { stripeAccount } : {};

      const refund = await stripe.refunds.create(
        {
          payment_intent: payment.stripePaymentIntentId,
          amount: Math.round(refundAmount * 100), // Convert to cents
          reason: 'requested_by_customer',
          metadata: {
            refundReason: reason,
            processedBy: req.user.id
          }
        },
        requestOptions
      );

      // Update payment record
      await prisma.payment.update({
        where: { id },
        data: {
          status: refundAmount >= payment.amount ? 'REFUNDED' : 'COMPLETED',
          refundedAmount: { increment: refundAmount },
          refundedAt: new Date(),
          metadata: {
            ...payment.metadata,
            refunds: [
              ...(payment.metadata?.refunds || []),
              {
                id: refund.id,
                amount: refundAmount,
                reason,
                processedBy: req.user.id,
                processedAt: new Date()
              }
            ]
          }
        }
      });

      // Update booking if fully refunded
      if (payment.bookingId && refundAmount >= payment.amount) {
        await prisma.booking.update({
          where: { id: payment.bookingId },
          data: {
            paymentStatus: 'REFUNDED',
            refundAmount: refundAmount
          }
        });
      }

      // Send notification
      await sendNotification({
        userId: payment.userId,
        type: 'email',
        title: 'Refund Processed',
        message: `A refund of €${refundAmount} has been processed for your payment.`,
        bookingId: payment.bookingId
      });

      logger.info(`Refund processed: ${refund.id} for payment ${id}, amount: €${refundAmount}`);

      res.json({
        success: true,
        message: 'Refund processed successfully',
        data: {
          refund: {
            id: refund.id,
            amount: refundAmount,
            status: refund.status
          }
        }
      });

    } catch (error) {
      logger.error('Process refund error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process refund',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// @route   GET /api/payments/stats/overview
// @desc    Get payment statistics
// @access  Private (Admin/Manager only)
router.get('/stats/overview', 
  authenticateToken, 
  authorize('ADMIN', 'MANAGER'), 
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const organizationId = req.user.organizationId;

      let whereClause = {
        organizationId,
        status: 'COMPLETED'
      };

      if (startDate || endDate) {
        whereClause.processedAt = {};
        if (startDate) whereClause.processedAt.gte = new Date(startDate);
        if (endDate) whereClause.processedAt.lte = new Date(endDate);
      }

      // Get payment statistics
      const [
        totalPayments,
        totalRevenue,
        totalRefunded,
        paymentsByMethod,
        recentPayments
      ] = await Promise.all([
        prisma.payment.count({ where: whereClause }),
        prisma.payment.aggregate({
          where: whereClause,
          _sum: { amount: true }
        }),
        prisma.payment.aggregate({
          where: { ...whereClause, refundedAmount: { gt: 0 } },
          _sum: { refundedAmount: true }
        }),
        prisma.payment.groupBy({
          by: ['paymentMethod'],
          where: whereClause,
          _count: true,
          _sum: { amount: true }
        }),
        prisma.payment.findMany({
          where: whereClause,
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            },
            booking: {
              select: {
                field: {
                  select: {
                    name: true
                  }
                }
              }
            }
          },
          orderBy: {
            processedAt: 'desc'
          },
          take: 10
        })
      ]);

      const stats = {
        totalPayments,
        totalRevenue: totalRevenue._sum.amount || 0,
        totalRefunded: totalRefunded._sum.refundedAmount || 0,
        netRevenue: (totalRevenue._sum.amount || 0) - (totalRefunded._sum.refundedAmount || 0),
        averageTransaction: totalPayments > 0 ? (totalRevenue._sum.amount || 0) / totalPayments : 0,
        paymentsByMethod: paymentsByMethod.map(method => ({
          method: method.paymentMethod,
          count: method._count,
          total: method._sum.amount
        })),
        recentPayments: recentPayments.map(payment => ({
          id: payment.id,
          amount: payment.amount,
          processedAt: payment.processedAt,
          customer: `${payment.user.firstName} ${payment.user.lastName}`,
          fieldName: payment.booking?.field?.name || 'N/A'
        }))
      };

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      logger.error('Get payment stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payment statistics'
      });
    }
  }
);

module.exports = router;