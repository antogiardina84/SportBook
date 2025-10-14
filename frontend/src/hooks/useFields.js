// ===========================================
// frontend/src/hooks/useFields.js
// ===========================================

import { useQuery } from '@tanstack/react-query';
import { fieldsAPI } from '@api/fields';

export const useFields = (params = {}) => {
  return useQuery({
    queryKey: ['fields', params],
    queryFn: () => fieldsAPI.getAll(params),
  });
};

export const useField = (id) => {
  return useQuery({
    queryKey: ['field', id],
    queryFn: () => fieldsAPI.getById(id),
    enabled: !!id,
  });
};