// ============================================
// frontend/src/api/admin.js
// API Client per operazioni Admin - COMPLETO
// ============================================

import axios from './axios';

export const adminAPI = {
  // Dashboard Statistics
  getDashboardStats: () => axios.get('/api/admin/dashboard'),
  getDashboard: () => axios.get('/api/admin/dashboard'), // Alias

  // Organization Settings
  getSettings: () => axios.get('/api/admin/settings'),
  updateSettings: (data) => axios.put('/api/admin/settings', data),

  // User Management
  getUsers: (params) => axios.get('/api/admin/users', { params }),
  getUser: (id) => axios.get(`/api/admin/users/${id}`),
  createUser: (data) => axios.post('/api/admin/users', data),
  updateUser: (id, data) => axios.put(`/api/admin/users/${id}`, data),
  deleteUser: (id) => axios.delete(`/api/admin/users/${id}`),

  // Field Management
  getFields: (params) => axios.get('/api/admin/fields', { params }),
  getField: (id) => axios.get(`/api/admin/fields/${id}`),
  createField: (data) => axios.post('/api/admin/fields', data),
  updateField: (id, data) => axios.put(`/api/admin/fields/${id}`, data),
  deleteField: (id) => axios.delete(`/api/admin/fields/${id}`),

  // Booking Management
  getAllBookings: (params) => axios.get('/api/admin/bookings', { params }),
  updateBooking: (id, data) => axios.put(`/api/admin/bookings/${id}`, data),
  cancelBooking: (id) => axios.post(`/api/admin/bookings/${id}/cancel`),

  // Reports
  getRevenueReport: (params) => axios.get('/api/admin/reports/revenue', { params }),
  getBookingReport: (params) => axios.get('/api/admin/reports/bookings', { params }),
  getUserReport: (params) => axios.get('/api/admin/reports/users', { params }),
  exportReport: (type, params) => axios.get(`/api/admin/reports/export/${type}`, {
    params,
    responseType: 'blob'
  }),

  // Payments
  getPayments: (params) => axios.get('/api/admin/payments', { params }),
  processRefund: (id, data) => axios.post(`/api/admin/payments/${id}/refund`, data),

  // Memberships
  getMemberships: (params) => axios.get('/api/admin/memberships', { params }),
  createMembership: (data) => axios.post('/api/admin/memberships', data),
  updateMembership: (id, data) => axios.put(`/api/admin/memberships/${id}`, data),
  cancelMembership: (id) => axios.delete(`/api/admin/memberships/${id}`),

  // Notifications
  sendNotification: (data) => axios.post('/api/admin/notifications/send', data),
  sendBulkNotification: (data) => axios.post('/api/admin/notifications/bulk', data),

  // System Logs
  getLogs: (params) => axios.get('/api/admin/logs', { params }),

  // Analytics
  getAnalytics: (params) => axios.get('/api/admin/analytics', { params })
};

// Alias exports per compatibilità
export const adminApi = adminAPI;

export default adminAPI;