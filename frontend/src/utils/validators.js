// ============================================
// frontend/src/utils/validators.js
// Funzioni di Validazione Form
// ============================================

import { VALIDATION_RULES } from './constants';

// Email validation
export const isValidEmail = (email) => {
  return VALIDATION_RULES.EMAIL_REGEX.test(email);
};

// Password validation
export const isValidPassword = (password) => {
  if (password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
    return {
      valid: false,
      message: `La password deve essere di almeno ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} caratteri`
    };
  }
  
  if (!VALIDATION_RULES.PASSWORD_REGEX.test(password)) {
    return {
      valid: false,
      message: 'La password deve contenere almeno una lettera maiuscola, una minuscola, un numero e un carattere speciale'
    };
  }
  
  return { valid: true };
};

// Phone validation
export const isValidPhone = (phone) => {
  return VALIDATION_RULES.PHONE_REGEX.test(phone);
};

// Name validation
export const isValidName = (name) => {
  const length = name.trim().length;
  return length >= VALIDATION_RULES.NAME_MIN_LENGTH && 
         length <= VALIDATION_RULES.NAME_MAX_LENGTH;
};

// Required field validation
export const isRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

// Min length validation
export const minLength = (value, min) => {
  return value.length >= min;
};

// Max length validation
export const maxLength = (value, max) => {
  return value.length <= max;
};

// Number range validation
export const isInRange = (value, min, max) => {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
};

// Date validation
export const isValidDate = (date) => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
};

// Future date validation
export const isFutureDate = (date) => {
  const d = new Date(date);
  const now = new Date();
  return d > now;
};

// Past date validation
export const isPastDate = (date) => {
  const d = new Date(date);
  const now = new Date();
  return d < now;
};

// Date range validation
export const isDateInRange = (date, startDate, endDate) => {
  const d = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  return d >= start && d <= end;
};

// URL validation
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Credit card validation (basic Luhn algorithm)
export const isValidCreditCard = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s/g, '');
  
  if (!/^\d+$/.test(cleaned)) {
    return false;
  }
  
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

// CVV validation
export const isValidCVV = (cvv) => {
  return /^\d{3,4}$/.test(cvv);
};

// Expiry date validation (MM/YY format)
export const isValidExpiryDate = (expiry) => {
  if (!/^\d{2}\/\d{2}$/.test(expiry)) {
    return false;
  }
  
  const [month, year] = expiry.split('/').map(Number);
  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;
  
  if (month < 1 || month > 12) {
    return false;
  }
  
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return false;
  }
  
  return true;
};

// Postal code validation (Italian)
export const isValidPostalCode = (code) => {
  return /^\d{5}$/.test(code);
};

// Tax code validation (Italian Codice Fiscale - basic)
export const isValidTaxCode = (code) => {
  return /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/.test(code.toUpperCase());
};

// VAT number validation (Italian Partita IVA)
export const isValidVATNumber = (vat) => {
  return /^\d{11}$/.test(vat);
};

// Price validation
export const isValidPrice = (price) => {
  const num = Number(price);
  return !isNaN(num) && num >= 0 && Number.isFinite(num);
};

// Time slot validation
export const isValidTimeSlot = (startTime, endTime) => {
  const start = new Date(`2000-01-01 ${startTime}`);
  const end = new Date(`2000-01-01 ${endTime}`);
  return start < end;
};

// Booking duration validation
export const isValidBookingDuration = (startTime, endTime, minDuration = 60, maxDuration = 180) => {
  const start = new Date(`2000-01-01 ${startTime}`);
  const end = new Date(`2000-01-01 ${endTime}`);
  const durationMinutes = (end - start) / (1000 * 60);
  
  return durationMinutes >= minDuration && durationMinutes <= maxDuration;
};

// Form validation helper
export const validateForm = (values, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const fieldRules = rules[field];
    const value = values[field];
    
    // Required
    if (fieldRules.required && !isRequired(value)) {
      errors[field] = fieldRules.requiredMessage || 'Questo campo è obbligatorio';
      return;
    }
    
    // Skip other validations if empty and not required
    if (!value && !fieldRules.required) {
      return;
    }
    
    // Email
    if (fieldRules.email && !isValidEmail(value)) {
      errors[field] = 'Inserisci un\'email valida';
      return;
    }
    
    // Phone
    if (fieldRules.phone && !isValidPhone(value)) {
      errors[field] = 'Inserisci un numero di telefono valido';
      return;
    }
    
    // Min length
    if (fieldRules.minLength && !minLength(value, fieldRules.minLength)) {
      errors[field] = `Minimo ${fieldRules.minLength} caratteri`;
      return;
    }
    
    // Max length
    if (fieldRules.maxLength && !maxLength(value, fieldRules.maxLength)) {
      errors[field] = `Massimo ${fieldRules.maxLength} caratteri`;
      return;
    }
    
    // Custom validator
    if (fieldRules.validator) {
      const result = fieldRules.validator(value, values);
      if (result !== true) {
        errors[field] = result;
      }
    }
  });
  
  return errors;
};

// Sanitize input
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, ''); // Remove javascript: protocol
};

// Password strength checker
export const getPasswordStrength = (password) => {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z\d]/.test(password)) strength++;
  
  if (strength <= 2) return { level: 'weak', label: 'Debole', color: 'error' };
  if (strength <= 4) return { level: 'medium', label: 'Media', color: 'warning' };
  return { level: 'strong', label: 'Forte', color: 'success' };
};

export default {
  isValidEmail,
  isValidPassword,
  isValidPhone,
  isValidName,
  isRequired,
  minLength,
  maxLength,
  isInRange,
  isValidDate,
  isFutureDate,
  isPastDate,
  isDateInRange,
  isValidUrl,
  isValidCreditCard,
  isValidCVV,
  isValidExpiryDate,
  isValidPostalCode,
  isValidTaxCode,
  isValidVATNumber,
  isValidPrice,
  isValidTimeSlot,
  isValidBookingDuration,
  validateForm,
  sanitizeInput,
  getPasswordStrength
};