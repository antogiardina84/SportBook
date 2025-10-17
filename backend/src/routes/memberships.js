// backend/src/routes/memberships.js

const express = require('express');
const { prisma } = require('../config/database');
const { authenticateToken, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/memberships
// @desc    Get memberships
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = {
      organizationId: req.user.organizationId
    };

    // Role-based filtering
    if (req.user.role === 'MEMBER') {
      whereClause.userId = req.user.id;
    }

    if (status) {
      whereClause.status = status;
    }

    const [memberships, total] = await Promise.all([
      prisma.membership.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.membership.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: {
        memberships,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    logger.error('Get memberships error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch memberships'
    });
  }
});

// @route   POST /api/memberships
// @desc    Create membership
// @access  Private (Admin/Manager)
router.post('/', authenticateToken, authorize('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const {
      userId,
      name,
      description,
      membershipType,
      price,
      startsAt,
      expiresAt,
      bookingCredits = 0,
      discountPercent = 0,
      priorityBooking = false
    } = req.body;

    const membership = await prisma.membership.create({
      data: {
        organizationId: req.user.organizationId,
        userId,
        name,
        description,
        membershipType,
        price,
        startsAt: new Date(startsAt),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        bookingCredits,
        discountPercent,
        priorityBooking,
        status: 'ACTIVE'
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    logger.info(`Membership created: ${membership.id}`);

    res.status(201).json({
      success: true,
      message: 'Membership created successfully',
      data: { membership }
    });

  } catch (error) {
    logger.error('Create membership error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create membership'
    });
  }
});

module.exports = router;