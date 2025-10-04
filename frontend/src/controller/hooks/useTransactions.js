import { useTransactionContext } from '../context/providers/TransactionProvider.jsx';
import { useCategoryContext } from '../context/providers/CategoryProvider.jsx';
import { useUserContext } from '../context/UserContext.jsx';
import { useMemo } from 'react';
import { formatCurrency, formatDate } from '../utils/index.js';
import { faArrowUp, faArrowDown, faMinus, faChartLine } from '@fortawesome/free-solid-svg-icons';

// Simple safe execute function
const safeExecute = (fn, fallback) => {
  try {
    return fn();
  } catch (error) {
    console.warn('Safe execute error:', error);
    return fallback;
  }
};

/**
 * Simplified Transaction Controller Hook
 */
export const useTransactions = () => {
  const transactionContext = useTransactionContext();
  const categoryContext = useCategoryContext();
  const userContext = useUserContext();

  // Basic transaction data
  const transactions = useMemo(() => {
    return safeExecute(() => {
      return (transactionContext.transactions || []).map(transaction => {
        const category = (typeof categoryContext.getCategoryById === 'function') 
          ? categoryContext.getCategoryById(transaction.categoryId || transaction.category)
          : null;
        
        return {
          ...transaction,
          categoryInfo: category,
          categoryName: category?.name || transaction.category || 'Other',
          formattedAmount: formatCurrency(transaction.amount || 0),
          absoluteAmount: formatCurrency(Math.abs(transaction.amount || 0)),
          formattedDate: formatDate(transaction.date)
        };
      });
    }, []);
  }, [transactionContext.transactions, categoryContext.getCategoryById]);

  // Basic summary calculation
  const summary = useMemo(() => {
    return safeExecute(() => {
      const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
      const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
      const balance = income - expenses;
      
      return {
        income,
        expenses,
        balance,
        formattedIncome: formatCurrency(income),
        formattedExpenses: formatCurrency(expenses),
        formattedBalance: formatCurrency(balance),
        savingsRate: income > 0 ? ((income - expenses) / income * 100) : 0,
        isPositiveBalance: balance >= 0,
        balanceIcon: balance >= 0 ? faChartLine : faChartLine // Use chart icon for now
      };
    }, {
      income: 0,
      expenses: 0,
      balance: 0,
      formattedIncome: formatCurrency(0),
      formattedExpenses: formatCurrency(0),
      formattedBalance: formatCurrency(0),
      savingsRate: 0,
      isPositiveBalance: true,
      balanceIcon: faChartLine
    });
  }, [transactions]);

  // Basic category breakdown
  const categoryBreakdown = useMemo(() => {
    return safeExecute(() => {
      const categoryMap = {};
      transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
          const category = t.category || 'Other';
          categoryMap[category] = (categoryMap[category] || 0) + (t.amount || 0);
        });
      
      return Object.entries(categoryMap)
        .map(([category, amount]) => ({
          category,
          amount,
          formattedAmount: formatCurrency(amount)
        }))
        .sort((a, b) => b.amount - a.amount);
    }, []);
  }, [transactions]);

  // Basic helper functions
  const getTransactionsByDateRange = (startDate, endDate) => {
    return transactions.filter(t => {
      const date = new Date(t.date);
      return date >= startDate && date <= endDate;
    });
  };

  const addIncome = async (amount, category, description) => {
    return safeExecute(async () => {
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
  };

  const addExpense = async (amount, category, description) => {
    return safeExecute(async () => {
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
  };

  const deleteTransaction = async (transactionId) => {
    return safeExecute(async () => {
      if (transactionContext.actions && transactionContext.actions.deleteTransaction) {
        return await transactionContext.actions.deleteTransaction(transactionId);
      }
      return null;
    }, null);
  };

  const getTransactionStats = () => {
    return safeExecute(() => {
      const incomeTransactions = transactions.filter(t => t.type === 'income');
      const expenseTransactions = transactions.filter(t => t.type === 'expense');
      
      return {
        totalTransactions: transactions.length,
        incomeTransactions: incomeTransactions.length,
        expenseTransactions: expenseTransactions.length,
        averageIncome: incomeTransactions.length > 0 ? summary.income / incomeTransactions.length : 0,
        averageExpense: expenseTransactions.length > 0 ? summary.expenses / expenseTransactions.length : 0,
        transactionFrequency: transactions.length > 0 ? transactions.length / 30 : 0
      };
    }, {
      totalTransactions: 0,
      incomeTransactions: 0,
      expenseTransactions: 0,
      averageIncome: 0,
      averageExpense: 0,
      transactionFrequency: 0
    });
  };

  return {
    // Basic data
    transactions,
    filteredTransactions: transactions, // For now, filtered transactions are same as all transactions
    recentTransactions: transactionContext.recentTransactions || [],
    summary,
    categoryBreakdown,
    
    // Filter state
    filters: {
      search: '',
      category: 'all',
      type: 'all',
      dateRange: null,
      sortBy: 'date',
      sortOrder: 'desc'
    },
    
    // State
    isLoading: transactionContext.isLoading || false,
    hasError: transactionContext.hasError || (() => false),
    getError: transactionContext.getError || (() => null), // Add getError function
    
    // Quick state checks
    isLoadingTransactions: transactionContext.isLoading,
    isCreatingTransaction: transactionContext.isLoading,
    isUpdatingTransaction: transactionContext.isLoading,
    isDeletingTransaction: transactionContext.isLoading,
    
    // Actions
    loadTransactions: transactionContext.actions?.loadTransactions || (() => Promise.resolve([])),
    addIncome,
    addExpense,
    deleteTransaction,
    createTransaction: transactionContext.actions?.createTransaction || (() => Promise.resolve(null)),
    updateTransaction: transactionContext.actions?.updateTransaction || (() => Promise.resolve(null)),
    clearAllData: transactionContext.actions?.clearAllData || (() => {}), // Debug function
    
    // Helpers
    getTransactionsByDateRange,
    getTransactionStats,
    
    // Search
    searchTransactions: (searchTerm) => {
      if (!searchTerm) return transactions;
      const term = searchTerm.toLowerCase();
      return transactions.filter(t => 
        (t.description || '').toLowerCase().includes(term) ||
        (t.categoryName || '').toLowerCase().includes(term) ||
        (t.formattedAmount || '').includes(term)
      );
    },
    
    // Filter helpers
    filterByCategory: () => {},
    filterByType: () => {},
    filterByDateRange: () => {},
    setFilter: () => {},
    setFilters: () => {},
    resetFilters: () => {},
    sortTransactions: () => {},
    
    // Computed values
    totalIncome: summary.income,
    totalExpenses: summary.expenses,
    currentBalance: summary.balance,
    formattedTotalIncome: summary.formattedIncome,
    formattedTotalExpenses: summary.formattedExpenses,
    formattedCurrentBalance: summary.formattedBalance,
    
    // Context access
    contexts: {
      transactions: transactionContext,
      categories: categoryContext,
      user: userContext
    }
  };
};

export default useTransactions;
