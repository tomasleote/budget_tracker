/**
 * Pure helper: validates transaction data and throws ValidationError on failure.
 */

import { ValidationError } from '../../errors.js';

/**
 * @param {Object} data
 * @param {'create'|'update'} operation
 * @returns {Object} the same data object if valid
 * @throws {ValidationError}
 */
export function validateTransactionData(data, operation = 'create') {
  const errors = [];

  if (operation === 'create') {
    if (!data.type || !['income', 'expense'].includes(data.type)) {
      errors.push('Valid transaction type (income/expense) is required');
    }
    if (data.amount === undefined || data.amount === null) {
      errors.push('Amount is required');
    }
    if (!data.description || data.description.trim() === '') {
      errors.push('Description is required');
    }
    if (!data.categoryId) {
      errors.push('Category is required');
    }
    if (!data.date) {
      errors.push('Date is required');
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

  if (data.description && data.description.length > 255) {
    errors.push('Description must be 255 characters or less');
  }

  if (data.date) {
    const date = new Date(data.date);
    if (isNaN(date.getTime())) {
      errors.push('Invalid date format');
    }
  }

  if (errors.length > 0) {
    throw new ValidationError('Transaction validation failed', errors);
  }

  return data;
}
