/**
 * Analytics API Service
 * Handles all analytics-related API operations
 */

import BaseApiService from './BaseApiService.js';
import API_CONFIG from '../config.js';
import { ValidationError } from '../errors.js';
import {
  buildOverviewQueryParams,
  buildTrendsQueryParams,
  buildCategoryAnalyticsQueryParams,
  buildInsightsQueryParams,
  buildBudgetPerformanceQueryParams,
} from './analytics/queryParams.js';
import {
  transformOverviewResponse,
  transformTrendsResponse,
  transformCategoryAnalyticsResponse,
  transformInsightsResponse,
} from './analytics/transforms.js';

class AnalyticsService extends BaseApiService {
  constructor() {
    super('analytics', {
      base: API_CONFIG.ENDPOINTS.ANALYTICS_OVERVIEW,
    });
  }

  async getOverview(params = {}) {
    const queryParams = buildOverviewQueryParams(params);
    try {
      const response = await this.getCustom(API_CONFIG.ENDPOINTS.ANALYTICS_OVERVIEW, queryParams);
      return this.transformOverviewResponse(response);
    } catch (error) {
      console.error('Error fetching analytics overview:', error);
      throw error;
    }
  }

  async getSpendingTrends(params = {}) {
    const queryParams = buildTrendsQueryParams(params);
    try {
      const response = await this.getCustom(API_CONFIG.ENDPOINTS.ANALYTICS_TRENDS, queryParams);
      return this.transformTrendsResponse(response);
    } catch (error) {
      console.error('Error fetching spending trends:', error);
      throw error;
    }
  }

  async getCategoryAnalytics(params = {}) {
    const queryParams = buildCategoryAnalyticsQueryParams(params);
    try {
      const response = await this.getCustom(API_CONFIG.ENDPOINTS.ANALYTICS_CATEGORIES, queryParams);
      return this.transformCategoryAnalyticsResponse(response);
    } catch (error) {
      console.error('Error fetching category analytics:', error);
      throw error;
    }
  }

  async getInsights(params = {}) {
    const queryParams = buildInsightsQueryParams(params);
    try {
      const response = await this.getCustom(API_CONFIG.ENDPOINTS.ANALYTICS_INSIGHTS, queryParams);
      return this.transformInsightsResponse(response);
    } catch (error) {
      console.error('Error fetching insights:', error);
      throw error;
    }
  }

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

  async getYearComparison(currentYear, previousYear = null) {
    if (!currentYear || currentYear < 2000 || currentYear > 2100) {
      throw new ValidationError('Valid current year is required (2000-2100)');
    }
    try {
      const response = await this.getCustom(
        `${API_CONFIG.ENDPOINTS.ANALYTICS_OVERVIEW}/year-comparison`,
        { current_year: currentYear, previous_year: previousYear || currentYear - 1 }
      );
      return response;
    } catch (error) {
      console.error('Error fetching year comparison:', error);
      throw error;
    }
  }

  async getSpendingPatterns(params = {}) {
    const { startDate, endDate, groupBy = 'day_of_week' } = params;
    try {
      const response = await this.getCustom(
        `${API_CONFIG.ENDPOINTS.ANALYTICS_OVERVIEW}/patterns`,
        { start_date: startDate, end_date: endDate, group_by: groupBy }
      );
      return response;
    } catch (error) {
      console.error('Error fetching spending patterns:', error);
      throw error;
    }
  }

  async getBudgetPerformance(params = {}) {
    const queryParams = buildBudgetPerformanceQueryParams(params);
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

  async generateCustomReport(reportConfig) {
    const { metrics } = reportConfig;
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

  // Named instance methods kept so existing callers (if any) using `service.transformOverviewResponse` continue to work
  transformOverviewResponse(response) { return transformOverviewResponse(response); }
  transformTrendsResponse(response) { return transformTrendsResponse(response); }
  transformCategoryAnalyticsResponse(response) { return transformCategoryAnalyticsResponse(response); }
  transformInsightsResponse(response) { return transformInsightsResponse(response); }
}

const analyticsService = new AnalyticsService();

export default analyticsService;
export { AnalyticsService };
