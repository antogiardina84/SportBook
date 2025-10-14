// ===========================================
// src/utils/pricing.js - Pricing Calculation Utility
// ===========================================

const { prisma } = require('../config/database');
const dayjs = require('dayjs');

async function calculateBookingPrice({ field, startTime, endTime, userId, organizationId }) {
  const duration = dayjs(endTime).diff(dayjs(startTime), 'hour', true);
  let basePrice = field.hourlyRate * duration;

  // Check if it's peak hours (example: weekends or evenings)
  const bookingDay = dayjs(startTime);
  const hour = bookingDay.hour();
  const isWeekend = bookingDay.day() === 0 || bookingDay.day() === 6;
  const isPeakHour = hour >= 18 || hour <= 9 || isWeekend;

  if (isPeakHour && field.peakHourRate) {
    basePrice = field.peakHourRate * duration;
  }

  // Check for member discounts
  let discountAmount = 0;
  const activeMembership = await prisma.membership.findFirst({
    where: {
      userId,
      organizationId,
      status: 'ACTIVE',
      startsAt: { lte: startTime },
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: startTime } }
      ]
    }
  });

  if (activeMembership) {
    discountAmount = basePrice * (activeMembership.discountPercent / 100);
  } else if (field.memberDiscountPercent > 0) {
    discountAmount = basePrice * (field.memberDiscountPercent / 100);
  }

  // Calculate tax (example: 22% IVA in Italy)
  const taxRate = 0.22;
  const subtotal = basePrice - discountAmount;
  const taxAmount = subtotal * taxRate;
  const totalAmount = subtotal + taxAmount;

  return {
    basePrice: parseFloat(basePrice.toFixed(2)),
    discountAmount: parseFloat(discountAmount.toFixed(2)),
    taxAmount: parseFloat(taxAmount.toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    duration,
    isPeakHour,
    membershipDiscount: activeMembership ? activeMembership.discountPercent : 0
  };
}

module.exports = {
  calculateBookingPrice
};