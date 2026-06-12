export const generateId = (prefix = 'id', length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = prefix + '_';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generateTransactionId = () => generateId('txn', 12);
export const generateBudgetId = () => generateId('bdg', 12);
export const generateCategoryId = () => generateId('cat', 8);
export const generateUserId = () => generateId('usr', 10);

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
