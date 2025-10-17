// ============================================
// frontend/src/hooks/useFields.js
// Hook per Gestione Campi Sportivi
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { fieldsAPI } from '../api/fields';

export const useFields = (filters = {}) => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all fields
  const fetchFields = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fieldsAPI.getFields({
        ...filters,
        ...params
      });

      setFields(response.data.fields || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Errore nel caricamento campi');
      console.error('Fetch fields error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Get single field
  const getField = async (fieldId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fieldsAPI.getField(fieldId);
      return { success: true, data: response.data.field };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Errore nel caricamento campo';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Get available fields for date/time
  const getAvailableFields = async (date, startTime, endTime, fieldType = null) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fieldsAPI.getAvailableFields({
        date,
        startTime,
        endTime,
        fieldType
      });

      return { success: true, data: response.data.fields || [] };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Errore nel caricamento disponibilità';
      setError(errorMsg);
      return { success: false, error: errorMsg, data: [] };
    } finally {
      setLoading(false);
    }
  };

  // Filter fields by type
  const filterByType = (fieldType) => {
    if (!fieldType) return fields;
    return fields.filter(field => field.fieldType === fieldType);
  };

  // Filter active fields only
  const getActiveFields = () => {
    return fields.filter(field => field.isActive);
  };

  // Sort fields by price
  const sortByPrice = (ascending = true) => {
    return [...fields].sort((a, b) => 
      ascending ? a.hourlyRate - b.hourlyRate : b.hourlyRate - a.hourlyRate
    );
  };

  // Get field types available
  const getFieldTypes = () => {
    const types = new Set(fields.map(field => field.fieldType));
    return Array.from(types);
  };

  // Calculate price for duration
  const calculatePrice = (field, startTime, endTime, isMember = false) => {
    if (!field || !startTime || !endTime) return 0;

    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    const hours = (end - start) / (1000 * 60 * 60);

    let price = field.hourlyRate * hours;

    // Apply peak hour rate if applicable
    const hour = start.getHours();
    if (field.peakHourRate && hour >= 18 && hour < 22) {
      price = field.peakHourRate * hours;
    }

    // Apply member discount
    if (isMember && field.memberDiscountPercent) {
      price = price * (1 - field.memberDiscountPercent / 100);
    }

    return Math.round(price * 100) / 100; // Round to 2 decimals
  };

  // Initial fetch
  useEffect(() => {
    fetchFields();
  }, [fetchFields]);

  return {
    fields,
    loading,
    error,
    fetchFields,
    getField,
    getAvailableFields,
    filterByType,
    getActiveFields,
    sortByPrice,
    getFieldTypes,
    calculatePrice,
    refetch: fetchFields
  };
};

export default useFields;