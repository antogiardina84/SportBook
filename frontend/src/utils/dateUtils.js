import dayjs from 'dayjs';
import 'dayjs/locale/it';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('it');

export const formatDate = (date, format = 'DD/MM/YYYY') => {
  if (!date) return '';
  return dayjs(date).format(format);
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return dayjs(date).format('DD/MM/YYYY HH:mm');
};

export const formatTime = (date) => {
  if (!date) return '';
  return dayjs(date).format('HH:mm');
};

export const formatRelative = (date) => {
  if (!date) return '';
  return dayjs(date).fromNow();
};

export const isToday = (date) => {
  return dayjs(date).isSame(dayjs(), 'day');
};

export const isTomorrow = (date) => {
  return dayjs(date).isSame(dayjs().add(1, 'day'), 'day');
};

export const isPast = (date) => {
  return dayjs(date).isBefore(dayjs());
};

export const isFuture = (date) => {
  return dayjs(date).isAfter(dayjs());
};

export const getDayName = (date) => {
  return dayjs(date).format('dddd');
};

export const getMonthName = (date) => {
  return dayjs(date).format('MMMM');
};

export const addDays = (date, days) => {
  return dayjs(date).add(days, 'day').toDate();
};

export const subtractDays = (date, days) => {
  return dayjs(date).subtract(days, 'day').toDate();
};

export const startOfDay = (date) => {
  return dayjs(date).startOf('day').toDate();
};

export const endOfDay = (date) => {
  return dayjs(date).endOf('day').toDate();
};

export const parseDate = (dateString) => {
  return dayjs(dateString).toDate();
};