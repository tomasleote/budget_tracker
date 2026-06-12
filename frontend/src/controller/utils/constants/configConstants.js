export const CURRENCY_CONFIG = {
  DEFAULT: 'USD',
  SUPPORTED: [
    { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
    { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
    { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
    { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', locale: 'de-CH' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' }
  ]
};

export const DATE_FORMATS = {
  SHORT: 'MM/dd/yyyy',
  MEDIUM: 'MMM dd, yyyy',
  LONG: 'MMMM dd, yyyy',
  ISO: 'yyyy-MM-dd',
  TIMESTAMP: 'yyyy-MM-dd HH:mm:ss'
};

export const TIME_FORMATS = {
  TWELVE_HOUR: 'h:mm a',
  TWENTY_FOUR_HOUR: 'HH:mm',
  WITH_SECONDS: 'HH:mm:ss'
};

export const APP_CONFIG = {
  NAME: 'Budget Tracker',
  VERSION: '1.0.0',
  THEME: {
    DEFAULT: 'light',
    AVAILABLE: ['light', 'dark', 'auto']
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100]
  },
  CHART_COLORS: [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA',
    '#F1948A', '#D7BDE2', '#A9DFBF', '#F4D03F', '#AEB6BF'
  ]
};

export const BREAKPOINTS = {
  XS: '(max-width: 575.98px)',
  SM: '(min-width: 576px) and (max-width: 767.98px)',
  MD: '(min-width: 768px) and (max-width: 991.98px)',
  LG: '(min-width: 992px) and (max-width: 1199.98px)',
  XL: '(min-width: 1200px)',
  XXL: '(min-width: 1400px)'
};

export const API_ENDPOINTS = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  TRANSACTIONS: '/transactions',
  BUDGETS: '/budgets',
  CATEGORIES: '/categories',
  USER: '/user',
  AUTH: '/auth',
  EXPORT: '/export',
  IMPORT: '/import'
};

export const FEATURE_FLAGS = {
  DARK_MODE: true,
  EXPORT_IMPORT: true,
  CHARTS: true,
  NOTIFICATIONS: true,
  MULTI_CURRENCY: false,
  RECURRING_TRANSACTIONS: false,
  GOALS: false,
  BILL_REMINDERS: false
};
