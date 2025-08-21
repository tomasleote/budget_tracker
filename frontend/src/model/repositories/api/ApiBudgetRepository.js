import BaseApiRepository from './BaseApiRepository.js';
import { budgetService } from '../../../api/index.js';
import { BudgetTransformer } from '../../transformers/index.js';
import Budget from '../../entities/updated/Budget.js';

/**
 * ApiBudgetRepository
 * API-based repository for Budget entities
 */
class ApiBudgetRepository extends BaseApiRepository {
  constructor() {
    super('budgets', budgetService, BudgetTransformer);
    this.EntityClass = Budget;
  }

  /**
   * Get active budgets
   * @returns {Promise<Array>} Active budgets
   */
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

  /**
   * Get budgets by category
   * @param {string} categoryId - Category ID
   * @returns {Promise<Array>} Budgets for category
   */
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

  /**
   * Get budgets by period
   * @param {string} period - Budget period (weekly/monthly/quarterly/yearly)
   * @returns {Promise<Array>} Budgets for period
   */
  async getByPeriod(period) {
    try {
      const filters = { period };
      return await this.getAll(filters);
    } catch (error) {
      console.error('Error getting budgets by period:', error);
      return [];
    }
  }

  /**
   * Get budget with progress
   * @param {string} id - Budget ID
   * @returns {Promise<Budget|null>} Budget with progress or null
   */
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

  /**
   * Get all budgets with progress
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} Budgets with progress
   */
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

  /**
   * Get budget progress
   * @param {string} id - Budget ID
   * @returns {Promise<Object>} Budget progress
   */
  async getBudgetProgress(id) {
    try {
      const response = await this.apiService.getBudgetProgress(id);
      return this.transformer.progressFromBackend(response);
    } catch (error) {
      console.error('Error getting budget progress:', error);
      return {
        spent: 0,
        remaining: 0,
        percentage: 0,
        isOverBudget: false,
        daysRemaining: 0
      };
    }
  }

  /**
   * Get budget alerts
   * @param {number} threshold - Alert threshold percentage
   * @returns {Promise<Array>} Budget alerts
   */
  async getBudgetAlerts(threshold = 80) {
    try {
      const response = await this.apiService.getBudgetAlerts(threshold);
      return this.transformer.alertsFromBackend(response);
    } catch (error) {
      console.error('Error getting budget alerts:', error);
      return [];
    }
  }

  /**
   * Get budget summary
   * @returns {Promise<Object>} Budget summary statistics
   */
  async getSummary() {
    try {
      const response = await this.apiService.getBudgetSummary();
      return this.transformer.summaryFromBackend(response);
    } catch (error) {
      console.error('Error getting budget summary:', error);
      return {
        totalBudgets: 0,
        activeBudgets: 0,
        totalBudgeted: 0,
        totalSpent: 0,
        totalRemaining: 0,
        overallPercentage: 0,
        budgetsOverLimit: 0,
        budgetsNearLimit: 0
      };
    }
  }

  /**
   * Check if budget exists for category and period
   * @param {string} categoryId - Category ID
   * @param {string} period - Budget period
   * @returns {Promise<boolean>} True if exists
   */
  async existsForCategory(categoryId, period) {
    try {
      return await this.apiService.budgetExistsForCategory(categoryId, period);
    } catch (error) {
      console.error('Error checking budget existence:', error);
      return false;
    }
  }

  /**
   * Create budgets from template
   * @param {string} templateName - Template name
   * @param {number} totalIncome - Total monthly income
   * @returns {Promise<Object>} Result
   */
  async createFromTemplate(templateName, totalIncome) {
    try {
      const response = await this.apiService.createFromTemplate(templateName, totalIncome);
      
      if (Array.isArray(response)) {
        const budgets = response.map(item => new this.EntityClass(
          this.transformer.fromBackend(item)
        ));
        
        return {
          success: true,
          data: budgets,
          created: budgets.length
        };
      }
      
      return {
        success: false,
        error: 'Invalid response from template creation',
        data: []
      };
    } catch (error) {
      console.error('Error creating budgets from template:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Get budgets for current period
   * @returns {Promise<Array>} Current period budgets
   */
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

  /**
   * Get exceeded budgets
   * @returns {Promise<Array>} Exceeded budgets
   */
  async getExceededBudgets() {
    try {
      const budgets = await this.getAllWithProgress({ isActive: true });
      return budgets.filter(budget => budget.isExceeded());
    } catch (error) {
      console.error('Error getting exceeded budgets:', error);
      return [];
    }
  }

  /**
   * Get budgets near limit
   * @param {number} threshold - Threshold percentage
   * @returns {Promise<Array>} Budgets near limit
   */
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

  /**
   * Update budget spent amount (not typically done directly)
   * @param {string} id - Budget ID
   * @param {number} amount - New spent amount
   * @returns {Promise<Object>} Result
   */
  async updateSpentAmount(id, amount) {
    try {
      // Note: Spent amount is usually calculated by backend based on transactions
      console.warn('Updating spent amount directly is not recommended');
      
      const budget = await this.getById(id);
      if (budget) {
        budget.spent = amount;
        return {
          success: true,
          data: budget
        };
      }
      
      return {
        success: false,
        error: 'Budget not found'
      };
    } catch (error) {
      console.error('Error updating spent amount:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Override create to ensure entity instance creation
   * @param {Object} data - Budget data
   * @returns {Promise<Object>} Result with created budget
   */
  async create(data) {
    try {
      // Create entity instance to ensure validation
      const entity = new this.EntityClass(data);
      
      // Use parent create method with entity data
      const result = await super.create(entity.toJSON());
      
      if (result.success && result.data) {
        // Return entity instance
        result.data = new this.EntityClass(result.data);
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Override getAll to return entity instances
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} Array of Budget entities
   */
  async getAll(filters = {}) {
    const data = await super.getAll(filters);
    return data.map(item => new this.EntityClass(item));
  }

  /**
   * Override getById to return entity instance
   * @param {string} id - Budget ID
   * @returns {Promise<Budget|null>} Budget entity or null
   */
  async getById(id) {
    const data = await super.getById(id);
    return data ? new this.EntityClass(data) : null;
  }

  /**
   * Activate budget
   * @param {string} id - Budget ID
   * @returns {Promise<Object>} Result
   */
  async activate(id) {
    return this.update(id, { isActive: true });
  }

  /**
   * Deactivate budget
   * @param {string} id - Budget ID
   * @returns {Promise<Object>} Result
   */
  async deactivate(id) {
    return this.update(id, { isActive: false });
  }

  /**
   * Extend budget period
   * @param {string} id - Budget ID
   * @param {Date} newEndDate - New end date
   * @returns {Promise<Object>} Result
   */
  async extendPeriod(id, newEndDate) {
    return this.update(id, { endDate: newEndDate });
  }

  /**
   * Update alert threshold
   * @param {string} id - Budget ID
   * @param {number} threshold - New threshold percentage
   * @returns {Promise<Object>} Result
   */
  async updateAlertThreshold(id, threshold) {
    return this.update(id, { alertThreshold: threshold });
  }

  /**
   * Validate budget against business rules
   * @param {Object} budget - Budget data
   * @param {Object} context - Validation context
   * @returns {Promise<Object>} Validation result
   */
  async validateBusinessRules(budget, context = {}) {
    const errors = [];
    const warnings = [];

    // Check for overlapping budgets
    if (context.existingBudgets) {
      const overlapping = context.existingBudgets.filter(b =>
        b.categoryId === budget.categoryId &&
        b.period === budget.period &&
        b.isActive &&
        b.id !== budget.id
      );

      if (overlapping.length > 0) {
        errors.push('An active budget already exists for this category and period');
      }
    }

    // Check if start date is in the past for new budgets
    if (!budget.id && budget.startDate) {
      const startDate = new Date(budget.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        warnings.push('Budget start date is in the past');
      }
    }

    // Check if budget amount is reasonable
    if (budget.amount) {
      if (budget.amount < 10) {
        warnings.push('Budget amount seems very low');
      } else if (budget.amount > 100000) {
        warnings.push('Budget amount seems very high');
      }
    }

    return { 
      isValid: errors.length === 0, 
      errors, 
      warnings 
    };
  }

  /**
   * Get budget templates
   * @returns {Array} Available budget templates
   */
  getBudgetTemplates() {
    return [
      {
        name: '50-30-20',
        description: '50% needs, 30% wants, 20% savings',
        allocations: [
          { category: 'needs', percentage: 50 },
          { category: 'wants', percentage: 30 },
          { category: 'savings', percentage: 20 }
        ]
      },
      {
        name: '70-20-10',
        description: '70% expenses, 20% savings, 10% giving',
        allocations: [
          { category: 'expenses', percentage: 70 },
          { category: 'savings', percentage: 20 },
          { category: 'giving', percentage: 10 }
        ]
      },
      {
        name: 'Zero-Based',
        description: 'Every dollar is allocated to a category',
        allocations: []
      }
    ];
  }
}

// Export singleton instance
const apiBudgetRepository = new ApiBudgetRepository();

export default apiBudgetRepository;
export { ApiBudgetRepository };
