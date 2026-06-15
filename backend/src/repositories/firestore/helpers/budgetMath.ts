/**
 * Pure budget progress/summary math, shared by the Firestore budget repository.
 */
import { BudgetWithCategory } from '../../../types/budget';

export function computeBudgetProgress(
  budget: BudgetWithCategory,
  transactionAmounts: number[],
  daysRemaining: number,
  totalDays: number
) {
  const spentAmount = transactionAmounts.reduce((sum, a) => sum + a, 0);
  const remainingAmount = budget.budget_amount - spentAmount;
  const progressPercentage = budget.budget_amount > 0 ? (spentAmount / budget.budget_amount) * 100 : 0;
  const daysElapsed = totalDays - daysRemaining;
  const averageDailySpending = daysElapsed > 0 ? spentAmount / daysElapsed : 0;
  const projectedTotal = totalDays > 0 ? averageDailySpending * totalDays : spentAmount;

  return {
    spent_amount: Number(spentAmount.toFixed(2)),
    remaining_amount: Number(remainingAmount.toFixed(2)),
    progress_percentage: Number(progressPercentage.toFixed(2)),
    is_overspent: spentAmount > budget.budget_amount,
    days_remaining: daysRemaining,
    average_daily_spending: Number(averageDailySpending.toFixed(2)),
    projected_total: Number(projectedTotal.toFixed(2)),
  };
}

export function aggregateBudgetSummary(budgets: Array<{
  is_active: boolean;
  is_overspent: boolean;
  budget_amount: number;
  spent_amount: number;
  remaining_amount: number;
  progress_percentage: number;
  start_date: string;
  end_date: string;
}>) {
  const totalBudgetAmount = budgets.reduce((sum, b) => sum + b.budget_amount, 0);
  const totalSpentAmount = budgets.reduce((sum, b) => sum + b.spent_amount, 0);
  const totalRemainingAmount = budgets.reduce((sum, b) => sum + b.remaining_amount, 0);
  const averageProgress = budgets.length > 0
    ? budgets.reduce((sum, b) => sum + b.progress_percentage, 0) / budgets.length
    : 0;
  const startDates = budgets.map(b => b.start_date).sort();
  const endDates = budgets.map(b => b.end_date).sort();
  const today = new Date().toISOString().split('T')[0] || '';

  return {
    total_budgets: budgets.length,
    active_budgets: budgets.filter(b => b.is_active).length,
    total_budget_amount: Number(totalBudgetAmount.toFixed(2)),
    total_spent_amount: Number(totalSpentAmount.toFixed(2)),
    total_remaining_amount: Number(totalRemainingAmount.toFixed(2)),
    overspent_budgets: budgets.filter(b => b.is_overspent).length,
    average_progress_percentage: Number(averageProgress.toFixed(2)),
    date_range: { start: startDates[0] || today, end: endDates[endDates.length - 1] || today },
  };
}

export function daysRemaining(endDate: string): number {
  return Math.max(0, Math.ceil((new Date(endDate).getTime() - Date.now()) / 86_400_000));
}

export function totalDaysBetween(startDate: string, endDate: string): number {
  return Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86_400_000));
}
