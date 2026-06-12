// Default return values used in error catch blocks across ApiBudgetRepository

export const PROGRESS_FALLBACK = {
  spent: 0,
  remaining: 0,
  percentage: 0,
  isOverBudget: false,
  daysRemaining: 0
};

export const SUMMARY_FALLBACK = {
  totalBudgets: 0,
  activeBudgets: 0,
  totalBudgeted: 0,
  totalSpent: 0,
  totalRemaining: 0,
  overallPercentage: 0,
  budgetsOverLimit: 0,
  budgetsNearLimit: 0
};
