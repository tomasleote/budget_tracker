// Color Theme Presets (Phase 4)
export const COLOR_THEMES = {
  DEFAULT: {
    id: 'default',
    name: 'Default',
    description: 'Classic blue and gray theme',
    primary: '#3b82f6',
    secondary: '#10b981',
    accent: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  },
  OCEAN: {
    id: 'ocean',
    name: 'Ocean',
    description: 'Cool blues and teals',
    primary: '#0891b2',
    secondary: '#06b6d4',
    accent: '#3b82f6',
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
    info: '#0284c7'
  },
  FOREST: {
    id: 'forest',
    name: 'Forest',
    description: 'Natural greens and earth tones',
    primary: '#059669',
    secondary: '#10b981',
    accent: '#65a30d',
    success: '#16a34a',
    warning: '#ca8a04',
    error: '#dc2626',
    info: '#0891b2'
  }
};

// Theme Configuration
export const THEME_CONFIG = {
  DEFAULT_THEME: 'light',
  AVAILABLE_THEMES: ['light', 'dark', 'auto'],
  DEFAULT_COLOR_THEME: 'default',
  AVAILABLE_COLOR_THEMES: Object.keys(COLOR_THEMES).map(key => COLOR_THEMES[key]),
  STORAGE_KEY: 'budget_tracker_theme',
  COLOR_STORAGE_KEY: 'budget_tracker_color_theme'
};

// Application Constants

// Default Categories with Font Awesome icons and colors
export const DEFAULT_CATEGORIES = {
  expense: [
    { name: 'Food & Dining', icon: 'fas fa-utensils', color: '#FF6B6B', description: 'Restaurants, groceries, takeout' },
    { name: 'Transportation', icon: 'fas fa-car', color: '#4ECDC4', description: 'Gas, public transit, rideshare' },
    { name: 'Shopping', icon: 'fas fa-shopping-bag', color: '#45B7D1', description: 'Clothing, electronics, general purchases' },
    { name: 'Bills & Utilities', icon: 'fas fa-bolt', color: '#FFA07A', description: 'Electric, water, internet, phone' },
    { name: 'Entertainment', icon: 'fas fa-film', color: '#98D8C8', description: 'Movies, games, subscriptions' },
    { name: 'Healthcare', icon: 'fas fa-hospital', color: '#F7DC6F', description: 'Medical expenses, pharmacy' },
    { name: 'Education', icon: 'fas fa-graduation-cap', color: '#BB8FCE', description: 'Courses, books, tuition' },
    { name: 'Travel', icon: 'fas fa-plane', color: '#85C1E9', description: 'Flights, hotels, vacation' },
    { name: 'Insurance', icon: 'fas fa-shield-alt', color: '#F8C471', description: 'Life, health, auto insurance' },
    { name: 'Investments', icon: 'fas fa-chart-line', color: '#82E0AA', description: 'Stocks, bonds, retirement' },
    { name: 'Gifts & Donations', icon: 'fas fa-gift', color: '#F1948A', description: 'Charitable giving, presents' },
    { name: 'Personal Care', icon: 'fas fa-spa', color: '#D7BDE2', description: 'Haircuts, cosmetics, spa' },
    { name: 'Home & Garden', icon: 'fas fa-home', color: '#A9DFBF', description: 'Furniture, repairs, gardening' },
    { name: 'Taxes', icon: 'fas fa-file-invoice-dollar', color: '#F4D03F', description: 'Income tax, property tax' },
    { name: 'Other', icon: 'fas fa-question-circle', color: '#AEB6BF', description: 'Miscellaneous expenses' }
  ],
  income: [
    { name: 'Salary', icon: 'fas fa-money-bill-wave', color: '#52C41A', description: 'Primary employment income' },
    { name: 'Freelance', icon: 'fas fa-laptop-code', color: '#1890FF', description: 'Contract work, consulting' },
    { name: 'Business', icon: 'fas fa-building', color: '#722ED1', description: 'Business profits, revenue' },
    { name: 'Investments', icon: 'fas fa-chart-bar', color: '#13C2C2', description: 'Dividends, capital gains' },
    { name: 'Rental', icon: 'fas fa-key', color: '#FA8C16', description: 'Property rental income' },
    { name: 'Side Hustle', icon: 'fas fa-rocket', color: '#EB2F96', description: 'Secondary income sources' },
    { name: 'Gifts', icon: 'fas fa-hand-holding-heart', color: '#F759AB', description: 'Money gifts, inheritance' },
    { name: 'Refunds', icon: 'fas fa-undo', color: '#52C41A', description: 'Tax refunds, returns' },
    { name: 'Other', icon: 'fas fa-plus-circle', color: '#FAAD14', description: 'Miscellaneous income' }
  ]
};

// Currency Configuration
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

// Date and Time Formats
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

// Application Configuration
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

// Error Messages
export const ERROR_MESSAGES = {
  VALIDATION: {
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_AMOUNT: 'Please enter a valid amount greater than 0',
    INVALID_DATE: 'Please enter a valid date',
    INVALID_CATEGORY: 'Please select a valid category',
    FUTURE_DATE: 'Date cannot be in the future',
    PAST_LIMIT: 'Date cannot be more than 5 years in the past'
  },
  TRANSACTION: {
    CREATE_FAILED: 'Failed to create transaction',
    UPDATE_FAILED: 'Failed to update transaction',
    DELETE_FAILED: 'Failed to delete transaction',
    NOT_FOUND: 'Transaction not found',
    DUPLICATE: 'Potential duplicate transaction detected'
  },
  BUDGET: {
    CREATE_FAILED: 'Failed to create budget',
    UPDATE_FAILED: 'Failed to update budget',
    DELETE_FAILED: 'Failed to delete budget',
    NOT_FOUND: 'Budget not found',
    ALREADY_EXISTS: 'Budget already exists for this category and period',
    INVALID_PERIOD: 'Invalid budget period'
  },
  STORAGE: {
    SAVE_FAILED: 'Failed to save data',
    LOAD_FAILED: 'Failed to load data',
    CORRUPTED: 'Data appears to be corrupted',
    QUOTA_EXCEEDED: 'Storage quota exceeded'
  },
  NETWORK: {
    OFFLINE: 'You appear to be offline',
    TIMEOUT: 'Request timed out',
    SERVER_ERROR: 'Server error occurred'
  }
};

// Success Messages
export const SUCCESS_MESSAGES = {
  TRANSACTION: {
    CREATED: 'Transaction created successfully',
    UPDATED: 'Transaction updated successfully',
    DELETED: 'Transaction deleted successfully',
    IMPORTED: 'Transactions imported successfully'
  },
  BUDGET: {
    CREATED: 'Budget created successfully',
    UPDATED: 'Budget updated successfully',
    DELETED: 'Budget deleted successfully',
    ACTIVATED: 'Budget activated successfully',
    DEACTIVATED: 'Budget deactivated successfully'
  },
  DATA: {
    EXPORTED: 'Data exported successfully',
    IMPORTED: 'Data imported successfully',
    BACKUP_CREATED: 'Backup created successfully',
    RESTORED: 'Data restored successfully'
  }
};

// Validation Rules
export const VALIDATION_RULES = {
  TRANSACTION: {
    AMOUNT: {
      MIN: 0.01,
      MAX: 1000000,
      DECIMAL_PLACES: 2
    },
    DESCRIPTION: {
      MIN_LENGTH: 1,
      MAX_LENGTH: 100
    },
    CATEGORY: {
      MIN_LENGTH: 1,
      MAX_LENGTH: 50
    }
  },
  BUDGET: {
    AMOUNT: {
      MIN: 0.01,
      MAX: 1000000,
      DECIMAL_PLACES: 2
    },
    CATEGORY: {
      MIN_LENGTH: 1,
      MAX_LENGTH: 50
    },
    PERIOD: ['weekly', 'monthly', 'yearly']
  },
  USER: {
    NAME: {
      MIN_LENGTH: 2,
      MAX_LENGTH: 100
    },
    EMAIL: {
      MAX_LENGTH: 255,
      PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    }
  }
};

// Storage Keys
export const STORAGE_KEYS = {
  TRANSACTIONS: 'budget_tracker_transactions',
  BUDGETS: 'budget_tracker_budgets',
  CATEGORIES: 'budget_tracker_categories',
  USER: 'budget_tracker_user',
  SETTINGS: 'budget_tracker_settings',
  APP_DATA: 'budget_tracker_app_data',
  PREFERENCES: 'budget_tracker_preferences',
  CACHE: 'budget_tracker_cache'
};

// Time Periods
export const TIME_PERIODS = {
  WEEK: { value: 'week', label: 'This Week', days: 7 },
  MONTH: { value: 'month', label: 'This Month', days: 30 },
  QUARTER: { value: 'quarter', label: 'This Quarter', days: 90 },
  YEAR: { value: 'year', label: 'This Year', days: 365 },
  CUSTOM: { value: 'custom', label: 'Custom Range', days: null }
};

// Budget Status
export const BUDGET_STATUS = {
  NORMAL: { value: 'normal', label: 'Normal', color: '#52C41A', threshold: 0.6 },
  CAUTION: { value: 'caution', label: 'Caution', color: '#FAAD14', threshold: 0.8 },
  WARNING: { value: 'warning', label: 'Warning', color: '#FA8C16', threshold: 0.9 },
  CRITICAL: { value: 'critical', label: 'Critical', color: '#FF4D4F', threshold: 1.0 },
  EXCEEDED: { value: 'exceeded', label: 'Exceeded', color: '#A8071A', threshold: Infinity }
};

// Transaction Types
export const TRANSACTION_TYPES = {
  INCOME: { value: 'income', label: 'Income', color: '#52C41A', icon: 'fas fa-arrow-up' },
  EXPENSE: { value: 'expense', label: 'Expense', color: '#FF4D4F', icon: 'fas fa-arrow-down' }
};

// Chart Types
export const CHART_TYPES = {
  LINE: 'line',
  BAR: 'bar',
  PIE: 'pie',
  DOUGHNUT: 'doughnut',
  AREA: 'area'
};

// Export Formats
export const EXPORT_FORMATS = {
  JSON: { value: 'json', label: 'JSON', extension: '.json', mimeType: 'application/json' },
  CSV: { value: 'csv', label: 'CSV', extension: '.csv', mimeType: 'text/csv' },
  XLSX: { value: 'xlsx', label: 'Excel', extension: '.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
};

// Responsive Breakpoints
export const BREAKPOINTS = {
  XS: '(max-width: 575.98px)',
  SM: '(min-width: 576px) and (max-width: 767.98px)',
  MD: '(min-width: 768px) and (max-width: 991.98px)',
  LG: '(min-width: 992px) and (max-width: 1199.98px)',
  XL: '(min-width: 1200px)',
  XXL: '(min-width: 1400px)'
};

// API Endpoints (for future external API integration)
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

// Feature Flags
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

// Common Font Awesome Icons for the app
export const COMMON_ICONS = {
  // Navigation
  DASHBOARD: 'fas fa-tachometer-alt',
  TRANSACTIONS: 'fas fa-exchange-alt',
  BUDGETS: 'fas fa-wallet',
  REPORTS: 'fas fa-chart-pie',
  SETTINGS: 'fas fa-cog',
  
  // Actions
  ADD: 'fas fa-plus',
  EDIT: 'fas fa-edit',
  DELETE: 'fas fa-trash',
  SAVE: 'fas fa-save',
  CANCEL: 'fas fa-times',
  SEARCH: 'fas fa-search',
  FILTER: 'fas fa-filter',
  SORT: 'fas fa-sort',
  
  // Status
  SUCCESS: 'fas fa-check-circle',
  WARNING: 'fas fa-exclamation-triangle',
  ERROR: 'fas fa-times-circle',
  INFO: 'fas fa-info-circle',
  LOADING: 'fas fa-spinner',
  QUESTION: 'fas fa-question-circle',
  
  // Data
  EXPORT: 'fas fa-download',
  IMPORT: 'fas fa-upload',
  BACKUP: 'fas fa-cloud-upload-alt',
  RESTORE: 'fas fa-cloud-download-alt',
  
  // UI Elements
  MENU: 'fas fa-bars',
  CLOSE: 'fas fa-times',
  MINIMIZE: 'fas fa-minus',
  MAXIMIZE: 'fas fa-expand',
  REFRESH: 'fas fa-sync-alt',
  
  // Financial
  INCOME: 'fas fa-arrow-up',
  EXPENSE: 'fas fa-arrow-down',
  BALANCE: 'fas fa-balance-scale',
  BUDGET: 'fas fa-wallet',
  GOAL: 'fas fa-bullseye',
  
  // Time
  CALENDAR: 'fas fa-calendar-alt',
  CLOCK: 'fas fa-clock',
  HISTORY: 'fas fa-history',
  
  // User
  USER: 'fas fa-user',
  PROFILE: 'fas fa-user-circle',
  LOGOUT: 'fas fa-sign-out-alt',
  LOGIN: 'fas fa-sign-in-alt'
};

// Default User Preferences with Phase 2 additions
export const DEFAULT_PREFERENCES = {
  currency: CURRENCY_CONFIG.DEFAULT,
  dateFormat: DATE_FORMATS.MEDIUM,
  theme: THEME_CONFIG.DEFAULT_THEME,
  pageSize: APP_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
  // Phase 2 additions
  thousandsSeparator: ',',
  colorTheme: THEME_CONFIG.DEFAULT_COLOR_THEME,
  decimalPlaces: 2,
  // Notification preferences
  notifications: {
    budgetAlerts: true,
    weeklyReport: true,
    monthlyReport: true
  },
  // Privacy preferences
  privacy: {
    analytics: false,
    crashReporting: true
  },
  // UI preferences
  ui: {
    useIcons: true,
    iconStyle: 'fas', // Font Awesome style (fas, far, fab)
    showCategoryIcons: true,
    animateTransitions: true
  },
  // Phase 3 placeholder: Dashboard section preferences
  dashboardSections: {
    quickStats: true,
    balanceCard: true,
    budgetProgress: true,
    spendingChart: true,
    recentTransactions: true,
    enhancedAnalytics: true,
    dashboardWidgets: true
  },
  // Phase 4 placeholder: Category color overrides
  categoryColors: {}
};

// Icon utility functions
export const ICON_UTILS = {
  // Get icon class for category
  getCategoryIcon: (categoryName, type = 'expense') => {
    const categories = DEFAULT_CATEGORIES[type];
    const category = categories.find(cat => cat.name === categoryName);
    return category?.icon || COMMON_ICONS.QUESTION;
  },
  
  // Get transaction type icon
  getTransactionIcon: (type) => {
    return TRANSACTION_TYPES[type.toUpperCase()]?.icon || COMMON_ICONS.QUESTION;
  },
  
  // Get budget status icon
  getBudgetStatusIcon: (status) => {
    const statusIcons = {
      normal: 'fas fa-check-circle',
      caution: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      critical: 'fas fa-times-circle',
      exceeded: 'fas fa-ban'
    };
    return statusIcons[status] || COMMON_ICONS.INFO;
  },
  
  // Format icon class with additional classes
  formatIconClass: (iconClass, additionalClasses = '') => {
    return `${iconClass} ${additionalClasses}`.trim();
  },
  
  // Get severity icon
  getSeverityIcon: (severity) => {
    const severityIcons = {
      low: 'fas fa-info-circle',
      medium: 'fas fa-exclamation-triangle',
      high: 'fas fa-times-circle'
    };
    return severityIcons[severity] || COMMON_ICONS.INFO;
  },
  
  // Get trend icon
  getTrendIcon: (trend) => {
    const trendIcons = {
      increasing: 'fas fa-arrow-trend-up',
      decreasing: 'fas fa-arrow-trend-down',
      stable: 'fas fa-minus'
    };
    return trendIcons[trend] || 'fas fa-minus';
  },
  
  // Get alert type icon
  getAlertIcon: (alertType) => {
    const alertIcons = {
      exceeded: 'fas fa-exclamation-circle',
      near_limit: 'fas fa-exclamation-triangle',
      goal_reached: 'fas fa-trophy',
      reminder: 'fas fa-bell'
    };
    return alertIcons[alertType] || COMMON_ICONS.INFO;
  },
  
  // Get file format icon
  getFileFormatIcon: (format) => {
    const formatIcons = {
      json: 'fas fa-file-code',
      csv: 'fas fa-file-csv',
      xlsx: 'fas fa-file-excel',
      pdf: 'fas fa-file-pdf'
    };
    return formatIcons[format.toLowerCase()] || 'fas fa-file';
  }
};
