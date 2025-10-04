/**
 * LocalStorage implementation of AnalyticsRepository
 * Provides analytics calculations based on localStorage data
 */

import { logger } from '../../config/logger';
import { DatabaseResult } from '../BaseRepository';
import TransactionRepository from './TransactionLocalStorageRepository';
import CategoryRepository from './CategoryLocalStorageRepository';
import BudgetRepository from './BudgetLocalStorageRepository';
import {
  SpendingByCategory,
  SpendingTrend,
  IncomeVsExpense,
  MonthlyComparison,
  CategoryTrend,
  BudgetPerformance,
  FinancialHealth
} from '../../types/analytics';

export class AnalyticsLocalStorageRepository {
  /**
   * Get spending by category for a period
   */
  async getSpendingByCategory(startDate: string, endDate: string): Promise<DatabaseResult<SpendingByCategory[]>> {
    try {
      const transactionsResult = await TransactionRepository.findByDateRange(startDate, endDate);
      if (transactionsResult.error || !transactionsResult.data) {
        return { data: null, error: transactionsResult.error };
      }

      const categoriesResult = await CategoryRepository.findAll();
      if (categoriesResult.error || !categoriesResult.data) {
        return { data: null, error: categoriesResult.error };
      }

      const categoryMap = new Map(categoriesResult.data.map(cat => [cat.id, cat]));
      const spendingMap = new Map<string, SpendingByCategory>();

      transactionsResult.data.forEach(transaction => {
        if (transaction.type === 'expense' && transaction.category_id) {
          const category = categoryMap.get(transaction.category_id);
          if (category) {
            const existing = spendingMap.get(transaction.category_id);
            if (existing) {
              existing.amount += transaction.amount;
              existing.transaction_count++;
            } else {
              spendingMap.set(transaction.category_id, {
                category_id: transaction.category_id,
                category_name: category.name,
                category_color: category.color || '#95A5A6',
                category_icon: category.icon || 'circle',
                amount: transaction.amount,
                transaction_count: 1,
                percentage: 0 // Will calculate after
              });
            }
          }
        }
      });

      // Calculate percentages
      const totalSpending = Array.from(spendingMap.values()).reduce((sum, item) => sum + item.amount, 0);
      const results = Array.from(spendingMap.values()).map(item => ({
        ...item,
        percentage: totalSpending > 0 ? (item.amount / totalSpending) * 100 : 0
      }));

      // Sort by amount descending
      results.sort((a, b) => b.amount - a.amount);

      return { data: results, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('AnalyticsLocalStorageRepository.getSpendingByCategory error:', err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Get spending trends over time
   */
  async getSpendingTrends(
    period: 'daily' | 'weekly' | 'monthly',
    startDate: string,
    endDate: string
  ): Promise<DatabaseResult<SpendingTrend[]>> {
    try {
      const transactionsResult = await TransactionRepository.findByDateRange(startDate, endDate);
      if (transactionsResult.error || !transactionsResult.data) {
        return { data: null, error: transactionsResult.error };
      }

      const trendMap = new Map<string, SpendingTrend>();

      transactionsResult.data.forEach(transaction => {
        const date = new Date(transaction.date);
        let periodKey: string;

        switch (period) {
          case 'daily':
            periodKey = date.toISOString().split('T')[0];
            break;
          case 'weekly':
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            periodKey = weekStart.toISOString().split('T')[0];
            break;
          case 'monthly':
            periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            break;
        }

        const existing = trendMap.get(periodKey);
        if (existing) {
          if (transaction.type === 'income') {
            existing.income += transaction.amount;
          } else {
            existing.expense += transaction.amount;
          }
          existing.net = existing.income - existing.expense;
        } else {
          trendMap.set(periodKey, {
            period: periodKey,
            income: transaction.type === 'income' ? transaction.amount : 0,
            expense: transaction.type === 'expense' ? transaction.amount : 0,
            net: transaction.type === 'income' ? transaction.amount : -transaction.amount
          });
        }
      });

      const results = Array.from(trendMap.values());
      results.sort((a, b) => a.period.localeCompare(b.period));

      return { data: results, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('AnalyticsLocalStorageRepository.getSpendingTrends error:', err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Get income vs expense comparison
   */
  async getIncomeVsExpense(startDate: string, endDate: string): Promise<DatabaseResult<IncomeVsExpense>> {
    try {
      const summaryResult = await TransactionRepository.getSummary({
        date_from: startDate,
        date_to: endDate
      });

      if (summaryResult.error || !summaryResult.data) {
        return { data: null, error: summaryResult.error };
      }

      const summary = summaryResult.data;
      const savingsRate = summary.total_income > 0 
        ? ((summary.total_income - summary.total_expense) / summary.total_income) * 100 
        : 0;

      const result: IncomeVsExpense = {
        total_income: summary.total_income,
        total_expense: summary.total_expense,
        net_savings: summary.balance,
        savings_rate: savingsRate,
        income_count: 0, // Will need to count separately
        expense_count: 0,
        avg_income: summary.avg_income,
        avg_expense: summary.avg_expense
      };

      // Get transaction counts by type
      const transactionsResult = await TransactionRepository.findByDateRange(startDate, endDate);
      if (transactionsResult.data) {
        result.income_count = transactionsResult.data.filter(t => t.type === 'income').length;
        result.expense_count = transactionsResult.data.filter(t => t.type === 'expense').length;
      }

      return { data: result, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('AnalyticsLocalStorageRepository.getIncomeVsExpense error:', err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Get month-over-month comparison
   */
  async getMonthlyComparison(year: number, month: number): Promise<DatabaseResult<MonthlyComparison>> {
    try {
      // Current month
      const currentStart = new Date(year, month - 1, 1).toISOString();
      const currentEnd = new Date(year, month, 0, 23, 59, 59).toISOString();

      // Previous month
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      const prevStart = new Date(prevYear, prevMonth - 1, 1).toISOString();
      const prevEnd = new Date(prevYear, prevMonth, 0, 23, 59, 59).toISOString();

      // Get summaries for both periods
      const [currentResult, prevResult] = await Promise.all([
        TransactionRepository.getSummary({ date_from: currentStart, date_to: currentEnd }),
        TransactionRepository.getSummary({ date_from: prevStart, date_to: prevEnd })
      ]);

      if (currentResult.error || !currentResult.data) {
        return { data: null, error: currentResult.error };
      }
      if (prevResult.error || !prevResult.data) {
        return { data: null, error: prevResult.error };
      }

      const current = currentResult.data;
      const previous = prevResult.data;

      const result: MonthlyComparison = {
        current_month: {
          income: current.total_income,
          expense: current.total_expense,
          net: current.balance
        },
        previous_month: {
          income: previous.total_income,
          expense: previous.total_expense,
          net: previous.balance
        },
        income_change: previous.total_income > 0 
          ? ((current.total_income - previous.total_income) / previous.total_income) * 100 
          : 0,
        expense_change: previous.total_expense > 0 
          ? ((current.total_expense - previous.total_expense) / previous.total_expense) * 100 
          : 0,
        net_change: current.balance - previous.balance
      };

      return { data: result, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('AnalyticsLocalStorageRepository.getMonthlyComparison error:', err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Get category spending trends
   */
  async getCategoryTrends(
    categoryId: string,
    months: number = 6
  ): Promise<DatabaseResult<CategoryTrend[]>> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const transactionsResult = await TransactionRepository.findByCategoryId(categoryId);
      if (transactionsResult.error || !transactionsResult.data) {
        return { data: null, error: transactionsResult.error };
      }

      const trendMap = new Map<string, CategoryTrend>();
      
      // Initialize months with zero values
      for (let i = 0; i < months; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        trendMap.set(monthKey, {
          month: monthKey,
          amount: 0,
          transaction_count: 0,
          avg_transaction: 0
        });
      }

      // Aggregate transaction data
      transactionsResult.data.forEach(transaction => {
        const transDate = new Date(transaction.date);
        if (transDate >= startDate && transDate <= endDate) {
          const monthKey = `${transDate.getFullYear()}-${String(transDate.getMonth() + 1).padStart(2, '0')}`;
          const existing = trendMap.get(monthKey);
          if (existing) {
            existing.amount += transaction.amount;
            existing.transaction_count++;
            existing.avg_transaction = existing.amount / existing.transaction_count;
          }
        }
      });

      const results = Array.from(trendMap.values());
      results.sort((a, b) => a.month.localeCompare(b.month));

      return { data: results, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('AnalyticsLocalStorageRepository.getCategoryTrends error:', err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Get budget performance analytics
   */
  async getBudgetPerformance(startDate: string, endDate: string): Promise<DatabaseResult<BudgetPerformance[]>> {
    try {
      const budgetsResult = await BudgetRepository.findActiveForDate(startDate);
      if (budgetsResult.error || !budgetsResult.data) {
        return { data: null, error: budgetsResult.error };
      }

      const categoriesResult = await CategoryRepository.findAll();
      if (categoriesResult.error || !categoriesResult.data) {
        return { data: null, error: categoriesResult.error };
      }

      const categoryMap = new Map(categoriesResult.data.map(cat => [cat.id, cat]));
      
      const performance: BudgetPerformance[] = budgetsResult.data.map(budget => {
        const category = categoryMap.get(budget.category_id);
        return {
          budget_id: budget.id,
          category_name: category?.name || 'Unknown',
          budgeted_amount: budget.amount,
          spent_amount: budget.spent_amount || 0,
          remaining_amount: budget.remaining_amount || budget.amount,
          percentage_used: budget.percentage_used || 0,
          status: budget.status,
          period: budget.period,
          days_remaining: Math.max(0, Math.ceil(
            (new Date(budget.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          ))
        };
      });

      // Sort by percentage used (descending)
      performance.sort((a, b) => b.percentage_used - a.percentage_used);

      return { data: performance, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('AnalyticsLocalStorageRepository.getBudgetPerformance error:', err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Get financial health metrics
   */
  async getFinancialHealth(): Promise<DatabaseResult<FinancialHealth>> {
    try {
      // Get last 3 months of data
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);

      const summaryResult = await TransactionRepository.getSummary({
        date_from: startDate.toISOString(),
        date_to: endDate.toISOString()
      });

      if (summaryResult.error || !summaryResult.data) {
        return { data: null, error: summaryResult.error };
      }

      const summary = summaryResult.data;
      const monthlyAvgIncome = summary.total_income / 3;
      const monthlyAvgExpense = summary.total_expense / 3;
      const savingsRate = monthlyAvgIncome > 0 
        ? ((monthlyAvgIncome - monthlyAvgExpense) / monthlyAvgIncome) * 100 
        : 0;

      // Calculate health score (simple algorithm)
      let score = 50; // Base score
      
      // Savings rate contribution (max 30 points)
      if (savingsRate >= 20) score += 30;
      else if (savingsRate >= 10) score += 20;
      else if (savingsRate >= 5) score += 10;
      else if (savingsRate >= 0) score += 5;
      
      // Income stability (max 20 points) - simplified
      if (monthlyAvgIncome > 0) score += 20;

      // Determine health status
      let status: 'excellent' | 'good' | 'fair' | 'poor';
      if (score >= 80) status = 'excellent';
      else if (score >= 60) status = 'good';
      else if (score >= 40) status = 'fair';
      else status = 'poor';

      const health: FinancialHealth = {
        score,
        status,
        monthly_avg_income: monthlyAvgIncome,
        monthly_avg_expense: monthlyAvgExpense,
        savings_rate: savingsRate,
        expense_ratio: monthlyAvgIncome > 0 ? (monthlyAvgExpense / monthlyAvgIncome) * 100 : 100,
        recommendations: this.generateRecommendations(savingsRate, monthlyAvgExpense, monthlyAvgIncome)
      };

      return { data: health, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('AnalyticsLocalStorageRepository.getFinancialHealth error:', err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Generate financial recommendations
   */
  private generateRecommendations(
    savingsRate: number,
    avgExpense: number,
    avgIncome: number
  ): string[] {
    const recommendations: string[] = [];

    if (savingsRate < 10) {
      recommendations.push('Consider increasing your savings rate to at least 10% of income');
    }
    if (savingsRate < 5) {
      recommendations.push('Review your expenses to identify areas where you can cut back');
    }
    if (avgExpense > avgIncome * 0.8) {
      recommendations.push('Your expenses are high relative to income - consider creating a budget');
    }
    if (avgIncome === 0) {
      recommendations.push('Track your income sources to get better financial insights');
    }

    if (recommendations.length === 0) {
      recommendations.push('Great job! Keep maintaining your healthy financial habits');
    }

    return recommendations;
  }

  /**
   * Clear all analytics cache (if any)
   */
  async clearCache(): Promise<void> {
    // Analytics repository doesn't maintain cache in localStorage implementation
    logger.debug('Analytics cache cleared (no-op for localStorage)');
  }
}

// Export singleton instance
export default new AnalyticsLocalStorageRepository();
