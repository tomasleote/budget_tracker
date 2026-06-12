import { Budget } from '../../entities/index.js';

/**
 * Pure aggregation helpers for BudgetRepository.
 * All functions take a plain budget-data array and return a computed value.
 */

export function sumBudgetAmount(budgets) {
  return budgets.reduce((total, b) => total + (parseFloat(b.budgetAmount) || 0), 0);
}

export function sumSpentAmount(budgets) {
  return budgets.reduce((total, b) => total + (parseFloat(b.spent) || 0), 0);
}

export function computeStatusCounts(budgets) {
  const counts = { total: budgets.length, active: 0, inactive: 0, exceeded: 0, nearLimit: 0, healthy: 0 };
  budgets.forEach(bd => {
    const budget = Budget.fromJSON(bd);
    if (budget.isActive) { counts.active++; } else { counts.inactive++; }
    if (budget.isExceeded()) { counts.exceeded++; }
    else if (budget.isNearLimit()) { counts.nearLimit++; }
    else { counts.healthy++; }
  });
  return counts;
}

export function computePeriodStats(budgets) {
  const periodStats = {};
  budgets.forEach(b => {
    const period = b.period;
    if (!periodStats[period]) {
      periodStats[period] = { count: 0, totalBudget: 0, totalSpent: 0, averageBudget: 0, averageSpent: 0 };
    }
    periodStats[period].count++;
    periodStats[period].totalBudget += parseFloat(b.budgetAmount) || 0;
    periodStats[period].totalSpent += parseFloat(b.spent) || 0;
  });
  Object.keys(periodStats).forEach(period => {
    const s = periodStats[period];
    s.averageBudget = s.count > 0 ? s.totalBudget / s.count : 0;
    s.averageSpent = s.count > 0 ? s.totalSpent / s.count : 0;
  });
  return periodStats;
}

export function computeUtilizationStats(budgets) {
  const stats = {
    totalBudgets: budgets.length,
    utilizationRanges: { underUtilized: 0, healthy: 0, nearLimit: 0, exceeded: 0 }
  };
  budgets.forEach(bd => {
    const budget = Budget.fromJSON(bd);
    const pct = budget.getSpentPercentage();
    if (pct < 50) { stats.utilizationRanges.underUtilized++; }
    else if (pct < 80) { stats.utilizationRanges.healthy++; }
    else if (pct < 100) { stats.utilizationRanges.nearLimit++; }
    else { stats.utilizationRanges.exceeded++; }
  });
  return stats;
}

/**
 * Validate date ordering for all budgets.
 * Returns { total, valid, invalid, errors }.
 */
export function validateBudgetDates(budgets) {
  const errors = [];
  budgets.forEach(budget => {
    const startDate = new Date(budget.startDate);
    const endDate = new Date(budget.endDate);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      errors.push({ id: budget.id, category: budget.category, error: 'Invalid date format' });
    } else if (startDate >= endDate) {
      errors.push({ id: budget.id, category: budget.category, error: 'Start date must be before end date' });
    }
  });
  return { total: budgets.length, valid: budgets.length - errors.length, invalid: errors.length, errors };
}

/**
 * Find budgets that overlap the given budget's date range for the same category.
 */
export function findOverlapping(allBudgets, budget) {
  const budgetStart = new Date(budget.startDate);
  const budgetEnd = new Date(budget.endDate);
  return allBudgets.filter(existing => {
    if (existing.id === budget.id) return false;
    if (existing.category !== budget.category) return false;
    if (!existing.isActive) return false;
    const existingStart = new Date(existing.startDate);
    const existingEnd = new Date(existing.endDate);
    return budgetStart <= existingEnd && budgetEnd >= existingStart;
  });
}

/**
 * Build a CSV string from a budget array.
 * Returns '' for empty arrays, null on error (caller handles).
 */
export function buildBudgetCSV(budgets) {
  if (budgets.length === 0) return '';
  const headers = ['ID', 'Category', 'Budget Amount', 'Spent', 'Period', 'Start Date', 'End Date', 'Is Active', 'Created At'];
  const rows = budgets.map(b => [
    b.id,
    `"${b.category}"`,
    b.budgetAmount,
    b.spent,
    b.period,
    b.startDate,
    b.endDate,
    b.isActive,
    b.createdAt
  ].join(','));
  return [headers.join(','), ...rows].join('\n');
}
