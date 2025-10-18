// ============================================
// frontend/src/utils/formatters.js
// Utility Functions per Formattazione - COMPLETO
// ============================================

import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

/**
 * Format currency (EUR)
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '€0.00';
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

/**
 * Format date
 */
export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: it });
  } catch (error) {
    console.error('Format date error:', error);
    return '';
  }
};

/**
 * Format time
 */
export const formatTime = (date, formatStr = 'HH:mm') => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Format time error:', error);
    return '';
  }
};

/**
 * Format date and time
 */
export const formatDateTime = (date, formatStr = 'dd/MM/yyyy HH:mm') => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: it });
  } catch (error) {
    console.error('Format datetime error:', error);
    return '';
  }
};

/**
 * Format duration (minutes to hours)
 */
export const formatDuration = (minutes) => {
  if (!minutes) return '0 min';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}min`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${mins}min`;
  }
};

/**
 * Get booking status label
 */
export const getStatusLabel = (status) => {
  const statusLabels = {
    PENDING: 'In Attesa',
    CONFIRMED: 'Confermata',
    CANCELLED: 'Cancellata',
    COMPLETED: 'Completata',
    NO_SHOW: 'Assente'
  };
  return statusLabels[status] || status;
};

/**
 * Get booking status color
 */
export const getStatusColor = (status) => {
  const statusColors = {
    PENDING: 'warning',
    CONFIRMED: 'success',
    CANCELLED: 'error',
    COMPLETED: 'info',
    NO_SHOW: 'default'
  };
  return statusColors[status] || 'default';
};

/**
 * Get payment status label
 */
export const getPaymentStatusLabel = (status) => {
  const statusLabels = {
    PENDING: 'In Attesa',
    PROCESSING: 'In Elaborazione',
    COMPLETED: 'Completato',
    FAILED: 'Fallito',
    REFUNDED: 'Rimborsato',
    PARTIALLY_REFUNDED: 'Parzialmente Rimborsato'
  };
  return statusLabels[status] || status;
};

/**
 * Get payment status color
 */
export const getPaymentStatusColor = (status) => {
  const statusColors = {
    PENDING: 'warning',
    PROCESSING: 'info',
    COMPLETED: 'success',
    FAILED: 'error',
    REFUNDED: 'default',
    PARTIALLY_REFUNDED: 'warning'
  };
  return statusColors[status] || 'default';
};

/**
 * Get field type label
 */
export const getFieldTypeLabel = (type) => {
  const typeLabels = {
    TENNIS: 'Tennis',
    PADEL: 'Padel',
    SQUASH: 'Squash',
    MULTIPURPOSE: 'Multiuso'
  };
  return typeLabels[type] || type;
};

/**
 * Get surface type label
 */
export const getSurfaceTypeLabel = (surface) => {
  const surfaceLabels = {
    clay: 'Terra Battuta',
    hard: 'Cemento',
    grass: 'Erba',
    synthetic_turf: 'Erba Sintetica',
    carpet: 'Moquette'
  };
  return surfaceLabels[surface] || surface;
};

/**
 * Get user role label
 */
export const getUserRoleLabel = (role) => {
  const roleLabels = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Amministratore',
    MANAGER: 'Manager',
    STAFF: 'Staff',
    MEMBER: 'Membro'
  };
  return roleLabels[role] || role;
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  // Format as +39 xxx xxx xxxx
  if (cleaned.startsWith('39')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  return phone;
};

/**
 * Truncate text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Capitalize first letter
 */
export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Format percentage
 */
export const formatPercentage = (value, decimals = 0) => {
  if (value === null || value === undefined) return '0%';
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format number with thousand separator
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('it-IT').format(num);
};

// Export default object with all formatters
export default {
  formatCurrency,
  formatDate,
  formatTime,
  formatDateTime,
  formatDuration,
  getStatusLabel,
  getStatusColor,
  getPaymentStatusLabel,
  getPaymentStatusColor,
  getFieldTypeLabel,
  getSurfaceTypeLabel,
  getUserRoleLabel,
  formatPhoneNumber,
  truncateText,
  formatFileSize,
  capitalizeFirst,
  formatPercentage,
  formatNumber
};