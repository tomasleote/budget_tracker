// Standalone mapping and validation helpers for BudgetTransformer.
// Extracted to keep BudgetTransformer under the line-count limit.
// These functions have no dependency on BaseTransformer instance methods
// except parseAmount/parseBoolean, which are replicated here as plain functions
// to avoid a circular-import path (BudgetTransformer -> budgetMappings -> BaseTransformer is fine
// but we avoid importing BudgetTransformer itself).

function parseAmount(value) {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
}

function parseBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true' || value === '1';
  return Boolean(value);
}

/**
 * Transform budget alerts from backend format.
 */
export function alertsFromBackend(alerts) {
  if (!Array.isArray(alerts)) return [];

  return alerts.map(alert => ({
    budgetId: alert.budget_id,
    budgetName: alert.budget_name,
    categoryId: alert.category_id,
    categoryName: alert.category_name,
    percentage: parseFloat(alert.percentage || 0),
    spent: parseAmount(alert.spent || 0),
    amount: parseAmount(alert.amount || 0),
    remaining: parseAmount(alert.remaining || 0),
    daysRemaining: parseInt(alert.days_remaining) || 0,
    severity: alert.severity || 'warning',
    message: alert.message
  }));
}

/**
 * Transform budget summary from backend format.
 */
export function summaryFromBackend(summary) {
  if (!summary) return null;

  return {
    totalBudgets: summary.total_budgets || 0,
    activeBudgets: summary.active_budgets || 0,
    totalBudgeted: parseAmount(summary.total_budgeted || 0),
    totalSpent: parseAmount(summary.total_spent || 0),
    totalRemaining: parseAmount(summary.total_remaining || 0),
    overallPercentage: parseFloat(summary.overall_percentage || 0),
    budgetsOverLimit: summary.budgets_over_limit || 0,
    budgetsNearLimit: summary.budgets_near_limit || 0
  };
}

/**
 * Validate budget data before sending to backend.
 * Rules table: name, category, amount, period, startDate, alertThreshold, description.
 */
export function validateBudgetData(budget) {
  const errors = [];

  if (!budget.name || budget.name.trim() === '') {
    errors.push('Budget name is required');
  }
  if (budget.name && budget.name.length > 100) {
    errors.push('Budget name must be 100 characters or less');
  }
  if (!budget.categoryId && !budget.category) {
    errors.push('Category is required');
  }
  if (!budget.amount || budget.amount <= 0) {
    errors.push('Budget amount must be greater than 0');
  }
  if (budget.amount && budget.amount > 999999999.99) {
    errors.push('Budget amount cannot exceed 999,999,999.99');
  }
  if (!budget.period || !['weekly', 'monthly', 'quarterly', 'yearly'].includes(budget.period)) {
    errors.push('Valid budget period is required (weekly, monthly, quarterly, yearly)');
  }
  if (!budget.startDate) {
    errors.push('Start date is required');
  }
  if (budget.alertThreshold !== undefined) {
    const threshold = parseInt(budget.alertThreshold);
    if (isNaN(threshold) || threshold < 0 || threshold > 100) {
      errors.push('Alert threshold must be between 0 and 100');
    }
  }
  if (budget.description && budget.description.length > 255) {
    errors.push('Description must be 255 characters or less');
  }

  return { isValid: errors.length === 0, errors };
}
