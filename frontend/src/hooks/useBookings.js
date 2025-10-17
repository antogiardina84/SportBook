// ============================================
// frontend/src/hooks/useBookings.js
// Hook per Gestione Prenotazioni
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { bookingAPI } from '../api/bookings';
import { useAuth } from './useAuth';

export const useBookings = (filters = {}) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0
  });

  // Fetch bookings
  const fetchBookings = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await bookingAPI.getMyBookings({
        ...filters,
        ...params
      });

      setBookings(response.data.bookings || []);
      
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Errore nel caricamento prenotazioni');
      console.error('Fetch bookings error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Create booking
  const createBooking = async (bookingData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await bookingAPI.createBooking(bookingData);
      
      // Refresh bookings list
      await fetchBookings();
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Errore nella creazione prenotazione';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Cancel booking
  const cancelBooking = async (bookingId) => {
    try {
      setLoading(true);
      setError(null);

      await bookingAPI.cancelBooking(bookingId);
      
      // Update local state
      setBookings(prev => 
        prev.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b)
      );
      
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Errore nella cancellazione';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Get booking by ID
  const getBooking = async (bookingId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await bookingAPI.getBooking(bookingId);
      return { success: true, data: response.data.booking };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Errore nel caricamento prenotazione';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Check availability
  const checkAvailability = async (fieldId, startTime, endTime) => {
    try {
      const response = await bookingAPI.checkAvailability(fieldId, {
        startTime,
        endTime
      });
      return { success: true, available: response.data.available };
    } catch (err) {
      return { success: false, available: false };
    }
  };

  // Update booking
  const updateBooking = async (bookingId, updateData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await bookingAPI.updateBooking(bookingId, updateData);
      
      // Update local state
      setBookings(prev =>
        prev.map(b => b.id === bookingId ? response.data.booking : b)
      );
      
      return { success: true, data: response.data.booking };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Errore nell\'aggiornamento';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user, fetchBookings]);

  return {
    bookings,
    loading,
    error,
    pagination,
    fetchBookings,
    createBooking,
    cancelBooking,
    getBooking,
    updateBooking,
    checkAvailability,
    refetch: fetchBookings
  };
};

export default useBookings;