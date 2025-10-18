// ============================================
// frontend/src/api/bookings.js
// API Client per Prenotazioni - COMPLETO
// ============================================

import axios from './axios';

export const bookingsAPI = {
  // Get user's bookings
  getMyBookings: (params) => axios.get('/bookings/my-bookings', { params }),
  
  // Get all bookings (admin)
  getAllBookings: (params) => axios.get('/bookings', { params }),
  
  // Get single booking
  getBooking: (id) => axios.get(`/bookings/${id}`),
  
  // Create booking
  createBooking: (data) => axios.post('/bookings', data),
  
  // Update booking
  updateBooking: (id, data) => axios.put(`/bookings/${id}`, data),
  
  // Cancel booking
  cancelBooking: (id, reason) => axios.post(`/bookings/${id}/cancel`, { reason }),
  
  // Confirm booking
  confirmBooking: (id) => axios.post(`/bookings/${id}/confirm`),
  
  // Check availability
  checkAvailability: (fieldId, startTime, duration) => 
    axios.get('/bookings/check-availability', {
      params: { fieldId, startTime, duration }
    }),
  
  // Get booking statistics
  getBookingStats: (params) => axios.get('/bookings/stats', { params }),
  
  // Get upcoming bookings
  getUpcomingBookings: () => axios.get('/bookings/upcoming'),
  
  // Get past bookings
  getPastBookings: (params) => axios.get('/bookings/past', { params }),
};

// Alias exports per compatibilità
export const bookingAPI = bookingsAPI;
export const bookingApi = bookingsAPI;

export default bookingsAPI;