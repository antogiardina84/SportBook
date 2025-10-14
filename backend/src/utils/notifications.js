// ===========================================
// src/utils/notifications.js - Notification Utility
// ===========================================

const { prisma } = require('../config/database');
const { sendEmail } = require('./email');
const logger = require('./logger');
const twilio = require('twilio');

async function sendNotification({ 
  userId, 
  type = 'email', 
  title, 
  message, 
  bookingId = null,
  membershipId = null 
}) {
  try {
    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            smsConfig: true,
            emailConfig: true
          }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Create notification record
    const notification = await prisma.notification.create({
      data: {
        organizationId: user.organizationId,
        userId,
        title,
        message,
        type,
        bookingId,
        membershipId,
        scheduledAt: new Date(),
        deliveryStatus: 'pending'
      }
    });

    // Send based on type
    let sent = false;

    if (type === 'email' || type === 'EMAIL') {
      try {
        await sendEmail({
          to: user.email,
          subject: title,
          template: 'notification',
          data: {
            firstName: user.firstName,
            title,
            message,
            organizationName: user.organization.name
          },
          organizationId: user.organizationId
        });
        sent = true;
      } catch (error) {
        logger.error('Email notification failed:', error);
      }
    }

    if (type === 'sms' || type === 'SMS') {
      if (user.phone && user.organization.smsConfig?.twilioAccountSid) {
        try {
          const client = twilio(
            user.organization.smsConfig.twilioAccountSid,
            user.organization.smsConfig.twilioAuthToken
          );

          await client.messages.create({
            body: `${title}: ${message}`,
            from: user.organization.smsConfig.twilioPhoneNumber,
            to: user.phone
          });
          sent = true;
        } catch (error) {
          logger.error('SMS notification failed:', error);
        }
      }
    }

    // Update notification status
    await prisma.notification.update({
      where: { id: notification.id },
      data: {
        sentAt: sent ? new Date() : null,
        deliveryStatus: sent ? 'sent' : 'failed'
      }
    });

    logger.info(`Notification sent: ${notification.id} to user ${userId} via ${type}`);
    return notification;

  } catch (error) {
    logger.error('Send notification error:', error);
    throw error;
  }
}

async function sendBulkNotification({
  organizationId,
  userRoles = [],
  title,
  message,
  type = 'email'
}) {
  try {
    // Get users based on roles
    const users = await prisma.user.findMany({
      where: {
        organizationId,
        isActive: true,
        ...(userRoles.length > 0 && { role: { in: userRoles } })
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true
      }
    });

    // Send to each user
    const promises = users.map(user =>
      sendNotification({
        userId: user.id,
        type,
        title,
        message
      }).catch(error => {
        logger.error(`Failed to send to user ${user.id}:`, error);
        return null;
      })
    );

    const results = await Promise.all(promises);
    const successCount = results.filter(r => r !== null).length;

    logger.info(`Bulk notification sent to ${successCount}/${users.length} users`);

    return {
      total: users.length,
      success: successCount,
      failed: users.length - successCount
    };

  } catch (error) {
    logger.error('Send bulk notification error:', error);
    throw error;
  }
}

module.exports = {
  sendNotification,
  sendBulkNotification
};