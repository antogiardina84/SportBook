// ===========================================
// frontend/src/api/fields.js
// ===========================================

import api from './axios';

export const fieldsAPI = {
  getAll: async (params) => {
    const response = await api.get('/fields', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/fields/${id}`);
    return response.data;
  },
};
