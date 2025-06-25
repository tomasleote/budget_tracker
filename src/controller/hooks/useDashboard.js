import { useMemo, useCallback } from 'react';
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

// Basic icon constants
const COMMON_ICONS = {
  SUCCESS: 'check-circle',
  WARNING: 'exclamation-triangle',
  ERROR: 'times-circle',
  INFO: 'info-circle',
  INCOME: 'arrow-up',
  EXPENSE: 'arrow-down'
};

// Basic utility functions
const calculateBalance = (transactions = []) => {
  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
  return { income, expenses, balance: income - expenses };
};

// Calculate balance for current month only
const calculateCurrentMonthBalance = (transactions = []) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  });
  
  return calculateBalance(currentMonthTransactions);
};

const calculateSpendingByCategory = (transactions = [], type = 'expense') => {
  const categoryMap = {};
  transactions
    .filter(t => t.type === type)
    .forEach(t => {
      const category = t.category || 'Other';
      if (!categoryMap[category]) {
        categoryMap[category] = { amount: 0, count: 0 };
      }
      categoryMap[category].amount += (t.amount || 0);
      categoryMap[category].count += 1;
    });
  
  return Object.entries(categoryMap)
    .map(([category, data]) => ({ 
      category, 
      amount: data.amount, 
      transactionCount: data.count 
    }))
    .sort((a, b) => b.amount - a.amount);
};

// Calculate spending by category for current month only
const calculateCurrentMonthSpendingByCategory = (transactions = [], type = 'expense') => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  });
  
  return calculateSpendingByCategory(currentMonthTransactions, type);
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
 * Enhanced Dashboard Controller Hook - Performance Optimized - LOGGING CLEANED
 * 
 * Aggregates data from multiple contexts for dashboard views
 * Uses utility functions for formatting and calculations
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * - Uses stable primitive values and hashes instead of entire context objects in dependencies
 * - Memoizes all computed values (summary, recentActivity, etc.) with stable dependencies
 * - Eliminates circular dependencies between computed values
 * - Memoizes actions and utils objects to prevent recreation
 * - Uses hash-based change detection for complex arrays
 * 
 * LOGGING CLEANUP:
 * - Removed excessive debug logs in development mode
 * - Only keep essential error logs and major operation logs
 * - Reduced verbosity in refresh operations
 * 
 * This prevents unnecessary re-renders and cascade recalculations.
 */
export const useDashboard = () => {
  // Get all required contexts
  const transactionContext = useTransactionContext();
  const budgetContext = useBudgetContext();
  const categoryContext = useCategoryContext();
  const userContext = useUserContext();

  // Extract stable primitive values to prevent unnecessary re-renders
  const transactionCount = transactionContext.transactions?.length || 0;
  const budgetCount = budgetContext.budgets?.length || 0;
  const alertCount = budgetContext.alerts?.length || 0;
  const overviewCount = budgetContext.overview?.length || 0;
  const categoryCount = categoryContext.categories?.length || 0;
  const recentTransactionCount = transactionContext.recentTransactions?.length || 0;

  // Create stable hashes for complex arrays to detect real changes
  const transactionHash = useMemo(() => {
    const transactions = transactionContext.transactions || [];
    return transactions.map(t => `${t.id}-${t.amount}-${t.type}-${t.category}-${t.date}`).sort().join('|');
  }, [transactionContext.transactions]);

  const budgetHash = useMemo(() => {
    const budgets = budgetContext.budgets || [];
    return budgets.map(b => `${b.id}-${b.budgetAmount}-${b.category}-${b.isActive}`).sort().join('|');
  }, [budgetContext.budgets]);

  const alertHash = useMemo(() => {
    const alerts = budgetContext.alerts || [];
    return alerts.map(a => `${a.id || a.category}-${a.type}`).sort().join('|');
  }, [budgetContext.alerts]);

  const overviewHash = useMemo(() => {
    const overview = budgetContext.overview || [];
    return overview.map(o => `${o.id}-${o.progress?.spent || 0}-${o.progress?.percentage || 0}`).sort().join('|');
  }, [budgetContext.overview]);

  const recentTransactionHash = useMemo(() => {
    const recent = transactionContext.recentTransactions || [];
    return recent.map(t => `${t.id}-${t.amount}-${t.date}`).sort().join('|');
  }, [transactionContext.recentTransactions]);

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
    // Use function references directly since they should be stable
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
    // Use function references directly since they should be stable
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
      
      // Use current month balance for Quick Stats
      const currentMonthBalance = calculateCurrentMonthBalance(transactions);
      // Use all-time balance for other calculations
      const allTimeBalance = calculateBalance(transactions);

      return {
        totalTransactions: transactions.length,
        totalBudgets: budgets.length,
        activeBudgets: budgets.filter(b => b.isActive).length,
        totalCategories: categories.length,
        activeCategories: categories.filter(c => c.isActive).length,
        
        // Enhanced financial summary with formatting - CURRENT MONTH DATA
        totalIncome: currentMonthBalance.income,
        totalExpenses: currentMonthBalance.expenses,
        currentBalance: currentMonthBalance.balance,
        formattedIncome: formatCurrency(currentMonthBalance.income),
        formattedExpenses: formatCurrency(currentMonthBalance.expenses),
        formattedBalance: formatCurrency(currentMonthBalance.balance),
        
        // All-time data for other components
        allTimeIncome: allTimeBalance.income,
        allTimeExpenses: allTimeBalance.expenses,
        allTimeBalance: allTimeBalance.balance,
        
        // Budget summary with enhanced data
        budgetAlerts: budgetContext.alerts?.length || 0,
        exceededBudgets: budgetContext.alerts?.filter(a => a.type === 'exceeded').length || 0,
        nearLimitBudgets: budgetContext.alerts?.filter(a => a.type === 'near_limit').length || 0,
        
        // Additional metrics - using current month data
        savingsRate: currentMonthBalance.income > 0 ? ((currentMonthBalance.income - currentMonthBalance.expenses) / currentMonthBalance.income * 100) : 0,
        isPositiveBalance: currentMonthBalance.balance >= 0,
        balanceIcon: currentMonthBalance.balance >= 0 ? COMMON_ICONS.SUCCESS : COMMON_ICONS.WARNING,
        
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
    // Use stable primitive counts and hashes instead of entire objects
    transactionCount,
    transactionHash,
    budgetCount,
    budgetHash,
    alertCount,
    alertHash,
    overviewCount,
    overviewHash,
    categoryCount
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
    // Use stable count and hash instead of entire arrays
    recentTransactionCount,
    recentTransactionHash
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
  }, [
    // Use stable count and hash instead of entire arrays
    overviewCount,
    overviewHash
  ]);

  // Enhanced category breakdown data using utilities - CURRENT MONTH ONLY
  const categoryBreakdown = useMemo(() => {
    return safeExecute(() => {
      const transactions = transactionContext.transactions || [];
      const breakdown = calculateCurrentMonthSpendingByCategory(transactions, 'expense');
      
      // Calculate current month expenses for percentage calculations
      const currentMonthBalance = calculateCurrentMonthBalance(transactions);
      const totalExpenses = currentMonthBalance.expenses;

      return breakdown.map(category => {
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
          percentage: totalExpenses > 0 ? (category.amount / totalExpenses * 100) : 0,
          formattedPercentage: totalExpenses > 0 ? 
            formatPercentage(category.amount / totalExpenses * 100) : '0%'
        };
      });
    }, []);
  }, [
    // Use stable transaction hash instead of depending on summary (avoids circular dependency)
    transactionCount,
    transactionHash
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
  }, [summary]); // Now depends on stable summary

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
  }, [
    // Use stable counts and hashes instead of entire arrays
    transactionCount,
    transactionHash,
    budgetCount,
    budgetHash
  ]);

  // Memoized dashboard actions to prevent recreation
  const actions = useMemo(() => ({
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
        console.log('🔄 Dashboard refresh triggered...');
        
        const promises = [];
        if (transactionContext.actions?.loadTransactions) promises.push(transactionContext.actions.loadTransactions());
        if (budgetContext.actions?.loadBudgets) promises.push(budgetContext.actions.loadBudgets());
        if (categoryContext.actions?.loadCategories) promises.push(categoryContext.actions.loadCategories());
        
        await Promise.all(promises);
        
        // Wait a bit then refresh budget overview and alerts
        setTimeout(async () => {
          console.log('🔄 Refreshing budget overview and alerts...');
          if (budgetContext.actions?.loadOverview) await budgetContext.actions.loadOverview();
          if (budgetContext.actions?.loadAlerts) await budgetContext.actions.loadAlerts();
        }, 200);
        
        // Also dispatch a force sync event
        window.dispatchEvent(new CustomEvent('forceDataSync'));
        
        console.log('✅ Dashboard refresh complete');
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
  }), [
    // Actions depend on context action functions which should be stable
    transactionContext.actions,
    budgetContext.actions,
    categoryContext.actions,
    userContext.actions
  ]);

  // Memoized utility functions to prevent recreation
  const utils = useMemo(() => ({
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
  }), [
    // Utils depend on summary and financialHealth which are now stable
    summary,
    financialHealth,
    transactionCount,
    transactionHash
  ]);

  // Memoized context references for simplified access
  const contexts = useMemo(() => ({
    transactions: transactionContext,
    budgets: budgetContext,
    categories: categoryContext,
    user: userContext
  }), [transactionContext, budgetContext, categoryContext, userContext]);

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
    contexts
  };
};

export default useDashboard;
