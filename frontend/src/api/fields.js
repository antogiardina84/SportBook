// ============================================
// frontend/src/api/fields.js
// API Client per Gestione Campi - CORRETTO
// ============================================

import axios from './axios';

export const fieldsAPI = {
  // Get all fields
  getFields: (params) => axios.get('/fields', { params }),
  
  // Get single field
  getField: (id) => axios.get(`/fields/${id}`),
  
  // Check field availability
  checkAvailability: (fieldId, params) => 
    axios.get(`/fields/${fieldId}/availability`, { params }),
  
  // Get field schedule
  getSchedule: (fieldId, date) => 
    axios.get(`/fields/${fieldId}/schedule`, { params: { date } }),
  
  // Get available time slots
  getAvailableSlots: (fieldId, date) => 
    axios.get(`/fields/${fieldId}/available-slots`, { params: { date } }),
  
  // Search fields
  searchFields: (params) => axios.get('/fields/search', { params }),
  
  // Get field types
  getFieldTypes: () => axios.get('/fields/types'),
  
  // Get field by type
  getFieldsByType: (type) => axios.get(`/fields/type/${type}`),
  
  // Admin: Create field
  createField: (data) => axios.post('/fields', data),
  
  // Admin: Update field
  updateField: (id, data) => axios.put(`/fields/${id}`, data),
  
  // Admin: Delete field
  deleteField: (id) => axios.delete(`/fields/${id}`),
  
  // Admin: Update field status
  updateFieldStatus: (id, isActive) => 
    axios.patch(`/fields/${id}/status`, { isActive }),
  
  // Get field statistics
  getFieldStats: (id) => axios.get(`/fields/${id}/stats`),
  
  // Get popular fields
  getPopularFields: () => axios.get('/fields/popular')
};

// Alias exports per compatibilità
export const fieldAPI = fieldsAPI;
export const fieldApi = fieldsAPI;

export default fieldsAPI;