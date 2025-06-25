import React, { useState, useEffect, useMemo, useCallback } from 'react';
import TransactionContext from '../TransactionContext.jsx';

// Working TransactionProvider with localStorage persistence
export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Function to load transactions from localStorage
  const loadTransactionsFromStorage = () => {
    try {
      const stored = localStorage.getItem('budget_tracker_transactions');
      if (stored) {
        const loadedTransactions = JSON.parse(stored);
        // Remove any duplicates that might exist
        const uniqueTransactions = loadedTransactions.filter((transaction, index, arr) => 
          arr.findIndex(t => t.id === transaction.id) === index
        );
        console.log(`📊 Loaded ${uniqueTransactions.length} transactions from localStorage`);
        
        // Always update state with loaded transactions (even if empty)
        setTransactions(uniqueTransactions);
        return uniqueTransactions;
      } else {
        console.log('📋 No transaction data in localStorage');
        setTransactions([]);
        return [];
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions([]);
      return [];
    }
  };

  // Load transactions from localStorage on mount
  useEffect(() => {
    loadTransactionsFromStorage();
  }, []);

  // Listen for storage changes (when mock data is loaded)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'budget_tracker_transactions') {
        console.log('🔄 Storage changed, reloading transactions...');
        loadTransactionsFromStorage();
      }
    };

    // Listen for storage events
    window.addEventListener('storage', handleStorageChange);

    // Custom event for same-tab storage changes
    const handleCustomRefresh = () => {
      console.log('🔄 Custom refresh triggered, reloading transactions...');
      loadTransactionsFromStorage();
    };

    window.addEventListener('refreshTransactions', handleCustomRefresh);
    
    // Listen for force sync events from other providers
    const handleForceSync = () => {
      console.log('🔄 Force sync event received, reloading transactions...');
      loadTransactionsFromStorage();
    };
    
    window.addEventListener('forceDataSync', handleForceSync);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('refreshTransactions', handleCustomRefresh);
      window.removeEventListener('forceDataSync', handleForceSync);
    };
  }, []);

  // Save transactions to localStorage whenever transactions change
  useEffect(() => {
    try {
      localStorage.setItem('budget_tracker_transactions', JSON.stringify(transactions));
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  }, [transactions]);

  // Memoized computed values to prevent unnecessary re-renders
  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5);
  }, [transactions]);

  const summary = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
    const balance = income - expenses;
    return { income, expenses, balance };
  }, [transactions]);

  // Stable action functions using useCallback
  const createTransaction = useCallback(async (transactionData) => {
    try {
      setIsLoading(true);
      setErrors({});
      
      const newTransaction = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Better unique ID generation
        ...transactionData,
        date: transactionData.date || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Prevent duplicates by checking if transaction with same data already exists
      setTransactions(prev => {
        const exists = prev.some(t => 
          t.amount === newTransaction.amount &&
          t.description === newTransaction.description &&
          t.category === newTransaction.category &&
          Math.abs(new Date(t.createdAt) - new Date(newTransaction.createdAt)) < 1000 // Within 1 second
        );
        
        if (exists) {
          console.warn('Duplicate transaction detected, skipping');
          return prev;
        }
        
        console.log('🎉 Transaction created, dispatching event...');
        // Dispatch custom event for budget updates
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('transactionCreated', { detail: newTransaction }));
        }, 100);
        
        return [newTransaction, ...prev];
      });
      
      setIsLoading(false);
      return newTransaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      setErrors({ create: error.message });
      setIsLoading(false);
      throw error;
    }
  }, []);

  const updateTransaction = useCallback(async (id, transactionData) => {
    try {
      setIsLoading(true);
      setErrors({});
      
      const updatedTransaction = {
        ...transactionData,
        id,
        updatedAt: new Date().toISOString()
      };
      
      setTransactions(prev => {
        const updated = prev.map(t => t.id === id ? { ...t, ...updatedTransaction } : t);
        
        console.log('🔄 Transaction updated, dispatching event...');
        // Dispatch custom event for budget updates
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('transactionUpdated', { detail: updatedTransaction }));
        }, 100);
        
        return updated;
      });
      
      setIsLoading(false);
      return updatedTransaction;
    } catch (error) {
      console.error('Error updating transaction:', error);
      setErrors({ update: error.message });
      setIsLoading(false);
      throw error;
    }
  }, []);

  const deleteTransaction = useCallback(async (id) => {
    try {
      setIsLoading(true);
      setErrors({});
      
      setTransactions(prev => {
        const filtered = prev.filter(t => t.id !== id);
        
        console.log('🗑️ Transaction deleted, dispatching event...');
        // Dispatch custom event for budget updates
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('transactionDeleted', { detail: { id } }));
        }, 100);
        
        return filtered;
      });
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      setErrors({ delete: error.message });
      setIsLoading(false);
      throw error;
    }
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Debug function to clear all data
  const clearAllData = useCallback(() => {
    localStorage.removeItem('budget_tracker_transactions');
    setTransactions([]);
    setErrors({});
  }, []);

  // Refresh function to reload data from storage
  const refreshTransactions = useCallback(() => {
    return loadTransactionsFromStorage();
  }, []);

  // Helper functions (memoized)
  const hasError = useCallback((type) => {
    if (type) return Boolean(errors[type]);
    return Object.keys(errors).length > 0;
  }, [errors]);

  const getError = useCallback((type) => {
    return errors[type] || null;
  }, [errors]);

  // Memoized actions object to prevent recreating on every render
  const actions = useMemo(() => ({
    loadTransactions: refreshTransactions,
    loadSummary: async () => {},
    loadRecentTransactions: async () => {},
    createTransaction,
    updateTransaction,
    deleteTransaction,
    clearErrors,
    clearAllData, // Debug function
    refreshTransactions // Add refresh function
  }), [refreshTransactions, createTransaction, updateTransaction, deleteTransaction, clearErrors, clearAllData]);

  // Memoized context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    transactions,
    recentTransactions,
    summary,
    categoryBreakdown: [], // Static for now
    isLoading,
    hasError,
    getError,
    actions
  }), [transactions, recentTransactions, summary, isLoading, hasError, getError, actions]);

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

export default TransactionProvider;
