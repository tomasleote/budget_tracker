/**
 * Budget API Service
 * Handles all budget-related API operations
 */

import BaseApiService from './BaseApiService.js';
import API_CONFIG from '../config.js';
import { buildBudgetQueryParams } from './budget/queryParams.js';
import { transformBudgetRequest, transformBudgetResponse } from './budget/transforms.js';
import { validateBudgetData } from './budget/validators.js';

class BudgetService extends BaseApiService {
  constructor() {
    super('budgets', {
      base: API_CONFIG.ENDPOINTS.BUDGETS,
      byId: API_CONFIG.ENDPOINTS.BUDGET_BY_ID,
      bulk: API_CONFIG.ENDPOINTS.BUDGETS_BULK,
    });
  }

  async getAllBudgets(params = {}) {
    const queryParams = buildBudgetQueryParams(params);
    const response = await this.getAll(queryParams);
    if (response.data && Array.isArray(response.data)) {
      response.data = response.data.map(budget => this.transformResponse(budget));
    }
    return response;
  }

  async getBudgetById(id, includeProgress = true) {
    const response = await this.getById(id, { include_progress: includeProgress });
    return this.transformResponse(response);
  }

  async createBudget(budgetData) {
    const validatedData = this.validateData(budgetData, 'create');
    const transformedData = this.transformRequest(validatedData);
    const response = await this.create(transformedData);
    return this.transformResponse(response);
  }

  async updateBudget(id, updates) {
    const validatedData = this.validateData(updates, 'update');
    const transformedData = this.transformRequest(validatedData);
    const response = await this.update(id, transformedData);
    return this.transformResponse(response);
  }

  async deleteBudget(id) {
    return this.delete(id);
  }

  async getBudgetProgress(id) {
    return this.getCustom(API_CONFIG.ENDPOINTS.BUDGET_PROGRESS(id));
  }

  async getActiveBudgets() {
    const response = await this.getAllBudgets({ isActive: true });
    return response.data || [];
  }

  async getBudgetsByCategory(categoryId) {
    const response = await this.getAllBudgets({ categoryId });
    return response.data || [];
  }

  async getBudgetAlerts(threshold = 80) {
    try {
      const response = await this.getCustom(
        `${API_CONFIG.ENDPOINTS.BUDGETS}/alerts`,
        { threshold }
      );
      return response;
    } catch (error) {
      console.error('Error fetching budget alerts:', error);
      throw error;
    }
  }

  async budgetExistsForCategory(categoryId, period) {
    const response = await this.getAllBudgets({ categoryId, period, limit: 1 });
    return response.data && response.data.length > 0;
  }

  validateData(data, operation = 'create') {
    return validateBudgetData(data, operation);
  }

  transformRequest(data) {
    return transformBudgetRequest(data);
  }

  transformResponse(budget) {
    return transformBudgetResponse(budget);
  }

  async createFromTemplate(templateName, totalIncome) {
    try {
      const response = await this.postCustom(
        `${API_CONFIG.ENDPOINTS.BUDGETS}/from-template`,
        { template: templateName, income: totalIncome }
      );
      return response;
    } catch (error) {
      console.error('Error creating budgets from template:', error);
      throw error;
    }
  }

  async getBudgetSummary() {
    try {
      const response = await this.getCustom(`${API_CONFIG.ENDPOINTS.BUDGETS}/summary`);
      return response;
    } catch (error) {
      console.error('Error fetching budget summary:', error);
      throw error;
    }
  }
}

const budgetService = new BudgetService();

export default budgetService;
export { BudgetService };
