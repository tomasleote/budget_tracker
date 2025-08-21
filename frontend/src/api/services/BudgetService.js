/**
 * Budget API Service
 * Handles all budget-related API operations
 */

import BaseApiService from './BaseApiService.js';
import API_CONFIG from '../config.js';
import { ValidationError } from '../errors.js';

class BudgetService extends BaseApiService {
  constructor() {
    super('budgets', {
      base: API_CONFIG.ENDPOINTS.BUDGETS,
      byId: API_CONFIG.ENDPOINTS.BUDGET_BY_ID,
      bulk: API_CONFIG.ENDPOINTS.BUDGETS_BULK,
    });
  }

  /**
   * Get all budgets with filtering
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Budgets with pagination
   */
  async getAllBudgets(params = {}) {
    const {
      page,
      limit,
      period,
      categoryId,
      isActive,
      startDate,
      endDate,
      includeProgress = true,
    } = params;

    const queryParams = {
      page,
      limit,
      period,
      category_id: categoryId,
      is_active: isActive,
      start_date: startDate,
      end_date: endDate,
      include_progress: includeProgress,
    };

    // Remove undefined values
    Object.keys(queryParams).forEach(key => 
      queryParams[key] === undefined && delete queryParams[key]
    );

    const response = await this.getAll(queryParams);
    
    // Transform response if needed
    if (response.data && Array.isArray(response.data)) {
      response.data = response.data.map(budget => this.transformResponse(budget));
    }
    
    return response;
  }

  /**
   * Get budget by ID with progress
   * @param {string} id - Budget ID
   * @param {boolean} includeProgress - Include progress calculations
   * @returns {Promise<Object>} Budget data with progress
   */
  async getBudgetById(id, includeProgress = true) {
    const response = await this.getById(id, { include_progress: includeProgress });
    return this.transformResponse(response);
  }

  /**
   * Create a new budget
   * @param {Object} budgetData - Budget data
   * @returns {Promise<Object>} Created budget
   */
  async createBudget(budgetData) {
    const validatedData = this.validateData(budgetData, 'create');
    const transformedData = this.transformRequest(validatedData);
    
    const response = await this.create(transformedData);
    return this.transformResponse(response);
  }

  /**
   * Update a budget
   * @param {string} id - Budget ID
   * @param {Object} updates - Update data
   * @returns {Promise<Object>} Updated budget
   */
  async updateBudget(id, updates) {
    const validatedData = this.validateData(updates, 'update');
    const transformedData = this.transformRequest(validatedData);
    
    const response = await this.update(id, transformedData);
    return this.transformResponse(response);
  }

  /**
   * Delete a budget
   * @param {string} id - Budget ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteBudget(id) {
    return this.delete(id);
  }

  /**
   * Get budget progress
   * @param {string} id - Budget ID
   * @returns {Promise<Object>} Budget progress details
   */
  async getBudgetProgress(id) {
    const response = await this.getCustom(API_CONFIG.ENDPOINTS.BUDGET_PROGRESS(id));
    return response;
  }

  /**
   * Get active budgets
   * @returns {Promise<Array>} Active budgets
   */
  async getActiveBudgets() {
    const response = await this.getAllBudgets({ isActive: true });
    return response.data || [];
  }

  /**
   * Get budgets by category
   * @param {string} categoryId - Category ID
   * @returns {Promise<Array>} Budgets for category
   */
  async getBudgetsByCategory(categoryId) {
    const response = await this.getAllBudgets({ categoryId });
    return response.data || [];
  }

  /**
   * Get budget alerts (budgets exceeding threshold)
   * @param {number} threshold - Alert threshold percentage (e.g., 80)
   * @returns {Promise<Array>} Budgets exceeding threshold
   */
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

  /**
   * Check if budget exists for category and period
   * @param {string} categoryId - Category ID
   * @param {string} period - Budget period
   * @returns {Promise<boolean>} True if budget exists
   */
  async budgetExistsForCategory(categoryId, period) {
    const response = await this.getAllBudgets({ 
      categoryId, 
      period, 
      limit: 1 
    });
    return response.data && response.data.length > 0;
  }

  /**
   * Validate budget data
   * @param {Object} data - Budget data
   * @param {string} operation - Operation type
   * @returns {Object} Validated data
   */
  validateData(data, operation = 'create') {
    const errors = [];

    if (operation === 'create') {
      // Required fields for creation
      if (!data.name || data.name.trim() === '') {
        errors.push('Budget name is required');
      }
      
      if (!data.amount || data.amount <= 0) {
        errors.push('Budget amount must be positive');
      }
      
      if (!data.categoryId) {
        errors.push('Category is required');
      }
      
      if (!data.period || !['weekly', 'monthly', 'quarterly', 'yearly'].includes(data.period)) {
        errors.push('Valid budget period is required (weekly, monthly, quarterly, yearly)');
      }
      
      if (!data.startDate) {
        errors.push('Start date is required');
      }
    }

    // Validate amount
    if (data.amount !== undefined) {
      const amount = parseFloat(data.amount);
      if (isNaN(amount) || amount <= 0) {
        errors.push('Amount must be a positive number');
      }
      if (amount > 999999999.99) {
        errors.push('Amount cannot exceed 999,999,999.99');
      }
    }

    // Validate name length
    if (data.name && data.name.length > 100) {
      errors.push('Budget name must be 100 characters or less');
    }

    // Validate dates
    if (data.startDate) {
      const startDate = new Date(data.startDate);
      if (isNaN(startDate.getTime())) {
        errors.push('Invalid start date format');
      }
    }

    if (data.endDate) {
      const endDate = new Date(data.endDate);
      if (isNaN(endDate.getTime())) {
        errors.push('Invalid end date format');
      }
      
      if (data.startDate) {
        const startDate = new Date(data.startDate);
        if (endDate <= startDate) {
          errors.push('End date must be after start date');
        }
      }
    }

    // Validate alert threshold
    if (data.alertThreshold !== undefined) {
      const threshold = parseInt(data.alertThreshold);
      if (isNaN(threshold) || threshold < 0 || threshold > 100) {
        errors.push('Alert threshold must be between 0 and 100');
      }
    }

    if (errors.length > 0) {
      throw new ValidationError('Budget validation failed', errors);
    }

    return data;
  }

  /**
   * Transform request data to API format
   * @param {Object} data - Budget data
   * @returns {Object} Transformed data
   */
  transformRequest(data) {
    const transformed = {
      name: data.name.trim(),
      amount: parseFloat(data.amount),
      category_id: data.categoryId || data.category_id,
      period: data.period,
      start_date: data.startDate instanceof Date ? data.startDate.toISOString() : data.startDate,
      is_active: data.isActive !== undefined ? data.isActive : true,
    };

    // Add optional fields
    if (data.endDate) {
      transformed.end_date = data.endDate instanceof Date ? data.endDate.toISOString() : data.endDate;
    }

    if (data.description) {
      transformed.description = data.description.trim();
    }

    if (data.alertThreshold !== undefined) {
      transformed.alert_threshold = parseInt(data.alertThreshold);
    }

    return transformed;
  }

  /**
   * Transform API response to frontend format
   * @param {Object} budget - API budget data
   * @returns {Object} Transformed budget
   */
  transformResponse(budget) {
    if (!budget) return null;

    const transformed = {
      id: budget.id,
      name: budget.name,
      amount: parseFloat(budget.amount),
      categoryId: budget.category_id,
      period: budget.period,
      startDate: budget.start_date,
      endDate: budget.end_date || null,
      isActive: budget.is_active,
      description: budget.description || '',
      alertThreshold: budget.alert_threshold || 80,
      createdAt: budget.created_at,
      updatedAt: budget.updated_at,
    };

    // Include progress data if available
    if (budget.progress) {
      transformed.progress = {
        spent: parseFloat(budget.progress.spent || 0),
        remaining: parseFloat(budget.progress.remaining || budget.amount),
        percentage: parseFloat(budget.progress.percentage || 0),
        isOverBudget: budget.progress.is_over_budget || false,
        daysRemaining: budget.progress.days_remaining || 0,
      };
    }

    // Include category data if available
    if (budget.category) {
      transformed.category = {
        id: budget.category.id,
        name: budget.category.name,
        type: budget.category.type,
        color: budget.category.color,
        icon: budget.category.icon,
      };
    }

    return transformed;
  }

  /**
   * Create budgets from template
   * @param {string} templateName - Template name (e.g., '50-30-20')
   * @param {number} totalIncome - Total monthly income
   * @returns {Promise<Array>} Created budgets
   */
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

  /**
   * Get budget summary
   * @returns {Promise<Object>} Budget summary statistics
   */
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

// Create singleton instance
const budgetService = new BudgetService();

export default budgetService;
export { BudgetService };
