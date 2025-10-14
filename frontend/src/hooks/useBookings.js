// ===========================================
// frontend/src/hooks/useBookings.js
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsAPI } from '@api/bookings';
import { toast } from 'react-toastify';

export const useBookings = (params = {}) => {
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: () => bookingsAPI.getAll(params),
  });
};

export const useBooking = (id) => {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingsAPI.getById(id),
    enabled: !!id,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['bookings']);
      toast.success('Prenotazione creata con successo!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Errore nella creazione della prenotazione');
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }) => bookingsAPI.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['bookings']);
      toast.success('Prenotazione cancellata');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Errore nella cancellazione');
    },
  });
};

export const useCheckAvailability = (fieldId, params) => {
  return useQuery({
    queryKey: ['availability', fieldId, params],
    queryFn: () => bookingsAPI.checkAvailability(fieldId, params),
    enabled: !!fieldId && !!params.date,
  });
};