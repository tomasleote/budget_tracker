import { useMemo, useCallback } from 'react';
import { useTransactionContext } from '../context/providers/TransactionProvider.jsx';
import { useBudgetContext } from '../context/providers/BudgetProvider.jsx';
import { useCategoryContext } from '../context/providers/CategoryProvider.jsx';
import { useUserContext } from '../context/UserContext.jsx';
import {
  formatCurrency,
  formatDate,
  formatPercentage
} from '../utils/index.js';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';

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

// Calculate balance for last 30 days (rolling window)
const calculateLast30DaysBalance = (transactions = []) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const last30DaysTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= thirtyDaysAgo && transactionDate <= now;
  });
  
  return calculateBalance(last30DaysTransactions);
};

// FIX BUG #2: Calculate balance for the last FULL calendar month
// Today = Nov 5, 2025 → Last full month = October 2025 (Oct 1 - Oct 31)
const calculateLastFullMonthBalance = (transactions = []) => {
  const now = new Date();
  
  // Get the first day of the current month
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Get the last full month by going back one month from current month start
  const lastFullMonthStart = new Date(currentMonthStart);
  lastFullMonthStart.setMonth(lastFullMonthStart.getMonth() - 1);
  
  // Get the last day of the last full month (one day before current month starts)
  const lastFullMonthEnd = new Date(currentMonthStart);
  lastFullMonthEnd.setDate(lastFullMonthEnd.getDate() - 1);
  lastFullMonthEnd.setHours(23, 59, 59, 999);
  
  console.log('📅 Last Full Month Calculation:', {
    today: now.toISOString().split('T')[0],
    lastFullMonthStart: lastFullMonthStart.toISOString().split('T')[0],
    lastFullMonthEnd: lastFullMonthEnd.toISOString().split('T')[0],
    monthName: lastFullMonthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  });
  
  const lastFullMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= lastFullMonthStart && transactionDate <= lastFullMonthEnd;
  });
  
  console.log(`  - Filtered ${lastFullMonthTransactions.length} transactions for last full month`);
  
  const balance = calculateBalance(lastFullMonthTransactions);
  
  return {
    ...balance,
    monthName: lastFullMonthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    startDate: lastFullMonthStart,
    endDate: lastFullMonthEnd
  };
};

// Helper to get last full month name for display
const getLastFullMonthName = () => {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return lastMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const calculateSpendingByCategory = (transactions = [], type = 'expense') => {
  const categoryMap = {};
  console.log('🔍 DEBUG - calculateSpendingByCategory input:', { transactionCount: transactions.length, type });
  
  transactions
    .filter(t => t.type === type)
    .forEach(t => {
      // Try different ways to get category identifier
      const category = t.category?.name || t.category?.id || t.categoryId || t.category_id || t.category || 'Other';
      
      console.log(`  - Transaction ${t.id}: category = '${category}', raw category data:`, {
        't.category': t.category,
        't.categoryId': t.categoryId,
        't.category_id': t.category_id,
        'extracted': category
      });
      
      if (!categoryMap[category]) {
        categoryMap[category] = { amount: 0, count: 0 };
      }
      categoryMap[category].amount += (t.amount || 0);
      categoryMap[category].count += 1;
    });
  
  const result = Object.entries(categoryMap)
    .map(([category, data]) => ({ 
      category, 
      amount: data.amount, 
      transactionCount: data.count 
    }))
    .sort((a, b) => b.amount - a.amount);
    
  console.log('  - Final category breakdown result:', result);
  return result;
};

// Hook for dashboard data processing
export const useDashboard = () => {
  // Context hooks
  const { transactions, summary: transactionSummary, isLoading: transactionsLoading } = useTransactionContext();
  const { budgets, isLoading: budgetsLoading } = useBudgetContext();
  const { categories, isLoading: categoriesLoading, getCategoryById } = useCategoryContext();
  const { user } = useUserContext();

  // Loading state
  const isLoading = transactionsLoading || budgetsLoading || categoriesLoading;

  // Calculate financial summary
  const summary = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      console.log('🔍 DEBUG - Dashboard summary calculation:');
      console.log('  - Total transactions: 0');
      console.log('  - All-time balance: {income: 0, expenses: 0, balance: 0}');
      console.log('  - Last full month balance: {income: 0, expenses: 0, balance: 0}');
      
      return {
        totalTransactions: 0,
        totalBudgets: budgets?.length || 0,
        allTimeIncome: 0,
        allTimeExpenses: 0,
        allTimeBalance: 0,
        currentBalance: 0,
        currentMonthIncome: 0,
        currentMonthExpenses: 0,
        currentMonthBalance: 0,
        currentMonthName: getLastFullMonthName(),
        // FIX BUG #2: totalIncome and totalExpenses now use last full month data
        totalIncome: 0,
        totalExpenses: 0,
        formattedBalance: formatCurrency(0),
        formattedIncome: formatCurrency(0),
        formattedExpenses: formatCurrency(0),
        isPositiveBalance: true,
        savingsRate: 0
      };
    }

    const allTimeBalance = calculateBalance(transactions);
    const lastFullMonthBalance = calculateLastFullMonthBalance(transactions);
    
    console.log('🔍 DEBUG - Dashboard summary calculation:');
    console.log('  - Total transactions:', transactions.length);
    console.log('  - All-time balance:', allTimeBalance);
    console.log('  - Last full month balance:', lastFullMonthBalance);

    // Calculate savings rate based on last full month
    const savingsRate = lastFullMonthBalance.income > 0 
      ? ((lastFullMonthBalance.income - lastFullMonthBalance.expenses) / lastFullMonthBalance.income) * 100 
      : 0;

    return {
      totalTransactions: transactions.length,
      totalBudgets: budgets?.length || 0,
      allTimeIncome: allTimeBalance.income,
      allTimeExpenses: allTimeBalance.expenses,
      allTimeBalance: allTimeBalance.balance,
      // FIX BUG #2: currentBalance, totalIncome, totalExpenses now use LAST FULL MONTH
      currentBalance: lastFullMonthBalance.balance,
      currentMonthIncome: lastFullMonthBalance.income,
      currentMonthExpenses: lastFullMonthBalance.expenses,
      currentMonthBalance: lastFullMonthBalance.balance,
      currentMonthName: lastFullMonthBalance.monthName,
      startDate: lastFullMonthBalance.startDate, // FIX BUG #2: Export dates
      endDate: lastFullMonthBalance.endDate, // FIX BUG #2: Export dates
      // These are for BalanceCard widget - using last full month data
      totalIncome: lastFullMonthBalance.income,
      totalExpenses: lastFullMonthBalance.expenses,
      formattedBalance: formatCurrency(lastFullMonthBalance.balance),
      formattedIncome: formatCurrency(lastFullMonthBalance.income),
      formattedExpenses: formatCurrency(lastFullMonthBalance.expenses),
      isPositiveBalance: lastFullMonthBalance.balance >= 0,
      savingsRate: savingsRate
    };
  }, [transactions, budgets]);

  // Recent activity calculation - Recent 5 transactions
  const recentActivity = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      console.log('🔍 DEBUG - Recent activity processing:');
      console.log('  - Recent transactions count: 0');
      console.log('  - Sample recent transaction: undefined');
      return [];
    }

    console.log('🔍 DEBUG - Recent activity processing:');
    console.log('  - Recent transactions count:', transactions.length);
    console.log('  - Sample recent transaction:', transactions[0]);

    // Sort by date descending and take first 5
    const sortedTransactions = [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    // Enrich with category information
    return sortedTransactions.map(transaction => {
      const categoryInfo = getCategoryById ? getCategoryById(transaction.categoryId || transaction.category_id) : null;
      
      console.log(`  - Processing recent transaction ${transaction.id}:`, {
        categoryId: transaction.categoryId,
        category_id: transaction.category_id,
        category: transaction.category,
        foundCategory: categoryInfo
      });
      
      return {
        ...transaction,
        categoryInfo: categoryInfo || { 
          id: transaction.categoryId || transaction.category_id || 'unknown', 
          name: 'Other', 
          icon: 'circle', 
          color: '#6B7280' 
        }
      };
    });
  }, [transactions, getCategoryById]);

  // Category breakdown analysis - FIX BUG #2: Filter by last full month
  const categoryBreakdown = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      console.log('🔍 DEBUG - Category breakdown detailed analysis:');
      console.log('  - Total transactions: 0');
      console.log('  - Sample transaction: undefined');
      console.log('  - Transaction categories: []');
      console.log('  - Total expenses for breakdown: 0');
      console.log('  - Category breakdown data: []');
      return [];
    }

    console.log('🔍 DEBUG - Category breakdown detailed analysis:');
    console.log('  - Total transactions:', transactions.length);
    console.log('  - Sample transaction:', transactions[0]);
    
    // FIX BUG #2: Filter transactions to last full month only
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastFullMonthStart = new Date(currentMonthStart);
    lastFullMonthStart.setMonth(lastFullMonthStart.getMonth() - 1);
    const lastFullMonthEnd = new Date(currentMonthStart);
    lastFullMonthEnd.setDate(lastFullMonthEnd.getDate() - 1);
    lastFullMonthEnd.setHours(23, 59, 59, 999);
    
    const lastMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= lastFullMonthStart && transactionDate <= lastFullMonthEnd;
    });
    
    console.log(`  - Filtered to ${lastMonthTransactions.length} transactions for ${getLastFullMonthName()}`);
    console.log('  - Transaction categories:', lastMonthTransactions.map(t => ({
      id: t.id,
      categoryId: t.categoryId,
      category_id: t.category_id,
      category: t.category
    })));

    const expenseBreakdown = calculateSpendingByCategory(lastMonthTransactions, 'expense');
    
    const totalExpenses = expenseBreakdown.reduce((sum, item) => sum + item.amount, 0);
    console.log('  - Total expenses for breakdown:', totalExpenses);
    console.log('  - Category breakdown data:', expenseBreakdown);
    
    // Map category IDs to category objects with full information
    const enrichedBreakdown = expenseBreakdown.map(item => {
      // Try to find the category by ID first, then by name
      const categoryInfo = getCategoryById ? getCategoryById(item.category) : null;
      
      console.log(`  - Processing category '${item.category}':`, {
        categoryInfo,
        originalCategory: item,
        getCategoryById: typeof getCategoryById
      });
      
      return {
        ...item,
        categoryInfo: categoryInfo || { 
          id: item.category, 
          name: item.category, 
          icon: 'circle', 
          color: '#6B7280' 
        }
      };
    });

    return enrichedBreakdown;
  }, [transactions, categories, getCategoryById]);

  // Quick stats for dashboard cards - FIXED: Return proper format for QuickStats component
  const quickStats = useMemo(() => {
    return safeExecute(() => {
      const stats = {
        // Balance with formatted value
        balance: {
          formatted: formatCurrency(summary.currentBalance),
          amount: summary.currentBalance,
          isPositive: summary.currentBalance >= 0,
          trend: 'stable'
        },
        // Monthly Income
        monthlyIncome: {
          formatted: formatCurrency(summary.currentMonthIncome),
          amount: summary.currentMonthIncome,
          trend: 'stable'
        },
        // Monthly Expenses
        monthlyExpenses: {
          formatted: formatCurrency(summary.currentMonthExpenses),
          amount: summary.currentMonthExpenses,
          trend: 'stable'
        },
        // Savings Rate
        savingsRate: {
          formatted: formatPercentage(summary.currentMonthIncome > 0 
            ? ((summary.currentMonthIncome - summary.currentMonthExpenses) / summary.currentMonthIncome) * 100 
            : 0),
          percentage: summary.currentMonthIncome > 0 
            ? ((summary.currentMonthIncome - summary.currentMonthExpenses) / summary.currentMonthIncome) * 100 
            : 0,
          status: summary.currentMonthIncome > 0 && summary.currentMonthExpenses < summary.currentMonthIncome ? 'good' : 'poor'
        },
        // Additional stats for other components
        totalBalance: summary.currentBalance,
        totalTransactions: summary.totalTransactions,
        totalBudgets: summary.totalBudgets,
        biggestExpenseCategory: categoryBreakdown[0] || null,
        averageTransactionAmount: summary.totalTransactions > 0 
          ? (summary.allTimeIncome + summary.allTimeExpenses) / summary.totalTransactions 
          : 0
      };

      return stats;
    }, {
      balance: { formatted: formatCurrency(0), amount: 0, isPositive: true, trend: 'stable' },
      monthlyIncome: { formatted: formatCurrency(0), amount: 0, trend: 'stable' },
      monthlyExpenses: { formatted: formatCurrency(0), amount: 0, trend: 'stable' },
      savingsRate: { formatted: formatPercentage(0), percentage: 0, status: 'poor' },
      totalBalance: 0,
      totalTransactions: 0,
      totalBudgets: 0,
      biggestExpenseCategory: null,
      averageTransactionAmount: 0
    });
  }, [summary, categoryBreakdown]);

  // Financial health indicators - FIXED: Add formatted values for QuickStats
  const financialHealth = useMemo(() => {
    return safeExecute(() => {
      // Calculate score based on multiple factors
      let score = 0;
      const indicators = {
        hasPositiveBalance: summary.currentBalance > 0,
        hasRegularIncome: summary.currentMonthIncome > 0,
        hasControlledSpending: summary.currentMonthExpenses < summary.currentMonthIncome,
        hasEmergencyFund: summary.currentBalance > (summary.currentMonthExpenses * 3),
        hasBudgets: (budgets?.length || 0) > 0
      };

      // Score calculation (out of 100)
      if (indicators.hasPositiveBalance) score += 20;
      if (indicators.hasRegularIncome) score += 20;
      if (indicators.hasControlledSpending) score += 30;
      if (indicators.hasEmergencyFund) score += 20;
      if (indicators.hasBudgets) score += 10;

      // Determine grade
      let grade = 'F';
      if (score >= 90) grade = 'A';
      else if (score >= 80) grade = 'B';
      else if (score >= 70) grade = 'C';
      else if (score >= 60) grade = 'D';

      const health = {
        score,
        formattedScore: `${score}/100`,
        grade,
        status: score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'warning' : 'poor',
        statusIcon: faChartLine,
        indicators,
        recommendations: []
      };

      // Add recommendations based on indicators
      if (!indicators.hasPositiveBalance) {
        health.recommendations.push('Consider reducing expenses or increasing income');
      }
      if (!indicators.hasBudgets) {
        health.recommendations.push('Create budgets to track your spending');
      }
      if (!indicators.hasEmergencyFund) {
        health.recommendations.push('Build an emergency fund covering 3-6 months of expenses');
      }

      return health;
    }, {
      score: 0,
      formattedScore: '0/100',
      grade: 'F',
      status: 'unknown',
      statusIcon: faChartLine,
      indicators: {},
      recommendations: []
    });
  }, [summary, budgets]);

  // Action functions
  const actions = useMemo(() => ({
    refreshDashboard: async () => {
      // Refresh logic would go here
      return true;
    },
    calculateProjections: (months = 6) => {
      return safeExecute(() => {
        const monthlyAverage = summary.currentMonthIncome - summary.currentMonthExpenses;
        return {
          projectedBalance: summary.currentBalance + (monthlyAverage * months),
          projectedSavings: monthlyAverage * months,
          months
        };
      }, { projectedBalance: 0, projectedSavings: 0, months });
    }
  }), [summary]);

  // Utility functions
  const utils = useMemo(() => ({
    formatCurrency: (amount) => formatCurrency ? formatCurrency(amount) : `$${amount.toFixed(2)}`,
    formatDate: (date) => formatDate ? formatDate(date) : new Date(date).toLocaleDateString(),
    formatPercentage: (value) => formatPercentage ? formatPercentage(value) : `${value.toFixed(1)}%`,
    getHealthColor: (score) => {
      if (score >= 80) return 'text-green-600';
      if (score >= 60) return 'text-yellow-600';
      return 'text-red-600';
    },
    getBalanceColor: (balance) => balance >= 0 ? 'text-green-600' : 'text-red-600'
  }), []);

  return {
    // Data
    summary,
    categoryBreakdown,
    recentActivity,
    quickStats,
    financialHealth,
    
    // State
    isLoading,
    
    // Time period info - FIX BUG #2: Expose month name and date range for widgets
    currentMonthName: summary.currentMonthName || getLastFullMonthName(),
    lastFullMonthStartDate: summary.startDate,
    lastFullMonthEndDate: summary.endDate,
    
    // Functions
    actions,
    utils
  };
};

export default useDashboard;
