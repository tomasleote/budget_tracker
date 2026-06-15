/**
 * Firestore-backed Analytics repository.
 * Aggregates the current user's transactions/budgets in memory using the
 * shared analytics helpers.
 */
import { DatabaseResult } from '../BaseRepository';
import { DashboardSummary, SpendingInsights, FinancialHealthScore, AnalyticsQuery } from '../../types/analytics';
import { errorMessage } from './helpers/queryHelpers';
import { loadTransactionsWithCategory, loadActiveBudgets } from './helpers/analyticsData';
import { staticFinancialHealthScore } from './helpers/healthScore';
import {
  resolveAnalyticsDateRange,
  aggregateSpendingInsights,
  aggregateDashboardCategoryExpenses,
  mapRecentTransactions,
} from '../queries/analyticsQueries';

const round = (n: number): number => Number(n.toFixed(2));
const day = (date: Date): string => date.toISOString().split('T')[0] || '';
const sum = (rows: { amount: number }[]): number => rows.reduce((acc, r) => acc + r.amount, 0);

export class AnalyticsFirestoreRepository {
  async getDashboardSummary(): Promise<DatabaseResult<DashboardSummary>> {
    try {
      const now = new Date();
      const monthStart = day(new Date(now.getFullYear(), now.getMonth(), 1));
      const monthEnd = day(new Date(now.getFullYear(), now.getMonth() + 1, 0));
      const yearStart = day(new Date(now.getFullYear(), 0, 1));

      const [transactions, budgets] = await Promise.all([loadTransactionsWithCategory(), loadActiveBudgets()]);

      const yearly = transactions.filter(t => t.date >= yearStart);
      const totalIncome = sum(yearly.filter(t => t.type === 'income'));
      const totalExpenses = sum(yearly.filter(t => t.type === 'expense'));

      const monthly = transactions.filter(t => t.date >= monthStart && t.date <= monthEnd);
      const monthlyIncome = sum(monthly.filter(t => t.type === 'income'));
      const monthlyExpenses = sum(monthly.filter(t => t.type === 'expense'));

      const totalBudgetAmount = budgets.reduce((acc, b) => acc + b.budget_amount, 0);
      const budgetUtilization = totalBudgetAmount > 0 ? (monthlyExpenses / totalBudgetAmount) * 100 : 0;

      const categoryTotals = aggregateDashboardCategoryExpenses(monthly.filter(t => t.type === 'expense'));
      const topExpenseCategory = categoryTotals.size > 0
        ? Array.from(categoryTotals.values()).sort((a, b) => b.amount - a.amount)[0] ?? null
        : null;

      const recent = [...transactions].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5);

      const summary: DashboardSummary = {
        overview: {
          total_income: round(totalIncome),
          total_expenses: round(totalExpenses),
          net_amount: round(totalIncome - totalExpenses),
          active_budgets: budgets.length,
          overspent_budgets: 0,
          transactions_count: yearly.length,
        },
        current_month: {
          income: round(monthlyIncome),
          expenses: round(monthlyExpenses),
          net_amount: round(monthlyIncome - monthlyExpenses),
          budget_utilization: round(budgetUtilization),
          top_expense_category: topExpenseCategory,
        },
        recent_transactions: mapRecentTransactions(recent),
        alerts: { budget_alerts: 0, overspent_budgets: [], approaching_budgets: [] },
      };
      return { data: summary, error: null };
    } catch (err) {
      return { data: null, error: errorMessage(err) };
    }
  }

  async getSpendingInsights(query: AnalyticsQuery): Promise<DatabaseResult<SpendingInsights>> {
    try {
      const { start_date, end_date } = resolveAnalyticsDateRange(query);
      const transactions = (await loadTransactionsWithCategory()).filter(t => t.date >= start_date && t.date <= end_date);
      const { categoryMap, dailyTotals } = aggregateSpendingInsights(transactions);

      const totalExpenses = Array.from(categoryMap.values()).reduce((acc, c) => acc + c.expense_amount, 0);

      const categoryBreakdown = Array.from(categoryMap.values())
        .filter(c => c.expense_amount > 0)
        .map(c => ({
          category_id: c.category_id,
          category_name: c.category_name,
          category_color: c.category_color,
          total_amount: round(c.expense_amount),
          transaction_count: c.transaction_count,
          percentage_of_total: round(totalExpenses > 0 ? (c.expense_amount / totalExpenses) * 100 : 0),
          average_transaction: round(c.transaction_count > 0 ? c.expense_amount / c.transaction_count : 0),
        }))
        .sort((a, b) => b.total_amount - a.total_amount);

      const spendingTrends = Array.from(dailyTotals.values())
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(t => ({
          ...t,
          total_expenses: round(t.total_expenses),
          total_income: round(t.total_income),
          net_amount: round(t.net_amount),
        }));

      const insights: SpendingInsights = {
        period: { start_date, end_date },
        category_breakdown: categoryBreakdown,
        spending_trends: spendingTrends,
        top_categories: {
          highest_spending: categoryBreakdown.slice(0, 5).map(c => ({ category_name: c.category_name, amount: c.total_amount, color: c.category_color })),
          most_transactions: [...categoryBreakdown]
            .sort((a, b) => b.transaction_count - a.transaction_count)
            .slice(0, 5)
            .map(c => ({ category_name: c.category_name, count: c.transaction_count, color: c.category_color })),
          budget_performance: [],
        },
      };
      return { data: insights, error: null };
    } catch (err) {
      return { data: null, error: errorMessage(err) };
    }
  }

  async getFinancialHealthScore(): Promise<DatabaseResult<FinancialHealthScore>> {
    return { data: staticFinancialHealthScore(), error: null };
  }
}

export default new AnalyticsFirestoreRepository();
