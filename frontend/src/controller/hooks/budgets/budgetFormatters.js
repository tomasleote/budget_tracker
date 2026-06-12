/**
 * Budget formatting utilities
 * Pure functions for formatting budget data
 */

// Formats a single raw budget item using its overviewBudget match
export const formatBudgetItem = (budget, overviewBudget) => {
  const progress = overviewBudget?.progress || {
    spent: 0,
    remaining: parseFloat(budget.budgetAmount) || parseFloat(budget.amount) || 0,
    percentage: 0
  };

  const spent = parseFloat(progress.spent) || 0;
  const budgetAmount = parseFloat(budget.budgetAmount) || parseFloat(budget.amount) || 0;
  const remaining = parseFloat(progress.remaining) || (budgetAmount - spent);
  const percentage = parseFloat(progress.percentage) || 0;

  return {
    ...budget,
    progress: {
      spent,
      remaining,
      percentage
    },
    isOverBudget: percentage > 100,
    isNearLimit: percentage >= 80 && percentage <= 100,
    utilizationPercentage: percentage,
    utilizationStatus: percentage > 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'good'
  };
};

// Builds analytics object from overviewData array
export const buildAnalytics = (overviewData, formatCurrency, formatPercentage) => {
  if (!overviewData || overviewData.length === 0) return null;

  const totalBudgetAmount = overviewData.reduce((sum, b) => sum + (parseFloat(b.budgetAmount) || 0), 0);
  const totalSpent = overviewData.reduce((sum, b) => sum + (parseFloat(b.progress?.spent) || 0), 0);
  const utilization = totalBudgetAmount > 0 ? (totalSpent / totalBudgetAmount * 100) : 0;

  return {
    totalBudgetAmount,
    totalSpent,
    budgetUtilization: utilization,
    formattedTotalBudget: formatCurrency(totalBudgetAmount),
    formattedTotalSpent: formatCurrency(totalSpent),
    formattedUtilization: formatPercentage(utilization),
    healthScore: utilization <= 80 ? 'excellent' : utilization <= 100 ? 'good' : 'poor'
  };
};

// Formats a single overview budget item for display
export const formatOverviewItem = (budget, formatCurrency) => {
  const spent = parseFloat(budget.progress?.spent) || 0;
  const budgetAmount = parseFloat(budget.budgetAmount) || 0;
  const percentage = budgetAmount > 0 ? (spent / budgetAmount * 100) : 0;

  return {
    ...budget,
    formattedBudget: formatCurrency(budgetAmount),
    formattedSpent: formatCurrency(spent),
    formattedRemaining: formatCurrency(parseFloat(budget.progress?.remaining) || budgetAmount),
    progressPercentage: percentage,
    progressStatus: percentage > 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'good',
    isExceeded: percentage > 100,
    isNearLimit: percentage >= 80 && percentage <= 100
  };
};
