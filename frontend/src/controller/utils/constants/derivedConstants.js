import { CURRENCY_CONFIG, DATE_FORMATS, APP_CONFIG } from './configConstants.js';
import { THEME_CONFIG } from './themeConstants.js';
import { DEFAULT_CATEGORIES } from './categoryConstants.js';
import { TRANSACTION_TYPES, BUDGET_STATUS } from './statusConstants.js';
import { COMMON_ICONS } from './iconConstants.js';

export const DEFAULT_PREFERENCES = {
  currency: CURRENCY_CONFIG.DEFAULT,
  dateFormat: DATE_FORMATS.MEDIUM,
  theme: THEME_CONFIG.DEFAULT_THEME,
  pageSize: APP_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
  thousandsSeparator: ',',
  colorTheme: THEME_CONFIG.DEFAULT_COLOR_THEME,
  decimalPlaces: 2,
  notifications: {
    budgetAlerts: true,
    weeklyReport: true,
    monthlyReport: true
  },
  privacy: {
    analytics: false,
    crashReporting: true
  },
  ui: {
    useIcons: true,
    iconStyle: 'fas',
    showCategoryIcons: true,
    animateTransitions: true
  },
  dashboardSections: {
    quickStats: true,
    balanceCard: true,
    budgetProgress: true,
    spendingChart: true,
    recentTransactions: true,
    enhancedAnalytics: true,
    dashboardWidgets: true
  },
  categoryColors: {}
};

export const ICON_UTILS = {
  getCategoryIcon: (categoryName, type = 'expense') => {
    const categories = DEFAULT_CATEGORIES[type];
    const category = categories.find(cat => cat.name === categoryName);
    return category?.icon || COMMON_ICONS.QUESTION;
  },

  getTransactionIcon: (type) => {
    return TRANSACTION_TYPES[type.toUpperCase()]?.icon || COMMON_ICONS.QUESTION;
  },

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

  formatIconClass: (iconClass, additionalClasses = '') => {
    return `${iconClass} ${additionalClasses}`.trim();
  },

  getSeverityIcon: (severity) => {
    const severityIcons = {
      low: 'fas fa-info-circle',
      medium: 'fas fa-exclamation-triangle',
      high: 'fas fa-times-circle'
    };
    return severityIcons[severity] || COMMON_ICONS.INFO;
  },

  getTrendIcon: (trend) => {
    const trendIcons = {
      increasing: 'fas fa-arrow-trend-up',
      decreasing: 'fas fa-arrow-trend-down',
      stable: 'fas fa-minus'
    };
    return trendIcons[trend] || 'fas fa-minus';
  },

  getAlertIcon: (alertType) => {
    const alertIcons = {
      exceeded: 'fas fa-exclamation-circle',
      near_limit: 'fas fa-exclamation-triangle',
      goal_reached: 'fas fa-trophy',
      reminder: 'fas fa-bell'
    };
    return alertIcons[alertType] || COMMON_ICONS.INFO;
  },

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
