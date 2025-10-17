// ============================================
// frontend/src/api/payments.js
// API Client per Pagamenti Stripe
// ============================================

import axios from './axios';

export const paymentsAPI = {
  // Create payment intent
  createPaymentIntent: (data) => 
    axios.post('/api/payments/create-payment-intent', data),

  // Confirm payment
  confirmPayment: (data) => 
    axios.post('/api/payments/confirm-payment', data),

  // Get payment by ID
  getPayment: (id) => 
    axios.get(`/api/payments/${id}`),

  // Get user payments
  getMyPayments: (params) => 
    axios.get('/api/payments/my-payments', { params }),

  // Request refund (user)
  requestRefund: (id, data) => 
    axios.post(`/api/payments/${id}/refund-request`, data),

  // Process refund (admin)
  processRefund: (id, data) => 
    axios.post(`/api/payments/${id}/refund`, data),

  // Get payment methods
  getPaymentMethods: () => 
    axios.get('/api/payments/methods'),

  // Add payment method
  addPaymentMethod: (data) => 
    axios.post('/api/payments/methods', data),

  // Remove payment method
  removePaymentMethod: (id) => 
    axios.delete(`/api/payments/methods/${id}`),

  // Set default payment method
  setDefaultPaymentMethod: (id) => 
    axios.put(`/api/payments/methods/${id}/set-default`),

  // Get payment statistics (admin)
  getPaymentStats: (params) => 
    axios.get('/api/payments/stats', { params }),

  // Export payments (admin)
  exportPayments: (params) => 
    axios.get('/api/payments/export', {
      params,
      responseType: 'blob'
    })
};

export default paymentsAPI;