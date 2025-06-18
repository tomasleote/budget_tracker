import { VALIDATION_RULES, ERROR_MESSAGES } from './constants.js';

// Transaction Validation
export const validateTransaction = (data) => {
  const errors = [];
  const warnings = [];

  // Required fields
  if (!data.type || !['income', 'expense'].includes(data.type)) {
    errors.push(ERROR_MESSAGES.VALIDATION.INVALID_CATEGORY);
  }

  if (!data.amount || isNaN(data.amount) || parseFloat(data.amount) <= 0) {
    errors.push(ERROR_MESSAGES.VALIDATION.INVALID_AMOUNT);
  } else {
    const amount = parseFloat(data.amount);
    if (amount < VALIDATION_RULES.TRANSACTION.AMOUNT.MIN) {
      errors.push(`Amount must be at least $${VALIDATION_RULES.TRANSACTION.AMOUNT.MIN}`);
    }
    if (amount > VALIDATION_RULES.TRANSACTION.AMOUNT.MAX) {
      errors.push(`Amount cannot exceed $${VALIDATION_RULES.TRANSACTION.AMOUNT.MAX.toLocaleString()}`);
    }
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.push(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD.replace('This field', 'Description'));
  } else {
    const desc = data.description.trim();
    if (desc.length < VALIDATION_RULES.TRANSACTION.DESCRIPTION.MIN_LENGTH) {
      errors.push(`Description must be at least ${VALIDATION_RULES.TRANSACTION.DESCRIPTION.MIN_LENGTH} character(s)`);
    }
    if (desc.length > VALIDATION_RULES.TRANSACTION.DESCRIPTION.MAX_LENGTH) {
      errors.push(`Description must be no more than ${VALIDATION_RULES.TRANSACTION.DESCRIPTION.MAX_LENGTH} characters`);
    }
  }

  if (!data.category || data.category.trim().length === 0) {
    errors.push(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD.replace('This field', 'Category'));
  }

  if (!data.date || isNaN(new Date(data.date))) {
    errors.push(ERROR_MESSAGES.VALIDATION.INVALID_DATE);
  } else {
    const date = new Date(data.date);
    const now = new Date();
    const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
    
    if (date > now) {
      warnings.push(ERROR_MESSAGES.VALIDATION.FUTURE_DATE);
    }
    if (date < fiveYearsAgo) {
      warnings.push(ERROR_MESSAGES.VALIDATION.PAST_LIMIT);
    }
  }

  // Business rules
  if (data.amount && parseFloat(data.amount) > 10000) {
    warnings.push('Large transaction amount detected');
  }

  if (data.description && data.description.length > 50) {
    warnings.push('Description is quite long');
  }

  return { isValid: errors.length === 0, errors, warnings };
};

// Budget Validation
export const validateBudget = (data) => {
  const errors = [];
  const warnings = [];

  // Required fields
  if (!data.category || data.category.trim().length === 0) {
    errors.push(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD.replace('This field', 'Category'));
  } else {
    const category = data.category.trim();
    if (category.length < VALIDATION_RULES.BUDGET.CATEGORY.MIN_LENGTH) {
      errors.push(`Category must be at least ${VALIDATION_RULES.BUDGET.CATEGORY.MIN_LENGTH} character(s)`);
    }
    if (category.length > VALIDATION_RULES.BUDGET.CATEGORY.MAX_LENGTH) {
      errors.push(`Category must be no more than ${VALIDATION_RULES.BUDGET.CATEGORY.MAX_LENGTH} characters`);
    }
  }

  if (!data.budgetAmount || isNaN(data.budgetAmount) || parseFloat(data.budgetAmount) <= 0) {
    errors.push(ERROR_MESSAGES.VALIDATION.INVALID_AMOUNT);
  } else {
    const amount = parseFloat(data.budgetAmount);
    if (amount < VALIDATION_RULES.BUDGET.AMOUNT.MIN) {
      errors.push(`Budget amount must be at least $${VALIDATION_RULES.BUDGET.AMOUNT.MIN}`);
    }
    if (amount > VALIDATION_RULES.BUDGET.AMOUNT.MAX) {
      errors.push(`Budget amount cannot exceed $${VALIDATION_RULES.BUDGET.AMOUNT.MAX.toLocaleString()}`);
    }
  }

  if (!data.period || !VALIDATION_RULES.BUDGET.PERIOD.includes(data.period)) {
    errors.push(ERROR_MESSAGES.BUDGET.INVALID_PERIOD);
  }

  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    
    if (start >= end) {
      errors.push('End date must be after start date');
    }
  }

  // Business rules
  if (data.budgetAmount && parseFloat(data.budgetAmount) > 50000) {
    warnings.push('Very high budget amount');
  }

  if (data.spent && data.budgetAmount && parseFloat(data.spent) > parseFloat(data.budgetAmount)) {
    warnings.push('Budget is already exceeded');
  }

  return { isValid: errors.length === 0, errors, warnings };
};

// Category Validation
export const validateCategory = (data) => {
  const errors = [];
  const warnings = [];

  // Required fields
  if (!data.name || data.name.trim().length === 0) {
    errors.push(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD.replace('This field', 'Name'));
  }

  if (!data.type || !['income', 'expense'].includes(data.type)) {
    errors.push('Category type must be either "income" or "expense"');
  }

  if (!data.color || !isValidHexColor(data.color)) {
    errors.push('Valid hex color is required');
  }

  if (!data.icon || data.icon.trim().length === 0) {
    errors.push('Icon is required');
  }

  // Business rules
  if (data.name && data.name.length > 50) {
    errors.push('Category name must be 50 characters or less');
  }

  if (data.description && data.description.length > 200) {
    errors.push('Description must be 200 characters or less');
  }

  return { isValid: errors.length === 0, errors, warnings };
};

// User Validation
export const validateUser = (data) => {
  const errors = [];
  const warnings = [];

  // Required fields
  if (!data.name || data.name.trim().length === 0) {
    errors.push(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD.replace('This field', 'Name'));
  } else {
    const name = data.name.trim();
    if (name.length < VALIDATION_RULES.USER.NAME.MIN_LENGTH) {
      errors.push(`Name must be at least ${VALIDATION_RULES.USER.NAME.MIN_LENGTH} characters`);
    }
    if (name.length > VALIDATION_RULES.USER.NAME.MAX_LENGTH) {
      errors.push(`Name must be no more than ${VALIDATION_RULES.USER.NAME.MAX_LENGTH} characters`);
    }
  }

  if (!data.email || data.email.trim().length === 0) {
    errors.push(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD.replace('This field', 'Email'));
  } else if (!isValidEmail(data.email)) {
    errors.push(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL);
  } else if (data.email.length > VALIDATION_RULES.USER.EMAIL.MAX_LENGTH) {
    errors.push(`Email must be no more than ${VALIDATION_RULES.USER.EMAIL.MAX_LENGTH} characters`);
  }

  // Business rules
  if (data.avatar && !isValidUrl(data.avatar)) {
    errors.push('Avatar must be a valid URL');
  }

  return { isValid: errors.length === 0, errors, warnings };
};

// Form Input Validation
export const validateFormInput = (value, rules = {}) => {
  const errors = [];

  // Required validation
  if (rules.required && (!value || value.toString().trim().length === 0)) {
    errors.push(`${rules.fieldName || 'Field'} is required`);
  }

  // Length validation
  if (value && rules.minLength && value.toString().length < rules.minLength) {
    errors.push(`${rules.fieldName || 'Field'} must be at least ${rules.minLength} characters`);
  }

  if (value && rules.maxLength && value.toString().length > rules.maxLength) {
    errors.push(`${rules.fieldName || 'Field'} must be no more than ${rules.maxLength} characters`);
  }

  // Number validation
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

  // Email validation
  if (rules.type === 'email' && value && !isValidEmail(value)) {
    errors.push(`${rules.fieldName || 'Field'} must be a valid email address`);
  }

  // Date validation
  if (rules.type === 'date' && value && isNaN(new Date(value))) {
    errors.push(`${rules.fieldName || 'Field'} must be a valid date`);
  }

  return { isValid: errors.length === 0, errors };
};

// Batch Validation
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

// Business Rule Validations
export const validateBusinessRules = (data, context = {}) => {
  const errors = [];
  const warnings = [];

  // Duplicate transaction detection
  if (data.type === 'transaction' && context.existingTransactions) {
    const duplicates = context.existingTransactions.filter(t => 
      t.amount === data.amount &&
      t.description === data.description &&
      t.category === data.category &&
      Math.abs(new Date(t.date) - new Date(data.date)) < 24 * 60 * 60 * 1000 // Same day
    );

    if (duplicates.length > 0) {
      warnings.push(ERROR_MESSAGES.TRANSACTION.DUPLICATE);
    }
  }

  // Budget overlap detection
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

  // Category usage validation
  if (data.type === 'category' && context.transactionCount > 0) {
    warnings.push('Category is used in existing transactions');
  }

  return { isValid: errors.length === 0, errors, warnings };
};

// Helper validation functions
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

// Sanitization functions
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

// Data normalization
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
