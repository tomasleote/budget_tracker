import { 
  DashboardSummary, 
  SpendingInsights, 
  BudgetPerformance, 
  TrendsAnalysis,
  FinancialHealthScore,
  ComparisonAnalysis,
  AnalyticsQuery 
} from '../types/analytics';
import { logger } from '../config/logger';
import AnalyticsRepository from '../repositories/AnalyticsRepository';
import BudgetRepository from '../repositories/BudgetRepository';

export class AnalyticsService {
  /**
   * Get comprehensive dashboard summary
   */
  async getDashboardSummary(): Promise<DashboardSummary> {
    try {
      const result = await AnalyticsRepository.getDashboardSummary();
      
      if (result.error) {
        throw new Error(`Failed to get dashboard summary: ${result.error}`);
      }

      return result.data!;
    } catch (error) {
      logger.error('AnalyticsService.getDashboardSummary error:', error);
      throw error;
    }
  }

  /**
   * Get detailed spending insights for a period
   */
  async getSpendingInsights(query: AnalyticsQuery = {}): Promise<SpendingInsights> {
    try {
      // Set default period to current month if not specified
      if (!query.period && !query.start_date) {
        query.period = 'month';
      }

      const result = await AnalyticsRepository.getSpendingInsights(query);
      
      if (result.error) {
        throw new Error(`Failed to get spending insights: ${result.error}`);
      }

      return result.data!;
    } catch (error) {
      logger.error('AnalyticsService.getSpendingInsights error:', error);
      throw error;
    }
  }

  /**
   * Get budget performance analysis
   */
  async getBudgetPerformance(query: AnalyticsQuery = {}): Promise<BudgetPerformance> {
    try {
      // Get all budgets with progress
      const budgetsResult = await BudgetRepository.findWithProgress();
      
      if (budgetsResult.error) {
        throw new Error(`Failed to get budget performance: ${budgetsResult.error}`);
      }

      const budgets = budgetsResult.data || [];
      const activeBudgets = budgets.filter(b => b.is_active);

      // Calculate overall performance metrics
      const totalBudgetAmount = activeBudgets.reduce((sum, b) => sum + b.budget_amount, 0);
      const totalSpent = activeBudgets.reduce((sum, b) => sum + b.spent_amount, 0);
      const overallUtilization = totalBudgetAmount > 0 ? (totalSpent / totalBudgetAmount) * 100 : 0;

      const budgetsOnTrack = activeBudgets.filter(b => 
        b.progress_percentage <= 80 && !b.is_overspent
      ).length;
      
      const budgetsApproachingLimit = activeBudgets.filter(b => 
        b.progress_percentage > 80 && b.progress_percentage <= 100
      ).length;
      
      const budgetsOverspent = activeBudgets.filter(b => b.is_overspent).length;

      // Map budget details with status
      const budgetDetails = activeBudgets.map(budget => {
        let status: 'on_track' | 'approaching_limit' | 'overspent';
        
        if (budget.is_overspent) {
          status = 'overspent';
        } else if (budget.progress_percentage > 80) {
          status = 'approaching_limit';
        } else {
          status = 'on_track';
        }

        return {
          budget_id: budget.id,
          category_name: budget.category.name,
          category_color: budget.category.color,
          budget_amount: budget.budget_amount,
          spent_amount: budget.spent_amount,
          remaining_amount: budget.remaining_amount,
          utilization_percentage: budget.progress_percentage,
          days_remaining: budget.days_remaining,
          daily_average: budget.average_daily_spending,
          projected_total: budget.projected_total,
          status,
          period: budget.period
        };
      });

      // Get date range for analysis
      const { start_date, end_date } = this.getDateRange(query);

      const performance: BudgetPerformance = {
        period: {
          start_date,
          end_date
        },
        overall_performance: {
          total_budgets: activeBudgets.length,
          total_budget_amount: Number(totalBudgetAmount.toFixed(2)),
          total_spent: Number(totalSpent.toFixed(2)),
          overall_utilization: Number(overallUtilization.toFixed(2)),
          budgets_on_track: budgetsOnTrack,
          budgets_overspent: budgetsOverspent,
          budgets_approaching_limit: budgetsApproachingLimit
        },
        budget_details: budgetDetails,
        performance_trends: [] // TODO: Implement historical trends
      };

      return performance;
    } catch (error) {
      logger.error('AnalyticsService.getBudgetPerformance error:', error);
      throw error;
    }
  }

  /**
   * Get trends analysis for income, expenses, and categories
   */
  async getTrendsAnalysis(query: AnalyticsQuery = {}): Promise<TrendsAnalysis> {
    try {
      // This is a simplified implementation
      // In a full implementation, this would analyze historical data
      // and provide predictions using statistical methods
      
      const { start_date, end_date } = this.getDateRange(query);
      const granularity = query.granularity || 'daily';

      // Get spending insights to use for trends
      const insights = await this.getSpendingInsights(query);

      const trends: TrendsAnalysis = {
        period: {
          start_date,
          end_date,
          granularity
        },
        income_trends: insights.spending_trends.map(trend => ({
          date: trend.date,
          amount: trend.total_income,
          transaction_count: 0 // TODO: Calculate actual transaction counts
        })),
        expense_trends: insights.spending_trends.map(trend => ({
          date: trend.date,
          amount: trend.total_expenses,
          transaction_count: 0 // TODO: Calculate actual transaction counts
        })),
        net_worth_trends: insights.spending_trends.map((trend, index) => {
          // Calculate cumulative net worth
          const previousCumulative = index > 0 ? 
            insights.spending_trends.slice(0, index).reduce((sum, t) => sum + t.net_amount, 0) : 0;
          
          return {
            date: trend.date,
            net_amount: trend.net_amount,
            cumulative_net: previousCumulative + trend.net_amount
          };
        }),
        category_trends: {}, // TODO: Implement category-specific trends
        predictions: {
          next_month_income: 0, // TODO: Implement predictions
          next_month_expenses: 0,
          predicted_net: 0,
          confidence_score: 0
        }
      };

      return trends;
    } catch (error) {
      logger.error('AnalyticsService.getTrendsAnalysis error:', error);
      throw error;
    }
  }

  /**
   * Get financial health score and recommendations
   */
  async getFinancialHealthScore(): Promise<FinancialHealthScore> {
    try {
      const result = await AnalyticsRepository.getFinancialHealthScore();
      
      if (result.error) {
        throw new Error(`Failed to get financial health score: ${result.error}`);
      }

      return result.data!;
    } catch (error) {
      logger.error('AnalyticsService.getFinancialHealthScore error:', error);
      throw error;
    }
  }

  /**
   * Get comparison analysis between two periods
   */
  async getComparisonAnalysis(query: AnalyticsQuery = {}): Promise<ComparisonAnalysis> {
    try {
      const { start_date, end_date } = this.getDateRange(query);
      
      // Calculate previous period dates
      const periodLength = new Date(end_date).getTime() - new Date(start_date).getTime();
      const previousEndDate: string = new Date(new Date(start_date).getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '';
      const previousStartDate: string = new Date(new Date(start_date).getTime() - periodLength - 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '';

      // Get insights for both periods
      const currentInsights = await this.getSpendingInsights({
        start_date,
        end_date
      });

      const previousInsights = await this.getSpendingInsights({
        start_date: previousStartDate,
        end_date: previousEndDate
      });

      // Calculate totals for current period
      const currentIncome = currentInsights.spending_trends.reduce((sum, t) => sum + t.total_income, 0);
      const currentExpenses = currentInsights.spending_trends.reduce((sum, t) => sum + t.total_expenses, 0);
      const currentNet = currentIncome - currentExpenses;
      const currentTransactionCount = currentInsights.category_breakdown.reduce((sum, c) => sum + c.transaction_count, 0);

      // Calculate totals for previous period
      const previousIncome = previousInsights.spending_trends.reduce((sum, t) => sum + t.total_income, 0);
      const previousExpenses = previousInsights.spending_trends.reduce((sum, t) => sum + t.total_expenses, 0);
      const previousNet = previousIncome - previousExpenses;
      const previousTransactionCount = previousInsights.category_breakdown.reduce((sum, c) => sum + c.transaction_count, 0);

      // Calculate changes
      const incomeChange = currentIncome - previousIncome;
      const expenseChange = currentExpenses - previousExpenses;
      const netChange = currentNet - previousNet;
      const transactionCountChange = currentTransactionCount - previousTransactionCount;

      // Helper function to determine trend
      const getTrend = (change: number): 'up' | 'down' | 'stable' => {
        if (Math.abs(change) < 0.05) return 'stable'; // Less than 5% change
        return change > 0 ? 'up' : 'down';
      };

      // Calculate percentage changes (avoid division by zero)
      const incomePercentage = previousIncome > 0 ? (incomeChange / previousIncome) * 100 : 0;
      const expensePercentage = previousExpenses > 0 ? (expenseChange / previousExpenses) * 100 : 0;
      const netPercentage = Math.abs(previousNet) > 0 ? (netChange / Math.abs(previousNet)) * 100 : 0;
      const transactionPercentage = previousTransactionCount > 0 ? (transactionCountChange / previousTransactionCount) * 100 : 0;

      // Category comparisons
      const categoryComparisons = currentInsights.category_breakdown.map(currentCat => {
        const previousCat = previousInsights.category_breakdown.find(c => c.category_name === currentCat.category_name);
        const previousAmount = previousCat?.total_amount || 0;
        const changeAmount = currentCat.total_amount - previousAmount;
        const changePercentage = previousAmount > 0 ? (changeAmount / previousAmount) * 100 : 0;

        return {
          category_name: currentCat.category_name,
          current_amount: currentCat.total_amount,
          previous_amount: previousAmount,
          change_amount: Number(changeAmount.toFixed(2)),
          change_percentage: Number(changePercentage.toFixed(2)),
          trend: getTrend(changePercentage / 100)
        };
      });

      const comparison: ComparisonAnalysis = {
        current_period: {
          start_date,
          end_date,
          total_income: Number(currentIncome.toFixed(2)),
          total_expenses: Number(currentExpenses.toFixed(2)),
          net_amount: Number(currentNet.toFixed(2)),
          transaction_count: currentTransactionCount
        },
        previous_period: {
          start_date: previousStartDate,
          end_date: previousEndDate,
          total_income: Number(previousIncome.toFixed(2)),
          total_expenses: Number(previousExpenses.toFixed(2)),
          net_amount: Number(previousNet.toFixed(2)),
          transaction_count: previousTransactionCount
        },
        comparison: {
          income_change: {
            amount: Number(incomeChange.toFixed(2)),
            percentage: Number(incomePercentage.toFixed(2)),
            trend: getTrend(incomePercentage / 100)
          },
          expense_change: {
            amount: Number(expenseChange.toFixed(2)),
            percentage: Number(expensePercentage.toFixed(2)),
            trend: getTrend(expensePercentage / 100)
          },
          net_change: {
            amount: Number(netChange.toFixed(2)),
            percentage: Number(netPercentage.toFixed(2)),
            trend: getTrend(netPercentage / 100)
          },
          transaction_count_change: {
            amount: transactionCountChange,
            percentage: Number(transactionPercentage.toFixed(2)),
            trend: getTrend(transactionPercentage / 100)
          }
        },
        category_comparisons: categoryComparisons
      };

      return comparison;
    } catch (error) {
      logger.error('AnalyticsService.getComparisonAnalysis error:', error);
      throw error;
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
    const end_date: string = now.toISOString().split('T')[0] || '';

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

export default new AnalyticsService();
