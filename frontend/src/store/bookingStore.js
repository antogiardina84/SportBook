// ===========================================
// frontend/src/store/bookingStore.js
// ===========================================

import { create } from 'zustand';

export const useBookingStore = create((set) => ({
  selectedField: null,
  selectedDate: null,
  selectedTime: null,
  bookingData: null,

  setSelectedField: (field) => set({ selectedField: field }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedTime: (time) => set({ selectedTime: time }),
  setBookingData: (data) => set({ bookingData: data }),

  clearBooking: () =>
    set({
      selectedField: null,
      selectedDate: null,
      selectedTime: null,
      bookingData: null,
    }),
}));