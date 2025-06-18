import { useState, useCallback } from 'react';
import { useTransactions } from '../../../controller/hooks/useTransactions';
import { validateTransaction } from '../../../controller/utils/validators';

/**
 * Enhanced Transaction Operations Hook
 * Provides CRUD operations with enhanced error handling, validation, and UI feedback
 * Designed to work with both localStorage and future backend implementations
 */
export const useTransactionOperations = (options = {}) => {
  const {
    onSuccess = () => {},
    onError = () => {},
    showNotifications = true,
    optimisticUpdates = true
  } = options;

  // Base transaction hook
  const baseHook = useTransactions();

  // Local state for enhanced UI feedback
  const [operationState, setOperationState] = useState({
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isBulkOperating: false,
    lastOperation: null,
    lastError: null,
    validationErrors: {}
  });

  // Enhanced validation
  const validateTransactionData = useCallback((data) => {
    const validation = validateTransaction(data);
    
    if (!validation.isValid) {
      setOperationState(prev => ({
        ...prev,
        validationErrors: validation.errors
      }));
      return false;
    }
    
    setOperationState(prev => ({
      ...prev,
      validationErrors: {}
    }));
    return true;
  }, []);

  // Enhanced create operation
  const createTransaction = useCallback(async (transactionData) => {
    setOperationState(prev => ({ ...prev, isCreating: true, lastError: null }));
    
    try {
      // Validate data
      if (!validateTransactionData(transactionData)) {
        throw new Error('Validation failed');
      }

      // Call base create function
      const result = await baseHook.createTransaction(transactionData);
      
      if (result) {
        setOperationState(prev => ({
          ...prev,
          lastOperation: { type: 'create', data: result, timestamp: Date.now() }
        }));
        
        onSuccess('create', result);
        return result;
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to create transaction';
      setOperationState(prev => ({ ...prev, lastError: { type: 'create', message: errorMessage } }));
      onError('create', error);
      throw error;
    } finally {
      setOperationState(prev => ({ ...prev, isCreating: false }));
    }
  }, [baseHook.createTransaction, validateTransactionData, onSuccess, onError]);

  // Enhanced update operation
  const updateTransaction = useCallback(async (transactionId, updateData) => {
    setOperationState(prev => ({ ...prev, isUpdating: true, lastError: null }));
    
    try {
      // Validate data
      if (!validateTransactionData(updateData)) {
        throw new Error('Validation failed');
      }

      // Optimistic update (if enabled)
      let originalTransaction = null;
      if (optimisticUpdates) {
        originalTransaction = baseHook.transactions.find(t => t.id === transactionId);
        // Could implement optimistic update here
      }

      // Call base update function
      const result = await baseHook.updateTransaction(transactionId, updateData);
      
      if (result) {
        setOperationState(prev => ({
          ...prev,
          lastOperation: { type: 'update', data: result, timestamp: Date.now() }
        }));
        
        onSuccess('update', result);
        return result;
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to update transaction';
      setOperationState(prev => ({ ...prev, lastError: { type: 'update', message: errorMessage } }));
      
      // Revert optimistic update if it was applied
      if (optimisticUpdates) {
        // Could implement revert logic here
      }
      
      onError('update', error);
      throw error;
    } finally {
      setOperationState(prev => ({ ...prev, isUpdating: false }));
    }
  }, [baseHook.updateTransaction, baseHook.transactions, validateTransactionData, optimisticUpdates, onSuccess, onError]);

  // Enhanced delete operation
  const deleteTransaction = useCallback(async (transactionId, options = {}) => {
    const { skipConfirmation = false } = options;
    
    // Confirmation dialog (unless skipped)
    if (!skipConfirmation) {
      const confirmed = window.confirm(
        'Are you sure you want to delete this transaction? This action cannot be undone.'
      );
      if (!confirmed) return false;
    }

    setOperationState(prev => ({ ...prev, isDeleting: true, lastError: null }));
    
    try {
      // Optimistic delete (if enabled)
      let originalTransaction = null;
      if (optimisticUpdates) {
        originalTransaction = baseHook.transactions.find(t => t.id === transactionId);
        // Could implement optimistic removal here
      }

      // Call base delete function
      const result = await baseHook.deleteTransaction(transactionId);
      
      if (result) {
        setOperationState(prev => ({
          ...prev,
          lastOperation: { type: 'delete', data: { id: transactionId }, timestamp: Date.now() }
        }));
        
        onSuccess('delete', { id: transactionId });
        return true;
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to delete transaction';
      setOperationState(prev => ({ ...prev, lastError: { type: 'delete', message: errorMessage } }));
      
      // Revert optimistic delete if it was applied
      if (optimisticUpdates) {
        // Could implement revert logic here
      }
      
      onError('delete', error);
      throw error;
    } finally {
      setOperationState(prev => ({ ...prev, isDeleting: false }));
    }
  }, [baseHook.deleteTransaction, baseHook.transactions, optimisticUpdates, onSuccess, onError]);

  // Bulk operations
  const bulkDeleteTransactions = useCallback(async (transactionIds, options = {}) => {
    const { skipConfirmation = false } = options;
    
    if (!skipConfirmation) {
      const confirmed = window.confirm(
        `Are you sure you want to delete ${transactionIds.length} transaction(s)? This action cannot be undone.`
      );
      if (!confirmed) return false;
    }

    setOperationState(prev => ({ ...prev, isBulkOperating: true, lastError: null }));
    
    try {
      const results = [];
      let successCount = 0;
      let errorCount = 0;

      for (const transactionId of transactionIds) {
        try {
          const result = await baseHook.deleteTransaction(transactionId);
          if (result) {
            results.push({ id: transactionId, success: true });
            successCount++;
          }
        } catch (error) {
          results.push({ id: transactionId, success: false, error: error.message });
          errorCount++;
        }
      }

      setOperationState(prev => ({
        ...prev,
        lastOperation: { 
          type: 'bulk_delete', 
          data: { results, successCount, errorCount }, 
          timestamp: Date.now() 
        }
      }));

      onSuccess('bulk_delete', { results, successCount, errorCount });
      return { results, successCount, errorCount };
    } catch (error) {
      const errorMessage = error.message || 'Bulk delete operation failed';
      setOperationState(prev => ({ ...prev, lastError: { type: 'bulk_delete', message: errorMessage } }));
      onError('bulk_delete', error);
      throw error;
    } finally {
      setOperationState(prev => ({ ...prev, isBulkOperating: false }));
    }
  }, [baseHook.deleteTransaction, onSuccess, onError]);

  // Clear operation state
  const clearOperationState = useCallback(() => {
    setOperationState({
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      isBulkOperating: false,
      lastOperation: null,
      lastError: null,
      validationErrors: {}
    });
  }, []);

  // Get operation status
  const getOperationStatus = useCallback(() => {
    return {
      isAnyOperationPending: operationState.isCreating || operationState.isUpdating || 
                             operationState.isDeleting || operationState.isBulkOperating,
      hasRecentError: operationState.lastError && 
                     (Date.now() - (operationState.lastError.timestamp || 0)) < 5000,
      hasRecentSuccess: operationState.lastOperation && 
                       (Date.now() - operationState.lastOperation.timestamp) < 5000
    };
  }, [operationState]);

  return {
    // Enhanced operations
    createTransaction,
    updateTransaction,
    deleteTransaction,
    bulkDeleteTransactions,
    
    // Validation
    validateTransactionData,
    validationErrors: operationState.validationErrors,
    
    // Operation state
    isCreating: operationState.isCreating,
    isUpdating: operationState.isUpdating,
    isDeleting: operationState.isDeleting,
    isBulkOperating: operationState.isBulkOperating,
    
    // Status helpers
    lastOperation: operationState.lastOperation,
    lastError: operationState.lastError,
    getOperationStatus,
    clearOperationState,
    
    // Base hook data (pass-through)
    transactions: baseHook.transactions,
    filteredTransactions: baseHook.filteredTransactions,
    summary: baseHook.summary,
    categoryBreakdown: baseHook.categoryBreakdown,
    isLoadingTransactions: baseHook.isLoadingTransactions,
    hasLoadError: baseHook.hasLoadError,
    
    // Additional utilities from base hook
    searchTransactions: baseHook.searchTransactions,
    filterByCategory: baseHook.filterByCategory,
    filterByType: baseHook.filterByType,
    filterByDateRange: baseHook.filterByDateRange,
    sortByAmount: baseHook.sortByAmount,
    sortByDate: baseHook.sortByDate,
    sortByCategory: baseHook.sortByCategory,
    
    // Quick actions with enhanced error handling
    addIncome: useCallback(async (amount, category, description, date) => {
      return createTransaction({
        type: 'income',
        amount,
        category,
        description,
        date: date?.toISOString() || new Date().toISOString()
      });
    }, [createTransaction]),
    
    addExpense: useCallback(async (amount, category, description, date) => {
      return createTransaction({
        type: 'expense',
        amount,
        category,
        description,
        date: date?.toISOString() || new Date().toISOString()
      });
    }, [createTransaction])
  };
};

export default useTransactionOperations;