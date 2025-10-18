// ============================================
// frontend/src/api/fields.js
// API Client per Gestione Campi - COMPLETO
// ============================================

import axios from './axios';

export const fieldsAPI = {
  // Get all fields
  getFields: (params) => axios.get('/api/fields', { params }),
  
  // Get single field
  getField: (id) => axios.get(`/api/fields/${id}`),
  
  // Check field availability
  checkAvailability: (fieldId, params) => 
    axios.get(`/api/fields/${fieldId}/availability`, { params }),
  
  // Get field schedule
  getSchedule: (fieldId, date) => 
    axios.get(`/api/fields/${fieldId}/schedule`, { params: { date } }),
  
  // Get available time slots
  getAvailableSlots: (fieldId, date) => 
    axios.get(`/api/fields/${fieldId}/available-slots`, { params: { date } }),
  
  // Search fields
  searchFields: (params) => axios.get('/api/fields/search', { params }),
  
  // Get field types
  getFieldTypes: () => axios.get('/api/fields/types'),
  
  // Get field by type
  getFieldsByType: (type) => axios.get(`/api/fields/type/${type}`),
  
  // Admin: Create field
  createField: (data) => axios.post('/api/fields', data),
  
  // Admin: Update field
  updateField: (id, data) => axios.put(`/api/fields/${id}`, data),
  
  // Admin: Delete field
  deleteField: (id) => axios.delete(`/api/fields/${id}`),
  
  // Admin: Update field status
  updateFieldStatus: (id, isActive) => 
    axios.patch(`/api/fields/${id}/status`, { isActive }),
  
  // Get field statistics
  getFieldStats: (id) => axios.get(`/api/fields/${id}/stats`),
  
  // Get popular fields
  getPopularFields: () => axios.get('/api/fields/popular')
};

// Alias exports per compatibilità
export const fieldAPI = fieldsAPI;
export const fieldApi = fieldsAPI;

export default fieldsAPI;