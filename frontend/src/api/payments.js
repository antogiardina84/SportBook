// ============================================
// frontend/src/api/payments.js
// API Client per Pagamenti Stripe - CORRETTO
// ============================================

import axios from './axios';

export const paymentsAPI = {
  // Create payment intent
  createPaymentIntent: (data) => 
    axios.post('/payments/create-payment-intent', data),

  // Confirm payment
  confirmPayment: (data) => 
    axios.post('/payments/confirm-payment', data),

  // Get payment by ID
  getPayment: (id) => 
    axios.get(`/payments/${id}`),

  // Get user payments
  getMyPayments: (params) => 
    axios.get('/payments/my-payments', { params }),

  // Request refund (user)
  requestRefund: (id, data) => 
    axios.post(`/payments/${id}/refund-request`, data),

  // Process refund (admin)
  processRefund: (id, data) => 
    axios.post(`/payments/${id}/refund`, data),

  // Get payment methods
  getPaymentMethods: () => 
    axios.get('/payments/methods'),

  // Add payment method
  addPaymentMethod: (data) => 
    axios.post('/payments/methods', data),

  // Remove payment method
  removePaymentMethod: (id) => 
    axios.delete(`/payments/methods/${id}`),

  // Set default payment method
  setDefaultPaymentMethod: (id) => 
    axios.put(`/payments/methods/${id}/set-default`),

  // Get payment statistics (admin)
  getPaymentStats: (params) => 
    axios.get('/payments/stats', { params }),

  // Export payments (admin)
  exportPayments: (params) => 
    axios.get('/payments/export', {
      params,
      responseType: 'blob'
    })
};

export default paymentsAPI;