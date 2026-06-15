import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { repositories } from '../../../model/repositories/RepositoryFactory.js';
import { logger } from '../../utils/logger.js';
import {
  initialTransactionSummary,
  initialFilters,
  initialPagination
} from './transaction/transactionState.js';
import {
  extractTransactionsData,
  computeTransactionSummary
} from './transaction/transactionHelpers.js';

const TransactionContext = createContext();

/**
 * TransactionProvider
 * Loads/persists transactions through the repository layer (localStorage today).
 */
export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [summary, setSummary] = useState(initialTransactionSummary);
  const [filters, setFilters] = useState(initialFilters);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const transactionRepository = useMemo(() => repositories.transactions, []);

  const loadTransactions = useCallback(async (queryParams = {}) => {
    setLoading(true);
    setError(null);

    try {
      const currentPagination = {
        page: queryParams.page || pagination.page,
        limit: queryParams.limit || pagination.limit,
        include_category: true,
        ...queryParams
      };

      const result = await transactionRepository.getAll(currentPagination);
      const extracted = extractTransactionsData(result);

      if (extracted !== null) {
        const { transactionsData, paginationData } = extracted;
        setTransactions(transactionsData);
        logger.debug('Transactions loaded:', transactionsData.length);

        if (paginationData) {
          setPagination(prev => ({ ...prev, ...paginationData }));
        }

        setSummary(computeTransactionSummary(transactionsData));
      } else {
        throw new Error('Failed to load transactions - invalid response format');
      }
    } catch (err) {
      logger.error('Failed to load transactions:', err);
      setError(err.message || 'Failed to load transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [transactionRepository, pagination.page, pagination.limit]);

  const loadAllTransactionsForDashboard = useCallback(async () => {
    try {
      const result = await transactionRepository.getAll({
        limit: 1000,
        include_category: true
      });

      const extracted = extractTransactionsData(result);
      const transactionsData = extracted ? extracted.transactionsData : [];
      logger.debug('Dashboard analytics loaded:', transactionsData.length);
      return transactionsData;
    } catch (err) {
      logger.error('Failed to load dashboard analytics:', err);
      return [];
    }
  }, [transactionRepository]);

  const calculateSummary = useCallback(async (transactionsData = transactions) => {
    try {
      setSummary(computeTransactionSummary(transactionsData));
    } catch (err) {
      logger.error('Failed to calculate transaction summary:', err);
    }
  }, [transactions]);

  const createTransaction = useCallback(async (transactionData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await transactionRepository.create({
        ...transactionData,
        date: transactionData.date || new Date().toISOString(),
        amount: parseFloat(transactionData.amount)
      });

      if (result && result.success !== false) {
        const newTransaction = result.data || result;
        setTransactions(prev => {
          const updated = [newTransaction, ...prev];
          setSummary(computeTransactionSummary(updated));
          return updated;
        });
        logger.debug('Transaction created:', newTransaction.description || newTransaction.id);
        window.dispatchEvent(new CustomEvent('transactionCreated', { detail: newTransaction }));
        return { success: true, data: newTransaction };
      } else {
        throw new Error(result?.error || 'Failed to create transaction');
      }
    } catch (err) {
      logger.error('Failed to create transaction:', err);
      setError(err.message || 'Failed to create transaction');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [transactionRepository, calculateSummary]);

  const updateTransaction = useCallback(async (transactionId, updates) => {
    setLoading(true);
    setError(null);

    try {
      const result = await transactionRepository.update(transactionId, {
        ...updates,
        amount: parseFloat(updates.amount)
      });

      if (result && result.success !== false) {
        const updatedTransaction = result.data || result;
        setTransactions(prev => {
          const updated = prev.map(t => t.id === transactionId ? updatedTransaction : t);
          setSummary(computeTransactionSummary(updated));
          return updated;
        });
        logger.debug('Transaction updated:', updatedTransaction.description || updatedTransaction.id);
        window.dispatchEvent(new CustomEvent('transactionUpdated', { detail: updatedTransaction }));
        return { success: true, data: updatedTransaction };
      } else {
        throw new Error(result?.error || 'Failed to update transaction');
      }
    } catch (err) {
      logger.error('Failed to update transaction:', err);
      setError(err.message || 'Failed to update transaction');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [transactionRepository, calculateSummary]);

  const deleteTransaction = useCallback(async (transactionId) => {
    setLoading(true);
    setError(null);

    try {
      const result = await transactionRepository.delete(transactionId);

      if (result && result.success !== false) {
        setTransactions(prev => {
          const updated = prev.filter(t => t.id !== transactionId);
          setSummary(computeTransactionSummary(updated));
          return updated;
        });
        logger.debug('Transaction deleted:', transactionId);
        window.dispatchEvent(new CustomEvent('transactionDeleted', { detail: { id: transactionId } }));
        return { success: true };
      } else {
        throw new Error(result?.error || 'Failed to delete transaction');
      }
    } catch (err) {
      logger.error('Failed to delete transaction:', err);
      setError(err.message || 'Failed to delete transaction');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [transactionRepository, calculateSummary]);

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

  const applyFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 }));
    loadTransactions({ ...newFilters, page: 1 });
  }, [loadTransactions]);

  const hasError = useCallback(() => {
    return !!error;
  }, [error]);

  const getError = useCallback(() => {
    return error;
  }, [error]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    loadTransactions();
  }, []); // Empty dependency array - only load once on mount

  const value = useMemo(() => ({
    transactions,
    filteredTransactions,
    currentTransaction,
    summary,
    filters,
    pagination,
    isLoading: loading,
    hasError,
    getError,
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

export const useTransactionContext = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactionContext must be used within a TransactionProvider');
  }
  return context;
};

export default TransactionProvider;
