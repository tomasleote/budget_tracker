import BaseTransformer from './BaseTransformer.js';

/**
 * Budget Transformer
 * Handles data transformation between frontend and backend formats for budgets
 */
class BudgetTransformer extends BaseTransformer {
  /**
   * Transform budget from backend format to frontend format
   * @param {Object} backendData - Budget data from API
   * @returns {Object} Frontend formatted budget
   */
  static fromBackend(backendData) {
    if (!backendData) return null;

    const transformed = {
      id: backendData.id,
      name: this.cleanString(backendData.name),
      categoryId: backendData.category_id,
      amount: this.parseAmount(backendData.amount),
      period: backendData.period,
      startDate: backendData.start_date,
      endDate: backendData.end_date || null,
      isActive: this.parseBoolean(backendData.is_active),
      description: this.cleanString(backendData.description || ''),
      alertThreshold: parseInt(backendData.alert_threshold) || 80,
      createdAt: backendData.created_at,
      updatedAt: backendData.updated_at
    };

    // Include progress data if available
    if (backendData.progress) {
      transformed.spent = this.parseAmount(backendData.progress.spent || 0);
      transformed.progress = {
        spent: this.parseAmount(backendData.progress.spent || 0),
        remaining: this.parseAmount(backendData.progress.remaining || transformed.amount),
        percentage: parseFloat(backendData.progress.percentage || 0),
        isOverBudget: this.parseBoolean(backendData.progress.is_over_budget),
        daysRemaining: parseInt(backendData.progress.days_remaining) || 0
      };
    } else {
      transformed.spent = 0;
    }

    // Include category data if available
    if (backendData.category) {
      transformed.category = {
        id: backendData.category.id,
        name: backendData.category.name,
        type: backendData.category.type,
        color: backendData.category.color,
        icon: backendData.category.icon
      };
    }

    return transformed;
  }

  /**
   * Transform budget from frontend format to backend format
   * @param {Object} frontendData - Budget data from frontend
   * @returns {Object} Backend formatted budget
   */
  static toBackend(frontendData) {
    if (!frontendData) return null;

    // Handle both new and old field names for backward compatibility
    const categoryId = frontendData.categoryId || frontendData.category_id || 
                      (typeof frontendData.category === 'string' ? frontendData.category : null);

    const transformed = {
      name: this.cleanString(frontendData.name),
      category_id: categoryId,
      amount: this.parseAmount(frontendData.amount || frontendData.budgetAmount),
      period: frontendData.period,
      start_date: this.formatDateToISO(frontendData.startDate),
      is_active: this.parseBoolean(frontendData.isActive !== undefined ? frontendData.isActive : true)
    };

    // Only include ID if it's not a temporary ID
    if (frontendData.id && !this.isTemporaryId(frontendData.id)) {
      transformed.id = frontendData.id;
    }

    // Optional fields
    if (frontendData.endDate) {
      transformed.end_date = this.formatDateToISO(frontendData.endDate);
    }

    if (frontendData.description) {
      transformed.description = this.cleanString(frontendData.description);
    }

    if (frontendData.alertThreshold !== undefined) {
      transformed.alert_threshold = parseInt(frontendData.alertThreshold) || 80;
    }

    return transformed;
  }

  /**
   * Transform budget for create operation
   * @param {Object} frontendData - Budget data from frontend
   * @returns {Object} Backend formatted budget for creation
   */
  static toBackendCreate(frontendData) {
    const transformed = this.toBackend(frontendData);
    delete transformed.id; // Remove ID for creation
    return transformed;
  }

  /**
   * Transform budget for update operation
   * @param {Object} frontendData - Budget data from frontend
   * @returns {Object} Backend formatted budget for update
   */
  static toBackendUpdate(frontendData) {
    const transformed = this.toBackend(frontendData);
    // Remove fields that shouldn't be updated
    delete transformed.id;
    delete transformed.created_at;
    return transformed;
  }

  /**
   * Check if ID is temporary (not a UUID)
   * @param {string} id - Budget ID
   * @returns {boolean} True if temporary ID
   */
  static isTemporaryId(id) {
    if (!id) return true;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return !uuidRegex.test(id);
  }

  /**
   * Transform budget progress from backend
   * @param {Object} progress - Progress data from API
   * @returns {Object} Frontend formatted progress
   */
  static progressFromBackend(progress) {
    if (!progress) return null;

    return {
      spent: this.parseAmount(progress.spent || 0),
      remaining: this.parseAmount(progress.remaining || 0),
      percentage: parseFloat(progress.percentage || 0),
      isOverBudget: this.parseBoolean(progress.is_over_budget),
      daysRemaining: parseInt(progress.days_remaining) || 0,
      averageDailySpend: this.parseAmount(progress.average_daily_spend || 0),
      projectedTotal: this.parseAmount(progress.projected_total || 0)
    };
  }

  /**
   * Transform filters for backend query
   * @param {Object} filters - Frontend filter object
   * @returns {Object} Backend formatted filters
   */
  static filtersToBackend(filters) {
    const transformed = {};

    if (filters.period) transformed.period = filters.period;
    if (filters.categoryId) transformed.category_id = filters.categoryId;
    if (filters.isActive !== undefined) transformed.is_active = this.parseBoolean(filters.isActive);
    if (filters.startDate) transformed.start_date = this.formatDateToISO(filters.startDate);
    if (filters.endDate) transformed.end_date = this.formatDateToISO(filters.endDate);
    if (filters.includeProgress !== undefined) transformed.include_progress = this.parseBoolean(filters.includeProgress);

    return transformed;
  }

  /**
   * Transform paginated response from backend
   * @param {Object} response - Paginated response from API
   * @returns {Object} Frontend formatted response
   */
  static paginatedFromBackend(response) {
    if (!response) return null;

    return {
      budgets: this.fromBackendArray(response.data || response.budgets || []),
      pagination: {
        page: response.pagination?.page || 1,
        limit: response.pagination?.limit || 20,
        total: response.pagination?.total || 0,
        pages: response.pagination?.pages || 1,
        hasNext: response.pagination?.has_next || false,
        hasPrev: response.pagination?.has_prev || false
      }
    };
  }

  /**
   * Transform budget alerts from backend
   * @param {Array} alerts - Array of budget alerts from API
   * @returns {Array} Frontend formatted alerts
   */
  static alertsFromBackend(alerts) {
    if (!Array.isArray(alerts)) return [];

    return alerts.map(alert => ({
      budgetId: alert.budget_id,
      budgetName: alert.budget_name,
      categoryId: alert.category_id,
      categoryName: alert.category_name,
      percentage: parseFloat(alert.percentage || 0),
      spent: this.parseAmount(alert.spent || 0),
      amount: this.parseAmount(alert.amount || 0),
      remaining: this.parseAmount(alert.remaining || 0),
      daysRemaining: parseInt(alert.days_remaining) || 0,
      severity: alert.severity || 'warning', // info, warning, critical
      message: alert.message
    }));
  }

  /**
   * Transform budget summary from backend
   * @param {Object} summary - Summary data from API
   * @returns {Object} Frontend formatted summary
   */
  static summaryFromBackend(summary) {
    if (!summary) return null;

    return {
      totalBudgets: summary.total_budgets || 0,
      activeBudgets: summary.active_budgets || 0,
      totalBudgeted: this.parseAmount(summary.total_budgeted || 0),
      totalSpent: this.parseAmount(summary.total_spent || 0),
      totalRemaining: this.parseAmount(summary.total_remaining || 0),
      overallPercentage: parseFloat(summary.overall_percentage || 0),
      budgetsOverLimit: summary.budgets_over_limit || 0,
      budgetsNearLimit: summary.budgets_near_limit || 0
    };
  }

  /**
   * Validate budget data before sending to backend
   * @param {Object} budget - Budget data
   * @returns {Object} Validation result
   */
  static validate(budget) {
    const errors = [];

    if (!budget.name || budget.name.trim() === '') {
      errors.push('Budget name is required');
    }

    if (budget.name && budget.name.length > 100) {
      errors.push('Budget name must be 100 characters or less');
    }

    if (!budget.categoryId && !budget.category) {
      errors.push('Category is required');
    }

    if (!budget.amount || budget.amount <= 0) {
      errors.push('Budget amount must be greater than 0');
    }

    if (budget.amount && budget.amount > 999999999.99) {
      errors.push('Budget amount cannot exceed 999,999,999.99');
    }

    if (!budget.period || !['weekly', 'monthly', 'quarterly', 'yearly'].includes(budget.period)) {
      errors.push('Valid budget period is required (weekly, monthly, quarterly, yearly)');
    }

    if (!budget.startDate) {
      errors.push('Start date is required');
    }

    if (budget.alertThreshold !== undefined) {
      const threshold = parseInt(budget.alertThreshold);
      if (isNaN(threshold) || threshold < 0 || threshold > 100) {
        errors.push('Alert threshold must be between 0 and 100');
      }
    }

    if (budget.description && budget.description.length > 255) {
      errors.push('Description must be 255 characters or less');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Transform budget template request
   * @param {string} templateName - Template name
   * @param {number} income - Total income
   * @returns {Object} Backend formatted template request
   */
  static templateToBackend(templateName, income) {
    return {
      template: templateName,
      income: this.parseAmount(income)
    };
  }
}

export default BudgetTransformer;
