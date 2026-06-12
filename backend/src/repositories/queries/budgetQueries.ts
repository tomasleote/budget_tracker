import { supabaseAdmin } from '../../config/database';
import { FilterOptions } from '../BaseRepository';
import { BudgetWithCategory } from '../../types/budget';

const CATEGORY_SELECT = `
  *,
  category:categories!inner (
    id,
    name,
    type,
    color,
    icon
  )
`;

/** Build and execute the find-with-category query applying arbitrary filters. */
export async function buildFindWithCategoryQuery(
  tableName: string,
  filters: FilterOptions,
  sort: { field: string; ascending: boolean }
) {
  let query = supabaseAdmin.from(tableName).select(CATEGORY_SELECT);

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (key.includes('gte_')) {
        query = query.gte(key.replace('gte_', ''), value);
      } else if (key.includes('lte_')) {
        query = query.lte(key.replace('lte_', ''), value);
      } else {
        query = query.eq(key, value);
      }
    }
  });

  return query.order(sort.field, { ascending: sort.ascending });
}

/** Build and execute the advanced-filter query used by import/export. */
export async function buildBudgetFindAllWithFiltersQuery(tableName: string, filters: any) {
  let query = supabaseAdmin.from(tableName).select(`
    *,
    categories (
      id,
      name,
      type,
      color,
      icon
    )
  `);

  if (filters.category_ids) {
    query = query.in('category_id', filters.category_ids);
  }

  if (filters.period) {
    if (Array.isArray(filters.period)) {
      query = query.in('period', filters.period);
    } else {
      query = query.eq('period', filters.period);
    }
  }

  if (filters.start_date_from) {
    query = query.gte('start_date', filters.start_date_from);
  }

  if (filters.end_date_to) {
    query = query.lte('end_date', filters.end_date_to);
  }

  if (filters.is_active !== undefined) {
    query = query.eq('is_active', filters.is_active);
  }

  return query.order('start_date', { ascending: false });
}

/** Calculate progress metrics for a single budget given its transaction rows. */
export function computeBudgetProgress(
  budget: BudgetWithCategory,
  transactionAmounts: number[],
  daysRemaining: number,
  totalDays: number
) {
  const spentAmount = transactionAmounts.reduce((sum, a) => sum + a, 0);
  const remainingAmount = budget.budget_amount - spentAmount;
  const progressPercentage = budget.budget_amount > 0
    ? (spentAmount / budget.budget_amount) * 100
    : 0;
  const isOverspent = spentAmount > budget.budget_amount;
  const daysElapsed = totalDays - daysRemaining;
  const averageDailySpending = daysElapsed > 0 ? spentAmount / daysElapsed : 0;
  const projectedTotal = totalDays > 0 ? averageDailySpending * totalDays : spentAmount;

  return {
    spent_amount: Number(spentAmount.toFixed(2)),
    remaining_amount: Number(remainingAmount.toFixed(2)),
    progress_percentage: Number(progressPercentage.toFixed(2)),
    is_overspent: isOverspent,
    days_remaining: daysRemaining,
    average_daily_spending: Number(averageDailySpending.toFixed(2)),
    projected_total: Number(projectedTotal.toFixed(2))
  };
}

/** Aggregate an array of BudgetWithProgress-like objects into a summary object. */
export function aggregateBudgetSummary(budgets: any[]) {
  const activeBudgets = budgets.filter(b => b.is_active);
  const overspentBudgets = budgets.filter(b => b.is_overspent);

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
    active_budgets: activeBudgets.length,
    total_budget_amount: Number(totalBudgetAmount.toFixed(2)),
    total_spent_amount: Number(totalSpentAmount.toFixed(2)),
    total_remaining_amount: Number(totalRemainingAmount.toFixed(2)),
    overspent_budgets: overspentBudgets.length,
    average_progress_percentage: Number(averageProgress.toFixed(2)),
    date_range: {
      start: startDates[0] || today,
      end: endDates[endDates.length - 1] || today
    }
  };
}
