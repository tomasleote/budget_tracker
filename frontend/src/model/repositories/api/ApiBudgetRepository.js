import BaseApiRepository from './BaseApiRepository.js';
import { budgetService } from '../../../api/index.js';
import { BudgetTransformer } from '../../transformers/index.js';
import Budget from '../../entities/updated/Budget.js';
import { PROGRESS_FALLBACK, SUMMARY_FALLBACK } from './budget/fallbacks.js';
import BUDGET_TEMPLATES from './budget/templates.js';
import { validateBudgetBusinessRules } from './budget/validators.js';

/**
 * ApiBudgetRepository
 * API-based repository for Budget entities
 */
class ApiBudgetRepository extends BaseApiRepository {
  constructor() {
    super('budgets', budgetService, BudgetTransformer);
    this.EntityClass = Budget;
  }

  async getActiveBudgets() {
    try {
      const response = await this.apiService.getActiveBudgets();
      return response.map(item => new this.EntityClass(
        this.transformer.fromBackend(item)
      ));
    } catch (error) {
      console.error('Error getting active budgets:', error);
      return [];
    }
  }

  async getByCategory(categoryId) {
    try {
      const response = await this.apiService.getBudgetsByCategory(categoryId);
      return response.map(item => new this.EntityClass(
        this.transformer.fromBackend(item)
      ));
    } catch (error) {
      console.error('Error getting budgets by category:', error);
      return [];
    }
  }

  async getByPeriod(period) {
    try {
      return await this.getAll({ period });
    } catch (error) {
      console.error('Error getting budgets by period:', error);
      return [];
    }
  }

  async getWithProgress(id) {
    try {
      const response = await this.apiService.getBudgetById(id, true);
      return response ? new this.EntityClass(
        this.transformer.fromBackend(response)
      ) : null;
    } catch (error) {
      console.error('Error getting budget with progress:', error);
      return null;
    }
  }

  async getAllWithProgress(filters = {}) {
    try {
      const response = await this.apiService.getAllBudgets({
        ...filters,
        includeProgress: true
      });

      if (response && response.data) {
        return response.data.map(item => new this.EntityClass(
          this.transformer.fromBackend(item)
        ));
      }

      return [];
    } catch (error) {
      console.error('Error getting budgets with progress:', error);
      return [];
    }
  }

  async getBudgetProgress(id) {
    try {
      const response = await this.apiService.getBudgetProgress(id);
      return this.transformer.progressFromBackend(response);
    } catch (error) {
      console.error('Error getting budget progress:', error);
      return { ...PROGRESS_FALLBACK };
    }
  }

  async getBudgetAlerts(threshold = 80) {
    try {
      const response = await this.apiService.getBudgetAlerts(threshold);
      return this.transformer.alertsFromBackend(response);
    } catch (error) {
      console.error('Error getting budget alerts:', error);
      return [];
    }
  }

  async getSummary() {
    try {
      const response = await this.apiService.getBudgetSummary();
      return this.transformer.summaryFromBackend(response);
    } catch (error) {
      console.error('Error getting budget summary:', error);
      return { ...SUMMARY_FALLBACK };
    }
  }

  async existsForCategory(categoryId, period) {
    try {
      return await this.apiService.budgetExistsForCategory(categoryId, period);
    } catch (error) {
      console.error('Error checking budget existence:', error);
      return false;
    }
  }

  async createFromTemplate(templateName, totalIncome) {
    try {
      const response = await this.apiService.createFromTemplate(templateName, totalIncome);

      if (Array.isArray(response)) {
        const budgets = response.map(item => new this.EntityClass(
          this.transformer.fromBackend(item)
        ));

        return { success: true, data: budgets, created: budgets.length };
      }

      return {
        success: false,
        error: 'Invalid response from template creation',
        data: []
      };
    } catch (error) {
      console.error('Error creating budgets from template:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  async getCurrentPeriodBudgets() {
    try {
      const now = new Date();
      const filters = {
        isActive: true,
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0)
      };

      return await this.getAllWithProgress(filters);
    } catch (error) {
      console.error('Error getting current period budgets:', error);
      return [];
    }
  }

  async getExceededBudgets() {
    try {
      const budgets = await this.getAllWithProgress({ isActive: true });
      return budgets.filter(budget => budget.isExceeded());
    } catch (error) {
      console.error('Error getting exceeded budgets:', error);
      return [];
    }
  }

  async getBudgetsNearLimit(threshold = 80) {
    try {
      const budgets = await this.getAllWithProgress({ isActive: true });
      return budgets.filter(budget =>
        budget.getSpentPercentage() >= threshold && !budget.isExceeded()
      );
    } catch (error) {
      console.error('Error getting budgets near limit:', error);
      return [];
    }
  }

  async updateSpentAmount(id, amount) {
    try {
      // Note: Spent amount is usually calculated by backend based on transactions
      console.warn('Updating spent amount directly is not recommended');

      const budget = await this.getById(id);
      if (budget) {
        budget.spent = amount;
        return { success: true, data: budget };
      }

      return { success: false, error: 'Budget not found' };
    } catch (error) {
      console.error('Error updating spent amount:', error);
      return { success: false, error: error.message };
    }
  }

  async create(data) {
    try {
      const entity = new this.EntityClass(data);
      const result = await super.create(entity.toJSON());

      if (result.success && result.data) {
        result.data = new this.EntityClass(result.data);
      }

      return result;
    } catch (error) {
      return { success: false, error: error.message, data: null };
    }
  }

  async getAll(filters = {}) {
    const data = await super.getAll(filters);
    return data.map(item => new this.EntityClass(item));
  }

  async getById(id) {
    const data = await super.getById(id);
    return data ? new this.EntityClass(data) : null;
  }

  async activate(id) {
    return this.update(id, { isActive: true });
  }

  async deactivate(id) {
    return this.update(id, { isActive: false });
  }

  async extendPeriod(id, newEndDate) {
    return this.update(id, { endDate: newEndDate });
  }

  async updateAlertThreshold(id, threshold) {
    return this.update(id, { alertThreshold: threshold });
  }

  async validateBusinessRules(budget, context = {}) {
    return validateBudgetBusinessRules(budget, context);
  }

  getBudgetTemplates() {
    return BUDGET_TEMPLATES;
  }
}

// Export singleton instance
const apiBudgetRepository = new ApiBudgetRepository();

export default apiBudgetRepository;
export { ApiBudgetRepository };
