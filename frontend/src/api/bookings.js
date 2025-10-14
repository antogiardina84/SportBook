// ===========================================
// frontend/src/api/bookings.js
// ===========================================

import api from './axios';

export const bookingsAPI = {
  getAll: async (params) => {
    const response = await api.get('/bookings', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  create: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/bookings/${id}`, data);
    return response.data;
  },

  cancel: async (id, reason) => {
    const response = await api.post(`/bookings/${id}/cancel`, { reason });
    return response.data;
  },

  checkAvailability: async (fieldId, params) => {
    const response = await api.get(`/bookings/availability/${fieldId}`, { params });
    return response.data;
  },
};