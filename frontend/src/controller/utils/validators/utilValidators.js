import { VALIDATION_RULES, ERROR_MESSAGES } from '../constants.js';

export const isValidEmail = (email) => {
  return VALIDATION_RULES.USER.EMAIL.PATTERN.test(email);
};

export const isValidHexColor = (color) => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateFormInput = (value, rules = {}) => {
  const errors = [];

  if (rules.required && (!value || value.toString().trim().length === 0)) {
    errors.push(`${rules.fieldName || 'Field'} is required`);
  }

  if (value && rules.minLength && value.toString().length < rules.minLength) {
    errors.push(`${rules.fieldName || 'Field'} must be at least ${rules.minLength} characters`);
  }

  if (value && rules.maxLength && value.toString().length > rules.maxLength) {
    errors.push(`${rules.fieldName || 'Field'} must be no more than ${rules.maxLength} characters`);
  }

  if (rules.type === 'number' && value) {
    if (isNaN(value)) {
      errors.push(`${rules.fieldName || 'Field'} must be a valid number`);
    } else {
      const numValue = parseFloat(value);
      if (rules.min !== undefined && numValue < rules.min) {
        errors.push(`${rules.fieldName || 'Field'} must be at least ${rules.min}`);
      }
      if (rules.max !== undefined && numValue > rules.max) {
        errors.push(`${rules.fieldName || 'Field'} must be no more than ${rules.max}`);
      }
    }
  }

  if (rules.type === 'email' && value && !isValidEmail(value)) {
    errors.push(`${rules.fieldName || 'Field'} must be a valid email address`);
  }

  if (rules.type === 'date' && value && isNaN(new Date(value))) {
    errors.push(`${rules.fieldName || 'Field'} must be a valid date`);
  }

  return { isValid: errors.length === 0, errors };
};

export const validateBatch = (items, validator) => {
  const results = [];
  let allValid = true;

  items.forEach((item, index) => {
    const validation = validator(item);
    results.push({
      index,
      item,
      ...validation
    });

    if (!validation.isValid) {
      allValid = false;
    }
  });

  return {
    isValid: allValid,
    results,
    validItems: results.filter(r => r.isValid).map(r => r.item),
    invalidItems: results.filter(r => !r.isValid)
  };
};

export const validateBusinessRules = (data, context = {}) => {
  const errors = [];
  const warnings = [];

  if (data.type === 'transaction' && context.existingTransactions) {
    const duplicates = context.existingTransactions.filter(t =>
      t.amount === data.amount &&
      t.description === data.description &&
      t.category === data.category &&
      Math.abs(new Date(t.date) - new Date(data.date)) < 24 * 60 * 60 * 1000
    );

    if (duplicates.length > 0) {
      warnings.push(ERROR_MESSAGES.TRANSACTION.DUPLICATE);
    }
  }

  if (data.type === 'budget' && context.existingBudgets) {
    const overlapping = context.existingBudgets.filter(b =>
      b.category === data.category &&
      b.period === data.period &&
      b.isActive
    );

    if (overlapping.length > 0) {
      errors.push(ERROR_MESSAGES.BUDGET.ALREADY_EXISTS);
    }
  }

  if (data.type === 'category' && context.transactionCount > 0) {
    warnings.push('Category is used in existing transactions');
  }

  return { isValid: errors.length === 0, errors, warnings };
};

export const sanitizeInput = (input, type = 'text') => {
  if (typeof input !== 'string') return input;

  switch (type) {
    case 'text':
      return input.trim().replace(/[<>]/g, '');
    case 'number':
      return input.replace(/[^0-9.-]/g, '');
    case 'email':
      return input.trim().toLowerCase();
    case 'currency':
      return input.replace(/[^0-9.]/g, '');
    default:
      return input.trim();
  }
};

export const normalizeData = (data, schema = {}) => {
  const normalized = { ...data };

  Object.keys(schema).forEach(key => {
    if (normalized[key] !== undefined) {
      const rule = schema[key];

      if (rule.type === 'string') {
        normalized[key] = String(normalized[key]).trim();
      } else if (rule.type === 'number') {
        normalized[key] = parseFloat(normalized[key]) || 0;
      } else if (rule.type === 'boolean') {
        normalized[key] = Boolean(normalized[key]);
      } else if (rule.type === 'date') {
        normalized[key] = new Date(normalized[key]);
      }

      if (rule.lowercase) {
        normalized[key] = normalized[key].toLowerCase();
      }

      if (rule.uppercase) {
        normalized[key] = normalized[key].toUpperCase();
      }
    }
  });

  return normalized;
};
