/**
 * Analytics API Service
 * Handles all analytics-related API operations
 */

import BaseApiService from './BaseApiService.js';
import API_CONFIG from '../config.js';
import { ValidationError } from '../errors.js';

class AnalyticsService extends BaseApiService {
  constructor() {
    super('analytics', {
      base: API_CONFIG.ENDPOINTS.ANALYTICS_OVERVIEW,
    });
  }

  /**
   * Get analytics overview
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Analytics overview data
   */
  async getOverview(params = {}) {
    const { startDate, endDate, groupBy = 'month' } = params;
    
    const queryParams = {
      start_date: startDate,
      end_date: endDate,
      group_by: groupBy,
    };

    // Remove undefined values
    Object.keys(queryParams).forEach(key => 
      queryParams[key] === undefined && delete queryParams[key]
    );

    try {
      const response = await this.getCustom(API_CONFIG.ENDPOINTS.ANALYTICS_OVERVIEW, queryParams);
      return this.transformOverviewResponse(response);
    } catch (error) {
      console.error('Error fetching analytics overview:', error);
      throw error;
    }
  }

  /**
   * Get spending trends
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Spending trends data
   */
  async getSpendingTrends(params = {}) {
    const { startDate, endDate, interval = 'daily', categoryId } = params;
    
    const queryParams = {
      start_date: startDate,
      end_date: endDate,
      interval,
      category_id: categoryId,
    };

    // Remove undefined values
    Object.keys(queryParams).forEach(key => 
      queryParams[key] === undefined && delete queryParams[key]
    );

    try {
      const response = await this.getCustom(API_CONFIG.ENDPOINTS.ANALYTICS_TRENDS, queryParams);
      return this.transformTrendsResponse(response);
    } catch (error) {
      console.error('Error fetching spending trends:', error);
      throw error;
    }
  }

  /**
   * Get category analytics
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Category analytics data
   */
  async getCategoryAnalytics(params = {}) {
    const { startDate, endDate, limit = 10, type } = params;
    
    const queryParams = {
      start_date: startDate,
      end_date: endDate,
      limit,
      type,
    };

    // Remove undefined values
    Object.keys(queryParams).forEach(key => 
      queryParams[key] === undefined && delete queryParams[key]
    );

    try {
      const response = await this.getCustom(API_CONFIG.ENDPOINTS.ANALYTICS_CATEGORIES, queryParams);
      return this.transformCategoryAnalyticsResponse(response);
    } catch (error) {
      console.error('Error fetching category analytics:', error);
      throw error;
    }
  }

  /**
   * Get financial insights
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Financial insights
   */
  async getInsights(params = {}) {
    const { startDate, endDate } = params;
    
    const queryParams = {
      start_date: startDate,
      end_date: endDate,
    };

    // Remove undefined values
    Object.keys(queryParams).forEach(key => 
      queryParams[key] === undefined && delete queryParams[key]
    );

    try {
      const response = await this.getCustom(API_CONFIG.ENDPOINTS.ANALYTICS_INSIGHTS, queryParams);
      return this.transformInsightsResponse(response);
    } catch (error) {
      console.error('Error fetching insights:', error);
      throw error;
    }
  }

  /**
   * Get monthly comparison
   * @param {number} year - Year to analyze
   * @returns {Promise<Array>} Monthly comparison data
   */
  async getMonthlyComparison(year) {
    if (!year || year < 2000 || year > 2100) {
      throw new ValidationError('Valid year is required (2000-2100)');
    }

    try {
      const response = await this.getCustom(
        `${API_CONFIG.ENDPOINTS.ANALYTICS_OVERVIEW}/monthly-comparison`,
        { year }
      );
      return response;
    } catch (error) {
      console.error('Error fetching monthly comparison:', error);
      throw error;
    }
  }

  /**
   * Get year-over-year comparison
   * @param {number} currentYear - Current year
   * @param {number} previousYear - Previous year to compare
   * @returns {Promise<Object>} Year comparison data
   */
  async getYearComparison(currentYear, previousYear = null) {
    if (!currentYear || currentYear < 2000 || currentYear > 2100) {
      throw new ValidationError('Valid current year is required (2000-2100)');
    }

    const params = {
      current_year: currentYear,
      previous_year: previousYear || currentYear - 1,
    };

    try {
      const response = await this.getCustom(
        `${API_CONFIG.ENDPOINTS.ANALYTICS_OVERVIEW}/year-comparison`,
        params
      );
      return response;
    } catch (error) {
      console.error('Error fetching year comparison:', error);
      throw error;
    }
  }

  /**
   * Get spending patterns
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Spending patterns analysis
   */
  async getSpendingPatterns(params = {}) {
    const { startDate, endDate, groupBy = 'day_of_week' } = params;
    
    const queryParams = {
      start_date: startDate,
      end_date: endDate,
      group_by: groupBy, // day_of_week, time_of_day, day_of_month
    };

    try {
      const response = await this.getCustom(
        `${API_CONFIG.ENDPOINTS.ANALYTICS_OVERVIEW}/patterns`,
        queryParams
      );
      return response;
    } catch (error) {
      console.error('Error fetching spending patterns:', error);
      throw error;
    }
  }

  /**
   * Get budget performance analytics
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Budget performance data
   */
  async getBudgetPerformance(params = {}) {
    const { startDate, endDate, categoryId } = params;
    
    const queryParams = {
      start_date: startDate,
      end_date: endDate,
      category_id: categoryId,
    };

    try {
      const response = await this.getCustom(
        `${API_CONFIG.ENDPOINTS.ANALYTICS_OVERVIEW}/budget-performance`,
        queryParams
      );
      return response;
    } catch (error) {
      console.error('Error fetching budget performance:', error);
      throw error;
    }
  }

  /**
   * Transform overview response
   * @param {Object} response - API response
   * @returns {Object} Transformed response
   */
  transformOverviewResponse(response) {
    if (!response) return null;

    return {
      summary: {
        totalIncome: parseFloat(response.total_income || 0),
        totalExpenses: parseFloat(response.total_expenses || 0),
        netSavings: parseFloat(response.net_savings || 0),
        savingsRate: parseFloat(response.savings_rate || 0),
        transactionCount: response.transaction_count || 0,
      },
      periodComparison: response.period_comparison || [],
      topCategories: response.top_categories || [],
      dateRange: {
        start: response.date_range?.start,
        end: response.date_range?.end,
      },
    };
  }

  /**
   * Transform trends response
   * @param {Object} response - API response
   * @returns {Object} Transformed response
   */
  transformTrendsResponse(response) {
    if (!response) return null;

    return {
      trends: (response.trends || []).map(trend => ({
        date: trend.date,
        income: parseFloat(trend.income || 0),
        expenses: parseFloat(trend.expenses || 0),
        net: parseFloat(trend.net || 0),
        cumulativeNet: parseFloat(trend.cumulative_net || 0),
      })),
      summary: {
        averageIncome: parseFloat(response.average_income || 0),
        averageExpenses: parseFloat(response.average_expenses || 0),
        trend: response.trend || 'stable', // increasing, decreasing, stable
        volatility: parseFloat(response.volatility || 0),
      },
    };
  }

  /**
   * Transform category analytics response
   * @param {Object} response - API response
   * @returns {Object} Transformed response
   */
  transformCategoryAnalyticsResponse(response) {
    if (!response) return null;

    return {
      categories: (response.categories || []).map(cat => ({
        id: cat.id,
        name: cat.name,
        type: cat.type,
        total: parseFloat(cat.total || 0),
        percentage: parseFloat(cat.percentage || 0),
        transactionCount: cat.transaction_count || 0,
        averageTransaction: parseFloat(cat.average_transaction || 0),
        color: cat.color,
        icon: cat.icon,
      })),
      uncategorized: {
        total: parseFloat(response.uncategorized?.total || 0),
        percentage: parseFloat(response.uncategorized?.percentage || 0),
        count: response.uncategorized?.count || 0,
      },
    };
  }

  /**
   * Transform insights response
   * @param {Object} response - API response
   * @returns {Object} Transformed response
   */
  transformInsightsResponse(response) {
    if (!response) return null;

    return {
      insights: (response.insights || []).map(insight => ({
        type: insight.type,
        title: insight.title,
        description: insight.description,
        severity: insight.severity, // info, warning, success, error
        value: insight.value,
        recommendation: insight.recommendation,
        category: insight.category,
      })),
      score: {
        overall: parseFloat(response.financial_score?.overall || 0),
        spending: parseFloat(response.financial_score?.spending || 0),
        saving: parseFloat(response.financial_score?.saving || 0),
        budgeting: parseFloat(response.financial_score?.budgeting || 0),
      },
    };
  }

  /**
   * Get custom analytics report
   * @param {Object} reportConfig - Report configuration
   * @returns {Promise<Object>} Custom report data
   */
  async generateCustomReport(reportConfig) {
    const { metrics, filters, groupBy, sortBy } = reportConfig;
    
    if (!metrics || !Array.isArray(metrics) || metrics.length === 0) {
      throw new ValidationError('At least one metric is required');
    }

    try {
      const response = await this.postCustom(
        `${API_CONFIG.ENDPOINTS.ANALYTICS_OVERVIEW}/custom-report`,
        reportConfig
      );
      return response;
    } catch (error) {
      console.error('Error generating custom report:', error);
      throw error;
    }
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();

export default analyticsService;
export { AnalyticsService };
