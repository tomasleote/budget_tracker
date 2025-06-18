import { STORAGE_KEYS } from './constants.js';

// Object utilities
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

export const deepMerge = (target, ...sources) => {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
};

export const getNestedValue = (obj, path, defaultValue = undefined) => {
  const keys = path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result === null || result === undefined || !(key in result)) {
      return defaultValue;
    }
    result = result[key];
  }

  return result;
};

export const setNestedValue = (obj, path, value) => {
  const keys = path.split('.');
  const lastKey = keys.pop();
  let target = obj;

  for (const key of keys) {
    if (!(key in target) || !isObject(target[key])) {
      target[key] = {};
    }
    target = target[key];
  }

  target[lastKey] = value;
  return obj;
};

export const omit = (obj, keys) => {
  const keysToOmit = Array.isArray(keys) ? keys : [keys];
  const result = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key) && !keysToOmit.includes(key)) {
      result[key] = obj[key];
    }
  }

  return result;
};

export const pick = (obj, keys) => {
  const keysToPick = Array.isArray(keys) ? keys : [keys];
  const result = {};

  keysToPick.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });

  return result;
};

export const isObject = (item) => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (isObject(value)) return Object.keys(value).length === 0;
  return false;
};

// Array utilities
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = getNestedValue(item, key);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aValue = getNestedValue(a, key);
    const bValue = getNestedValue(b, key);

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export const unique = (array, key = null) => {
  if (key) {
    const seen = new Set();
    return array.filter(item => {
      const value = getNestedValue(item, key);
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  }
  return [...new Set(array)];
};

export const sumBy = (array, key) => {
  return array.reduce((sum, item) => {
    const value = getNestedValue(item, key);
    return sum + (parseFloat(value) || 0);
  }, 0);
};

export const countBy = (array, key) => {
  return array.reduce((counts, item) => {
    const value = getNestedValue(item, key);
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
};

export const chunk = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const flatten = (array, depth = 1) => {
  return depth > 0 
    ? array.reduce((acc, val) => 
        acc.concat(Array.isArray(val) ? flatten(val, depth - 1) : val), [])
    : array.slice();
};

// Date utilities
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const addYears = (date, years) => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
};

export const startOfDay = (date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const endOfDay = (date) => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

export const startOfMonth = (date) => {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const endOfMonth = (date) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1, 0);
  result.setHours(23, 59, 59, 999);
  return result;
};

export const startOfYear = (date) => {
  const result = new Date(date);
  result.setMonth(0, 1);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const endOfYear = (date) => {
  const result = new Date(date);
  result.setMonth(11, 31);
  result.setHours(23, 59, 59, 999);
  return result;
};

export const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return today.toDateString() === checkDate.toDateString();
};

export const isThisMonth = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return today.getMonth() === checkDate.getMonth() && 
         today.getFullYear() === checkDate.getFullYear();
};

export const isThisYear = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return today.getFullYear() === checkDate.getFullYear();
};

export const daysBetween = (date1, date2) => {
  const diffTime = Math.abs(new Date(date2) - new Date(date1));
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const monthsBetween = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
};

// String utilities
export const generateId = (prefix = 'id', length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = prefix + '_';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generateTransactionId = () => {
  return generateId('txn', 12);
};

export const generateBudgetId = () => {
  return generateId('bdg', 12);
};

export const generateCategoryId = () => {
  return generateId('cat', 8);
};

export const generateUserId = () => {
  return generateId('usr', 10);
};

export const camelCase = (str) => {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
};

export const kebabCase = (str) => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
};

export const snakeCase = (str) => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
};

export const randomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Performance utilities
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const memoize = (fn, getKey = (...args) => JSON.stringify(args)) => {
  const cache = new Map();
  return (...args) => {
    const key = getKey(...args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

export const once = (fn) => {
  let called = false;
  let result;
  return (...args) => {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  };
};

// Validation helpers
export const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date);
};

export const isNumeric = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

export const isPositiveNumber = (value) => {
  return isNumeric(value) && parseFloat(value) > 0;
};

export const isInteger = (value) => {
  return Number.isInteger(Number(value));
};

export const isInRange = (value, min, max) => {
  const num = parseFloat(value);
  return num >= min && num <= max;
};

export const hasMinLength = (value, minLength) => {
  return typeof value === 'string' && value.length >= minLength;
};

export const hasMaxLength = (value, maxLength) => {
  return typeof value === 'string' && value.length <= maxLength;
};

export const matchesPattern = (value, pattern) => {
  return new RegExp(pattern).test(value);
};

// Error handling utilities
export const safeExecute = (fn, fallback = null) => {
  try {
    return fn();
  } catch (error) {
    console.error('Safe execution failed:', error);
    return fallback;
  }
};

export const asyncSafeExecute = async (fn, fallback = null) => {
  try {
    return await fn();
  } catch (error) {
    console.error('Async safe execution failed:', error);
    return fallback;
  }
};

export const withRetry = async (fn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(delay * Math.pow(2, i)); // Exponential backoff
    }
  }
};

export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Local storage utilities
export const getStorageItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting storage item ${key}:`, error);
    return defaultValue;
  }
};

export const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error setting storage item ${key}:`, error);
    return false;
  }
};

export const removeStorageItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing storage item ${key}:`, error);
    return false;
  }
};

export const clearStorage = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing storage:', error);
    return false;
  }
};

export const getStorageSize = () => {
  let total = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return total;
};

// URL utilities
export const parseUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return {
      protocol: urlObj.protocol,
      hostname: urlObj.hostname,
      port: urlObj.port,
      pathname: urlObj.pathname,
      search: urlObj.search,
      hash: urlObj.hash,
      params: Object.fromEntries(urlObj.searchParams)
    };
  } catch (error) {
    return null;
  }
};

export const buildUrl = (baseUrl, params = {}) => {
  const url = new URL(baseUrl);
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined) {
      url.searchParams.set(key, params[key]);
    }
  });
  return url.toString();
};

// File utilities
export const downloadFile = (data, filename, type = 'application/json') => {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const readFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = e => reject(e);
    reader.readAsText(file);
  });
};

export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Browser utilities
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isTablet = () => {
  return /iPad|Android|webOS|BlackBerry|IEMobile/i.test(navigator.userAgent) && window.innerWidth >= 768;
};

export const isDesktop = () => {
  return !isMobile() && !isTablet();
};

export const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';

  if (userAgent.indexOf('Chrome') > -1) {
    browserName = 'Chrome';
    browserVersion = userAgent.match(/Chrome\/(\d+)/)[1];
  } else if (userAgent.indexOf('Firefox') > -1) {
    browserName = 'Firefox';
    browserVersion = userAgent.match(/Firefox\/(\d+)/)[1];
  } else if (userAgent.indexOf('Safari') > -1) {
    browserName = 'Safari';
    browserVersion = userAgent.match(/Version\/(\d+)/)[1];
  } else if (userAgent.indexOf('Edge') > -1) {
    browserName = 'Edge';
    browserVersion = userAgent.match(/Edge\/(\d+)/)[1];
  }

  return { browserName, browserVersion };
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch (err) {
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
};

// Math utilities
export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

export const lerp = (start, end, factor) => {
  return start + (end - start) * factor;
};

export const randomBetween = (min, max) => {
  return Math.random() * (max - min) + min;
};

export const randomInt = (min, max) => {
  return Math.floor(randomBetween(min, max + 1));
};

export const toFixed = (number, decimals = 2) => {
  return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

// Color utilities
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const rgbToHex = (r, g, b) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

export const darkenColor = (hex, amount) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const darken = (value) => Math.max(0, Math.min(255, value - amount));
  return rgbToHex(darken(rgb.r), darken(rgb.g), darken(rgb.b));
};

export const lightenColor = (hex, amount) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const lighten = (value) => Math.max(0, Math.min(255, value + amount));
  return rgbToHex(lighten(rgb.r), lighten(rgb.g), lighten(rgb.b));
};

// Event utilities
export const createEventEmitter = () => {
  const events = {};
  
  return {
    on(event, callback) {
      if (!events[event]) events[event] = [];
      events[event].push(callback);
    },
    off(event, callback) {
      if (events[event]) {
        events[event] = events[event].filter(cb => cb !== callback);
      }
    },
    emit(event, ...args) {
      if (events[event]) {
        events[event].forEach(callback => callback(...args));
      }
    },
    once(event, callback) {
      const onceCallback = (...args) => {
        callback(...args);
        this.off(event, onceCallback);
      };
      this.on(event, onceCallback);
    }
  };
};
