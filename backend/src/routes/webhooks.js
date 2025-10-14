// ===========================================
// src/routes/webhooks.js - Stripe Webhook Handler
// ===========================================

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { prisma } = require('../config/database');
const logger = require('../utils/logger');
const { sendNotification } = require('../utils/notifications');

const router = express.Router();

// @route   POST /api/webhooks/stripe
// @desc    Handle Stripe webhooks
// @access  Public (verified by Stripe signature)
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.rawBody || req.body, sig, webhookSecret);
  } catch (err) {
    logger.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      default:
        logger.info(`Unhandled webhook event type: ${event.type}`);
    }

    res.json({ received: true });

  } catch (error) {
    logger.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Handle successful payment
async function handlePaymentIntentSucceeded(paymentIntent) {
  try {
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
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
      logger.warn(`Payment not found for payment intent: ${paymentIntent.id}`);
      return;
    }

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
    if (payment.bookingId) {
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
        message: `Your payment of €${payment.amount} has been processed successfully.`,
        bookingId: payment.bookingId
      });
    }

    logger.info(`Payment succeeded via webhook: ${payment.id}`);

  } catch (error) {
    logger.error('Error handling payment_intent.succeeded:', error);
    throw error;
  }
}

// Handle failed payment
async function handlePaymentIntentFailed(paymentIntent) {
  try {
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
      include: {
        user: true,
        booking: true
      }
    });

    if (!payment) {
      logger.warn(`Payment not found for failed payment intent: ${paymentIntent.id}`);
      return;
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'FAILED',
        failureReason: paymentIntent.last_payment_error?.message || 'Payment failed'
      }
    });

    // Update booking status
    if (payment.bookingId) {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: {
          paymentStatus: 'FAILED'
        }
      });
    }

    // Send failure notification
    await sendNotification({
      userId: payment.userId,
      type: 'email',
      title: 'Payment Failed',
      message: `Your payment of €${payment.amount} could not be processed. Please try again.`,
      bookingId: payment.bookingId
    });

    logger.warn(`Payment failed via webhook: ${payment.id}`);

  } catch (error) {
    logger.error('Error handling payment_intent.payment_failed:', error);
    throw error;
  }
}

// Handle refund
async function handleChargeRefunded(charge) {
  try {
    const payment = await prisma.payment.findFirst({
      where: { stripeChargeId: charge.id },
      include: {
        user: true,
        booking: true
      }
    });

    if (!payment) {
      logger.warn(`Payment not found for refunded charge: ${charge.id}`);
      return;
    }

    const refundAmount = charge.amount_refunded / 100; // Convert from cents

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: refundAmount >= payment.amount ? 'REFUNDED' : 'COMPLETED',
        refundedAmount: refundAmount,
        refundedAt: new Date()
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

    logger.info(`Refund processed via webhook: ${payment.id}, amount: €${refundAmount}`);

  } catch (error) {
    logger.error('Error handling charge.refunded:', error);
    throw error;
  }
}

// Handle subscription updates
async function handleSubscriptionUpdate(subscription) {
  try {
    const customerId = subscription.customer;
    const organizationId = subscription.metadata?.organizationId;

    if (!organizationId) {
      logger.warn(`Organization ID not found in subscription metadata: ${subscription.id}`);
      return;
    }

    // Update organization subscription status
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        subscriptionStatus: subscription.status === 'active' ? 'ACTIVE' : 'INACTIVE',
        subscriptionEndsAt: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
        paymentConfig: {
          ...await prisma.organization.findUnique({
            where: { id: organizationId },
            select: { paymentConfig: true }
          }).then(org => org.paymentConfig),
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: customerId
        }
      }
    });

    logger.info(`Subscription updated via webhook: ${subscription.id} for org ${organizationId}`);

  } catch (error) {
    logger.error('Error handling subscription update:', error);
    throw error;
  }
}

// Handle subscription deletion
async function handleSubscriptionDeleted(subscription) {
  try {
    const organizationId = subscription.metadata?.organizationId;

    if (!organizationId) {
      logger.warn(`Organization ID not found in subscription metadata: ${subscription.id}`);
      return;
    }

    // Update organization subscription status
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        subscriptionStatus: 'CANCELLED',
        subscriptionEndsAt: new Date()
      }
    });

    logger.info(`Subscription deleted via webhook: ${subscription.id} for org ${organizationId}`);

  } catch (error) {
    logger.error('Error handling subscription deletion:', error);
    throw error;
  }
}

module.exports = router;
                