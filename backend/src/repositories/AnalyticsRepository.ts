import { supabaseAdmin } from '../config/database';
import { logger } from '../config/logger';
import { DatabaseResult } from './BaseRepository';
import {
  DashboardSummary,
  SpendingInsights,
  FinancialHealthScore,
  AnalyticsQuery
} from '../types/analytics';
import {
  resolveAnalyticsDateRange,
  aggregateSpendingInsights,
  aggregateDashboardCategoryExpenses,
  mapRecentTransactions
} from './queries/analyticsQueries';

export class AnalyticsRepository {
  async getDashboardSummary(userId?: string): Promise<DatabaseResult<DashboardSummary>> {
    try {
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0] || '';
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0] || '';
      const yearStart = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0] || '';

      const { data: yearlyTotals, error: yearlyError } = await supabaseAdmin
        .from('transactions')
        .select('type, amount')
        .gte('date', yearStart || '');

      if (yearlyError) return { data: null, error: yearlyError.message };

      const totalIncome = yearlyTotals?.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || 0;
      const totalExpenses = yearlyTotals?.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) || 0;

      const { data: monthlyTotals, error: monthlyError } = await supabaseAdmin
        .from('transactions')
        .select('type, amount')
        .gte('date', currentMonthStart)
        .lte('date', currentMonthEnd);

      if (monthlyError) return { data: null, error: monthlyError.message };

      const monthlyIncome = monthlyTotals?.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || 0;
      const monthlyExpenses = monthlyTotals?.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) || 0;

      const { data: budgets, error: budgetError } = await supabaseAdmin
        .from('budgets')
        .select('*')
        .eq('is_active', true);

      if (budgetError) return { data: null, error: budgetError.message };

      const totalBudgetAmount = budgets?.reduce((sum, b) => sum + b.budget_amount, 0) || 0;
      const budgetUtilization = totalBudgetAmount > 0 ? (monthlyExpenses / totalBudgetAmount) * 100 : 0;

      const { data: categoryExpenses, error: categoryError } = await supabaseAdmin
        .from('transactions')
        .select(`
          amount,
          category:categories!inner (
            id,
            name,
            color
          )
        `)
        .eq('type', 'expense')
        .gte('date', currentMonthStart)
        .lte('date', currentMonthEnd);

      if (categoryError) return { data: null, error: categoryError.message };

      const categoryTotals = aggregateDashboardCategoryExpenses(categoryExpenses || []);

      let topExpenseCategory: { name: string; color: string; amount: number } | null = null;
      if (categoryTotals.size > 0) {
        const sorted = Array.from(categoryTotals.values()).sort((a, b) => b.amount - a.amount);
        topExpenseCategory = sorted[0] ?? null;
      }

      const { data: recentRows, error: recentError } = await supabaseAdmin
        .from('transactions')
        .select(`
          id,
          type,
          amount,
          description,
          date,
          category:categories!inner (
            name,
            color,
            icon
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentError) return { data: null, error: recentError.message };

      const overspentBudgets = 0;
      const approachingBudgets: string[] = [];

      const summary: DashboardSummary = {
        overview: {
          total_income: Number(totalIncome.toFixed(2)),
          total_expenses: Number(totalExpenses.toFixed(2)),
          net_amount: Number((totalIncome - totalExpenses).toFixed(2)),
          active_budgets: budgets?.length || 0,
          overspent_budgets: overspentBudgets,
          transactions_count: yearlyTotals?.length || 0
        },
        current_month: {
          income: Number(monthlyIncome.toFixed(2)),
          expenses: Number(monthlyExpenses.toFixed(2)),
          net_amount: Number((monthlyIncome - monthlyExpenses).toFixed(2)),
          budget_utilization: Number(budgetUtilization.toFixed(2)),
          top_expense_category: topExpenseCategory
        },
        recent_transactions: mapRecentTransactions(recentRows || []),
        alerts: {
          budget_alerts: overspentBudgets,
          overspent_budgets: [],
          approaching_budgets: approachingBudgets
        }
      };

      return { data: summary, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('AnalyticsRepository.getDashboardSummary error:', err);
      return { data: null, error: errorMessage };
    }
  }

  async getSpendingInsights(query: AnalyticsQuery): Promise<DatabaseResult<SpendingInsights>> {
    try {
      const { start_date, end_date } = resolveAnalyticsDateRange(query);

      const { data: transactions, error: transactionError } = await supabaseAdmin
        .from('transactions')
        .select(`
          type,
          amount,
          date,
          category:categories!inner (
            id,
            name,
            color
          )
        `)
        .gte('date', start_date)
        .lte('date', end_date);

      if (transactionError) return { data: null, error: transactionError.message };

      const { categoryMap, dailyTotals } = aggregateSpendingInsights(transactions || []);

      const totalExpenses = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.expense_amount, 0);

      const categoryBreakdown = Array.from(categoryMap.values())
        .filter(cat => cat.expense_amount > 0)
        .map(cat => ({
          category_id: cat.category_id,
          category_name: cat.category_name,
          category_color: cat.category_color,
          total_amount: Number(cat.expense_amount.toFixed(2)),
          transaction_count: cat.transaction_count,
          percentage_of_total: Number((totalExpenses > 0 ? (cat.expense_amount / totalExpenses) * 100 : 0).toFixed(2)),
          average_transaction: Number((cat.transaction_count > 0 ? cat.expense_amount / cat.transaction_count : 0).toFixed(2))
        }))
        .sort((a, b) => b.total_amount - a.total_amount);

      const spendingTrends = Array.from(dailyTotals.values())
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(trend => ({
          ...trend,
          total_expenses: Number(trend.total_expenses.toFixed(2)),
          total_income: Number(trend.total_income.toFixed(2)),
          net_amount: Number(trend.net_amount.toFixed(2))
        }));

      const highestSpending = categoryBreakdown.slice(0, 5).map(cat => ({
        category_name: cat.category_name,
        amount: cat.total_amount,
        color: cat.category_color
      }));

      const mostTransactions = [...categoryBreakdown]
        .sort((a, b) => b.transaction_count - a.transaction_count)
        .slice(0, 5)
        .map(cat => ({
          category_name: cat.category_name,
          count: cat.transaction_count,
          color: cat.category_color
        }));

      const insights: SpendingInsights = {
        period: { start_date, end_date },
        category_breakdown: categoryBreakdown,
        spending_trends: spendingTrends,
        top_categories: {
          highest_spending: highestSpending,
          most_transactions: mostTransactions,
          budget_performance: []
        }
      };

      return { data: insights, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('AnalyticsRepository.getSpendingInsights error:', err);
      return { data: null, error: errorMessage };
    }
  }

  async getFinancialHealthScore(): Promise<DatabaseResult<FinancialHealthScore>> {
    try {
      const healthScore: FinancialHealthScore = {
        overall_score: 75,
        score_breakdown: {
          budget_adherence: {
            score: 80,
            description: 'Good budget adherence',
            factors: ['80% of budgets stayed within limits', 'Minor overspending in 2 categories']
          },
          spending_consistency: {
            score: 70,
            description: 'Moderate spending consistency',
            factors: ['Some variation in monthly spending', 'Large purchases affect consistency']
          },
          income_stability: {
            score: 85,
            description: 'Stable income pattern',
            factors: ['Consistent monthly income', 'Multiple income sources']
          },
          emergency_fund: {
            score: 60,
            description: 'Emergency fund needs improvement',
            factors: ['Current savings cover 2 months', 'Recommended: 6 months coverage']
          }
        },
        recommendations: [
          {
            priority: 'high',
            category: 'savings',
            title: 'Build Emergency Fund',
            description: 'Increase emergency savings to cover 6 months of expenses',
            action_items: [
              'Set up automatic savings transfer',
              'Reduce discretionary spending by 10%',
              'Consider high-yield savings account'
            ]
          },
          {
            priority: 'medium',
            category: 'budgeting',
            title: 'Optimize Budget Categories',
            description: 'Fine-tune budget allocations based on spending patterns',
            action_items: [
              'Review overspent categories',
              'Adjust budget amounts realistically',
              'Set up spending alerts'
            ]
          }
        ],
        historical_scores: [
          { month: '2025-01', score: 72 },
          { month: '2025-02', score: 74 },
          { month: '2025-03', score: 75 }
        ]
      };

      return { data: healthScore, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('AnalyticsRepository.getFinancialHealthScore error:', err);
      return { data: null, error: errorMessage };
    }
  }
}

export default new AnalyticsRepository();
