// ===========================================
// backend/src/routes/notifications.js
// ===========================================

const express = require('express');
const { prisma } = require('../config/database');
const { authenticateToken, authorize } = require('../middleware/auth');
const { sendNotification, sendBulkNotification } = require('../utils/notifications');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { unread, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = {
      organizationId: req.user.organizationId,
      userId: req.user.id
    };

    if (unread === 'true') {
      whereClause.readAt = null;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.notification.count({ where: whereClause }),
      prisma.notification.count({
        where: {
          ...whereClause,
          readAt: null
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    logger.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await prisma.notification.update({
      where: { id },
      data: { readAt: new Date() }
    });

    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    logger.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

// @route   POST /api/notifications/send
// @desc    Send notification (Admin)
// @access  Private (Admin)
router.post('/send', authenticateToken, authorize('ADMIN'), async (req, res) => {
  try {
    const { userId, title, message, type = 'email' } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'userId, title, and message are required'
      });
    }

    const notification = await sendNotification({
      userId,
      type,
      title,
      message
    });

    res.json({
      success: true,
      message: 'Notification sent successfully',
      data: { notification }
    });

  } catch (error) {
    logger.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification'
    });
  }
});

// @route   POST /api/notifications/broadcast
// @desc    Broadcast notification to multiple users (Admin)
// @access  Private (Admin)
router.post('/broadcast', authenticateToken, authorize('ADMIN'), async (req, res) => {
  try {
    const {
      userRoles = [],
      title,
      message,
      type = 'email'
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'title and message are required'
      });
    }

    const result = await sendBulkNotification({
      organizationId: req.user.organizationId,
      userRoles,
      title,
      message,
      type
    });

    res.json({
      success: true,
      message: 'Broadcast notification sent',
      data: result
    });

  } catch (error) {
    logger.error('Broadcast notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to broadcast notification'
    });
  }
});

module.exports = router;