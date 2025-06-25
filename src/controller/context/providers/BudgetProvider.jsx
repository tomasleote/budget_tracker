import React, { useReducer, useEffect, useMemo, useCallback, useRef } from 'react';
import BudgetService from '../../../model/services/BudgetService.js';
import BudgetContext from '../BudgetContext.jsx';
import { useAppContext } from '../AppContext.jsx';
import { useTransactionContext } from '../TransactionContext.jsx';

// Debounce utility function for batching updates
const debounce = (func, delay) => {
  let timeoutId;
  const debounced = (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
  debounced.cancel = () => clearTimeout(timeoutId);
  return debounced;
};

// Helper function to check if date is within budget period
const isDateInBudgetPeriod = (date, budget) => {
  const transactionDate = new Date(date);
  const startDate = new Date(budget.startDate);
  const endDate = new Date(budget.endDate);
  return transactionDate >= startDate && transactionDate <= endDate;
};

// Initial state
const initialState = {
  budgets: [],
  currentBudget: null,
  overview: [],
  alerts: [],
  
  // Filters
  filters: {
    category: 'all',
    status: 'all',
    period: 'all',
    search: '',
    sortBy: 'category',
    sortOrder: 'asc'
  },
  
  // Loading states
  loading: {
    budgets: false,
    creating: false,
    updating: false,
    deleting: false,
    overview: false,
    alerts: false
  },
  
  // Error states
  errors: {
    load: null,
    create: null,
    update: null,
    delete: null
  }
};

// Action types
const BUDGET_ACTIONS = {
  SET_BUDGETS: 'SET_BUDGETS',
  ADD_BUDGET: 'ADD_BUDGET',
  UPDATE_BUDGET: 'UPDATE_BUDGET',
  REMOVE_BUDGET: 'REMOVE_BUDGET',
  SET_CURRENT_BUDGET: 'SET_CURRENT_BUDGET',
  SET_OVERVIEW: 'SET_OVERVIEW',
  SET_ALERTS: 'SET_ALERTS',
  SET_FILTER: 'SET_FILTER',
  SET_FILTERS: 'SET_FILTERS',
  RESET_FILTERS: 'RESET_FILTERS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const budgetReducer = (state, action) => {
  switch (action.type) {
    case BUDGET_ACTIONS.SET_BUDGETS:
      return { ...state, budgets: action.payload };
    
    case BUDGET_ACTIONS.ADD_BUDGET:
      return { ...state, budgets: [action.payload, ...state.budgets] };
    
    case BUDGET_ACTIONS.UPDATE_BUDGET:
      return {
        ...state,
        budgets: state.budgets.map(budget =>
          budget.id === action.payload.id ? action.payload : budget
        ),
        currentBudget: state.currentBudget?.id === action.payload.id 
          ? action.payload : state.currentBudget
      };
    
    case BUDGET_ACTIONS.REMOVE_BUDGET:
      return {
        ...state,
        budgets: state.budgets.filter(budget => budget.id !== action.payload),
        currentBudget: state.currentBudget?.id === action.payload 
          ? null : state.currentBudget
      };
    
    case BUDGET_ACTIONS.SET_CURRENT_BUDGET:
      return { ...state, currentBudget: action.payload };
    
    case BUDGET_ACTIONS.SET_OVERVIEW:
      return { ...state, overview: action.payload };
    
    case BUDGET_ACTIONS.SET_ALERTS:
      return { ...state, alerts: action.payload };
    
    case BUDGET_ACTIONS.SET_FILTER:
      return {
        ...state,
        filters: { ...state.filters, [action.payload.key]: action.payload.value }
      };
    
    case BUDGET_ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };
    
    case BUDGET_ACTIONS.RESET_FILTERS:
      return { ...state, filters: initialState.filters };
    
    case BUDGET_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: { ...state.loading, [action.payload.type]: action.payload.value }
      };
    
    case BUDGET_ACTIONS.SET_ERROR:
      return {
        ...state,
        errors: { ...state.errors, [action.payload.type]: action.payload.error }
      };
    
    case BUDGET_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        errors: { ...state.errors, [action.payload]: null }
      };
    
    default:
      return state;
  }
};

/**
 * BudgetProvider - COMPLETELY SILENT
 * 
 * Provides budget data and operations to the application using React Context.
 * 
 * LOGGING CLEANUP - FINAL VERSION:
 * - Removed ALL excessive logging
 * - Silent operation unless critical errors occur
 * - No transaction processing logs
 * - No budget calculation logs
 * - No repository operation logs
 * - Performance optimized with zero console spam
 */
export const BudgetProvider = ({ children }) => {
  const [state, dispatch] = useReducer(budgetReducer, initialState);
  const { actions: appActions } = useAppContext();
  const transactionContext = useTransactionContext();
  
  // Refs for tracking update state and preventing duplicates
  const updateTimeoutRef = useRef(null);
  const lastUpdateTrigger = useRef('');
  const isUpdatingRef = useRef(false);

  // Get transactions from TransactionProvider - SILENT
  const getTransactionsForBudgetCalculations = () => {
    return transactionContext.transactions || [];
  };

  // Check if transactions are ready - SILENT
  const areTransactionsReady = () => {
    const transactions = transactionContext.transactions || [];
    const isTransactionLoading = transactionContext.isLoading;
    
    let hasStoredData = false;
    try {
      const storedTransactions = localStorage.getItem('budget_tracker_transactions');
      hasStoredData = storedTransactions && JSON.parse(storedTransactions).length > 0;
    } catch (error) {
      hasStoredData = false;
    }
    
    const ready = transactions.length > 0 || 
                  (!isTransactionLoading && hasStoredData) ||
                  (!isTransactionLoading && !hasStoredData);
    
    return ready;
  };

  // Load budgets - SILENT
  const loadBudgets = useCallback(async () => {
    try {
      dispatch({ type: BUDGET_ACTIONS.SET_LOADING, payload: { type: 'budgets', value: true } });
      const budgets = await BudgetService.getAllBudgets();
      dispatch({ type: BUDGET_ACTIONS.SET_BUDGETS, payload: budgets });
    } catch (error) {
      console.error('❌ Error loading budgets:', error);
      dispatch({ type: BUDGET_ACTIONS.SET_ERROR, payload: { type: 'load', error: error.message } });
    } finally {
      dispatch({ type: BUDGET_ACTIONS.SET_LOADING, payload: { type: 'budgets', value: false } });
    }
  }, []);

  // Load budget overview - SILENT
  const loadOverview = useCallback(async () => {
    try {
      dispatch({ type: BUDGET_ACTIONS.SET_LOADING, payload: { type: 'overview', value: true } });
      
      const currentBudgets = await BudgetService.budgetRepository.getCurrentBudgets();
      const transactions = getTransactionsForBudgetCalculations();
      
      // Calculate overview silently
      const overview = currentBudgets.map(budget => {
        const categoryTransactions = transactions.filter(t => {
          const isExpense = t.type === 'expense';
          const matchesCategory = t.category === budget.category;
          const isInPeriod = isDateInBudgetPeriod(t.date, budget);
          return isExpense && matchesCategory && isInPeriod;
        });
        
        const spent = categoryTransactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
        const budgetAmount = parseFloat(budget.budgetAmount) || 0;
        const remaining = Math.max(0, budgetAmount - spent);
        const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
        
        return {
          ...budget,
          progress: {
            spent,
            remaining,
            percentage,
            budgetAmount,
            isExceeded: spent > budgetAmount,
            isNearLimit: percentage >= 80,
            status: spent > budgetAmount ? 'exceeded' : percentage >= 80 ? 'warning' : 'good'
          }
        };
      });
      
      // Sort by status
      overview.sort((a, b) => {
        if (a.progress.isExceeded !== b.progress.isExceeded) {
          return a.progress.isExceeded ? -1 : 1;
        }
        return b.progress.percentage - a.progress.percentage;
      });
      
      dispatch({ type: BUDGET_ACTIONS.SET_OVERVIEW, payload: overview });
    } catch (error) {
      console.error('❌ Error loading budget overview:', error);
      dispatch({ type: BUDGET_ACTIONS.SET_ERROR, payload: { type: 'load', error: error.message } });
    } finally {
      dispatch({ type: BUDGET_ACTIONS.SET_LOADING, payload: { type: 'overview', value: false } });
    }
  }, [getTransactionsForBudgetCalculations]);

  // Load alerts - SILENT
  const loadAlerts = useCallback(async () => {
    try {
      const alerts = await BudgetService.getBudgetAlerts();
      dispatch({ type: BUDGET_ACTIONS.SET_ALERTS, payload: alerts });
    } catch (error) {
      console.error('❌ Error loading budget alerts:', error);
    }
  }, []);

  // Debounced budget update - SILENT
  const debouncedBudgetUpdate = useMemo(() => {
    return debounce(async (trigger = 'unknown') => {
      if (isUpdatingRef.current || lastUpdateTrigger.current === trigger) {
        return;
      }

      try {
        isUpdatingRef.current = true;
        lastUpdateTrigger.current = trigger;
        
        await Promise.all([
          loadOverview(),
          loadAlerts()
        ]);
      } catch (error) {
        console.error(`❌ Error in budget update (${trigger}):`, error);
      } finally {
        isUpdatingRef.current = false;
        setTimeout(() => {
          lastUpdateTrigger.current = '';
        }, 1000);
      }
    }, 300);
  }, [loadOverview, loadAlerts]);

  // Cleanup debounced function
  useEffect(() => {
    return () => {
      if (debouncedBudgetUpdate?.cancel) {
        debouncedBudgetUpdate.cancel();
      }
    };
  }, [debouncedBudgetUpdate]);

  // Memoized actions object
  const actions = useMemo(() => ({
    loadBudgets,
    loadOverview,
    loadAlerts,

    createBudget: async (budgetData) => {
      try {
        dispatch({ type: BUDGET_ACTIONS.SET_LOADING, payload: { type: 'creating', value: true } });
        const result = await BudgetService.createBudget(budgetData);
        if (result.success) {
          dispatch({ type: BUDGET_ACTIONS.ADD_BUDGET, payload: result.budget });
          appActions.showSuccess('Budget created successfully');
          await debouncedBudgetUpdate('budget_created');
          return result.budget;
        }
      } catch (error) {
        dispatch({ type: BUDGET_ACTIONS.SET_ERROR, payload: { type: 'create', error: error.message } });
        appActions.showError(error.message);
        throw error;
      } finally {
        dispatch({ type: BUDGET_ACTIONS.SET_LOADING, payload: { type: 'creating', value: false } });
      }
    },

    updateBudget: async (budgetId, updateData) => {
      try {
        dispatch({ type: BUDGET_ACTIONS.SET_LOADING, payload: { type: 'updating', value: true } });
        const result = await BudgetService.updateBudget(budgetId, updateData);
        if (result.success) {
          dispatch({ type: BUDGET_ACTIONS.UPDATE_BUDGET, payload: result.budget });
          appActions.showSuccess('Budget updated successfully');
          await debouncedBudgetUpdate('budget_updated');
          return result.budget;
        }
      } catch (error) {
        dispatch({ type: BUDGET_ACTIONS.SET_ERROR, payload: { type: 'update', error: error.message } });
        appActions.showError(error.message);
        throw error;
      } finally {
        dispatch({ type: BUDGET_ACTIONS.SET_LOADING, payload: { type: 'updating', value: false } });
      }
    },

    deleteBudget: async (budgetId) => {
      try {
        dispatch({ type: BUDGET_ACTIONS.SET_LOADING, payload: { type: 'deleting', value: true } });
        const result = await BudgetService.deleteBudget(budgetId);
        if (result.success) {
          dispatch({ type: BUDGET_ACTIONS.REMOVE_BUDGET, payload: budgetId });
          appActions.showSuccess('Budget deleted successfully');
          await debouncedBudgetUpdate('budget_deleted');
          return { success: true };
        }
      } catch (error) {
        dispatch({ type: BUDGET_ACTIONS.SET_ERROR, payload: { type: 'delete', error: error.message } });
        appActions.showError(error.message);
        throw error;
      } finally {
        dispatch({ type: BUDGET_ACTIONS.SET_LOADING, payload: { type: 'deleting', value: false } });
      }
    },

    activateBudget: async (budgetId) => {
      try {
        const result = await BudgetService.activateBudget(budgetId);
        if (result.success) {
          dispatch({ type: BUDGET_ACTIONS.UPDATE_BUDGET, payload: result.data });
          appActions.showSuccess('Budget activated successfully');
          await debouncedBudgetUpdate('budget_activated');
          return result;
        }
      } catch (error) {
        appActions.showError(error.message);
        throw error;
      }
    },

    deactivateBudget: async (budgetId) => {
      try {
        const result = await BudgetService.deactivateBudget(budgetId);
        if (result.success) {
          dispatch({ type: BUDGET_ACTIONS.UPDATE_BUDGET, payload: result.data });
          appActions.showSuccess('Budget deactivated successfully');
          await debouncedBudgetUpdate('budget_deactivated');
          return result;
        }
      } catch (error) {
        appActions.showError(error.message);
        throw error;
      }
    },

    setFilter: (key, value) => {
      dispatch({ type: BUDGET_ACTIONS.SET_FILTER, payload: { key, value } });
    },

    clearErrors: () => {
      dispatch({ type: BUDGET_ACTIONS.CLEAR_ERROR, payload: 'load' });
      dispatch({ type: BUDGET_ACTIONS.CLEAR_ERROR, payload: 'create' });
      dispatch({ type: BUDGET_ACTIONS.CLEAR_ERROR, payload: 'update' });
      dispatch({ type: BUDGET_ACTIONS.CLEAR_ERROR, payload: 'delete' });
    }
  }), [loadBudgets, loadOverview, loadAlerts, appActions, debouncedBudgetUpdate]);

  // Load initial data - SILENT
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await loadBudgets();
        
        const checkAndLoadOverview = async (retryCount = 0) => {
          const transactions = getTransactionsForBudgetCalculations();
          const isReady = areTransactionsReady();
          
          if (isReady || retryCount >= 5) {
            await loadOverview();
            await loadAlerts();
          } else {
            setTimeout(() => {
              checkAndLoadOverview(retryCount + 1);
            }, 500 + (retryCount * 200));
          }
        };
        
        setTimeout(() => {
          checkAndLoadOverview();
        }, 100);
        
      } catch (error) {
        console.error('Error loading initial budget data:', error);
      }
    };
    
    loadInitialData();
    
    const handleCustomRefresh = () => {
      setTimeout(() => {
        loadInitialData();
      }, 100);
    };

    window.addEventListener('refreshBudgets', handleCustomRefresh);

    return () => {
      window.removeEventListener('refreshBudgets', handleCustomRefresh);
    };
  }, []);

  // Transaction change handling - SILENT
  const transactionCount = transactionContext.transactions?.length || 0;
  const transactionHash = useMemo(() => {
    const transactions = transactionContext.transactions || [];
    return transactions.map(t => t.id).sort().join(',');
  }, [transactionContext.transactions]);

  useEffect(() => {
    if (transactionCount === 0) {
      return;
    }
    
    debouncedBudgetUpdate('transaction_change');
    
  }, [transactionCount, transactionHash, debouncedBudgetUpdate]);

  // Event listener for transaction actions - SILENT
  useEffect(() => {
    const handleTransactionEvents = () => {
      debouncedBudgetUpdate('transaction_event');
    };

    const events = ['transactionCreated', 'transactionUpdated', 'transactionDeleted'];
    
    events.forEach(event => {
      window.addEventListener(event, handleTransactionEvents);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleTransactionEvents);
      });
    };
  }, [debouncedBudgetUpdate]);

  // Helper functions
  const getBudgetProgress = useCallback((budgetId) => {
    const budget = state.budgets.find(b => b.id === budgetId);
    if (!budget) return null;
    
    const spent = budget.spent || 0;
    const budgetAmount = budget.budgetAmount || 0;
    const remaining = budgetAmount - spent;
    const percentage = budgetAmount > 0 ? (spent / budgetAmount * 100) : 0;
    
    return {
      spent,
      remaining,
      percentage,
      budgetAmount,
      isExceeded: percentage > 100,
      isNearLimit: percentage >= 80,
      status: percentage > 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'good'
    };
  }, [state.budgets]);

  const getFilteredBudgets = useCallback(() => {
    let filtered = [...state.budgets];
    
    if (state.filters.category !== 'all') {
      filtered = filtered.filter(budget => budget.category === state.filters.category);
    }
    
    if (state.filters.status !== 'all') {
      filtered = filtered.filter(budget => {
        if (state.filters.status === 'active') return budget.isActive;
        if (state.filters.status === 'inactive') return !budget.isActive;
        return true;
      });
    }
    
    if (state.filters.search) {
      const searchTerm = state.filters.search.toLowerCase();
      filtered = filtered.filter(budget => 
        budget.category.toLowerCase().includes(searchTerm) ||
        budget.description?.toLowerCase().includes(searchTerm)
      );
    }
    
    filtered.sort((a, b) => {
      const aVal = a[state.filters.sortBy];
      const bVal = b[state.filters.sortBy];
      
      if (state.filters.sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    return filtered;
  }, [state.budgets, state.filters]);

  const isLoading = useCallback((type) => state.loading[type] || false, [state.loading]);
  const hasError = useCallback((type) => !!state.errors[type], [state.errors]);
  const getError = useCallback((type) => state.errors[type], [state.errors]);

  // Memoized context value
  const value = useMemo(() => ({
    state,
    actions,
    budgets: state.budgets,
    overview: state.overview,
    alerts: state.alerts,
    isLoading,
    hasError,
    getError,
    filters: state.filters,
    getBudgetProgress,
    getFilteredBudgets
  }), [state, actions, isLoading, hasError, getError, getBudgetProgress, getFilteredBudgets]);

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};

export default BudgetProvider;
