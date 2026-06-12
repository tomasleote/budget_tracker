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

export const TIME_PERIODS = {
  WEEK: { value: 'week', label: 'This Week', days: 7 },
  MONTH: { value: 'month', label: 'This Month', days: 30 },
  QUARTER: { value: 'quarter', label: 'This Quarter', days: 90 },
  YEAR: { value: 'year', label: 'This Year', days: 365 },
  CUSTOM: { value: 'custom', label: 'Custom Range', days: null }
};

export const BUDGET_STATUS = {
  NORMAL: { value: 'normal', label: 'Normal', color: '#52C41A', threshold: 0.6 },
  CAUTION: { value: 'caution', label: 'Caution', color: '#FAAD14', threshold: 0.8 },
  WARNING: { value: 'warning', label: 'Warning', color: '#FA8C16', threshold: 0.9 },
  CRITICAL: { value: 'critical', label: 'Critical', color: '#FF4D4F', threshold: 1.0 },
  EXCEEDED: { value: 'exceeded', label: 'Exceeded', color: '#A8071A', threshold: Infinity }
};

export const TRANSACTION_TYPES = {
  INCOME: { value: 'income', label: 'Income', color: '#52C41A', icon: 'fas fa-arrow-up' },
  EXPENSE: { value: 'expense', label: 'Expense', color: '#FF4D4F', icon: 'fas fa-arrow-down' }
};

export const CHART_TYPES = {
  LINE: 'line',
  BAR: 'bar',
  PIE: 'pie',
  DOUGHNUT: 'doughnut',
  AREA: 'area'
};

export const EXPORT_FORMATS = {
  JSON: { value: 'json', label: 'JSON', extension: '.json', mimeType: 'application/json' },
  CSV: { value: 'csv', label: 'CSV', extension: '.csv', mimeType: 'text/csv' },
  XLSX: { value: 'xlsx', label: 'Excel', extension: '.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
};

export { COMMON_ICONS } from './iconConstants.js';
