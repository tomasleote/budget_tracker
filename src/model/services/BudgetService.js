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

  // Get budget overview for dashboard using utility functions
  async getBudgetOverview() {
    return asyncSafeExecute(async () => {
      const currentBudgets = await this.budgetRepository.getCurrentBudgets();
      const transactions = await this.transactionRepository.getAll();
      console.log('📊 BudgetService.getBudgetOverview - Processing budgets:', currentBudgets.length);
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

      console.log('✅ Budget overview ready:', overview.length);
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
    // Generate alert if:
    // 1. State changed from normal to warning/exceeded
    // 2. State changed from warning to exceeded  
    // 3. State changed back from exceeded/warning to normal (so it can alert again later)
    // 4. It's a new budget (lastState is 'normal')
    
    if (currentState === 'normal') {
      // If back to normal, don't generate alert but allow future alerts
      return false;
    }
    
    if (lastState === 'normal' && (currentState === 'warning' || currentState === 'exceeded')) {
      return true; // Normal → Warning/Exceeded
    }
    
    if (lastState === 'warning' && currentState === 'exceeded') {
      return true; // Warning → Exceeded
    }
    
    // State reverted and then went bad again
    if ((lastState === 'exceeded' || lastState === 'warning') && currentState === 'normal') {
      return false; // Don't alert when going back to normal, but reset for future
    }
    
    return false; // Same state, don't generate new alert
  }
  
  getStoredAlerts() {
    try {
      const stored = localStorage.getItem('budget_tracker_alerts');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading stored alerts:', error);
      return [];
    }
  }
  
  saveStoredAlerts(alerts) {
    try {
      localStorage.setItem('budget_tracker_alerts', JSON.stringify(alerts));
    } catch (error) {
      console.error('Error saving alerts:', error);
    }
  }
  
  getDismissedAlerts() {
    try {
      const dismissed = localStorage.getItem('budget_tracker_dismissed_alerts');
      return dismissed ? new Set(JSON.parse(dismissed)) : new Set();
    } catch (error) {
      console.error('Error reading dismissed alerts:', error);
      return new Set();
    }
  }
  
  saveDismissedAlerts(dismissedSet) {
    try {
      localStorage.setItem('budget_tracker_dismissed_alerts', JSON.stringify([...dismissedSet]));
    } catch (error) {
      console.error('Error saving dismissed alerts:', error);
    }
  }
  
  getAlertHistory() {
    try {
      const history = localStorage.getItem('budget_tracker_alert_history');
      return history ? JSON.parse(history) : {};
    } catch (error) {
      console.error('Error reading alert history:', error);
      return {};
    }
  }
  
  saveAlertHistory(history) {
    try {
      localStorage.setItem('budget_tracker_alert_history', JSON.stringify(history));
    } catch (error) {
      console.error('Error saving alert history:', error);
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

  // Update all budget spending amounts
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

  // Budget analytics using utility functions
  async getBudgetAnalytics(period = 'month') {
    return asyncSafeExecute(async () => {
      const budgets = await this.budgetRepository.getAll();
      const transactions = await this.transactionRepository.getAll();
      
      const analytics = {
        totalBudgets: budgets.length,
        activeBudgets: budgets.filter(b => b.isActive).length,
        totalBudgetAmount: budgets.reduce((sum, b) => sum + (parseFloat(b.budgetAmount) || 0), 0),
        totalSpent: 0,
        budgetUtilization: 0,
        categoryBreakdown: [],
        performanceMetrics: {}
      };

      // Calculate spending and utilization using utility functions
      for (const budget of budgets) {
        const progress = calculateBudgetProgress(budget, transactions);
        analytics.totalSpent += progress.spent;
        
        analytics.categoryBreakdown.push({
          category: budget.category,
          budgetAmount: budget.budgetAmount,
          spent: progress.spent,
          remaining: progress.remaining,
          percentage: progress.percentage,
          status: progress.status
        });
      }

      analytics.budgetUtilization = analytics.totalBudgetAmount > 0 ? 
        (analytics.totalSpent / analytics.totalBudgetAmount * 100) : 0;

      // Performance metrics
      const exceededBudgets = analytics.categoryBreakdown.filter(b => b.percentage > 100);
      const nearLimitBudgets = analytics.categoryBreakdown.filter(b => b.percentage >= 80 && b.percentage <= 100);
      const healthyBudgets = analytics.categoryBreakdown.filter(b => b.percentage < 80);

      analytics.performanceMetrics = {
        exceededCount: exceededBudgets.length,
        nearLimitCount: nearLimitBudgets.length,
        healthyCount: healthyBudgets.length,
        averageUtilization: analytics.categoryBreakdown.length > 0 ? 
          analytics.categoryBreakdown.reduce((sum, b) => sum + b.percentage, 0) / analytics.categoryBreakdown.length : 0
      };

      return analytics;
    }, null);
  }

  // Budget recommendations using utility functions
  async getBudgetRecommendations() {
    return asyncSafeExecute(async () => {
      const analytics = await this.getBudgetAnalytics();
      const transactions = await this.transactionRepository.getAll();
      const recommendations = [];

      if (!analytics) return recommendations;

      // Analyze spending patterns using utility functions
      const categorySpending = calculateSpendingByCategory(transactions, 'expense');
      const existingBudgetCategories = new Set(analytics.categoryBreakdown.map(b => b.category));

      // Recommend budgets for high-spending categories without budgets
      categorySpending.forEach(category => {
        if (!existingBudgetCategories.has(category.category) && category.amount > 100) {
          recommendations.push({
            type: 'create_budget',
            category: category.category,
            suggestedAmount: roundCurrency(category.amount * 1.1), // 10% buffer
            reason: `You spent $${category.amount} on ${category.category} last period`,
            priority: 'medium'
          });
        }
      });

      // Recommend budget adjustments for consistently exceeded budgets
      analytics.categoryBreakdown.forEach(budget => {
        if (budget.percentage > 120) {
          recommendations.push({
            type: 'increase_budget',
            category: budget.category,
            currentAmount: budget.budgetAmount,
            suggestedAmount: roundCurrency(budget.spent * 1.1),
            reason: `Budget consistently exceeded by ${(budget.percentage - 100).toFixed(1)}%`,
            priority: 'high'
          });
        } else if (budget.percentage < 50) {
          recommendations.push({
            type: 'decrease_budget',
            category: budget.category,
            currentAmount: budget.budgetAmount,
            suggestedAmount: roundCurrency(budget.spent * 1.2),
            reason: `Budget underutilized at ${budget.percentage.toFixed(1)}%`,
            priority: 'low'
          });
        }
      });

      return recommendations.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    }, []);
  }

  // Budget templates
  async createBudgetTemplate(name, budgets) {
    return safeExecute(() => {
      const template = {
        id: `template_${Date.now()}`,
        name,
        budgets: budgets.map(b => ({
          category: b.category,
          budgetAmount: b.budgetAmount,
          period: b.period
        })),
        createdAt: new Date().toISOString()
      };

      return template;
    }, null);
  }

  async applyBudgetTemplate(templateBudgets) {
    return asyncSafeExecute(async () => {
      const results = [];
      
      for (const templateBudget of templateBudgets) {
        const result = await this.createBudget(templateBudget);
        results.push(result);
      }

      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      return {
        total: results.length,
        successful: successful.length,
        failed: failed.length,
        results,
        budgets: successful.map(r => r.budget)
      };
    }, {
      total: 0,
      successful: 0,
      failed: 0,
      error: 'Failed to apply budget template'
    });
  }

  // Budget forecasting using utility functions
  async forecastBudgetPerformance(months = 3) {
    return asyncSafeExecute(async () => {
      const budgets = await this.budgetRepository.getAll();
      const transactions = await this.transactionRepository.getAll();
      const forecasts = [];

      for (const budget of budgets) {
        const categoryTransactions = transactions.filter(t => 
          t.type === 'expense' && t.category === budget.category
        );

        // Calculate average monthly spending using utility functions
        const trends = calculateTrends(categoryTransactions, 6);
        const avgMonthlySpend = trends.length > 0 ?
          trends.reduce((sum, trend) => sum + trend.balance.expenses, 0) / trends.length : 0;

        // Forecast future months
        const monthForecasts = [];
        for (let i = 1; i <= months; i++) {
          const forecastDate = new Date();
          forecastDate.setMonth(forecastDate.getMonth() + i);
          
          monthForecasts.push({
            month: forecastDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
            projectedSpending: roundCurrency(avgMonthlySpend),
            budgetAmount: budget.budgetAmount,
            projectedOverage: Math.max(0, roundCurrency(avgMonthlySpend - budget.budgetAmount)),
            riskLevel: this.calculateRiskLevel(avgMonthlySpend, budget.budgetAmount)
          });
        }

        forecasts.push({
          category: budget.category,
          currentBudget: budget.budgetAmount,
          averageMonthlySpending: roundCurrency(avgMonthlySpend),
          monthlyForecasts: monthForecasts,
          recommendation: this.getBudgetRecommendation(avgMonthlySpend, budget.budgetAmount)
        });
      }

      return forecasts;
    }, []);
  }

  calculateRiskLevel(projectedSpending, budgetAmount) {
    const ratio = projectedSpending / budgetAmount;
    if (ratio > 1.2) return 'high';
    if (ratio > 1.0) return 'medium';
    if (ratio > 0.8) return 'low';
    return 'minimal';
  }

  getBudgetRecommendation(avgSpending, budgetAmount) {
    const ratio = avgSpending / budgetAmount;
    
    if (ratio > 1.2) {
      return {
        action: 'increase',
        suggestedAmount: roundCurrency(avgSpending * 1.1),
        reason: 'Consistently exceeding budget by significant amount'
      };
    } else if (ratio > 1.0) {
      return {
        action: 'increase',
        suggestedAmount: roundCurrency(avgSpending * 1.05),
        reason: 'Regularly exceeding budget'
      };
    } else if (ratio < 0.6) {
      return {
        action: 'decrease',
        suggestedAmount: roundCurrency(avgSpending * 1.2),
        reason: 'Budget significantly underutilized'
      };
    } else {
      return {
        action: 'maintain',
        suggestedAmount: budgetAmount,
        reason: 'Budget is well-calibrated'
      };
    }
  }

  // Export budget data using utility functions
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

  // Budget statistics
  async getBudgetStatistics() {
    return asyncSafeExecute(async () => {
      return await this.budgetRepository.getBudgetsByStatus();
    }, null);
  }

  // Budget filtering
  async getBudgetsWithFilters(filters = {}) {
    return asyncSafeExecute(async () => {
      return await this.budgetRepository.getWithFilters(filters);
    }, []);
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

  // Budget performance insights
  async getBudgetInsights() {
    return asyncSafeExecute(async () => {
      const analytics = await this.getBudgetAnalytics();
      const recommendations = await this.getBudgetRecommendations();
      const alerts = await this.getBudgetAlerts();

      return {
        summary: {
          totalBudgets: analytics.totalBudgets,
          activeBudgets: analytics.activeBudgets,
          budgetUtilization: analytics.budgetUtilization,
          healthScore: this.calculateBudgetHealthScore(analytics)
        },
        alerts,
        recommendations: recommendations.slice(0, 5), // Top 5 recommendations
        trends: await this.getBudgetTrends()
      };
    }, null);
  }

  calculateBudgetHealthScore(analytics) {
    if (!analytics || analytics.totalBudgets === 0) return 0;

    const healthyWeight = 0.4;
    const nearLimitWeight = 0.3;
    const exceededWeight = 0.3;

    const score = 
      (analytics.performanceMetrics.healthyCount / analytics.totalBudgets) * healthyWeight * 100 +
      ((analytics.performanceMetrics.nearLimitCount / analytics.totalBudgets) * nearLimitWeight * 50) +
      ((analytics.performanceMetrics.exceededCount / analytics.totalBudgets) * exceededWeight * 0);

    return Math.round(score);
  }

  async getBudgetTrends(periods = 6) {
    return asyncSafeExecute(async () => {
      const transactions = await this.transactionRepository.getAll();
      const trends = calculateTrends(transactions, periods);
      
      return trends.map(trend => ({
        period: trend.periodName,
        totalSpent: trend.balance.expenses,
        categories: trend.categoryBreakdown.slice(0, 5) // Top 5 categories
      }));
    }, []);
  }
}

// Create singleton instance
const budgetService = new BudgetService();

export default budgetService;
