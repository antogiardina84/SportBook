// ============================================
// frontend/src/api/admin.js
// API Client per operazioni Admin - COMPLETO
// ============================================

import axios from './axios';

export const adminAPI = {
  // Dashboard Statistics
  getDashboardStats: () => axios.get('/admin/dashboard'),
  getDashboard: () => axios.get('/admin/dashboard'), // Alias

  // Organization Settings
  getSettings: () => axios.get('/admin/settings'),
  updateSettings: (data) => axios.put('/admin/settings', data),

  // User Management
  getUsers: (params) => axios.get('/admin/users', { params }),
  getUser: (id) => axios.get(`/admin/users/${id}`),
  createUser: (data) => axios.post('/admin/users', data),
  updateUser: (id, data) => axios.put(`/admin/users/${id}`, data),
  deleteUser: (id) => axios.delete(`/admin/users/${id}`),

  // Field Management
  getFields: (params) => axios.get('/admin/fields', { params }),
  getField: (id) => axios.get(`/admin/fields/${id}`),
  createField: (data) => axios.post('/admin/fields', data),
  updateField: (id, data) => axios.put(`/admin/fields/${id}`, data),
  deleteField: (id) => axios.delete(`/admin/fields/${id}`),

  // Booking Management
  getAllBookings: (params) => axios.get('/admin/bookings', { params }),
  updateBooking: (id, data) => axios.put(`/admin/bookings/${id}`, data),
  cancelBooking: (id) => axios.post(`/admin/bookings/${id}/cancel`),

  // Reports
  getRevenueReport: (params) => axios.get('/admin/reports/revenue', { params }),
  getBookingReport: (params) => axios.get('/admin/reports/bookings', { params }),
  getUserReport: (params) => axios.get('/admin/reports/users', { params }),
  exportReport: (type, params) => axios.get(`/admin/reports/export/${type}`, {
    params,
    responseType: 'blob'
  }),

  // Payments
  getPayments: (params) => axios.get('/admin/payments', { params }),
  processRefund: (id, data) => axios.post(`/admin/payments/${id}/refund`, data),

  // Memberships
  getMemberships: (params) => axios.get('/admin/memberships', { params }),
  createMembership: (data) => axios.post('/admin/memberships', data),
  updateMembership: (id, data) => axios.put(`/admin/memberships/${id}`, data),
  cancelMembership: (id) => axios.delete(`/admin/memberships/${id}`),

  // Notifications
  sendNotification: (data) => axios.post('/admin/notifications/send', data),
  sendBulkNotification: (data) => axios.post('/admin/notifications/bulk', data),

  // System Logs
  getLogs: (params) => axios.get('/admin/logs', { params }),

  // Analytics
  getAnalytics: (params) => axios.get('/admin/analytics', { params })
};

// Alias exports per compatibilità
export const adminApi = adminAPI;

export default adminAPI;