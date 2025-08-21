import { useBudgetContext } from '../context/providers/BudgetProvider.jsx';
import { useMemo } from 'react';
import { formatCurrency, formatPercentage } from '../utils/index.js';

/**
 * useBudgets - LOGGING CLEANED
 * 
 * Budget controller hook for managing budget operations
 * 
 * LOGGING CLEANUP:
 * - Removed excessive analytics calculation logs
 * - Silent budget operations unless errors occur
 * - Clean budget state management without console spam
 */

// Simple safe execute function
const safeExecute = (fn, fallback) => {
  try {
    return fn();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Safe execute error:', error);
    }
    return fallback;
  }
};

const asyncSafeExecute = async (fn, fallback) => {
  try {
    return await fn();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Async safe execute error:', error);
    }
    return fallback;
  }
};

export const useBudgets = () => {
  const context = useBudgetContext();

  // Basic budgets with formatting
  const budgets = useMemo(() => {
    return safeExecute(() => {
      const overviewData = context.overview || [];
      const budgetData = context.budgets || [];
      
      return budgetData.map(budget => {
        // Find corresponding overview data for this budget
        const overviewBudget = overviewData.find(ob => ob.id === budget.id);
        const progress = overviewBudget?.progress || {
          spent: 0,
          remaining: parseFloat(budget.budgetAmount) || 0,
          percentage: 0
        };
        
        const spent = parseFloat(progress.spent) || 0;
        const budgetAmount = parseFloat(budget.budgetAmount) || 0;
        const remaining = parseFloat(progress.remaining) || (budgetAmount - spent);
        const percentage = parseFloat(progress.percentage) || 0;
        
        return {
          ...budget,
          formattedAmount: formatCurrency(budgetAmount),
          formattedSpent: formatCurrency(spent),
          formattedRemaining: formatCurrency(remaining),
          progress: {
            spent,
            remaining,
            percentage
          },
          isOverBudget: percentage > 100,
          isNearLimit: percentage >= 80,
          utilizationPercentage: percentage,
          utilizationStatus: percentage > 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'good'
        };
      });
    }, []);
  }, [context.budgets, context.overview]);

  // Basic overview
  const overview = useMemo(() => {
    return safeExecute(() => {
      return (context.overview || []).map(budget => {
        const spent = parseFloat(budget.progress?.spent) || 0;
        const budgetAmount = parseFloat(budget.budgetAmount) || 0;
        const percentage = budgetAmount > 0 ? (spent / budgetAmount * 100) : 0;
        
        return {
          ...budget,
          formattedBudget: formatCurrency(budgetAmount),
          formattedSpent: formatCurrency(spent),
          formattedRemaining: formatCurrency(parseFloat(budget.progress?.remaining) || budgetAmount),
          progressPercentage: percentage,
          progressStatus: percentage > 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'good',
          isExceeded: percentage > 100,
          isNearLimit: percentage >= 80 && percentage <= 100
        };
      });
    }, []);
  }, [context.overview]);

  // Basic analytics - CLEANED (no logging)
  const analytics = useMemo(() => {
    return safeExecute(() => {
      // Use overview data which has the calculated progress, not budgets array
      const overviewData = context.overview || [];
      if (overviewData.length === 0) return null;
      
      const totalBudgetAmount = overviewData.reduce((sum, b) => sum + (parseFloat(b.budgetAmount) || 0), 0);
      const totalSpent = overviewData.reduce((sum, b) => sum + (parseFloat(b.progress?.spent) || 0), 0);
      const utilization = totalBudgetAmount > 0 ? (totalSpent / totalBudgetAmount * 100) : 0;
      
      // REMOVED: Excessive analytics logging
      
      return {
        totalBudgetAmount,
        totalSpent,
        budgetUtilization: utilization,
        formattedTotalBudget: formatCurrency(totalBudgetAmount),
        formattedTotalSpent: formatCurrency(totalSpent),
        formattedUtilization: formatPercentage(utilization),
        healthScore: utilization <= 80 ? 'excellent' : utilization <= 100 ? 'good' : 'poor'
      };
    }, null);
  }, [context.overview]);

  // Basic actions
  const createBudget = async (budgetData) => {
    return asyncSafeExecute(async () => {
      if (context.actions && context.actions.createBudget) {
        return await context.actions.createBudget(budgetData);
      }
      return null;
    }, null);
  };

  const updateBudget = async (budgetId, updateData) => {
    return asyncSafeExecute(async () => {
      if (context.actions && context.actions.updateBudget) {
        return await context.actions.updateBudget(budgetId, updateData);
      }
      return null;
    }, null);
  };

  const deleteBudget = async (budgetId) => {
    return asyncSafeExecute(async () => {
      if (context.actions && context.actions.deleteBudget) {
        return await context.actions.deleteBudget(budgetId);
      }
      return null;
    }, null);
  };

  const dismissAlert = async (alertId) => {
    return asyncSafeExecute(async () => {
      // Import BudgetService dynamically to avoid circular dependency
      const { default: BudgetService } = await import('../../model/services/BudgetService.js');
      const result = BudgetService.dismissAlert(alertId);
      
      // Reload alerts after dismissing
      if (result.success && context.actions && context.actions.loadAlerts) {
        await context.actions.loadAlerts();
      }
      
      return result;
    }, { success: false, error: 'Failed to dismiss alert' });
  };

  const createMonthlyBudget = async (category, amount, description = '') => {
    return createBudget({
      category,
      budgetAmount: amount,
      period: 'monthly',
      description,
      isActive: true,
      startDate: new Date().toISOString(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
    });
  };

  // Basic statistics
  const getBudgetStatistics = () => {
    return safeExecute(() => {
      const totalBudgets = budgets.length;
      const activeBudgets = budgets.filter(b => b.isActive).length;
      const exceededBudgets = budgets.filter(b => b.isOverBudget).length;
      const nearLimitBudgets = budgets.filter(b => b.isNearLimit && !b.isOverBudget).length;
      const healthyBudgets = totalBudgets - exceededBudgets - nearLimitBudgets;
      
      return {
        totalBudgets,
        activeBudgets,
        exceededBudgets,
        nearLimitBudgets,
        healthyBudgets,
        overallUtilization: analytics?.budgetUtilization || 0
      };
    }, {
      totalBudgets: 0,
      activeBudgets: 0,
      exceededBudgets: 0,
      nearLimitBudgets: 0,
      healthyBudgets: 0,
      overallUtilization: 0
    });
  };

  return {
    // Basic data
    budgets,
    overview,
    alerts: context.alerts || [],
    analytics,
    
    // State
    isLoading: (typeof context.isLoading === 'function') ? context.isLoading() : false,
    hasError: (typeof context.hasError === 'function') ? context.hasError() : false,
    
    // Quick state checks
    isLoadingBudgets: false,
    isCreatingBudget: false,
    isUpdatingBudget: false,
    isDeletingBudget: false,
    
    // Actions
    createBudget,
    updateBudget,
    deleteBudget,
    createMonthlyBudget,
    dismissAlert,
    
    // Context actions
    loadBudgets: context.actions?.loadBudgets || (() => Promise.resolve()),
    loadOverview: context.actions?.loadOverview || (() => Promise.resolve()),
    loadAlerts: context.actions?.loadAlerts || (() => Promise.resolve()),
    loadAnalytics: context.actions?.loadAnalytics || (() => Promise.resolve()),
    clearErrors: context.actions?.clearErrors || (() => {}),
    
    // Helpers
    getBudgetStatistics,
    getBudgetProgress: context.getBudgetProgress || (() => null),
    
    getBudgetByCategory: (category) => {
      return budgets.find(b => b.category === category);
    },
    
    getExceededBudgets: () => {
      return budgets.filter(b => b.isOverBudget);
    },
    
    getNearLimitBudgets: () => {
      return budgets.filter(b => b.isNearLimit && !b.isOverBudget);
    },
    
    getHealthyBudgets: () => {
      return budgets.filter(b => !b.isOverBudget && !b.isNearLimit);
    },
    
    // Search
    searchBudgets: (searchTerm) => {
      if (!searchTerm) return budgets;
      const term = searchTerm.toLowerCase();
      return budgets.filter(budget => 
        (budget.category || '').toLowerCase().includes(term) ||
        (budget.formattedAmount || '').includes(term) ||
        (budget.period || '').toLowerCase().includes(term)
      );
    },
    
    // Filter helpers (basic implementations)
    filterByCategory: () => {},
    filterByStatus: () => {},
    filterByPeriod: () => {},
    setFilter: () => {},
    setFilters: () => {},
    resetFilters: () => {},
    
    // Computed values
    totalBudgetAmount: analytics?.totalBudgetAmount || 0,
    totalSpent: analytics?.totalSpent || 0,
    budgetUtilization: analytics?.budgetUtilization || 0,
    formattedTotalBudget: analytics?.formattedTotalBudget || formatCurrency(0),
    formattedTotalSpent: analytics?.formattedTotalSpent || formatCurrency(0),
    formattedUtilization: analytics?.formattedUtilization || formatPercentage(0),
    
    // Alert helpers
    hasAlerts: (context.alerts || []).length > 0,
    highPriorityAlerts: (context.alerts || []).filter(a => a.severity === 'high'),
    
    // Context access
    contexts: {
      budget: context
    }
  };
};

export default useBudgets;
