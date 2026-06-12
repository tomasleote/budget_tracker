import { Budget } from '../entities/index.js';
import BudgetRepository from '../repositories/BudgetRepository.js';
import TransactionRepository from '../repositories/TransactionRepository.js';
import {
  validateBudget,
  validateBusinessRules,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  calculateBudgetProgress,
  asyncSafeExecute
} from '../../controller/utils/index.js';
import {
  getBudgetState,
  shouldGenerateAlert,
  getStoredAlerts,
  saveStoredAlerts,
  getDismissedAlerts,
  saveDismissedAlerts,
  getAlertHistory,
  saveAlertHistory,
  clearAllAlertStorage
} from './budget/alertStorage.js';

class BudgetService {
  constructor() {
    this.budgetRepository = new BudgetRepository();
    this.transactionRepository = new TransactionRepository();
  }

  async createBudget(budgetData) {
    return asyncSafeExecute(async () => {
      const validation = validateBudget(budgetData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const existingBudgets = await this.budgetRepository.getAll();
      const businessValidation = validateBusinessRules(
        { ...budgetData, type: 'budget' },
        { existingBudgets }
      );

      if (!businessValidation.isValid) {
        throw new Error(`Business rule validation failed: ${businessValidation.errors.join(', ')}`);
      }

      const result = await this.budgetRepository.create(budgetData);
      if (!result.success) throw new Error(result.error);

      return {
        success: true,
        budget: result.data,
        warnings: [...validation.warnings, ...businessValidation.warnings],
        message: SUCCESS_MESSAGES.BUDGET.CREATED
      };
    }, { success: false, error: ERROR_MESSAGES.BUDGET.CREATE_FAILED, budget: null });
  }

  async updateBudget(budgetId, updateData) {
    return asyncSafeExecute(async () => {
      const validation = validateBudget(updateData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const result = await this.budgetRepository.update(budgetId, updateData);
      if (!result.success) throw new Error(result.error);

      return { success: true, budget: result.data, message: SUCCESS_MESSAGES.BUDGET.UPDATED };
    }, { success: false, error: ERROR_MESSAGES.BUDGET.UPDATE_FAILED, budget: null });
  }

  async deleteBudget(budgetId) {
    return asyncSafeExecute(async () => {
      const result = await this.budgetRepository.delete(budgetId);
      if (!result.success) throw new Error(result.error);
      return { success: true, message: SUCCESS_MESSAGES.BUDGET.DELETED };
    }, { success: false, error: ERROR_MESSAGES.BUDGET.DELETE_FAILED });
  }

  async getAllBudgets() {
    return asyncSafeExecute(async () => this.budgetRepository.getAll(), []);
  }

  async getBudgetById(budgetId) {
    return asyncSafeExecute(async () => this.budgetRepository.getById(budgetId), null);
  }

  async getActiveBudgets() {
    return asyncSafeExecute(async () => this.budgetRepository.getActive(), []);
  }

  async getBudgetsByCategory(category) {
    return asyncSafeExecute(async () => this.budgetRepository.getByCategory(category), []);
  }

  async getCurrentBudgets() {
    return asyncSafeExecute(async () => this.budgetRepository.getCurrentBudgets(), []);
  }

  async getBudgetProgress(budgetId) {
    return asyncSafeExecute(async () => {
      const budget = await this.budgetRepository.getById(budgetId);
      if (!budget) throw new Error(ERROR_MESSAGES.BUDGET.NOT_FOUND);
      const transactions = await this.transactionRepository.getAll();
      return calculateBudgetProgress(budget, transactions);
    }, null);
  }

  async getBudgetOverview() {
    return asyncSafeExecute(async () => {
      const currentBudgets = await this.budgetRepository.getCurrentBudgets();
      const transactions = await this.transactionRepository.getAll();
      const overview = currentBudgets.map(budget => ({
        ...budget,
        progress: calculateBudgetProgress(budget, transactions)
      }));

      overview.sort((a, b) => {
        if (a.progress.isExceeded !== b.progress.isExceeded) {
          return a.progress.isExceeded ? -1 : 1;
        }
        return b.progress.percentage - a.progress.percentage;
      });

      return overview;
    }, []);
  }

  async getBudgetAlerts() {
    return asyncSafeExecute(async () => {
      const budgetOverview = await this.getBudgetOverview();
      const existingAlerts = getStoredAlerts();
      const dismissedAlerts = getDismissedAlerts();
      const alertHistory = getAlertHistory();

      const newAlerts = [];
      const updatedHistory = { ...alertHistory };

      budgetOverview.forEach(budget => {
        const { progress } = budget;
        const budgetKey = `budget_${budget.id}`;
        const currentState = getBudgetState(progress);
        const lastKnownState = alertHistory[budgetKey] || 'normal';

        if (shouldGenerateAlert(currentState, lastKnownState)) {
          if (progress.isExceeded) {
            const alertId = `alert_${budget.id}_exceeded`;
            if (!dismissedAlerts.has(alertId)) {
              newAlerts.push({
                id: alertId,
                type: 'exceeded',
                severity: 'high',
                budgetId: budget.id,
                category: budget.category,
                categoryName: budget.category,
                message: `Budget exceeded for ${budget.category}`,
                amount: progress.spent - progress.budgetAmount,
                percentage: progress.percentage,
                createdAt: new Date().toISOString(),
                state: 'exceeded'
              });
            }
          } else if (progress.isNearLimit) {
            const alertId = `alert_${budget.id}_nearlimit`;
            if (!dismissedAlerts.has(alertId)) {
              newAlerts.push({
                id: alertId,
                type: 'near_limit',
                severity: 'medium',
                budgetId: budget.id,
                category: budget.category,
                categoryName: budget.category,
                message: `Budget near limit for ${budget.category}`,
                percentage: progress.percentage,
                remaining: progress.remaining,
                createdAt: new Date().toISOString(),
                state: 'warning'
              });
            }
          }
        }

        updatedHistory[budgetKey] = currentState;
      });

      saveAlertHistory(updatedHistory);

      const allAlerts = [
        ...existingAlerts.filter(alert => !dismissedAlerts.has(alert.id)),
        ...newAlerts
      ];
      saveStoredAlerts(allAlerts);

      return allAlerts.sort((a, b) => {
        const severityOrder = { high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });
    }, []);
  }

  dismissAlert(alertId) {
    try {
      const dismissedAlerts = getDismissedAlerts();
      dismissedAlerts.add(alertId);
      saveDismissedAlerts(dismissedAlerts);

      const storedAlerts = getStoredAlerts();
      saveStoredAlerts(storedAlerts.filter(alert => alert.id !== alertId));

      return { success: true };
    } catch (error) {
      console.error('Error dismissing alert:', error);
      return { success: false, error: error.message };
    }
  }

  clearDismissedAlerts() {
    try {
      clearAllAlertStorage();
      return { success: true };
    } catch (error) {
      console.error('Error clearing dismissed alerts:', error);
      return { success: false, error: error.message };
    }
  }

  async updateBudgetSpending(budgetId) {
    return asyncSafeExecute(async () => {
      const budget = await this.budgetRepository.getById(budgetId);
      if (!budget) throw new Error(ERROR_MESSAGES.BUDGET.NOT_FOUND);

      const transactions = await this.transactionRepository.getAll();
      const progress = calculateBudgetProgress(budget, transactions);

      const result = await this.budgetRepository.updateSpentAmount(budgetId, progress.spent);
      if (!result.success) throw new Error('Failed to update budget spending');

      return { success: true, budget: result.data, progress };
    }, { success: false, error: 'Failed to update budget spending' });
  }

  async refreshAllBudgetSpending() {
    return asyncSafeExecute(async () => {
      const budgets = await this.budgetRepository.getAll();
      const results = [];

      for (const budget of budgets) {
        results.push(await this.updateBudgetSpending(budget.id));
      }

      return {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      };
    }, { total: 0, successful: 0, failed: 0, error: 'Failed to refresh budget spending' });
  }

  async activateBudget(budgetId) {
    return asyncSafeExecute(async () => {
      const result = await this.budgetRepository.activateBudget(budgetId);
      return {
        ...result,
        message: result.success ? SUCCESS_MESSAGES.BUDGET.ACTIVATED : ERROR_MESSAGES.BUDGET.UPDATE_FAILED
      };
    }, { success: false, error: ERROR_MESSAGES.BUDGET.UPDATE_FAILED });
  }

  async deactivateBudget(budgetId) {
    return asyncSafeExecute(async () => {
      const result = await this.budgetRepository.deactivateBudget(budgetId);
      return {
        ...result,
        message: result.success ? SUCCESS_MESSAGES.BUDGET.DEACTIVATED : ERROR_MESSAGES.BUDGET.UPDATE_FAILED
      };
    }, { success: false, error: ERROR_MESSAGES.BUDGET.UPDATE_FAILED });
  }

  async getBudgetsWithFilters(filters = {}) {
    return asyncSafeExecute(async () => this.budgetRepository.getWithFilters(filters), []);
  }

  async getBudgetStatistics() {
    return asyncSafeExecute(async () => this.budgetRepository.getBudgetsByStatus(), null);
  }

  async exportBudgets(format = 'json') {
    return asyncSafeExecute(async () => {
      const budgets = await this.budgetRepository.getAll();
      switch (format.toLowerCase()) {
        case 'csv': return this.budgetRepository.exportToCSV();
        case 'json': return JSON.stringify(budgets, null, 2);
        default: throw new Error('Unsupported export format');
      }
    }, null);
  }
}

const budgetService = new BudgetService();

export default budgetService;
