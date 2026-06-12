import { sortData } from '../base/sortHelpers.js';

/**
 * Pure filter/sort helpers for TransactionRepository.getWithFilters.
 */

export function filterByType(transactions, type) {
  if (!type || type === 'all') return transactions;
  return transactions.filter(t => t.type === type);
}

export function filterByCategory(transactions, category) {
  if (!category || category === 'all') return transactions;
  return transactions.filter(t => t.category === category);
}

export function filterByDateRange(transactions, dateFrom, dateTo) {
  if (!dateFrom && !dateTo) return transactions;
  const fromDate = dateFrom ? new Date(dateFrom) : new Date('1900-01-01');
  const toDate = dateTo ? new Date(dateTo) : new Date('2100-12-31');
  return transactions.filter(t => {
    const d = new Date(t.date);
    return d >= fromDate && d <= toDate;
  });
}

export function filterByAmountRange(transactions, minAmount, maxAmount) {
  let result = transactions;
  if (minAmount !== undefined) result = result.filter(t => t.amount >= parseFloat(minAmount));
  if (maxAmount !== undefined) result = result.filter(t => t.amount <= parseFloat(maxAmount));
  return result;
}

export function filterBySearch(transactions, search) {
  if (!search) return transactions;
  const term = search.toLowerCase();
  return transactions.filter(t =>
    t.description.toLowerCase().includes(term) ||
    t.category.toLowerCase().includes(term)
  );
}

/**
 * Apply the full filter/sort/paginate pipeline from a filters object.
 * Mirrors the logic previously inlined in TransactionRepository.getWithFilters.
 */
export function applyTransactionFilters(transactions, filters = {}) {
  let result = transactions;
  result = filterByType(result, filters.type);
  result = filterByCategory(result, filters.category);
  result = filterByDateRange(result, filters.dateFrom, filters.dateTo);
  result = filterByAmountRange(result, filters.minAmount, filters.maxAmount);
  result = filterBySearch(result, filters.search);
  if (filters.sortBy) result = sortData(result, filters.sortBy, filters.sortOrder || 'desc');
  if (filters.limit) {
    const offset = filters.offset || 0;
    result = result.slice(offset, offset + filters.limit);
  }
  return result;
}
