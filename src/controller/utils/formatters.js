import { CURRENCY_CONFIG, DATE_FORMATS } from './constants.js';

// Get user preferences from localStorage (fallback until full context integration)
const getUserPreferences = () => {
  try {
    const stored = localStorage.getItem('budget_tracker_preferences');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// Currency Formatting with User Preferences
export const formatCurrency = (amount, options = {}) => {
  const userPrefs = getUserPreferences();
  const {
    currency = userPrefs.currency || CURRENCY_CONFIG.DEFAULT,
    locale = 'en-US',
    minimumFractionDigits = userPrefs.decimalPlaces ?? 2,
    maximumFractionDigits = userPrefs.decimalPlaces ?? 2,
    useUserFormat = true
  } = options;

  const currencyInfo = CURRENCY_CONFIG.SUPPORTED.find(c => c.code === currency);
  const localeToUse = currencyInfo?.locale || locale;

  try {
    let formatted = new Intl.NumberFormat(localeToUse, {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits
    }).format(parseFloat(amount) || 0);
    
    // Apply user thousands separator preference if enabled
    if (useUserFormat && userPrefs.thousandsSeparator && userPrefs.thousandsSeparator !== ',') {
      if (userPrefs.thousandsSeparator === '.') {
        // European style: swap . and ,
        formatted = formatted.replace(/,/g, 'TEMP').replace(/\./g, ',').replace(/TEMP/g, '.');
      } else if (userPrefs.thousandsSeparator === ' ') {
        // Space separator
        formatted = formatted.replace(/,/g, ' ');
      }
    }
    
    return formatted;
  } catch (error) {
    // Fallback formatting
    const symbol = currencyInfo?.symbol || '$';
    return `${symbol}${(parseFloat(amount) || 0).toFixed(minimumFractionDigits)}`;
  }
};

// Compact currency formatting (e.g., $1.2K, $2.5M)
export const formatCurrencyCompact = (amount, options = {}) => {
  const userPrefs = getUserPreferences();
  const { currency = userPrefs.currency || CURRENCY_CONFIG.DEFAULT, locale = 'en-US' } = options;
  const value = parseFloat(amount) || 0;

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  } catch (error) {
    // Fallback for compact formatting
    const currencyInfo = CURRENCY_CONFIG.SUPPORTED.find(c => c.code === currency);
    const symbol = currencyInfo?.symbol || '$';
    
    if (value >= 1000000) {
      return `${symbol}${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${symbol}${(value / 1000).toFixed(1)}K`;
    } else {
      return `${symbol}${value.toFixed(2)}`;
    }
  }
};

// Number formatting with user preferences
export const formatNumber = (number, options = {}) => {
  const userPrefs = getUserPreferences();
  const {
    locale = 'en-US',
    minimumFractionDigits = 0,
    maximumFractionDigits = userPrefs.decimalPlaces ?? 2
  } = options;

  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits,
      maximumFractionDigits
    }).format(parseFloat(number) || 0);
  } catch (error) {
    return (parseFloat(number) || 0).toFixed(maximumFractionDigits);
  }
};

// Percentage formatting
export const formatPercentage = (value, options = {}) => {
  const {
    locale = 'en-US',
    minimumFractionDigits = 1,
    maximumFractionDigits = 1
  } = options;

  try {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits,
      maximumFractionDigits
    }).format((parseFloat(value) || 0) / 100);
  } catch (error) {
    return `${(parseFloat(value) || 0).toFixed(maximumFractionDigits)}%`;
  }
};

// Date formatting with user preferences
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

// Relative time formatting (e.g., "2 days ago", "in 3 hours")
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
    // Fallback relative time
    const diffInDays = Math.round((dateObj.getTime() - now.getTime()) / 86400000);
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Tomorrow';
    if (diffInDays === -1) return 'Yesterday';
    if (diffInDays > 0) return `In ${diffInDays} days`;
    return `${Math.abs(diffInDays)} days ago`;
  }
};

// Time formatting
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

// File size formatting
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Text formatting utilities
export const capitalize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.split(' ').map(word => capitalize(word)).join(' ');
};

export const truncate = (str, length = 50, suffix = '...') => {
  if (!str || typeof str !== 'string') return '';
  if (str.length <= length) return str;
  return str.substring(0, length - suffix.length) + suffix;
};

export const slugify = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const escapeHtml = (unsafe) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const unescapeHtml = (safe) => {
  return safe
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
};

// Transaction specific formatting
export const formatTransactionAmount = (transaction) => {
  if (!transaction) return formatCurrency(0);
  
  const amount = parseFloat(transaction.amount) || 0;
  const prefix = transaction.type === 'expense' ? '-' : '+';
  const formatted = formatCurrency(amount);
  
  return `${prefix}${formatted}`;
};

export const formatTransactionType = (type) => {
  const types = {
    income: { label: 'Income', color: '#52C41A', icon: 'fas fa-arrow-up' },
    expense: { label: 'Expense', color: '#FF4D4F', icon: 'fas fa-arrow-down' }
  };
  
  return types[type] || { label: 'Unknown', color: '#999', icon: 'fas fa-question-circle' };
};

// Icon formatting functions
export const formatIcon = (iconClass, options = {}) => {
  const {
    size = '',
    color = '',
    spin = false,
    pulse = false,
    fixedWidth = false,
    additionalClasses = ''
  } = options;

  let classes = [iconClass];
  
  if (size) classes.push(`fa-${size}`);
  if (color) classes.push(`text-${color}`);
  if (spin) classes.push('fa-spin');
  if (pulse) classes.push('fa-pulse');
  if (fixedWidth) classes.push('fa-fw');
  if (additionalClasses) classes.push(additionalClasses);
  
  return classes.join(' ');
};

export const formatCategoryIcon = (category, type = 'expense') => {
  // This will use the ICON_UTILS.getCategoryIcon when imported
  const categoryMap = {
    expense: {
      'Food & Dining': 'fas fa-utensils',
      'Transportation': 'fas fa-car',
      'Shopping': 'fas fa-shopping-bag',
      'Bills & Utilities': 'fas fa-bolt',
      'Entertainment': 'fas fa-film',
      'Healthcare': 'fas fa-hospital',
      'Education': 'fas fa-graduation-cap',
      'Travel': 'fas fa-plane',
      'Insurance': 'fas fa-shield-alt',
      'Investments': 'fas fa-chart-line',
      'Gifts & Donations': 'fas fa-gift',
      'Personal Care': 'fas fa-spa',
      'Home & Garden': 'fas fa-home',
      'Taxes': 'fas fa-file-invoice-dollar',
      'Other': 'fas fa-question-circle'
    },
    income: {
      'Salary': 'fas fa-money-bill-wave',
      'Freelance': 'fas fa-laptop-code',
      'Business': 'fas fa-building',
      'Investments': 'fas fa-chart-bar',
      'Rental': 'fas fa-key',
      'Side Hustle': 'fas fa-rocket',
      'Gifts': 'fas fa-hand-holding-heart',
      'Refunds': 'fas fa-undo',
      'Other': 'fas fa-plus-circle'
    }
  };
  
  return categoryMap[type]?.[category] || 'fas fa-question-circle';
};

// Budget specific formatting
export const formatBudgetProgress = (budget, spent) => {
  if (!budget) return { percentage: 0, status: 'normal', formatted: '0%' };
  
  const budgetAmount = parseFloat(budget.budgetAmount) || 0;
  const spentAmount = parseFloat(spent) || 0;
  const percentage = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;
  
  let status = 'normal';
  if (percentage >= 100) status = 'exceeded';
  else if (percentage >= 90) status = 'critical';
  else if (percentage >= 80) status = 'warning';
  else if (percentage >= 60) status = 'caution';
  
  return {
    percentage: Math.round(percentage),
    status,
    formatted: formatPercentage(percentage)
  };
};

export const formatBudgetPeriod = (period) => {
  const periods = {
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly'
  };
  
  return periods[period] || period;
};

// Chart data formatting
export const formatChartData = (data, type = 'currency') => {
  if (!Array.isArray(data)) return [];
  
  return data.map(item => ({
    ...item,
    value: type === 'currency' ? parseFloat(item.value) || 0 : item.value,
    formattedValue: type === 'currency' 
      ? formatCurrency(item.value) 
      : formatNumber(item.value),
    label: item.label || item.name || 'Unknown'
  }));
};

export const formatChartTooltip = (value, name, type = 'currency') => {
  const formattedValue = type === 'currency' 
    ? formatCurrency(value) 
    : formatNumber(value);
  
  return [`${formattedValue}`, name];
};

// Export formatting
export const formatExportFilename = (prefix, format = 'json', date = new Date()) => {
  const dateStr = formatDate(date, DATE_FORMATS.ISO);
  const timestamp = date.toTimeString().slice(0, 8).replace(/:/g, '-');
  return `${prefix}_${dateStr}_${timestamp}.${format}`;
};

// Input formatting helpers
export const formatCurrencyInput = (value) => {
  // Remove all non-numeric characters except decimal point
  const cleaned = value.toString().replace(/[^\d.]/g, '');
  
  // Ensure only one decimal point
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Limit to 2 decimal places
  if (parts[1] && parts[1].length > 2) {
    return parts[0] + '.' + parts[1].slice(0, 2);
  }
  
  return cleaned;
};

export const formatDateInput = (date) => {
  if (!date) return '';
  const dateObj = new Date(date);
  if (isNaN(dateObj)) return '';
  return dateObj.toISOString().split('T')[0];
};

// Display formatting utilities
export const formatDisplayName = (firstName, lastName) => {
  if (!firstName && !lastName) return 'Unknown User';
  if (!lastName) return firstName;
  if (!firstName) return lastName;
  return `${firstName} ${lastName}`;
};

export const formatInitials = (firstName, lastName) => {
  const first = firstName ? firstName.charAt(0).toUpperCase() : '';
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  return first + last || '?';
};

export const formatAddress = (address) => {
  if (!address) return '';
  
  const parts = [
    address.street,
    address.city,
    address.state,
    address.zipCode,
    address.country
  ].filter(Boolean);
  
  return parts.join(', ');
};

// Status formatting with icons
export const formatStatus = (status, withIcon = true) => {
  const statusMap = {
    active: { label: 'Active', color: 'success', icon: 'fas fa-check-circle' },
    inactive: { label: 'Inactive', color: 'secondary', icon: 'fas fa-pause-circle' },
    pending: { label: 'Pending', color: 'warning', icon: 'fas fa-clock' },
    completed: { label: 'Completed', color: 'success', icon: 'fas fa-check-circle' },
    cancelled: { label: 'Cancelled', color: 'danger', icon: 'fas fa-times-circle' },
    error: { label: 'Error', color: 'danger', icon: 'fas fa-exclamation-circle' }
  };
  
  const statusInfo = statusMap[status] || { label: status, color: 'secondary', icon: 'fas fa-question-circle' };
  
  return {
    ...statusInfo,
    formatted: withIcon ? `${statusInfo.icon} ${statusInfo.label}` : statusInfo.label
  };
};

// Priority formatting with icons
export const formatPriority = (priority, withIcon = true) => {
  const priorityMap = {
    low: { label: 'Low', color: 'success', icon: 'fas fa-arrow-down' },
    medium: { label: 'Medium', color: 'warning', icon: 'fas fa-minus' },
    high: { label: 'High', color: 'danger', icon: 'fas fa-arrow-up' },
    critical: { label: 'Critical', color: 'danger', icon: 'fas fa-exclamation-triangle' }
  };
  
  const priorityInfo = priorityMap[priority] || { label: priority, color: 'secondary', icon: 'fas fa-question-circle' };
  
  return {
    ...priorityInfo,
    formatted: withIcon ? `${priorityInfo.icon} ${priorityInfo.label}` : priorityInfo.label
  };
};