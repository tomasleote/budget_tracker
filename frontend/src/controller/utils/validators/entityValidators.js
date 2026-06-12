import { VALIDATION_RULES, ERROR_MESSAGES } from '../constants.js';
import { isValidEmail, isValidHexColor, isValidUrl } from './utilValidators.js';

export const validateTransaction = (data) => {
  const errors = [];
  const warnings = [];

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

  if (data.amount && parseFloat(data.amount) > 10000) {
    warnings.push('Large transaction amount detected');
  }

  if (data.description && data.description.length > 50) {
    warnings.push('Description is quite long');
  }

  return { isValid: errors.length === 0, errors, warnings };
};

export const validateBudget = (data) => {
  const errors = [];
  const warnings = [];

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

  if (data.budgetAmount && parseFloat(data.budgetAmount) > 50000) {
    warnings.push('Very high budget amount');
  }

  if (data.spent && data.budgetAmount && parseFloat(data.spent) > parseFloat(data.budgetAmount)) {
    warnings.push('Budget is already exceeded');
  }

  return { isValid: errors.length === 0, errors, warnings };
};

export const validateCategory = (data) => {
  const errors = [];
  const warnings = [];

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

  if (data.name && data.name.length > 50) {
    errors.push('Category name must be 50 characters or less');
  }

  if (data.description && data.description.length > 200) {
    errors.push('Description must be 200 characters or less');
  }

  return { isValid: errors.length === 0, errors, warnings };
};

export const validateUser = (data) => {
  const errors = [];
  const warnings = [];

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

  if (data.avatar && !isValidUrl(data.avatar)) {
    errors.push('Avatar must be a valid URL');
  }

  return { isValid: errors.length === 0, errors, warnings };
};
