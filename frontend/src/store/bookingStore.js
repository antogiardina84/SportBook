// ============================================
// frontend/src/store/bookingStore.js
// Zustand Store - Prenotazioni Globale
// ============================================

import { create } from 'zustand';
import { bookingAPI } from '../api/bookings';

const useBookingStore = create((set, get) => ({
  // State
  bookings: [],
  currentBooking: null,
  selectedField: null,
  selectedDate: null,
  selectedTimeSlot: null,
  loading: false,
  error: null,
  filters: {
    status: null,
    fieldType: null,
    dateFrom: null,
    dateTo: null
  },

  // Actions
  setBookings: (bookings) => set({ bookings }),
  
  setCurrentBooking: (booking) => set({ currentBooking: booking }),
  
  setSelectedField: (field) => set({ selectedField: field }),
  
  setSelectedDate: (date) => set({ selectedDate: date }),
  
  setSelectedTimeSlot: (timeSlot) => set({ selectedTimeSlot: timeSlot }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),

  clearFilters: () => set({
    filters: {
      status: null,
      fieldType: null,
      dateFrom: null,
      dateTo: null
    }
  }),

  // Fetch bookings
  fetchBookings: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      const response = await bookingAPI.getMyBookings({
        ...filters,
        ...params
      });
      
      set({
        bookings: response.data.bookings || [],
        loading: false
      });

      return { success: true, data: response.data.bookings };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Errore nel caricamento prenotazioni';
      set({ loading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  // Get booking by ID
  fetchBookingById: async (bookingId) => {
    set({ loading: true, error: null });
    try {
      const response = await bookingAPI.getBooking(bookingId);
      set({
        currentBooking: response.data.booking,
        loading: false
      });
      return { success: true, data: response.data.booking };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Errore nel caricamento prenotazione';
      set({ loading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  // Create booking
  createBooking: async (bookingData) => {
    set({ loading: true, error: null });
    try {
      const response = await bookingAPI.createBooking(bookingData);
      const newBooking = response.data.booking;
      
      set((state) => ({
        bookings: [newBooking, ...state.bookings],
        currentBooking: newBooking,
        loading: false
      }));

      return { success: true, data: newBooking };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Errore nella creazione prenotazione';
      set({ loading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  // Update booking
  updateBooking: async (bookingId, updateData) => {
    set({ loading: true, error: null });
    try {
      const response = await bookingAPI.updateBooking(bookingId, updateData);
      const updatedBooking = response.data.booking;
      
      set((state) => ({
        bookings: state.bookings.map((b) =>
          b.id === bookingId ? updatedBooking : b
        ),
        currentBooking: state.currentBooking?.id === bookingId 
          ? updatedBooking 
          : state.currentBooking,
        loading: false
      }));

      return { success: true, data: updatedBooking };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Errore nell\'aggiornamento prenotazione';
      set({ loading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  // Cancel booking
  cancelBooking: async (bookingId) => {
    set({ loading: true, error: null });
    try {
      await bookingAPI.cancelBooking(bookingId);
      
      set((state) => ({
        bookings: state.bookings.map((b) =>
          b.id === bookingId ? { ...b, status: 'CANCELLED' } : b
        ),
        currentBooking: state.currentBooking?.id === bookingId
          ? { ...state.currentBooking, status: 'CANCELLED' }
          : state.currentBooking,
        loading: false
      }));

      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Errore nella cancellazione prenotazione';
      set({ loading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  // Check availability
  checkAvailability: async (fieldId, startTime, endTime) => {
    try {
      const response = await bookingAPI.checkAvailability(fieldId, {
        startTime,
        endTime
      });
      return { success: true, available: response.data.available };
    } catch (error) {
      return { 
        success: false, 
        available: false,
        error: error.response?.data?.message 
      };
    }
  },

  // Get future bookings
  getFutureBookings: () => {
    const { bookings } = get();
    const now = new Date();
    return bookings.filter((booking) => {
      const bookingDate = new Date(booking.startTime);
      return bookingDate > now && booking.status !== 'CANCELLED';
    });
  },

  // Get past bookings
  getPastBookings: () => {
    const { bookings } = get();
    const now = new Date();
    return bookings.filter((booking) => {
      const bookingDate = new Date(booking.startTime);
      return bookingDate <= now;
    });
  },

  // Get cancelled bookings
  getCancelledBookings: () => {
    const { bookings } = get();
    return bookings.filter((booking) => booking.status === 'CANCELLED');
  },

  // Get bookings by status
  getBookingsByStatus: (status) => {
    const { bookings } = get();
    return bookings.filter((booking) => booking.status === status);
  },

  // Get bookings by field
  getBookingsByField: (fieldId) => {
    const { bookings } = get();
    return bookings.filter((booking) => booking.fieldId === fieldId);
  },

  // Calculate total spent
  getTotalSpent: () => {
    const { bookings } = get();
    return bookings
      .filter((b) => b.status === 'COMPLETED' || b.status === 'CONFIRMED')
      .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
  },

  // Get booking stats
  getStats: () => {
    const { bookings } = get();
    return {
      total: bookings.length,
      confirmed: bookings.filter((b) => b.status === 'CONFIRMED').length,
      pending: bookings.filter((b) => b.status === 'PENDING').length,
      cancelled: bookings.filter((b) => b.status === 'CANCELLED').length,
      completed: bookings.filter((b) => b.status === 'COMPLETED').length,
      totalSpent: get().getTotalSpent()
    };
  },

  // Clear booking form
  clearBookingForm: () => set({
    selectedField: null,
    selectedDate: null,
    selectedTimeSlot: null,
    currentBooking: null
  }),

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () => set({
    bookings: [],
    currentBooking: null,
    selectedField: null,
    selectedDate: null,
    selectedTimeSlot: null,
    loading: false,
    error: null,
    filters: {
      status: null,
      fieldType: null,
      dateFrom: null,
      dateTo: null
    }
  })
}));

export default useBookingStore;