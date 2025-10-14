// ===========================================
// frontend/src/api/payments.js
// ===========================================

import api from './axios';

export const paymentsAPI = {
  createPaymentIntent: async (bookingId) => {
    const response = await api.post('/payments/create-payment-intent', { bookingId });
    return response.data;
  },

  confirmPayment: async (paymentIntentId) => {
    const response = await api.post('/payments/confirm-payment', { paymentIntentId });
    return response.data;
  },

  getAll: async (params) => {
    const response = await api.get('/payments', { params });
    return response.data;
  },
};