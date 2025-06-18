import { useMemo } from 'react';
import { useTransactionContext } from '../context/TransactionContext.jsx';
import { useBudgetContext } from '../context/BudgetContext.jsx';
import { useCategoryContext } from '../context/CategoryContext.jsx';
import { useUserContext } from '../context/UserContext.jsx';
import {
  formatCurrency,
  formatDate,
  formatPercentage
} from '../utils/index.js';

// Safe fallback functions for missing utilities
const safeExecute = (fn, fallback) => {
  try {
    return fn();
  } catch (error) {
    console.warn('Safe execute error:', error);
    return fallback;
  }
};

const asyncSafeExecute = async (fn, fallback) => {
  try {
    return await fn();
  } catch (error) {
    console.warn('Async safe execute error:', error);
    return fallback;
  }
};

// Basic icon constants
const COMMON_ICONS = {
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  INFO: 'info',
  INCOME: 'income',
  EXPENSE: 'expense'
};

// Basic utility functions
const calculateBalance = (transactions = []) => {
  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
  return { income, expenses, balance: income - expenses };
};

const calculateSpendingByCategory = (transactions = [], type = 'expense') => {
  const categoryMap = {};
  transactions
    .filter(t => t.type === type)
    .forEach(t => {
      const category = t.category || 'Other';
      categoryMap[category] = (categoryMap[category] || 0) + (t.amount || 0);
    });
  
  return Object.entries(categoryMap)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
};

const calculateFinancialHealthScore = (transactions = [], budgets = []) => {
  // Basic financial health calculation
  const balance = calculateBalance(transactions);
  const savingsRate = balance.income > 0 ? ((balance.income - balance.expenses) / balance.income * 100) : 0;
  
  let score = 50; // Base score
  
  // Adjust based on savings rate
  if (savingsRate >= 20) score += 30;
  else if (savingsRate >= 10) score += 15;
  else if (savingsRate < 0) score -= 20;
  
  // Adjust based on budget adherence
  const budgetScore = budgets.length > 0 ? 20 : 0;
  score += budgetScore;
  
  score = Math.max(0, Math.min(100, score));
  
  const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';
  
  return {
    score,
    grade,
    factors: { savingsRate, budgetAdherence: budgetScore },
    recommendations: []
  };
};

/**
 * Enhanced Dashboard Controller Hook
 * Aggregates data from multiple contexts for dashboard views
 * Uses utility functions for formatting and calculations
 */
export const useDashboard = () => {
  // Get all required contexts
  const transactionContext = useTransactionContext();
  const budgetContext = useBudgetContext();
  const categoryContext = useCategoryContext();
  const userContext = useUserContext();

  // Aggregate loading states using utilities
  const isLoading = useMemo(() => {
    return safeExecute(() => {
      return (
        (typeof transactionContext.isLoading === 'function' ? transactionContext.isLoading() : transactionContext.isLoading) ||
        (typeof budgetContext.isLoading === 'function' ? budgetContext.isLoading() : budgetContext.isLoading) ||
        (typeof categoryContext.isLoading === 'function' ? categoryContext.isLoading() : categoryContext.isLoading) ||
        (typeof userContext.isLoading === 'function' ? userContext.isLoading() : userContext.isLoading)
      );
    }, false);
  }, [
    transactionContext.isLoading,
    budgetContext.isLoading, 
    categoryContext.isLoading,
    userContext.isLoading
  ]);

  // Aggregate error states using utilities
  const hasErrors = useMemo(() => {
    return safeExecute(() => {
      return (
        (typeof transactionContext.hasError === 'function' ? transactionContext.hasError() : transactionContext.hasError) ||
        (typeof budgetContext.hasError === 'function' ? budgetContext.hasError() : budgetContext.hasError) ||
        (typeof categoryContext.hasError === 'function' ? categoryContext.hasError() : categoryContext.hasError) ||
        (typeof userContext.hasError === 'function' ? userContext.hasError() : userContext.hasError)
      );
    }, false);
  }, [
    transactionContext.hasError,
    budgetContext.hasError,
    categoryContext.hasError,
    userContext.hasError
  ]);

  // Enhanced dashboard summary data using utilities
  const summary = useMemo(() => {
    return safeExecute(() => {
      const transactions = transactionContext.transactions || [];
      const budgets = budgetContext.budgets || [];
      const categories = categoryContext.categories || [];
      const balance = calculateBalance(transactions);

      return {
        totalTransactions: transactions.length,
        totalBudgets: budgets.length,
        activeBudgets: budgets.filter(b => b.isActive).length,
        totalCategories: categories.length,
        activeCategories: categories.filter(c => c.isActive).length,
        
        // Enhanced financial summary with formatting
        totalIncome: balance.income,
        totalExpenses: balance.expenses,
        currentBalance: balance.balance,
        formattedIncome: formatCurrency(balance.income),
        formattedExpenses: formatCurrency(balance.expenses),
        formattedBalance: formatCurrency(balance.balance),
        
        // Budget summary with enhanced data
        budgetAlerts: budgetContext.alerts?.length || 0,
        exceededBudgets: budgetContext.alerts?.filter(a => a.type === 'exceeded').length || 0,
        nearLimitBudgets: budgetContext.alerts?.filter(a => a.type === 'near_limit').length || 0,
        
        // Additional metrics
        savingsRate: balance.income > 0 ? ((balance.income - balance.expenses) / balance.income * 100) : 0,
        isPositiveBalance: balance.balance >= 0,
        balanceIcon: balance.balance >= 0 ? COMMON_ICONS.SUCCESS : COMMON_ICONS.WARNING,
        
        // Budget overview for dashboard components
        budgetOverview: budgetContext.overview || []
      };
    }, {
      totalTransactions: 0,
      totalBudgets: 0,
      activeBudgets: 0,
      totalCategories: 0,
      activeCategories: 0,
      totalIncome: 0,
      totalExpenses: 0,
      currentBalance: 0,
      formattedIncome: formatCurrency(0),
      formattedExpenses: formatCurrency(0),
      formattedBalance: formatCurrency(0),
      budgetAlerts: 0,
      exceededBudgets: 0,
      nearLimitBudgets: 0,
      savingsRate: 0,
      isPositiveBalance: true,
      balanceIcon: COMMON_ICONS.INFO,
      budgetOverview: []
    });
  }, [
    transactionContext.transactions,
    budgetContext.budgets,
    budgetContext.alerts,
    categoryContext.categories
  ]);

  // Enhanced recent activity data using utilities
  const recentActivity = useMemo(() => {
    return safeExecute(() => {
      const recentTransactions = transactionContext.recentTransactions || [];

      return recentTransactions.slice(0, 5).map(transaction => {
        const category = (typeof categoryContext.getCategoryById === 'function') 
          ? categoryContext.getCategoryById(transaction.category) 
          : null;
        return {
          ...transaction,
          formattedAmount: formatCurrency(transaction.amount || 0),
          absoluteAmount: formatCurrency(Math.abs(transaction.amount || 0)),
          formattedDate: formatDate(transaction.date),
          categoryName: category?.name || transaction.category || 'Other',
          categoryIcon: 'icon',
          categoryColor: category?.color || '#4ECDC4',
          typeIcon: transaction.type,
          isToday: false,
          isRecent: true
        };
      });
    }, []);
  }, [
    transactionContext.recentTransactions,
    categoryContext.getCategoryById
  ]);

  // Enhanced budget overview data using utilities
  const budgetOverview = useMemo(() => {
    return safeExecute(() => {
      const overview = budgetContext.overview || [];

      return overview.map(budget => {
        const percentage = budget.progress?.spent && budget.budgetAmount 
          ? (budget.progress.spent / budget.budgetAmount * 100) 
          : 0;
        
        return {
          ...budget,
          formattedBudget: formatCurrency(budget.budgetAmount || 0),
          formattedSpent: formatCurrency(budget.progress?.spent || 0),
          formattedRemaining: formatCurrency(budget.progress?.remaining || budget.budgetAmount || 0),
          progressPercentage: percentage,
          progressStatus: percentage > 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'good',
          isExceeded: percentage > 100,
          isNearLimit: percentage >= 80 && percentage <= 100,
          statusIcon: 'icon',
          categoryIcon: 'icon',
          progressBar: {
            percentage: Math.min(percentage, 100),
            color: percentage > 100 ? '#FF4D4F' : percentage >= 80 ? '#FA8C16' : '#52C41A'
          }
        };
      });
    }, []);
  }, [budgetContext.overview]);

  // Enhanced category breakdown data using utilities
  const categoryBreakdown = useMemo(() => {
    return safeExecute(() => {
      const transactions = transactionContext.transactions || [];
      const breakdown = calculateSpendingByCategory(transactions, 'expense');

      return breakdown.slice(0, 5).map(category => {
        const categoryInfo = (typeof categoryContext.getCategoryById === 'function') 
          ? categoryContext.getCategoryById(category.category) 
          : null;
        return {
          ...category,
          formattedAmount: formatCurrency(category.amount),
          categoryInfo,
          categoryName: categoryInfo?.name || category.category,
          categoryIcon: 'icon',
          categoryColor: categoryInfo?.color || '#4ECDC4',
          percentage: summary.totalExpenses > 0 ? (category.amount / summary.totalExpenses * 100) : 0,
          formattedPercentage: summary.totalExpenses > 0 ? 
            formatPercentage(category.amount / summary.totalExpenses * 100) : '0%'
        };
      });
    }, []);
  }, [
    transactionContext.transactions,
    categoryContext.getCategoryById,
    summary.totalExpenses
  ]);

  // Enhanced quick stats for dashboard widgets using utilities
  const quickStats = useMemo(() => {
    return safeExecute(() => {
      return {
        balance: {
          amount: summary.currentBalance,
          formatted: summary.formattedBalance,
          isPositive: summary.isPositiveBalance,
          icon: summary.balanceIcon,
          trend: 'stable',
          trendIcon: 'stable'
        },
        
        monthlyIncome: {
          amount: summary.totalIncome,
          formatted: summary.formattedIncome,
          icon: COMMON_ICONS.INCOME,
          trend: 'stable',
          trendIcon: 'stable'
        },
        
        monthlyExpenses: {
          amount: summary.totalExpenses,
          formatted: summary.formattedExpenses,
          icon: COMMON_ICONS.EXPENSE,
          trend: 'stable',
          trendIcon: 'stable'
        },
        
        budgetStatus: {
          total: summary.totalBudgets,
          active: summary.activeBudgets,
          alerts: summary.budgetAlerts,
          exceeded: summary.exceededBudgets,
          nearLimit: summary.nearLimitBudgets,
          hasIssues: summary.budgetAlerts > 0,
          icon: summary.budgetAlerts > 0 ? COMMON_ICONS.WARNING : COMMON_ICONS.SUCCESS
        },

        savingsRate: {
          percentage: summary.savingsRate,
          formatted: formatPercentage(summary.savingsRate),
          icon: summary.savingsRate >= 20 ? COMMON_ICONS.SUCCESS : 
                summary.savingsRate >= 10 ? COMMON_ICONS.WARNING : COMMON_ICONS.ERROR,
          status: summary.savingsRate >= 20 ? 'excellent' : 
                  summary.savingsRate >= 10 ? 'good' : 'poor'
        }
      };
    }, {
      balance: { amount: 0, formatted: formatCurrency(0), isPositive: true, icon: COMMON_ICONS.INFO },
      monthlyIncome: { amount: 0, formatted: formatCurrency(0), icon: COMMON_ICONS.INCOME },
      monthlyExpenses: { amount: 0, formatted: formatCurrency(0), icon: COMMON_ICONS.EXPENSE },
      budgetStatus: { total: 0, active: 0, alerts: 0, exceeded: 0, nearLimit: 0, hasIssues: false, icon: COMMON_ICONS.INFO },
      savingsRate: { percentage: 0, formatted: formatPercentage(0), icon: COMMON_ICONS.INFO, status: 'poor' }
    });
  }, [summary]);

  // Enhanced financial health score using utilities
  const financialHealth = useMemo(() => {
    return safeExecute(() => {
      const transactions = transactionContext.transactions || [];
      const budgets = budgetContext.budgets || [];
      const healthData = calculateFinancialHealthScore(transactions, budgets);
      
      return {
        ...healthData,
        formattedScore: `${healthData.score}/100`,
        statusIcon: healthData.score >= 80 ? COMMON_ICONS.SUCCESS :
                   healthData.score >= 60 ? COMMON_ICONS.WARNING : COMMON_ICONS.ERROR,
        statusColor: healthData.score >= 80 ? '#52C41A' :
                    healthData.score >= 60 ? '#FAAD14' : '#FF4D4F'
      };
    }, {
      score: 0,
      grade: 'F',
      formattedScore: '0/100',
      statusIcon: COMMON_ICONS.ERROR,
      statusColor: '#FF4D4F',
      factors: {},
      recommendations: []
    });
  }, [transactionContext.transactions, budgetContext.budgets]);

  // Simplified dashboard actions
  const actions = {
    addExpense: async (amount, category, description = '') => {
      return asyncSafeExecute(async () => {
        if (transactionContext.actions && transactionContext.actions.createTransaction) {
          return await transactionContext.actions.createTransaction({
            type: 'expense',
            amount,
            category,
            description,
            date: new Date().toISOString()
          });
        }
        return null;
      }, null);
    },

    addIncome: async (amount, category, description = '') => {
      return asyncSafeExecute(async () => {
        if (transactionContext.actions && transactionContext.actions.createTransaction) {
          return await transactionContext.actions.createTransaction({
            type: 'income',
            amount,
            category,
            description,
            date: new Date().toISOString()
          });
        }
        return null;
      }, null);
    },

    createQuickBudget: async (category, amount) => {
      return asyncSafeExecute(async () => {
        if (budgetContext.actions && budgetContext.actions.createBudget) {
          return await budgetContext.actions.createBudget({
            category,
            budgetAmount: amount,
            period: 'monthly',
            isActive: true,
            startDate: new Date().toISOString(),
            endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
          });
        }
        return null;
      }, null);
    },

    refreshDashboard: async () => {
      return asyncSafeExecute(async () => {
        const promises = [];
        if (transactionContext.actions?.loadTransactions) promises.push(transactionContext.actions.loadTransactions());
        if (budgetContext.actions?.loadBudgets) promises.push(budgetContext.actions.loadBudgets());
        if (categoryContext.actions?.loadCategories) promises.push(categoryContext.actions.loadCategories());
        
        await Promise.all(promises);
      }, null);
    },

    clearAllErrors: () => {
      safeExecute(() => {
        if (transactionContext.actions?.clearErrors) transactionContext.actions.clearErrors();
        if (budgetContext.actions?.clearErrors) budgetContext.actions.clearErrors();
        if (categoryContext.actions?.clearErrors) categoryContext.actions.clearErrors();
        if (userContext.actions?.clearErrors) userContext.actions.clearErrors();
      });
    }
  };

  // Simplified utility functions
  const utils = {
    formatCurrency: (amount) => formatCurrency(amount),
    formatDate: (date) => formatDate(date),
    
    getSpendingTrend: () => {
      return safeExecute(() => {
        const currentExpenses = summary.totalExpenses;
        return {
          current: currentExpenses,
          formatted: formatCurrency(currentExpenses),
          trend: 'stable',
          percentage: 0,
          icon: 'stable'
        };
      }, {
        current: 0,
        formatted: formatCurrency(0),
        trend: 'stable',
        percentage: 0,
        icon: 'stable'
      });
    },

    getFinancialHealthScore: () => financialHealth,

    getCurrentMonthData: () => {
      return safeExecute(() => {
        const transactions = transactionContext.transactions || [];
        const monthlyBalance = calculateBalance(transactions);
        
        return {
          transactions: transactions.length,
          income: monthlyBalance.income,
          expenses: monthlyBalance.expenses,
          balance: monthlyBalance.balance,
          formattedIncome: formatCurrency(monthlyBalance.income),
          formattedExpenses: formatCurrency(monthlyBalance.expenses),
          formattedBalance: formatCurrency(monthlyBalance.balance)
        };
      }, {
        transactions: 0,
        income: 0,
        expenses: 0,
        balance: 0,
        formattedIncome: formatCurrency(0),
        formattedExpenses: formatCurrency(0),
        formattedBalance: formatCurrency(0)
      });
    },

    getFinancialInsights: () => {
      return safeExecute(() => {
        const insights = [];
        
        if (summary.savingsRate < 10) {
          insights.push({
            type: 'warning',
            icon: COMMON_ICONS.WARNING,
            title: 'Low Savings Rate',
            message: `Your savings rate is ${formatPercentage(summary.savingsRate)}. Consider reducing expenses.`,
            action: 'Review your budget and find areas to cut back.'
          });
        }

        if (summary.budgetAlerts > 0) {
          insights.push({
            type: 'error',
            icon: COMMON_ICONS.ERROR,
            title: 'Budget Alerts',
            message: `You have ${summary.budgetAlerts} budget alert${summary.budgetAlerts > 1 ? 's' : ''}.`,
            action: 'Review your budgets and adjust spending.'
          });
        }

        return insights;
      }, []);
    }
  };

  return {
    // Data
    summary,
    recentActivity,
    budgetOverview,
    categoryBreakdown,
    quickStats,
    financialHealth,
    
    // State
    isLoading,
    hasErrors,
    
    // Actions
    actions,
    
    // Utilities
    utils,
    
    // Simplified context access
    contexts: {
      transactions: transactionContext,
      budgets: budgetContext,
      categories: categoryContext,
      user: userContext
    }
  };
};

export default useDashboard;
