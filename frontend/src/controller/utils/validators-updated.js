import { VALIDATION_RULES, ERROR_MESSAGES } from './constants.js';

/**
 * Updated validators to match backend requirements
 * Includes UUID validation and backend-specific rules
 */

// UUID validation helper
export const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Transaction Validation (Updated for backend compatibility)
export const validateTransaction = (data) => {
  const errors = [];
  const warnings = [];

  // Required fields
  if (!data.type || !['income', 'expense'].includes(data.type)) {
    errors.push('Valid transaction type (income/expense) is required');
  }

  if (!data.amount || isNaN(data.amount) || parseFloat(data.amount) <= 0) {
    errors.push(ERROR_MESSAGES.VALIDATION.INVALID_AMOUNT);
  } else {
    const amount = parseFloat(data.amount);
    if (amount < VALIDATION_RULES.TRANSACTION.AMOUNT.MIN) {
      errors.push(`Amount must be at least $${VALIDATION_RULES.TRANSACTION.AMOUNT.MIN}`);
    }
    if (amount > 999999999.99) { // Backend limit
      errors.push('Amount cannot exceed $999,999,999.99');
    }
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.push(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD.replace('This field', 'Description'));
  } else {
    const desc = data.description.trim();
    if (desc.length < VALIDATION_RULES.TRANSACTION.DESCRIPTION.MIN_LENGTH) {
      errors.push(`Description must be at least ${VALIDATION_RULES.TRANSACTION.DESCRIPTION.MIN_LENGTH} character(s)`);
    }
    if (desc.length > 255) { // Backend limit
      errors.push('Description must be no more than 255 characters');
    }
  }

  // Updated to check categoryId instead of category
  if (!data.categoryId && !data.category) {
    errors.push('Category is required');
  } else if (data.categoryId && !isValidUUID(data.categoryId)) {
    warnings.push('Category ID appears to be invalid');
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

  return { isValid: errors.length === 0, errors, warnings };
};

// Budget Validation (Updated for backend compatibility)
export const validateBudget = (data) => {
  const errors = [];
  const warnings = [];

  // Name is now required by backend
  if (!data.name || data.name.trim().length === 0) {
    errors.push('Budget name is required');
  } else {
    const name = data.name.trim();
    if (name.length > 100) { // Backend limit
      errors.push('Budget name must be no more than 100 characters');
    }
  }

  // Updated to check categoryId
  if (!data.categoryId && !data.category) {
    errors.push('Category is required');
  } else if (data.categoryId && !isValidUUID(data.categoryId)) {
    warnings.push('Category ID appears to be invalid');
  }

  // Updated to check amount (backend uses 'amount' not 'budgetAmount')
  const amount = parseFloat(data.amount || data.budgetAmount);
  if (!amount || isNaN(amount) || amount <= 0) {
    errors.push(ERROR_MESSAGES.VALIDATION.INVALID_AMOUNT);
  } else {
    if (amount < VALIDATION_RULES.BUDGET.AMOUNT.MIN) {
      errors.push(`Budget amount must be at least $${VALIDATION_RULES.BUDGET.AMOUNT.MIN}`);
    }
    if (amount > 999999999.99) { // Backend limit
      errors.push('Budget amount cannot exceed $999,999,999.99');
    }
  }

  // Updated period validation to include quarterly
  if (!data.period || !['weekly', 'monthly', 'quarterly', 'yearly'].includes(data.period)) {
    errors.push('Budget period must be weekly, monthly, quarterly, or yearly');
  }

  if (!data.startDate) {
    errors.push('Start date is required');
  }

  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    
    if (start >= end) {
      errors.push('End date must be after start date');
    }
  }

  // Alert threshold validation
  if (data.alertThreshold !== undefined) {
    const threshold = parseInt(data.alertThreshold);
    if (isNaN(threshold) || threshold < 0 || threshold > 100) {
      errors.push('Alert threshold must be between 0 and 100');
    }
  }

  // Description validation
  if (data.description && data.description.length > 255) {
    errors.push('Description must be no more than 255 characters');
  }

  // Business rules
  if (amount && amount > 50000) {
    warnings.push('Very high budget amount');
  }

  if (data.spent && amount && parseFloat(data.spent) > amount) {
    warnings.push('Budget is already exceeded');
  }

  return { isValid: errors.length === 0, errors, warnings };
};

// Category Validation (remains mostly the same)
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

  if (data.icon && data.icon.length > 50) {
    errors.push('Icon class name must be 50 characters or less');
  }

  if (data.description && data.description.length > 200) {
    errors.push('Description must be 200 characters or less');
  }

  // Parent ID validation
  if (data.parentId && !isValidUUID(data.parentId)) {
    warnings.push('Parent category ID appears to be invalid');
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

  // UUID validation
  if (rules.type === 'uuid' && value && !isValidUUID(value)) {
    errors.push(`${rules.fieldName || 'Field'} must be a valid UUID`);
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

// Business Rule Validations (Updated for backend)
export const validateBusinessRules = (data, context = {}) => {
  const errors = [];
  const warnings = [];

  // Duplicate transaction detection
  if (data.type === 'transaction' && context.existingTransactions) {
    const duplicates = context.existingTransactions.filter(t => 
      t.amount === data.amount &&
      t.description === data.description &&
      t.categoryId === data.categoryId &&
      Math.abs(new Date(t.date) - new Date(data.date)) < 24 * 60 * 60 * 1000 // Same day
    );

    if (duplicates.length > 0) {
      warnings.push(ERROR_MESSAGES.TRANSACTION.DUPLICATE);
    }
  }

  // Budget overlap detection
  if (data.type === 'budget' && context.existingBudgets) {
    const overlapping = context.existingBudgets.filter(b =>
      b.categoryId === data.categoryId &&
      b.period === data.period &&
      b.isActive &&
      b.id !== data.id // Exclude self when updating
    );

    if (overlapping.length > 0) {
      errors.push(ERROR_MESSAGES.BUDGET.ALREADY_EXISTS);
    }
  }

  // Category usage validation
  if (data.type === 'category' && context.transactionCount > 0) {
    warnings.push('Category is used in existing transactions');
  }

  // Type matching validation for transactions
  if (data.type === 'transaction' && data.categoryType) {
    if (data.type !== data.categoryType) {
      errors.push(`${data.type} transaction must use ${data.type} category`);
    }
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

// Enhanced sanitization functions
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
    case 'uuid':
      return input.trim().toLowerCase();
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

// Backend compatibility helpers
export const prepareTransactionForBackend = (transaction) => {
  return {
    ...transaction,
    category_id: transaction.categoryId || transaction.category,
    categoryId: undefined,
    category: undefined
  };
};

export const prepareBudgetForBackend = (budget) => {
  return {
    ...budget,
    category_id: budget.categoryId || budget.category,
    amount: budget.amount || budget.budgetAmount,
    categoryId: undefined,
    category: undefined,
    budgetAmount: undefined
  };
};

// Precision helpers for currency
export const roundToTwoDecimals = (value) => {
  return Math.round(value * 100) / 100;
};

export const formatAmountForBackend = (amount) => {
  const parsed = parseFloat(amount);
  return isNaN(parsed) ? 0 : roundToTwoDecimals(parsed);
};
