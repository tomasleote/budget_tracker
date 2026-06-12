import { Budget } from '../../entities/index.js';
import { sortData } from '../base/sortHelpers.js';

/**
 * Pure filter/sort helpers for BudgetRepository.getWithFilters.
 * Each function takes a budget array and returns a filtered subset.
 */

export function filterByCategory(budgets, category) {
  if (!category || category === 'all') return budgets;
  return budgets.filter(b => b.category === category);
}

export function filterByPeriod(budgets, period) {
  if (!period || period === 'all') return budgets;
  return budgets.filter(b => b.period === period);
}

export function filterByStatus(budgets, status) {
  switch (status) {
    case 'active':
      return budgets.filter(b => b.isActive);
    case 'inactive':
      return budgets.filter(b => !b.isActive);
    case 'current':
      return budgets.filter(bd => Budget.fromJSON(bd).isCurrentlyActive());
    default:
      return budgets;
  }
}

export function filterByExceeded(budgets, exceeded) {
  if (exceeded === undefined) return budgets;
  return budgets.filter(b => {
    const isExceeded = parseFloat(b.spent) > parseFloat(b.budgetAmount);
    return exceeded ? isExceeded : !isExceeded;
  });
}

export function filterByAmountRange(budgets, min, max) {
  let result = budgets;
  if (min !== undefined) result = result.filter(b => parseFloat(b.budgetAmount) >= parseFloat(min));
  if (max !== undefined) result = result.filter(b => parseFloat(b.budgetAmount) <= parseFloat(max));
  return result;
}

export function filterByDateOverlap(budgets, dateFrom, dateTo) {
  if (!dateFrom && !dateTo) return budgets;
  const fromDate = dateFrom ? new Date(dateFrom) : new Date('1900-01-01');
  const toDate = dateTo ? new Date(dateTo) : new Date('2100-12-31');
  return budgets.filter(b => {
    const budgetStart = new Date(b.startDate);
    const budgetEnd = new Date(b.endDate);
    return budgetStart <= toDate && budgetEnd >= fromDate;
  });
}

export function filterBySearch(budgets, search) {
  if (!search) return budgets;
  const term = search.toLowerCase();
  return budgets.filter(b => b.category.toLowerCase().includes(term));
}

/**
 * Apply the full filter/sort/paginate pipeline from a filters object.
 * Mirrors the logic previously inlined in BudgetRepository.getWithFilters.
 */
export function applyBudgetFilters(budgets, filters = {}) {
  let result = budgets;
  result = filterByCategory(result, filters.category);
  result = filterByPeriod(result, filters.period);
  if (filters.status) result = filterByStatus(result, filters.status);
  result = filterByExceeded(result, filters.exceeded);
  result = filterByAmountRange(result, filters.minBudgetAmount, filters.maxBudgetAmount);
  result = filterByDateOverlap(result, filters.dateFrom, filters.dateTo);
  result = filterBySearch(result, filters.search);
  if (filters.sortBy) result = sortData(result, filters.sortBy, filters.sortOrder || 'desc');
  if (filters.limit) {
    const offset = filters.offset || 0;
    result = result.slice(offset, offset + filters.limit);
  }
  return result;
}
