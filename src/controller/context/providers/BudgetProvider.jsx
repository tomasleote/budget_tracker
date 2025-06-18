import React, { useReducer, useEffect } from 'react';
import BudgetService from '../../../model/services/BudgetService.js';
import BudgetContext from '../BudgetContext.jsx';
import { useAppContext } from '../AppContext.jsx';
import { useTransactionContext } from '../TransactionContext.jsx';

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

export const BudgetProvider = ({ children }) => {
  const [state, dispatch] = useReducer(budgetReducer, initialState);
  const { actions: appActions } = useAppContext();
  const transactionContext = useTransactionContext();

  // Get transactions from TransactionProvider instead of repository
  const getTransactionsForBudgetCalculations = () => {
    const transactions = transactionContext.transactions || [];
    const isTransactionLoading = transactionContext.isLoading;
    console.log(`💳 BudgetProvider using ${transactions.length} transactions from TransactionProvider (loading: ${isTransactionLoading})`);
    return transactions;
  };

  // Check if transactions are ready for budget calculations
  const areTransactionsReady = () => {
    const transactions = transactionContext.transactions || [];
    const isTransactionLoading = transactionContext.isLoading;
    
    // Also check localStorage directly to see if we have data that hasn't been loaded yet
    let hasStoredData = false;
    try {
      const storedTransactions = localStorage.getItem('budget_tracker_transactions');
      hasStoredData = storedTransactions && JSON.parse(storedTransactions).length > 0;
    } catch (error) {
      hasStoredData = false;
    }
    
    // Consider transactions ready if:
    // 1. We have transactions in context, OR
    // 2. We're not loading AND we have stored data, OR
    // 3. We're not loading AND localStorage is empty (no data to load)
    const ready = transactions.length > 0 || 
                  (!isTransactionLoading && hasStoredData) ||
                  (!isTransactionLoading && !hasStoredData);
    
    console.log(`🔍 Transactions ready check:`);
    console.log(`  - Context transactions: ${transactions.length}`);
    console.log(`  - Is loading: ${isTransactionLoading}`);
    console.log(`  - Has stored data: ${hasStoredData}`);
    console.log(`  - Ready: ${ready}`);
    
    return ready;
  };

  // Actions - define as a variable first to avoid circular dependency
  let actions;
  actions = {
    // Load budgets
    loadBudgets: async () => {
      try {
        dispatch({ type: BUDGET_ACTIONS.SET_LOADING, payload: { type: 'budgets', value: true } });
        console.log('🔄 Loading budgets...');
        const budgets = await BudgetService.getAllBudgets();
        console.log('📊 Loaded budgets:', budgets.length, budgets);
        dispatch({ type: BUDGET_ACTIONS.SET_BUDGETS, payload: budgets });
      } catch (error) {
        console.error('❌ Error loading budgets:', error);
        dispatch({ type: BUDGET_ACTIONS.SET_ERROR, payload: { type: 'load', error: error.message } });
      } finally {
        dispatch({ type: BUDGET_ACTIONS.SET_LOADING, payload: { type: 'budgets', value: false } });
      }
    },

    // Create budget
    createBudget: async (budgetData) => {
      try {
        dispatch({ type: BUDGET_ACTIONS.SET_LOADING, payload: { type: 'creating', value: true } });
        const result = await BudgetService.createBudget(budgetData);
        if (result.success) {
          dispatch({ type: BUDGET_ACTIONS.ADD_BUDGET, payload: result.budget });
          appActions.showSuccess('Budget created successfully');
          // Refresh overview and alerts after creating
          await actions.loadOverview();
          await actions.loadAlerts();
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

    // Update budget
    updateBudget: async (budgetId, updateData) => {
      try {
        dispatch({ type: BUDGET_ACTIONS.SET_LOADING, payload: { type: 'updating', value: true } });
        const result = await BudgetService.updateBudget(budgetId, updateData);
        if (result.success) {
          dispatch({ type: BUDGET_ACTIONS.UPDATE_BUDGET, payload: result.budget });
          appActions.showSuccess('Budget updated successfully');
          // Refresh overview and alerts after updating
          await actions.loadOverview();
          await actions.loadAlerts();
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

    // Delete budget
    deleteBudget: async (budgetId) => {
      try {
        dispatch({ type: BUDGET_ACTIONS.SET_LOADING, payload: { type: 'deleting', value: true } });
        const result = await BudgetService.deleteBudget(budgetId);
        if (result.success) {
          dispatch({ type: BUDGET_ACTIONS.REMOVE_BUDGET, payload: budgetId });
          appActions.showSuccess('Budget deleted successfully');
          // Refresh overview and alerts after deleting
          await actions.loadOverview();
          await actions.loadAlerts();
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

    // Activate budget
    activateBudget: async (budgetId) => {
      try {
        const result = await BudgetService.activateBudget(budgetId);
        if (result.success) {
          dispatch({ type: BUDGET_ACTIONS.UPDATE_BUDGET, payload: result.data });
          appActions.showSuccess('Budget activated successfully');
          await actions.loadOverview();
          return result;
        }
      } catch (error) {
        appActions.showError(error.message);
        throw error;
      }
    },

    // Deactivate budget
    deactivateBudget: async (budgetId) => {
      try {
        const result = await BudgetService.deactivateBudget(budgetId);
        if (result.success) {
          dispatch({ type: BUDGET_ACTIONS.UPDATE_BUDGET, payload: result.data });
          appActions.showSuccess('Budget deactivated successfully');
          await actions.loadOverview();
          return result;
        }
      } catch (error) {
        appActions.showError(error.message);
        throw error;
      }
    },

    // Load overview - use transactions from TransactionProvider
    loadOverview: async () => {
      try {
        dispatch({ type: BUDGET_ACTIONS.SET_LOADING, payload: { type: 'overview', value: true } });
        console.log('🔄 Loading budget overview...');
        
        // Get budgets from service
        const currentBudgets = await BudgetService.budgetRepository.getCurrentBudgets();
        console.log(`📊 Found ${currentBudgets.length} current budgets`);
        
        // Get transactions from TransactionProvider
        const transactions = getTransactionsForBudgetCalculations();
        console.log(`💳 Using ${transactions.length} transactions for budget calculations`);
        
        // If no transactions, check localStorage directly and try to refresh
        if (transactions.length === 0) {
          console.log('🔍 No transactions from provider, checking localStorage directly...');
          const storedTransactions = localStorage.getItem('budget_tracker_transactions');
          if (storedTransactions) {
            const parsedTransactions = JSON.parse(storedTransactions);
            console.log(`💾 Found ${parsedTransactions.length} transactions in localStorage directly`);
            if (parsedTransactions.length > 0) {
              // Force transaction provider to refresh immediately
              if (transactionContext.actions?.refreshTransactions) {
                console.log('🔄 Triggering transaction provider refresh...');
                const refreshedTransactions = transactionContext.actions.refreshTransactions();
                console.log(`🔄 Refreshed transactions: ${refreshedTransactions?.length || 0}`);
              }
              
              // Also dispatch a custom event to force all providers to sync
              window.dispatchEvent(new CustomEvent('forceDataSync'));
              
              // Wait and retry budget overview calculation
              setTimeout(() => {
                console.log('⏰ Retrying budget overview after transaction refresh...');
                actions.loadOverview();
              }, 500);
              return;
            }
          }
        }
        
        // Calculate overview using transactions from provider
        const overview = currentBudgets.map(budget => {
          console.log(`🔍 Processing budget for ${budget.category}:`);
          console.log(`  - Budget period: ${budget.startDate} to ${budget.endDate}`);
          console.log(`  - Budget amount: ${budget.budgetAmount}`);
          
          // Calculate spending for this budget category in the budget period
          const categoryTransactions = transactions.filter(t => {
            const isExpense = t.type === 'expense';
            const matchesCategory = t.category === budget.category;
            const isInPeriod = isDateInBudgetPeriod(t.date, budget);
            
            if (isExpense && matchesCategory) {
              console.log(`    📝 Transaction: ${t.date} - ${t.category} - ${t.amount} - In period: ${isInPeriod}`);
            }
            
            return isExpense && matchesCategory && isInPeriod;
          });
          
          const spent = categoryTransactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
          const budgetAmount = parseFloat(budget.budgetAmount) || 0;
          const remaining = Math.max(0, budgetAmount - spent);
          const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
          
          console.log(`📊 Budget ${budget.category}: spent ${spent} of ${budgetAmount} (${percentage.toFixed(1)}%) from ${categoryTransactions.length} transactions`);
          
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
        
        // Sort by status (exceeded first, then by percentage)
        overview.sort((a, b) => {
          if (a.progress.isExceeded !== b.progress.isExceeded) {
            return a.progress.isExceeded ? -1 : 1;
          }
          return b.progress.percentage - a.progress.percentage;
        });
        
        console.log('📊 Loaded budget overview:', overview.length, overview);
        dispatch({ type: BUDGET_ACTIONS.SET_OVERVIEW, payload: overview });
      } catch (error) {
        console.error('❌ Error loading budget overview:', error);
        dispatch({ type: BUDGET_ACTIONS.SET_ERROR, payload: { type: 'load', error: error.message } });
      } finally {
        dispatch({ type: BUDGET_ACTIONS.SET_LOADING, payload: { type: 'overview', value: false } });
      }
    },

    // Load alerts
    loadAlerts: async () => {
      try {
        console.log('🔄 Loading budget alerts...');
        const alerts = await BudgetService.getBudgetAlerts();
        console.log('⚠️ Loaded budget alerts:', alerts.length, alerts);
        dispatch({ type: BUDGET_ACTIONS.SET_ALERTS, payload: alerts });
      } catch (error) {
        console.error('❌ Error loading budget alerts:', error);
      }
    },

    // Filter actions
    setFilter: (key, value) => {
      dispatch({ type: BUDGET_ACTIONS.SET_FILTER, payload: { key, value } });
    },

    clearErrors: () => {
      dispatch({ type: BUDGET_ACTIONS.CLEAR_ERROR, payload: 'load' });
      dispatch({ type: BUDGET_ACTIONS.CLEAR_ERROR, payload: 'create' });
      dispatch({ type: BUDGET_ACTIONS.CLEAR_ERROR, payload: 'update' });
      dispatch({ type: BUDGET_ACTIONS.CLEAR_ERROR, payload: 'delete' });
    }
  };

  // Load initial data with better timing
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await actions.loadBudgets();
        
        // Check if transactions are available, retry if not
        const checkAndLoadOverview = async (retryCount = 0) => {
          console.log(`🔄 Attempt ${retryCount + 1} to load budget overview...`);
          
          const transactions = getTransactionsForBudgetCalculations();
          const isReady = areTransactionsReady();
          
          console.log(`📊 Transaction status: ${transactions.length} transactions, ready: ${isReady}`);
          
          if (isReady || retryCount >= 5) {
            // Either we have transactions or we've tried enough times
            await actions.loadOverview();
            await actions.loadAlerts();
          } else {
            // Wait and retry
            console.log(`⏳ Transactions not ready, retrying in ${500 + (retryCount * 200)}ms...`);
            setTimeout(() => {
              checkAndLoadOverview(retryCount + 1);
            }, 500 + (retryCount * 200)); // Increasing delay
          }
        };
        
        // Start checking for transactions
        setTimeout(() => {
          checkAndLoadOverview();
        }, 100);
        
      } catch (error) {
        console.error('Error loading initial budget data:', error);
      }
    };
    
    loadInitialData();
    
    // Listen for custom refresh events
    const handleCustomRefresh = () => {
      console.log('🔄 Custom budget refresh triggered, reloading budget data...');
      setTimeout(() => {
        loadInitialData();
      }, 100);
    };

    window.addEventListener('refreshBudgets', handleCustomRefresh);

    return () => {
      window.removeEventListener('refreshBudgets', handleCustomRefresh);
    };
  }, []); // Empty dependency array is intentional for initial load

  // Watch for transaction changes and update budget overview
  useEffect(() => {
    const transactionCount = transactionContext.transactions?.length || 0;
    console.log(`🔄 Transaction count changed to: ${transactionCount}`);
    
    if (transactionCount > 0) {
      console.log('🔄 Transactions updated, refreshing budget overview...');
      // Small delay to ensure all contexts are ready
      setTimeout(() => {
        actions.loadOverview();
        actions.loadAlerts();
      }, 100);
    }
  }, [transactionContext.transactions?.length, transactionContext.transactions]);

  // Also listen for transaction provider actions (like create/update/delete)
  useEffect(() => {
    const handleTransactionChange = () => {
      console.log('🔄 Transaction change event detected, refreshing budgets...');
      setTimeout(() => {
        actions.loadOverview();
        actions.loadAlerts();
      }, 200);
    };

    // Listen for custom transaction events
    window.addEventListener('transactionCreated', handleTransactionChange);
    window.addEventListener('transactionUpdated', handleTransactionChange);
    window.addEventListener('transactionDeleted', handleTransactionChange);

    return () => {
      window.removeEventListener('transactionCreated', handleTransactionChange);
      window.removeEventListener('transactionUpdated', handleTransactionChange);
      window.removeEventListener('transactionDeleted', handleTransactionChange);
    };
  }, []);

  // Helper function to calculate budget progress
  const getBudgetProgress = (budgetId) => {
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
  };

  const value = {
    state,
    actions,
    budgets: state.budgets,
    overview: state.overview,
    alerts: state.alerts,
    isLoading: (type) => state.loading[type] || false,
    hasError: (type) => !!state.errors[type],
    getError: (type) => state.errors[type],
    filters: state.filters,
    getBudgetProgress,
    
    getFilteredBudgets: () => {
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
    }
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};

export default BudgetProvider;