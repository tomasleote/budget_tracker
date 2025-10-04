import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { repositories } from '../../../model/repositories/RepositoryFactory.js';

// Create TransactionContext
const TransactionContext = createContext();

/**
 * TransactionProvider - Real API Implementation
 * Connects to backend database through repository pattern
 */
export const TransactionProvider = ({ children }) => {
  // State management
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [summary, setSummary] = useState({
    totalTransactions: 0,
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    averageTransaction: 0,
    largestIncome: 0,
    largestExpense: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    type: 'all', // 'all', 'income', 'expense'
    category: 'all',
    dateRange: 'all', // 'all', 'today', 'week', 'month', 'year'
    amountRange: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20, // Standard pagination limit
    total: 0,
    pages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get repository instance
  const transactionRepository = useMemo(() => repositories.transactions, []);

  // Load transactions from API/database
  const loadTransactions = useCallback(async (queryParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Loading transactions from backend...');
      console.log('🔍 DEBUG - Query params:', queryParams);
      
      // Use current pagination state or defaults
      const currentPagination = {
        page: queryParams.page || pagination.page,
        limit: queryParams.limit || pagination.limit,
        include_category: true,
        ...queryParams
      };
      
      console.log('🔍 DEBUG - Final pagination params:', currentPagination);
      
      const result = await transactionRepository.getAll(currentPagination);
      
      // DEBUG: Log the exact response structure with detailed inspection
      console.log('🔍 DEBUG - Raw result from repository:', result);
      console.log('🔍 DEBUG - result type:', typeof result);
      console.log('🔍 DEBUG - result is array:', Array.isArray(result));
      console.log('🔍 DEBUG - result keys:', result ? Object.keys(result) : 'null/undefined');
      
      if (result) {
        console.log('🔍 DEBUG - result.data:', result.data);
        console.log('🔍 DEBUG - result.transactions:', result.transactions);
        console.log('🔍 DEBUG - result.pagination:', result.pagination);
      }
      
      // Handle the response from the interceptor
      if (result && (result.data || Array.isArray(result))) {
        // Extract transactions array - handle both formats
        let transactionsData;
        let paginationData = null;
        
        if (Array.isArray(result)) {
          transactionsData = result;
        } else if (result.data && Array.isArray(result.data)) {
          transactionsData = result.data;
          paginationData = result.pagination;
        } else if (result.transactions && Array.isArray(result.transactions)) {
          transactionsData = result.transactions;
          paginationData = result.pagination;
        } else {
          transactionsData = [];
        }
        
        console.log('🔍 DEBUG - Extracted transactions:', transactionsData);
        setTransactions(transactionsData);
        console.log('✅ Transactions loaded:', transactionsData.length, 'transactions');
        
        // Update pagination if provided
        if (paginationData) {
          console.log('🔍 DEBUG - Updating pagination:', paginationData);
          setPagination(prev => ({
            ...prev,
            ...paginationData
          }));
        }
        
        // Calculate summary
        await calculateSummary(transactionsData);
        
      } else {
        console.log('❌ DEBUG - Invalid response structure:', result);
        throw new Error('Failed to load transactions - invalid response format');
      }
    } catch (err) {
      console.error('❌ Failed to load transactions:', err);
      setError(err.message || 'Failed to load transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [transactionRepository, pagination.page, pagination.limit]);

  // Special function for loading ALL transactions for dashboard analytics
  const loadAllTransactionsForDashboard = useCallback(async () => {
    console.log('🔍 DASHBOARD API CALL: Loading transactions for analytics charts...');
    console.log('🔍 API CALL: GET /transactions with limit=1000 for dashboard analytics');
    
    try {
      const result = await transactionRepository.getAll({
        limit: 1000, // Get many transactions for analytics
        include_category: true
      });
      
      // Handle response format
      let transactionsData = [];
      if (Array.isArray(result)) {
        transactionsData = result;
      } else if (result?.transactions && Array.isArray(result.transactions)) {
        transactionsData = result.transactions;
      } else if (result?.data && Array.isArray(result.data)) {
        transactionsData = result.data;
      }
      
      console.log('✅ Dashboard analytics loaded:', transactionsData.length, 'transactions');
      return transactionsData;
    } catch (err) {
      console.error('❌ Failed to load dashboard analytics:', err);
      return [];
    }
  }, [transactionRepository]);

  // Calculate transaction summary
  const calculateSummary = useCallback(async (transactionsData = transactions) => {
    try {
      const income = transactionsData
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
      
      const expenses = transactionsData
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
      
      const summary = {
        totalTransactions: transactionsData.length,
        totalIncome: income,
        totalExpenses: expenses,
        balance: income - expenses,
        averageTransaction: transactionsData.length > 0 ? (income + expenses) / transactionsData.length : 0,
        largestIncome: Math.max(...transactionsData.filter(t => t.type === 'income').map(t => parseFloat(t.amount) || 0), 0),
        largestExpense: Math.max(...transactionsData.filter(t => t.type === 'expense').map(t => parseFloat(t.amount) || 0), 0)
      };
      
      setSummary(summary);
    } catch (err) {
      console.error('❌ Failed to calculate transaction summary:', err);
    }
  }, [transactions]);

  // Create new transaction
  const createTransaction = useCallback(async (transactionData) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Creating transaction:', transactionData.description);
      const result = await transactionRepository.create({
        ...transactionData,
        date: transactionData.date || new Date().toISOString(),
        amount: parseFloat(transactionData.amount)
      });
      
      // Handle response format consistently
      if (result && (result.success !== false)) {
        const newTransaction = result.data || result;
        
        // Add to local state
        setTransactions(prev => [newTransaction, ...prev]);
        console.log('✅ Transaction created:', newTransaction.description || newTransaction.id);
        
        // Recalculate summary
        calculateSummary();
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('transactionCreated', { 
          detail: newTransaction 
        }));
        
        return { success: true, data: newTransaction };
      } else {
        throw new Error(result?.error || 'Failed to create transaction');
      }
    } catch (err) {
      console.error('❌ Failed to create transaction:', err);
      setError(err.message || 'Failed to create transaction');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [transactionRepository, calculateSummary]);

  // Update existing transaction
  const updateTransaction = useCallback(async (transactionId, updates) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Updating transaction:', transactionId);
      const result = await transactionRepository.update(transactionId, {
        ...updates,
        amount: parseFloat(updates.amount)
      });
      
      // Handle response format consistently
      if (result && (result.success !== false)) {
        const updatedTransaction = result.data || result;
        
        // Update local state
        setTransactions(prev => 
          prev.map(t => t.id === transactionId ? updatedTransaction : t)
        );
        console.log('✅ Transaction updated:', updatedTransaction.description || updatedTransaction.id);
        
        // Recalculate summary
        calculateSummary();
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('transactionUpdated', { 
          detail: updatedTransaction 
        }));
        
        return { success: true, data: updatedTransaction };
      } else {
        throw new Error(result?.error || 'Failed to update transaction');
      }
    } catch (err) {
      console.error('❌ Failed to update transaction:', err);
      setError(err.message || 'Failed to update transaction');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [transactionRepository, calculateSummary]);

  // Delete transaction
  const deleteTransaction = useCallback(async (transactionId) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Deleting transaction:', transactionId);
      const result = await transactionRepository.delete(transactionId);
      
      // Handle response format consistently
      if (result && (result.success !== false)) {
        // Remove from local state
        setTransactions(prev => prev.filter(t => t.id !== transactionId));
        console.log('✅ Transaction deleted');
        
        // Recalculate summary
        calculateSummary();
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('transactionDeleted', { 
          detail: { id: transactionId } 
        }));
        
        return { success: true };
      } else {
        throw new Error(result?.error || 'Failed to delete transaction');
      }
    } catch (err) {
      console.error('❌ Failed to delete transaction:', err);
      setError(err.message || 'Failed to delete transaction');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [transactionRepository, calculateSummary]);

  // Pagination functions
  const goToPage = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }));
    loadTransactions({ page });
  }, [loadTransactions]);

  const nextPage = useCallback(() => {
    if (pagination.page < pagination.pages) {
      goToPage(pagination.page + 1);
    }
  }, [pagination.page, pagination.pages, goToPage]);

  const prevPage = useCallback(() => {
    if (pagination.page > 1) {
      goToPage(pagination.page - 1);
    }
  }, [pagination.page, goToPage]);

  // Filter and search functions
  const applyFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    loadTransactions({ ...newFilters, page: 1 });
  }, [loadTransactions]);

  // Helper functions
  const hasError = useCallback((type) => {
    return !!error;
  }, [error]);

  const getError = useCallback(() => {
    return error;
  }, [error]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Don't auto-load transactions on mount - load on demand when user visits Transactions page
  // This prevents blocking the Dashboard while waiting for transaction data
  // Transactions will be loaded when:
  // 1. User navigates to Transactions page
  // 2. Dashboard explicitly calls loadAllTransactionsForDashboard()
  // 3. User performs a refresh action
  /*
  useEffect(() => {
    console.log('🔄 Loading transactions from backend...');
    loadTransactions();
  }, [loadTransactions]);
  */

  // Context value
  const value = useMemo(() => ({
    // State
    transactions,
    filteredTransactions,
    currentTransaction,
    summary,
    filters,
    pagination,
    
    // Status functions
    isLoading: loading,
    hasError,
    getError,
    
    // Actions
    actions: {
      loadTransactions,
      loadAllTransactionsForDashboard,
      calculateSummary,
      createTransaction,
      updateTransaction,
      deleteTransaction,
      applyFilters,
      goToPage,
      nextPage,
      prevPage,
      clearErrors: clearError,
      refreshTransactions: loadTransactions,
      setCurrentTransaction
    }
  }), [
    transactions,
    filteredTransactions,
    currentTransaction,
    summary,
    filters,
    pagination,
    loading,
    hasError,
    getError,
    loadTransactions,
    loadAllTransactionsForDashboard,
    calculateSummary,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    applyFilters,
    goToPage,
    nextPage,
    prevPage,
    clearError
  ]);

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

// Hook to use TransactionContext
export const useTransactionContext = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactionContext must be used within a TransactionProvider');
  }
  return context;
};

export default TransactionProvider;
