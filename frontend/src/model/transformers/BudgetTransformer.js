import BaseTransformer from './BaseTransformer.js';
import {
  alertsFromBackend,
  summaryFromBackend,
  validateBudgetData
} from './budget/budgetMappings.js';

class BudgetTransformer extends BaseTransformer {
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

  static toBackend(frontendData) {
    if (!frontendData) return null;

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

    if (frontendData.id && !this.isTemporaryId(frontendData.id)) {
      transformed.id = frontendData.id;
    }

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

  static toBackendCreate(frontendData) {
    const transformed = this.toBackend(frontendData);
    delete transformed.id;
    return transformed;
  }

  static toBackendUpdate(frontendData) {
    const transformed = this.toBackend(frontendData);
    delete transformed.id;
    delete transformed.created_at;
    return transformed;
  }

  static isTemporaryId(id) {
    if (!id) return true;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return !uuidRegex.test(id);
  }

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

  static alertsFromBackend(alerts) {
    return alertsFromBackend(alerts);
  }

  static summaryFromBackend(summary) {
    return summaryFromBackend(summary);
  }

  static validate(budget) {
    return validateBudgetData(budget);
  }

  static templateToBackend(templateName, income) {
    return { template: templateName, income: this.parseAmount(income) };
  }
}

export default BudgetTransformer;
