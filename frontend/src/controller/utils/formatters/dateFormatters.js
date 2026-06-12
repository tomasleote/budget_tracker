import { DATE_FORMATS } from '../constants.js';

const getUserPreferences = () => {
  try {
    const stored = localStorage.getItem('budget_tracker_preferences');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

export const formatDate = (date, format = DATE_FORMATS.MEDIUM, options = {}) => {
  const userPrefs = getUserPreferences();
  const { locale = 'en-US', timeZone } = options;
  const dateObj = new Date(date);

  if (isNaN(dateObj)) {
    return 'Invalid Date';
  }

  const formatOptions = { timeZone };
  const userFormat = format || userPrefs.dateFormat || DATE_FORMATS.MEDIUM;

  switch (userFormat) {
    case 'DD/MM/YYYY':
      return dateObj.toLocaleDateString('en-GB');
    case 'YYYY-MM-DD':
      return dateObj.toISOString().split('T')[0];
    case DATE_FORMATS.SHORT:
      return dateObj.toLocaleDateString(locale, {
        ...formatOptions,
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      });
    case DATE_FORMATS.MEDIUM:
      return dateObj.toLocaleDateString(locale, {
        ...formatOptions,
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    case DATE_FORMATS.LONG:
      return dateObj.toLocaleDateString(locale, {
        ...formatOptions,
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    case DATE_FORMATS.ISO:
      return dateObj.toISOString().split('T')[0];
    case DATE_FORMATS.TIMESTAMP:
      return dateObj.toISOString().replace('T', ' ').slice(0, -5);
    case 'MM/DD/YYYY':
    default:
      return dateObj.toLocaleDateString('en-US');
  }
};

export const formatRelativeTime = (date, options = {}) => {
  const { locale = 'en-US' } = options;
  const dateObj = new Date(date);
  const now = new Date();

  if (isNaN(dateObj)) {
    return 'Invalid Date';
  }

  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    const diffInSeconds = (dateObj.getTime() - now.getTime()) / 1000;

    if (Math.abs(diffInSeconds) < 60) {
      return rtf.format(Math.round(diffInSeconds), 'second');
    } else if (Math.abs(diffInSeconds) < 3600) {
      return rtf.format(Math.round(diffInSeconds / 60), 'minute');
    } else if (Math.abs(diffInSeconds) < 86400) {
      return rtf.format(Math.round(diffInSeconds / 3600), 'hour');
    } else if (Math.abs(diffInSeconds) < 2592000) {
      return rtf.format(Math.round(diffInSeconds / 86400), 'day');
    } else if (Math.abs(diffInSeconds) < 31536000) {
      return rtf.format(Math.round(diffInSeconds / 2592000), 'month');
    } else {
      return rtf.format(Math.round(diffInSeconds / 31536000), 'year');
    }
  } catch (error) {
    const diffInDays = Math.round((dateObj.getTime() - now.getTime()) / 86400000);
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Tomorrow';
    if (diffInDays === -1) return 'Yesterday';
    if (diffInDays > 0) return `In ${diffInDays} days`;
    return `${Math.abs(diffInDays)} days ago`;
  }
};

export const formatTime = (date, format = 'h:mm a', options = {}) => {
  const { locale = 'en-US', timeZone } = options;
  const dateObj = new Date(date);

  if (isNaN(dateObj)) {
    return 'Invalid Time';
  }

  const formatOptions = { timeZone };

  switch (format) {
    case 'h:mm a':
      return dateObj.toLocaleTimeString(locale, {
        ...formatOptions,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    case 'HH:mm':
      return dateObj.toLocaleTimeString(locale, {
        ...formatOptions,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    case 'HH:mm:ss':
      return dateObj.toLocaleTimeString(locale, {
        ...formatOptions,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    default:
      return dateObj.toLocaleTimeString(locale, formatOptions);
  }
};

export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const formatExportFilename = (prefix, format = 'json', date = new Date()) => {
  const dateStr = formatDate(date, DATE_FORMATS.ISO);
  const timestamp = date.toTimeString().slice(0, 8).replace(/:/g, '-');
  return `${prefix}_${dateStr}_${timestamp}.${format}`;
};

export const formatDateInput = (date) => {
  if (!date) return '';
  const dateObj = new Date(date);
  if (isNaN(dateObj)) return '';
  return dateObj.toISOString().split('T')[0];
};
