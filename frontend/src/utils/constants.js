// ===========================================
// frontend/src/utils/constants.js
// ===========================================

export const FIELD_TYPES = {
  TENNIS: 'Tennis',
  PADEL: 'Padel',
  SQUASH: 'Squash',
  MULTIPURPOSE: 'Polivalente',
};

export const USER_ROLES = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Amministratore',
  MANAGER: 'Manager',
  INSTRUCTOR: 'Istruttore',
  MEMBER: 'Membro',
  GUEST: 'Ospite',
};

export const BOOKING_DURATIONS = [
  { value: 60, label: '1 ora' },
  { value: 90, label: '1,5 ore' },
  { value: 120, label: '2 ore' },
];

export const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00',
];