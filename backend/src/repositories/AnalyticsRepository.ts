import { supabaseAdmin } from '../config/database';
import { logger } from '../config/logger';
import { DatabaseResult } from './BaseRepository';
import { 
  DashboardSummary, 
  SpendingInsights, 
  BudgetPerformance, 
  TrendsAnalysis,
  FinancialHealthScore,
  ComparisonAnalysis,
  AnalyticsQuery 
} from '../types/analytics';

export class AnalyticsRepository {
  /**
   * Get dashboard summary data
   */
  async getDashboardSummary(userId?: string): Promise<DatabaseResult<DashboardSummary>> {
    try {
      // Get current month date range
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0] || '';
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0] || '';
      const yearStart = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0] || '';

      // Get overall totals for the year
      const { data: yearlyTotals, error: yearlyError } = await supabaseAdmin
        .from('transactions')
        .select('type, amount')
        .gte('date', yearStart || '');

      if (yearlyError) {
        return { data: null, error: yearlyError.message };
      }

      const totalIncome = yearlyTotals?.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || 0;
      const totalExpenses = yearlyTotals?.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) || 0;

      // Get current month data
      const { data: monthlyTotals, error: monthlyError } = await supabaseAdmin
        .from('transactions')
        .select('type, amount')
        .gte('date', currentMonthStart)
        .lte('date', currentMonthEnd);

      if (monthlyError) {
        return { data: null, error: monthlyError.message };
      }

      const monthlyIncome = monthlyTotals?.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || 0;
      const monthlyExpenses = monthlyTotals?.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) || 0;

      // Get budget data
      const { data: budgets, error: budgetError } = await supabaseAdmin
        .from('budgets')
        .select('*')
        .eq('is_active', true);

      if (budgetError) {
        return { data: null, error: budgetError.message };
      }

      // Calculate budget utilization
      const totalBudgetAmount = budgets?.reduce((sum, b) => sum + b.budget_amount, 0) || 0;
      const budgetUtilization = totalBudgetAmount > 0 ? (monthlyExpenses / totalBudgetAmount) * 100 : 0;

      // Get top expense category for current month
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

      if (categoryError) {
        return { data: null, error: categoryError.message };
      }

      // Aggregate by category
      const categoryTotals = new Map();
      categoryExpenses?.forEach(transaction => {
        // Check if category is an array (shouldn't be) or object
        const category = Array.isArray(transaction.category) ? transaction.category[0] : transaction.category;
        if (!category) return;
        
        const categoryId = category.id;
        const existing = categoryTotals.get(categoryId) || { 
          name: category.name,
          color: category.color,
          amount: 0 
        };
        existing.amount += transaction.amount;
        categoryTotals.set(categoryId, existing);
      });

      // Get top category
      let topExpenseCategory = null;
      if (categoryTotals.size > 0) {
        const sortedCategories = Array.from(categoryTotals.values()).sort((a, b) => b.amount - a.amount);
        topExpenseCategory = sortedCategories[0];
      }

      // Get recent transactions
      const { data: recentTransactions, error: recentError } = await supabaseAdmin
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

      if (recentError) {
        return { data: null, error: recentError.message };
      }

      // Count overspent budgets (simplified - would need actual calculation)
      const overspentBudgets = 0; // TODO: Calculate based on actual spending
      const approachingBudgets: string[] = []; // TODO: Calculate based on thresholds

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
        recent_transactions: recentTransactions?.map(t => {
          const category = Array.isArray(t.category) ? t.category[0] : t.category;
          return {
            id: t.id,
            type: t.type,
            amount: t.amount,
            description: t.description,
            category: category || { name: '', color: '', icon: '' },
            date: t.date
          };
        }) || [],
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

  /**
   * Get spending insights for a period
   */
  async getSpendingInsights(query: AnalyticsQuery): Promise<DatabaseResult<SpendingInsights>> {
    try {
      const { start_date, end_date } = this.getDateRange(query);

      // Get category breakdown
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

      if (transactionError) {
        return { data: null, error: transactionError.message };
      }

      // Group by category
      const categoryMap = new Map();
      const dailyTotals = new Map();

      transactions?.forEach(transaction => {
        // Check if category is an array (shouldn't be) or object
        const categoryData = Array.isArray(transaction.category) ? transaction.category[0] : transaction.category;
        if (!categoryData) return;
        
        const categoryId = categoryData.id;
        const category = categoryMap.get(categoryId) || {
          category_id: categoryId,
          category_name: categoryData.name,
          category_color: categoryData.color,
          income_amount: 0,
          expense_amount: 0,
          transaction_count: 0
        };

        if (transaction.type === 'income') {
          category.income_amount += transaction.amount;
        } else {
          category.expense_amount += transaction.amount;
        }
        category.transaction_count++;
        categoryMap.set(categoryId, category);

        // Daily totals
        const date = transaction.date;
        const daily = dailyTotals.get(date) || {
          date,
          total_expenses: 0,
          total_income: 0,
          net_amount: 0
        };
        
        if (transaction.type === 'income') {
          daily.total_income += transaction.amount;
        } else {
          daily.total_expenses += transaction.amount;
        }
        daily.net_amount = daily.total_income - daily.total_expenses;
        dailyTotals.set(date, daily);
      });

      // Calculate totals for percentages
      const totalExpenses = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.expense_amount, 0);

      // Build category breakdown (expenses only)
      const categoryBreakdown = Array.from(categoryMap.values())
        .filter(cat => cat.expense_amount > 0)
        .map(cat => ({
          category_id: cat.category_id,
          category_name: cat.category_name,
          category_color: cat.category_color,
          total_amount: cat.expense_amount,
          transaction_count: cat.transaction_count,
          percentage_of_total: totalExpenses > 0 ? (cat.expense_amount / totalExpenses) * 100 : 0,
          average_transaction: cat.transaction_count > 0 ? cat.expense_amount / cat.transaction_count : 0
        }))
        .sort((a, b) => b.total_amount - a.total_amount);

      // Build spending trends
      const spendingTrends = Array.from(dailyTotals.values())
        .sort((a, b) => a.date.localeCompare(b.date));

      // Top categories
      const highestSpending = categoryBreakdown.slice(0, 5).map(cat => ({
        category_name: cat.category_name,
        amount: cat.total_amount,
        color: cat.category_color
      }));

      const mostTransactions = categoryBreakdown
        .sort((a, b) => b.transaction_count - a.transaction_count)
        .slice(0, 5)
        .map(cat => ({
          category_name: cat.category_name,
          count: cat.transaction_count,
          color: cat.category_color
        }));

      const insights: SpendingInsights = {
        period: {
          start_date,
          end_date
        },
        category_breakdown: categoryBreakdown.map(cat => ({
          ...cat,
          total_amount: Number(cat.total_amount.toFixed(2)),
          percentage_of_total: Number(cat.percentage_of_total.toFixed(2)),
          average_transaction: Number(cat.average_transaction.toFixed(2))
        })),
        spending_trends: spendingTrends.map(trend => ({
          ...trend,
          total_expenses: Number(trend.total_expenses.toFixed(2)),
          total_income: Number(trend.total_income.toFixed(2)),
          net_amount: Number(trend.net_amount.toFixed(2))
        })),
        top_categories: {
          highest_spending: highestSpending,
          most_transactions: mostTransactions,
          budget_performance: [] // TODO: Implement budget performance
        }
      };

      return { data: insights, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('AnalyticsRepository.getSpendingInsights error:', err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Get simplified financial health score
   */
  async getFinancialHealthScore(): Promise<DatabaseResult<FinancialHealthScore>> {
    try {
      // This is a simplified implementation
      // In a real app, this would involve complex calculations
      
      const healthScore: FinancialHealthScore = {
        overall_score: 75,
        score_breakdown: {
          budget_adherence: {
            score: 80,
            description: "Good budget adherence",
            factors: ["80% of budgets stayed within limits", "Minor overspending in 2 categories"]
          },
          spending_consistency: {
            score: 70,
            description: "Moderate spending consistency",
            factors: ["Some variation in monthly spending", "Large purchases affect consistency"]
          },
          income_stability: {
            score: 85,
            description: "Stable income pattern",
            factors: ["Consistent monthly income", "Multiple income sources"]
          },
          emergency_fund: {
            score: 60,
            description: "Emergency fund needs improvement",
            factors: ["Current savings cover 2 months", "Recommended: 6 months coverage"]
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

  /**
   * Helper method to get date range from query
   */
  private getDateRange(query: AnalyticsQuery): { start_date: string; end_date: string } {
    if (query.start_date && query.end_date) {
      return {
        start_date: query.start_date,
        end_date: query.end_date
      };
    }

    const now = new Date();
    let start_date: string;
    let end_date: string = now.toISOString().split('T')[0] || '';

    switch (query.period) {
      case 'week':
        start_date = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '';
        break;
      case 'quarter':
        start_date = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1).toISOString().split('T')[0] || '';
        break;
      case 'year':
        start_date = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0] || '';
        break;
      case 'month':
      default:
        start_date = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0] || '';
        break;
    }

    return { start_date, end_date };
  }
}

export default new AnalyticsRepository();
