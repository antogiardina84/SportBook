// ===========================================
// frontend/src/utils/formatters.js
// ===========================================

import dayjs from 'dayjs';
import 'dayjs/locale/it';

dayjs.locale('it');

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

export const formatDate = (date, format = 'DD/MM/YYYY') => {
  return dayjs(date).format(format);
};

export const formatDateTime = (date) => {
  return dayjs(date).format('DD/MM/YYYY HH:mm');
};

export const formatTime = (date) => {
  return dayjs(date).format('HH:mm');
};

export const formatRelativeTime = (date) => {
  return dayjs(date).fromNow();
};

export const getBookingStatusLabel = (status) => {
  const labels = {
    PENDING: 'In attesa',
    CONFIRMED: 'Confermata',
    CANCELLED: 'Cancellata',
    COMPLETED: 'Completata',
    NO_SHOW: 'Non presentato',
  };
  return labels[status] || status;
};

export const getBookingStatusColor = (status) => {
  const colors = {
    PENDING: 'warning',
    CONFIRMED: 'success',
    CANCELLED: 'error',
    COMPLETED: 'info',
    NO_SHOW: 'default',
  };
  return colors[status] || 'default';
};

export const getPaymentStatusLabel = (status) => {
  const labels = {
    PENDING: 'In attesa',
    COMPLETED: 'Completato',
    FAILED: 'Fallito',
    REFUNDED: 'Rimborsato',
    CANCELLED: 'Cancellato',
  };
  return labels[status] || status;
};

export const getPaymentStatusColor = (status) => {
  const colors = {
    PENDING: 'warning',
    COMPLETED: 'success',
    FAILED: 'error',
    REFUNDED: 'info',
    CANCELLED: 'default',
  };
  return colors[status] || 'default';
};
