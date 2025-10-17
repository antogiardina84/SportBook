// ============================================
// frontend/src/utils/constants.js
// Costanti Applicazione
// ============================================

export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF',
  MEMBER: 'MEMBER'
};

export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
  NO_SHOW: 'NO_SHOW'
};

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED'
};

export const FIELD_TYPES = {
  TENNIS: 'TENNIS',
  PADEL: 'PADEL',
  SQUASH: 'SQUASH',
  MULTIPURPOSE: 'MULTIPURPOSE'
};

export const SURFACE_TYPES = {
  CLAY: 'clay',
  HARD: 'hard',
  GRASS: 'grass',
  SYNTHETIC_TURF: 'synthetic_turf',
  CARPET: 'carpet'
};

export const MEMBERSHIP_STATUS = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  SUSPENDED: 'SUSPENDED',
  CANCELLED: 'CANCELLED'
};

export const NOTIFICATION_TYPES = {
  BOOKING_CONFIRMED: 'BOOKING_CONFIRMED',
  BOOKING_CANCELLED: 'BOOKING_CANCELLED',
  BOOKING_REMINDER: 'BOOKING_REMINDER',
  PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  MEMBERSHIP_EXPIRING: 'MEMBERSHIP_EXPIRING',
  SYSTEM: 'SYSTEM'
};

export const GENDER = {
  M: 'M',
  F: 'F',
  OTHER: 'OTHER'
};

export const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00',
  '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00', '23:00'
];

export const DURATION_OPTIONS = [
  { value: 60, label: '1 ora' },
  { value: 90, label: '1.5 ore' },
  { value: 120, label: '2 ore' },
  { value: 180, label: '3 ore' }
];

export const AMENITIES = [
  { value: 'locker_room', label: 'Spogliatoio' },
  { value: 'shower', label: 'Doccia' },
  { value: 'parking', label: 'Parcheggio' },
  { value: 'bar', label: 'Bar' },
  { value: 'restaurant', label: 'Ristorante' },
  { value: 'wifi', label: 'WiFi' },
  { value: 'shop', label: 'Negozio' },
  { value: 'equipment_rental', label: 'Noleggio Attrezzatura' }
];

export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
  ISO: 'YYYY-MM-DD',
  TIME: 'HH:mm',
  FULL: 'dddd, D MMMM YYYY',
  API: 'YYYY-MM-DDTHH:mm:ss'
};

export const CURRENCY = {
  CODE: 'EUR',
  SYMBOL: '€',
  DECIMAL_PLACES: 2
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100]
};

export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[1-9]\d{6,14}$/,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50
};

export const API_ERRORS = {
  NETWORK_ERROR: 'Errore di connessione. Verifica la tua connessione internet.',
  UNAUTHORIZED: 'Sessione scaduta. Effettua nuovamente il login.',
  FORBIDDEN: 'Non hai i permessi necessari per questa operazione.',
  NOT_FOUND: 'Risorsa non trovata.',
  SERVER_ERROR: 'Errore del server. Riprova più tardi.',
  VALIDATION_ERROR: 'Errore di validazione. Controlla i dati inseriti.'
};

export const SUCCESS_MESSAGES = {
  LOGIN: 'Accesso effettuato con successo!',
  LOGOUT: 'Logout effettuato con successo!',
  REGISTRATION: 'Registrazione completata con successo!',
  PROFILE_UPDATE: 'Profilo aggiornato con successo!',
  PASSWORD_CHANGE: 'Password cambiata con successo!',
  BOOKING_CREATED: 'Prenotazione creata con successo!',
  BOOKING_CANCELLED: 'Prenotazione cancellata con successo!',
  PAYMENT_SUCCESS: 'Pagamento completato con successo!',
  SETTINGS_SAVED: 'Impostazioni salvate con successo!'
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  BOOKINGS: '/bookings',
  BOOKING_CREATE: '/bookings/new',
  BOOKING_DETAIL: '/bookings/:id',
  FIELDS: '/fields',
  FIELD_DETAIL: '/fields/:id',
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_FIELDS: '/admin/fields',
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_PAYMENTS: '/admin/payments',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_SETTINGS: '/admin/settings',
  NOT_FOUND: '/404'
};

export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  THEME: 'theme_preference',
  LANGUAGE: 'language_preference'
};

export const CHART_COLORS = {
  PRIMARY: '#667eea',
  SECONDARY: '#764ba2',
  SUCCESS: '#10b981',
  ERROR: '#ef4444',
  WARNING: '#f59e0b',
  INFO: '#3b82f6',
  GREY: '#6b7280'
};

export const THEME_OPTIONS = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
};

export default {
  USER_ROLES,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  FIELD_TYPES,
  SURFACE_TYPES,
  MEMBERSHIP_STATUS,
  NOTIFICATION_TYPES,
  GENDER,
  TIME_SLOTS,
  DURATION_OPTIONS,
  AMENITIES,
  DATE_FORMATS,
  CURRENCY,
  PAGINATION,
  VALIDATION_RULES,
  API_ERRORS,
  SUCCESS_MESSAGES,
  ROUTES,
  LOCAL_STORAGE_KEYS,
  CHART_COLORS,
  THEME_OPTIONS
};