import { Budget } from '../entities/index.js';
import BudgetRepository from '../repositories/BudgetRepository.js';
import TransactionRepository from '../repositories/TransactionRepository.js';
import {
  validateBudget,
  validateBusinessRules,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  calculateBudgetProgress,
  calculateSpendingByCategory,
  calculateTrends,
  calculateFinancialMetrics,
  getDateRange,
  roundCurrency,
  safeExecute,
  asyncSafeExecute,
  formatExportFilename
} from '../../controller/utils/index.js';

/**
 * BudgetService - LOGGING CLEANED
 * 
 * Service layer for budget operations and business logic
 * 
 * LOGGING CLEANUP:
 * - Removed excessive service operation logs
 * - Only keep essential error logs and major operations
 * - Reduced verbosity in budget processing
 */
class BudgetService {
  constructor() {
    this.budgetRepository = new BudgetRepository();
    this.transactionRepository = new TransactionRepository();
  }

  // Create a new budget
  async createBudget(budgetData) {
    return asyncSafeExecute(async () => {
      // Validate input data
      const validation = validateBudget(budgetData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Check for existing budgets with same category and period
      const existingBudgets = await this.budgetRepository.getAll();
      const businessValidation = validateBusinessRules(
        { ...budgetData, type: 'budget' },
        { existingBudgets }
      );

      if (!businessValidation.isValid) {
        throw new Error(`Business rule validation failed: ${businessValidation.errors.join(', ')}`);
      }

      // Create budget using repository
      const result = await this.budgetRepository.create(budgetData);
      if (!result.success) {
        throw new Error(result.error);
      }

      return {
        success: true,
        budget: result.data,
        warnings: [...validation.warnings, ...businessValidation.warnings],
        message: SUCCESS_MESSAGES.BUDGET.CREATED
      };
    }, {
      success: false,
      error: ERROR_MESSAGES.BUDGET.CREATE_FAILED,
      budget: null
    });
  }

  // Update existing budget
  async updateBudget(budgetId, updateData) {
    return asyncSafeExecute(async () => {
      const validation = validateBudget(updateData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const result = await this.budgetRepository.update(budgetId, updateData);
      if (!result.success) {
        throw new Error(result.error);
      }

      return {
        success: true,
        budget: result.data,
        message: SUCCESS_MESSAGES.BUDGET.UPDATED
      };
    }, {
      success: false,
      error: ERROR_MESSAGES.BUDGET.UPDATE_FAILED,
      budget: null
    });
  }

  // Delete budget
  async deleteBudget(budgetId) {
    return asyncSafeExecute(async () => {
      const result = await this.budgetRepository.delete(budgetId);
      if (!result.success) {
        throw new Error(result.error);
      }

      return { 
        success: true,
        message: SUCCESS_MESSAGES.BUDGET.DELETED
      };
    }, {
      success: false,
      error: ERROR_MESSAGES.BUDGET.DELETE_FAILED
    });
  }

  // Get all budgets
  async getAllBudgets() {
    return asyncSafeExecute(async () => {
      return await this.budgetRepository.getAll();
    }, []);
  }

  // Get budget by ID
  async getBudgetById(budgetId) {
    return asyncSafeExecute(async () => {
      return await this.budgetRepository.getById(budgetId);
    }, null);
  }

  // Get active budgets
  async getActiveBudgets() {
    return asyncSafeExecute(async () => {
      return await this.budgetRepository.getActive();
    }, []);
  }

  // Get budgets by category
  async getBudgetsByCategory(category) {
    return asyncSafeExecute(async () => {
      return await this.budgetRepository.getByCategory(category);
    }, []);
  }

  // Get current budgets (active and within date range)
  async getCurrentBudgets() {
    return asyncSafeExecute(async () => {
      return await this.budgetRepository.getCurrentBudgets();
    }, []);
  }

  // Calculate budget progress with utility functions
  async getBudgetProgress(budgetId) {
    return asyncSafeExecute(async () => {
      const budget = await this.budgetRepository.getById(budgetId);
      if (!budget) {
        throw new Error(ERROR_MESSAGES.BUDGET.NOT_FOUND);
      }

      const transactions = await this.transactionRepository.getAll();
      return calculateBudgetProgress(budget, transactions);
    }, null);
  }

  // Get budget overview for dashboard using utility functions - SILENT
  async getBudgetOverview() {
    return asyncSafeExecute(async () => {
      const currentBudgets = await this.budgetRepository.getCurrentBudgets();
      const transactions = await this.transactionRepository.getAll();
      const overview = [];

      for (const budget of currentBudgets) {
        const progress = calculateBudgetProgress(budget, transactions);
        overview.push({
          ...budget,
          progress
        });
      }

      // Sort by status (exceeded first, then by percentage)
      overview.sort((a, b) => {
        if (a.progress.isExceeded !== b.progress.isExceeded) {
          return a.progress.isExceeded ? -1 : 1;
        }
        return b.progress.percentage - a.progress.percentage;
      });

      return overview;
    }, []);
  }

  // Get budget alerts with state-based generation (only new alerts)
  async getBudgetAlerts() {
    return asyncSafeExecute(async () => {
      const budgetOverview = await this.getBudgetOverview();
      
      // Get existing alerts from localStorage to avoid duplicates
      const existingAlerts = this.getStoredAlerts();
      const dismissedAlerts = this.getDismissedAlerts();
      const alertHistory = this.getAlertHistory();
      
      const newAlerts = [];
      const updatedHistory = { ...alertHistory };

      budgetOverview.forEach(budget => {
        const { progress } = budget;
        const budgetKey = `budget_${budget.id}`;
        const currentState = this.getBudgetState(progress);
        const lastKnownState = alertHistory[budgetKey] || 'normal';
        
        // Only generate alert if state changed or it's a new budget
        const shouldGenerateAlert = this.shouldGenerateAlert(currentState, lastKnownState);
        
        if (shouldGenerateAlert) {
          let alertId;
          
          if (progress.isExceeded) {
            alertId = `alert_${budget.id}_exceeded`;
            // Check if this specific alert was dismissed
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
            alertId = `alert_${budget.id}_nearlimit`;
            // Check if this specific alert was dismissed
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
        
        // Update the state history
        updatedHistory[budgetKey] = currentState;
      });
      
      // Save updated history
      this.saveAlertHistory(updatedHistory);
      
      // Combine with existing non-dismissed alerts
      const allAlerts = [...existingAlerts.filter(alert => !dismissedAlerts.has(alert.id)), ...newAlerts];
      
      // Save all alerts (including new ones)
      this.saveStoredAlerts(allAlerts);

      return allAlerts.sort((a, b) => {
        const severityOrder = { high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });
    }, []);
  }
  
  // Helper methods for alert management
  getBudgetState(progress) {
    if (progress.isExceeded) return 'exceeded';
    if (progress.isNearLimit) return 'warning';
    return 'normal';
  }
  
  shouldGenerateAlert(currentState, lastState) {
    if (currentState === 'normal') {
      return false;
    }
    
    if (lastState === 'normal' && (currentState === 'warning' || currentState === 'exceeded')) {
      return true;
    }
    
    if (lastState === 'warning' && currentState === 'exceeded') {
      return true;
    }
    
    return false;
  }
  
  getStoredAlerts() {
    try {
      const stored = localStorage.getItem('budget_tracker_alerts');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error reading stored alerts:', error);
      }
      return [];
    }
  }
  
  saveStoredAlerts(alerts) {
    try {
      localStorage.setItem('budget_tracker_alerts', JSON.stringify(alerts));
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving alerts:', error);
      }
    }
  }
  
  getDismissedAlerts() {
    try {
      const dismissed = localStorage.getItem('budget_tracker_dismissed_alerts');
      return dismissed ? new Set(JSON.parse(dismissed)) : new Set();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error reading dismissed alerts:', error);
      }
      return new Set();
    }
  }
  
  saveDismissedAlerts(dismissedSet) {
    try {
      localStorage.setItem('budget_tracker_dismissed_alerts', JSON.stringify([...dismissedSet]));
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving dismissed alerts:', error);
      }
    }
  }
  
  getAlertHistory() {
    try {
      const history = localStorage.getItem('budget_tracker_alert_history');
      return history ? JSON.parse(history) : {};
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error reading alert history:', error);
      }
      return {};
    }
  }
  
  saveAlertHistory(history) {
    try {
      localStorage.setItem('budget_tracker_alert_history', JSON.stringify(history));
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving alert history:', error);
      }
    }
  }
  
  // Method to dismiss an alert (to be called from UI)
  dismissAlert(alertId) {
    try {
      const dismissedAlerts = this.getDismissedAlerts();
      dismissedAlerts.add(alertId);
      this.saveDismissedAlerts(dismissedAlerts);
      
      // Remove from stored alerts
      const storedAlerts = this.getStoredAlerts();
      const filteredAlerts = storedAlerts.filter(alert => alert.id !== alertId);
      this.saveStoredAlerts(filteredAlerts);
      
      return { success: true };
    } catch (error) {
      console.error('Error dismissing alert:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Method to clear all dismissed alerts (for testing/reset)
  clearDismissedAlerts() {
    try {
      localStorage.removeItem('budget_tracker_dismissed_alerts');
      localStorage.removeItem('budget_tracker_alert_history');
      localStorage.removeItem('budget_tracker_alerts');
      return { success: true };
    } catch (error) {
      console.error('Error clearing dismissed alerts:', error);
      return { success: false, error: error.message };
    }
  }

  // Update budget spent amount based on transactions
  async updateBudgetSpending(budgetId) {
    return asyncSafeExecute(async () => {
      const budget = await this.budgetRepository.getById(budgetId);
      if (!budget) {
        throw new Error(ERROR_MESSAGES.BUDGET.NOT_FOUND);
      }

      const transactions = await this.transactionRepository.getAll();
      const progress = calculateBudgetProgress(budget, transactions);

      // Update budget with calculated spent amount
      const result = await this.budgetRepository.updateSpentAmount(budgetId, progress.spent);
      if (!result.success) {
        throw new Error('Failed to update budget spending');
      }

      return {
        success: true,
        budget: result.data,
        progress
      };
    }, {
      success: false,
      error: 'Failed to update budget spending'
    });
  }

  // Simplified methods without excessive logging
  async refreshAllBudgetSpending() {
    return asyncSafeExecute(async () => {
      const budgets = await this.budgetRepository.getAll();
      const results = [];

      for (const budget of budgets) {
        const result = await this.updateBudgetSpending(budget.id);
        results.push(result);
      }

      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      return {
        total: results.length,
        successful: successful.length,
        failed: failed.length,
        results
      };
    }, {
      total: 0,
      successful: 0,
      failed: 0,
      error: 'Failed to refresh budget spending'
    });
  }

  // Activate/Deactivate budgets
  async activateBudget(budgetId) {
    return asyncSafeExecute(async () => {
      const result = await this.budgetRepository.activateBudget(budgetId);
      return {
        ...result,
        message: result.success ? SUCCESS_MESSAGES.BUDGET.ACTIVATED : ERROR_MESSAGES.BUDGET.UPDATE_FAILED
      };
    }, {
      success: false,
      error: ERROR_MESSAGES.BUDGET.UPDATE_FAILED
    });
  }

  async deactivateBudget(budgetId) {
    return asyncSafeExecute(async () => {
      const result = await this.budgetRepository.deactivateBudget(budgetId);
      return {
        ...result,
        message: result.success ? SUCCESS_MESSAGES.BUDGET.DEACTIVATED : ERROR_MESSAGES.BUDGET.UPDATE_FAILED
      };
    }, {
      success: false,
      error: ERROR_MESSAGES.BUDGET.UPDATE_FAILED
    });
  }

  // Budget filtering
  async getBudgetsWithFilters(filters = {}) {
    return asyncSafeExecute(async () => {
      return await this.budgetRepository.getWithFilters(filters);
    }, []);
  }

  // Budget statistics
  async getBudgetStatistics() {
    return asyncSafeExecute(async () => {
      return await this.budgetRepository.getBudgetsByStatus();
    }, null);
  }

  // Export budget data
  async exportBudgets(format = 'json') {
    return asyncSafeExecute(async () => {
      const budgets = await this.budgetRepository.getAll();
      
      switch (format.toLowerCase()) {
        case 'csv':
          return await this.budgetRepository.exportToCSV();
        case 'json':
          return JSON.stringify(budgets, null, 2);
        default:
          throw new Error('Unsupported export format');
      }
    }, null);
  }
}

// Create singleton instance
const budgetService = new BudgetService();

export default budgetService;
