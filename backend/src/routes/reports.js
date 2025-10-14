// ===========================================
// backend/src/routes/reports.js
// ===========================================

const express = require('express');
const { prisma } = require('../config/database');
const { authenticateToken, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');
const dayjs = require('dayjs');

const router = express.Router();

// All routes require Admin or Manager role
router.use(authenticateToken, authorize('ADMIN', 'MANAGER'));

// @route   GET /api/reports/overview
// @desc    Get overview statistics
// @access  Private (Admin/Manager)
router.get('/overview', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const organizationId = req.user.organizationId;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.lte = new Date(endDate);
    }

    const [
      totalUsers,
      totalBookings,
      totalRevenue,
      averageBookingValue,
      bookingsByStatus,
      topFields
    ] = await Promise.all([
      prisma.user.count({
        where: { organizationId, isActive: true }
      }),
      prisma.booking.count({
        where: { organizationId, ...dateFilter }
      }),
      prisma.payment.aggregate({
        where: {
          organizationId,
          status: 'COMPLETED',
          ...dateFilter
        },
        _sum: { amount: true }
      }),
      prisma.booking.aggregate({
        where: { organizationId, ...dateFilter },
        _avg: { totalAmount: true }
      }),
      prisma.booking.groupBy({
        by: ['status'],
        where: { organizationId, ...dateFilter },
        _count: true
      }),
      prisma.booking.groupBy({
        by: ['fieldId'],
        where: { organizationId, ...dateFilter },
        _count: true,
        orderBy: { _count: { fieldId: 'desc' } },
        take: 5
      })
    ]);

    // Get field names for top fields
    const fieldIds = topFields.map(f => f.fieldId);
    const fields = await prisma.field.findMany({
      where: { id: { in: fieldIds } },
      select: { id: true, name: true }
    });

    const topFieldsWithNames = topFields.map(tf => ({
      fieldId: tf.fieldId,
      fieldName: fields.find(f => f.id === tf.fieldId)?.name || 'Unknown',
      count: tf._count
    }));

    res.json({
      success: true,
      data: {
        totalUsers,
        totalBookings,
        totalRevenue: totalRevenue._sum.amount || 0,
        averageBookingValue: averageBookingValue._avg.totalAmount || 0,
        bookingsByStatus,
        topFields: topFieldsWithNames
      }
    });

  } catch (error) {
    logger.error('Get overview report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate overview report'
    });
  }
});

// @route   GET /api/reports/revenue
// @desc    Get revenue report
// @access  Private (Admin/Manager)
router.get('/revenue', async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    const organizationId = req.user.organizationId;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate are required'
      });
    }

    const payments = await prisma.payment.findMany({
      where: {
        organizationId,
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

    // Group by date
    const grouped = {};
    payments.forEach(payment => {
      const date = dayjs(payment.processedAt).format('YYYY-MM-DD');
      if (!grouped[date]) {
        grouped[date] = {
          date,
          revenue: 0,
          count: 0,
          byMethod: {},
          byFieldType: {}
        };
      }
      
      const amount = parseFloat(payment.amount);
      grouped[date].revenue += amount;
      grouped[date].count += 1;

      // By payment method
      if (!grouped[date].byMethod[payment.paymentMethod]) {
        grouped[date].byMethod[payment.paymentMethod] = 0;
      }
      grouped[date].byMethod[payment.paymentMethod] += amount;

      // By field type
      const fieldType = payment.booking?.field?.fieldType || 'UNKNOWN';
      if (!grouped[date].byFieldType[fieldType]) {
        grouped[date].byFieldType[fieldType] = 0;
      }
      grouped[date].byFieldType[fieldType] += amount;
    });

    const report = Object.values(grouped).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    const totalRevenue = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalTransactions: payments.length,
          averageTransaction: payments.length > 0 ? totalRevenue / payments.length : 0
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

// @route   GET /api/reports/bookings
// @desc    Get bookings report
// @access  Private (Admin/Manager)
router.get('/bookings', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const organizationId = req.user.organizationId;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate are required'
      });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        organizationId,
        startTime: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      include: {
        field: {
          select: {
            name: true,
            fieldType: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Group by status
    const byStatus = {};
    const byFieldType = {};
    const byHour = {};

    bookings.forEach(booking => {
      // By status
      if (!byStatus[booking.status]) {
        byStatus[booking.status] = 0;
      }
      byStatus[booking.status]++;

      // By field type
      const fieldType = booking.field.fieldType;
      if (!byFieldType[fieldType]) {
        byFieldType[fieldType] = 0;
      }
      byFieldType[fieldType]++;

      // By hour
      const hour = dayjs(booking.startTime).hour();
      if (!byHour[hour]) {
        byHour[hour] = 0;
      }
      byHour[hour]++;
    });

    res.json({
      success: true,
      data: {
        total: bookings.length,
        byStatus,
        byFieldType,
        byHour,
        bookings: bookings.slice(0, 100) // Limit to 100 for performance
      }
    });

  } catch (error) {
    logger.error('Get bookings report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate bookings report'
    });
  }
});

// @route   GET /api/reports/users
// @desc    Get users report
// @access  Private (Admin/Manager)
router.get('/users', async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    const [
      totalUsers,
      activeUsers,
      usersByRole,
      usersWithMemberships,
      topBookers
    ] = await Promise.all([
      prisma.user.count({
        where: { organizationId }
      }),
      prisma.user.count({
        where: { organizationId, isActive: true }
      }),
      prisma.user.groupBy({
        by: ['role'],
        where: { organizationId },
        _count: true
      }),
      prisma.membership.count({
        where: {
          organizationId,
          status: 'ACTIVE'
        }
      }),
      prisma.booking.groupBy({
        by: ['userId'],
        where: { organizationId },
        _count: true,
        orderBy: { _count: { userId: 'desc' } },
        take: 10
      })
    ]);

    // Get user details for top bookers
    const userIds = topBookers.map(tb => tb.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true
      }
    });

    const topBookersWithNames = topBookers.map(tb => ({
      userId: tb.userId,
      userName: (() => {
        const user = users.find(u => u.id === tb.userId);
        return user ? `${user.firstName} ${user.lastName}` : 'Unknown';
      })(),
      bookingCount: tb._count
    }));

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        usersByRole,
        usersWithMemberships,
        topBookers: topBookersWithNames
      }
    });

  } catch (error) {
    logger.error('Get users report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate users report'
    });
  }
});

module.exports = router;