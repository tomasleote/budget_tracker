// Custom hooks exports for easy importing
import { useAppContext } from './useAppContext.js';
import { useTransactions } from './useTransactions.js';
import { useBudgets } from './useBudgets.js';
import { useCategories } from './useCategories.js';
import { useUser } from './useUser.js';

export { useAppContext } from './useAppContext.js';
export { useTransactions } from './useTransactions.js';
export { useBudgets } from './useBudgets.js';
export { useCategories } from './useCategories.js';
export { useUser } from './useUser.js';
export { default as useNotifications } from './useNotifications.js';

// Combined hook for accessing multiple contexts

/**
 * Combined hook that provides access to all app contexts
 * Use this when you need data from multiple contexts in a single component
 */
export const useAppData = () => {
  const app = useAppContext();
  const user = useUser();
  const categories = useCategories();
  const transactions = useTransactions();
  const budgets = useBudgets();

  return {
    app,
    user,
    categories,
    transactions,
    budgets,
    
    // Global loading state
    isGlobalLoading: () => {
      return (
        app.isGlobalLoading ||
        user.isLoadingUser ||
        categories.isLoadingCategories ||
        transactions.isLoadingTransactions ||
        budgets.isLoadingBudgets
      );
    },
    
    // Global error state
    hasGlobalError: () => {
      return (
        app.hasGlobalError ||
        user.hasLoadError ||
        categories.hasLoadError ||
        transactions.hasLoadError ||
        budgets.hasLoadError
      );
    },
    
    // Clear all errors
    clearAllErrors: () => {
      app.clearAllErrors();
      user.clearErrors();
      categories.clearErrors();
      transactions.clearErrors();
      budgets.clearErrors();
    },
    
    // Refresh all data
    refreshAllData: async () => {
      await Promise.all([
        user.refreshUser(),
        categories.refreshCategories(),
        transactions.refreshTransactions(),
        budgets.refreshBudgets()
      ]);
    },
    
    // Dashboard data aggregator
    getDashboardData: () => {
      return {
        user: {
          name: user.getUserDisplayName(),
          currency: user.getCurrentCurrency(),
          theme: user.getCurrentTheme()
        },
        transactions: {
          recent: transactions.recentTransactions,
          totalIncome: transactions.totalIncome,
          totalExpenses: transactions.totalExpenses,
          balance: transactions.currentBalance
        },
        budgets: {
          alerts: budgets.alerts,
          overview: budgets.overview,
          hasAlerts: budgets.hasAlerts
        },
        categories: {
          total: categories.totalCategories,
          active: categories.activeCategories,
          mostUsed: categories.getMostUsedCategories(3)
        }
      };
    },
    
    // Quick actions
    quickActions: {
      addExpense: transactions.addExpense,
      addIncome: transactions.addIncome,
      createBudget: budgets.createMonthlyBudget,
      createCategory: categories.createExpenseCategory,
      toggleTheme: user.toggleTheme,
      formatCurrency: user.formatCurrency
    }
  };
};

/**
 * Hook for financial overview data
 * Combines transaction and budget data for financial summaries
 */
export const useFinancialOverview = () => {
  const transactions = useTransactions();
  const budgets = useBudgets();
  const user = useUser();

  return {
    // Financial summary
    totalIncome: transactions.totalIncome,
    totalExpenses: transactions.totalExpenses,
    netIncome: transactions.currentBalance,
    
    // Budget summary
    totalBudgeted: budgets.totalBudgetAmount,
    totalSpent: budgets.totalSpent,
    budgetUtilization: budgets.budgetUtilization,
    
    // Alerts and warnings
    budgetAlerts: budgets.alerts,
    hasExceededBudgets: budgets.getExceededBudgets().length > 0,
    hasNearLimitBudgets: budgets.getNearLimitBudgets().length > 0,
    
    // Formatted values
    formatCurrency: user.formatCurrency,
    
    // Trends (basic calculation)
    getSpendingTrend: () => {
      const thisMonth = transactions.totalExpenses;
      // This would ideally compare to previous month
      return {
        current: thisMonth,
        trend: 'stable', // 'up', 'down', 'stable'
        percentage: 0
      };
    },
    
    // Financial health score (basic implementation)
    getFinancialHealthScore: () => {
      const income = transactions.totalIncome;
      const expenses = transactions.totalExpenses;
      const budgetUtilization = budgets.budgetUtilization;
      
      if (income === 0) return { score: 0, status: 'needs_setup' };
      
      const savingsRate = ((income - expenses) / income) * 100;
      const budgetCompliance = 100 - budgetUtilization;
      
      const score = Math.round((savingsRate * 0.6) + (budgetCompliance * 0.4));
      
      let status = 'poor';
      if (score >= 80) status = 'excellent';
      else if (score >= 60) status = 'good';
      else if (score >= 40) status = 'fair';
      
      return { score: Math.max(0, Math.min(100, score)), status };
    }
  };
};

/**
 * Hook for dashboard-specific data and actions
 * Optimized for dashboard components
 */
export const useDashboard = () => {
  const appData = useAppData();
  const financialOverview = useFinancialOverview();

  return {
    // All app data
    ...appData,
    
    // Financial overview
    financial: financialOverview,
    
    // Dashboard-specific computed values
    summary: {
      totalTransactions: appData.transactions.recent.length,
      activeBudgets: appData.budgets.overview.filter(b => b.isActive).length,
      categoriesUsed: appData.categories.mostUsed.length,
      alertsCount: appData.budgets.alerts.length
    },
    
    // Recent activity
    recentActivity: appData.transactions.recent.slice(0, 5).map(transaction => ({
      ...transaction,
      formattedAmount: appData.user.formatCurrency(transaction.amount),
      formattedDate: appData.user.formatDate(transaction.date)
    })),
    
    // Widget data
    widgets: {
      balance: {
        current: financialOverview.netIncome,
        formatted: appData.user.formatCurrency(financialOverview.netIncome),
        trend: financialOverview.getSpendingTrend()
      },
      budgets: {
        total: appData.budgets.overview.length,
        exceeded: appData.budgets.getExceededBudgets().length,
        nearLimit: appData.budgets.getNearLimitBudgets().length
      },
      healthScore: financialOverview.getFinancialHealthScore()
    }
  };
};

// Default export provides access to all individual hooks
export default {
  useAppContext,
  useTransactions,
  useBudgets,
  useCategories,
  useUser,
  useAppData,
  useFinancialOverview,
  useDashboard
};