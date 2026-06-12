import { Budget, BudgetWithCategory, BudgetWithProgress, BudgetAlert, BudgetQuery } from '../../types/budget';
import BudgetRepository from '../../repositories/BudgetRepository';

export function calculateEndDate(startDate: string, period: 'weekly' | 'monthly' | 'yearly'): string {
  const start = new Date(startDate);
  const end = new Date(start);

  switch (period) {
    case 'weekly':
      end.setDate(start.getDate() + 6);
      break;
    case 'monthly':
      end.setMonth(start.getMonth() + 1);
      end.setDate(end.getDate() - 1);
      break;
    case 'yearly':
      end.setFullYear(start.getFullYear() + 1);
      end.setDate(end.getDate() - 1);
      break;
    default:
      throw new Error(`Invalid period: ${period}`);
  }

  const dateString = end.toISOString().split('T')[0];
  if (!dateString) {
    throw new Error('Failed to format end date');
  }
  return dateString;
}

export async function fetchBudgetsForQuery(
  filters: any,
  sort: string,
  order: string,
  pagination: { page: number; limit: number; offset: number },
  include_progress: boolean,
  include_category: boolean,
  overspent_only: boolean
): Promise<{ budgets: Budget[] | BudgetWithCategory[] | BudgetWithProgress[]; totalCount: number }> {
  const sortOptions = { field: sort, ascending: order === 'asc' };
  const { page, limit, offset } = pagination;

  if (include_progress) {
    const result = await BudgetRepository.findWithProgress(filters, sortOptions);
    if (result.error) {
      throw new Error(`Failed to fetch budgets with progress: ${result.error}`);
    }
    let allBudgets = result.data || [];
    if (overspent_only) {
      allBudgets = allBudgets.filter(b => b.is_overspent);
    }
    return { budgets: allBudgets.slice(offset, offset + limit), totalCount: allBudgets.length };
  }

  if (include_category) {
    const result = await BudgetRepository.findWithCategory(filters, sortOptions);
    if (result.error) {
      throw new Error(`Failed to fetch budgets with category: ${result.error}`);
    }
    const allBudgets = result.data || [];
    return { budgets: allBudgets.slice(offset, offset + limit), totalCount: allBudgets.length };
  }

  const result = await BudgetRepository.findAll(filters, sortOptions, pagination);
  if (result.error) {
    throw new Error(`Failed to fetch budgets: ${result.error}`);
  }
  return { budgets: result.data || [], totalCount: result.count || 0 };
}

export function buildBudgetAlerts(
  budgets: BudgetWithProgress[],
  thresholds: { approaching: number; high: number }
): BudgetAlert[] {
  const alerts: BudgetAlert[] = [];

  for (const budget of budgets) {
    const progress = budget.progress_percentage;

    if (budget.is_overspent) {
      alerts.push({
        budget_id: budget.id,
        category_name: budget.category.name,
        alert_type: 'overspent',
        message: `Budget exceeded! Spent $${budget.spent_amount.toFixed(2)} of $${budget.budget_amount.toFixed(2)} budget.`,
        severity: 'high',
        current_amount: budget.spent_amount,
        budget_amount: budget.budget_amount,
        progress_percentage: progress
      });
    } else if (budget.projected_total > budget.budget_amount) {
      alerts.push({
        budget_id: budget.id,
        category_name: budget.category.name,
        alert_type: 'exceeded_projection',
        message: `On track to exceed budget! Projected total: $${budget.projected_total.toFixed(2)} (Budget: $${budget.budget_amount.toFixed(2)}).`,
        severity: 'medium',
        current_amount: budget.spent_amount,
        budget_amount: budget.budget_amount,
        progress_percentage: progress
      });
    } else if (progress >= thresholds.high) {
      alerts.push({
        budget_id: budget.id,
        category_name: budget.category.name,
        alert_type: 'approaching_limit',
        message: `${progress.toFixed(1)}% of budget used. $${budget.remaining_amount.toFixed(2)} remaining.`,
        severity: 'high',
        current_amount: budget.spent_amount,
        budget_amount: budget.budget_amount,
        progress_percentage: progress
      });
    } else if (progress >= thresholds.approaching) {
      alerts.push({
        budget_id: budget.id,
        category_name: budget.category.name,
        alert_type: 'approaching_limit',
        message: `${progress.toFixed(1)}% of budget used. $${budget.remaining_amount.toFixed(2)} remaining.`,
        severity: 'medium',
        current_amount: budget.spent_amount,
        budget_amount: budget.budget_amount,
        progress_percentage: progress
      });
    }
  }

  return alerts;
}
