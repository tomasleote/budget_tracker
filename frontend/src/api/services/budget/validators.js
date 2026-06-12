/**
 * Pure helper: validates budget data and throws ValidationError on failure.
 */

import { ValidationError } from '../../errors.js';

/**
 * @param {Object} data
 * @param {'create'|'update'} operation
 * @returns {Object} the same data object if valid
 * @throws {ValidationError}
 */
export function validateBudgetData(data, operation = 'create') {
  const errors = [];

  if (operation === 'create') {
    if (!data.name || data.name.trim() === '') {
      errors.push('Budget name is required');
    }
    if (!data.amount || data.amount <= 0) {
      errors.push('Budget amount must be positive');
    }
    if (!data.categoryId) {
      errors.push('Category is required');
    }
    if (!data.period || !['weekly', 'monthly', 'quarterly', 'yearly'].includes(data.period)) {
      errors.push('Valid budget period is required (weekly, monthly, quarterly, yearly)');
    }
    if (!data.startDate) {
      errors.push('Start date is required');
    }
  }

  if (data.amount !== undefined) {
    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) {
      errors.push('Amount must be a positive number');
    }
    if (amount > 999999999.99) {
      errors.push('Amount cannot exceed 999,999,999.99');
    }
  }

  if (data.name && data.name.length > 100) {
    errors.push('Budget name must be 100 characters or less');
  }

  if (data.startDate) {
    const startDate = new Date(data.startDate);
    if (isNaN(startDate.getTime())) {
      errors.push('Invalid start date format');
    }
  }

  if (data.endDate) {
    const endDate = new Date(data.endDate);
    if (isNaN(endDate.getTime())) {
      errors.push('Invalid end date format');
    }
    if (data.startDate) {
      const startDate = new Date(data.startDate);
      if (endDate <= startDate) {
        errors.push('End date must be after start date');
      }
    }
  }

  if (data.alertThreshold !== undefined) {
    const threshold = parseInt(data.alertThreshold);
    if (isNaN(threshold) || threshold < 0 || threshold > 100) {
      errors.push('Alert threshold must be between 0 and 100');
    }
  }

  if (errors.length > 0) {
    throw new ValidationError('Budget validation failed', errors);
  }

  return data;
}
