import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { repositories } from '../../../model/repositories/RepositoryFactory.js';

const BudgetContext = createContext();

export const BudgetProvider = ({ children }) => {
  const [budgets, setBudgets] = useState([]);
  const [activeBudgets, setActiveBudgets] = useState([]);
  const [budgetAlerts, setBudgetAlerts] = useState([]);
  const [budgetSummary, setBudgetSummary] = useState({
    totalBudgets: 0,
    activeBudgets: 0,
    totalBudgetAmount: 0,
    totalSpentAmount: 0,
    totalRemainingAmount: 0,
    averageProgress: 0
  });
  const [currentBudget, setCurrentBudget] = useState(null);
  const [filters, setFilters] = useState({
    period: 'all',
    status: 'all',
    category: 'all',
    sortBy: 'start_date',
    sortOrder: 'desc'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const budgetRepository = useMemo(() => repositories.budgets, []);

  const loadBudgets = useCallback(async (queryParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await budgetRepository.getAll({
        include_progress: true,
        include_category: true,
        ...queryParams
      });
      
      if (result && (result.data || Array.isArray(result))) {
        let budgetsData;
        
        if (Array.isArray(result)) {
          budgetsData = result;
        } else if (result.data && Array.isArray(result.data)) {
          budgetsData = result.data;
        } else if (result.budgets && Array.isArray(result.budgets)) {
          budgetsData = result.budgets;
        } else {
          budgetsData = [];
        }
        
        setBudgets(budgetsData);
        
        const active = budgetsData.filter(budget => budget.isActive || budget.is_active);
        setActiveBudgets(active);
        
        await loadBudgetSummary(budgetsData);
        await loadBudgetAlerts(budgetsData);
        
      } else {
        throw new Error('Failed to load budgets - invalid response format');
      }
    } catch (err) {
      console.error('Failed to load budgets:', err);
      setError(err.message || 'Failed to load budgets');
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  }, [budgetRepository]);

  const loadBudgetSummary = useCallback(async (budgetsData = budgets) => {
    try {
      const summary = {
        totalBudgets: budgetsData.length,
        activeBudgets: budgetsData.filter(b => b.isActive || b.is_active).length,
        totalBudgetAmount: budgetsData.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0),
        totalSpentAmount: budgetsData.reduce((sum, b) => sum + (parseFloat(b.spentAmount) || 0), 0),
        totalRemainingAmount: 0,
        averageProgress: 0
      };
      
      summary.totalRemainingAmount = summary.totalBudgetAmount - summary.totalSpentAmount;
      summary.averageProgress = summary.totalBudgetAmount > 0 ? 
        (summary.totalSpentAmount / summary.totalBudgetAmount) * 100 : 0;
      
      setBudgetSummary(summary);
    } catch (err) {
      console.error('Failed to calculate budget summary:', err);
    }
  }, [budgets]);

  const loadBudgetAlerts = useCallback(async (budgetsData = budgets) => {
    try {
      const alerts = budgetsData.filter(budget => {
        const spent = parseFloat(budget.spentAmount) || 0;
        const amount = parseFloat(budget.amount) || 0;
        const progress = amount > 0 ? (spent / amount) * 100 : 0;
        
        return progress >= 80; // Alert when 80% or more of budget is spent
      }).map(budget => ({
        id: budget.id,
        type: 'warning',
        message: `Budget "${budget.name}" is ${Math.round((parseFloat(budget.spentAmount) || 0) / (parseFloat(budget.amount) || 1) * 100)}% spent`,
        budget
      }));
      
      setBudgetAlerts(alerts);
    } catch (err) {
      console.error('Failed to load budget alerts:', err);
    }
  }, [budgets]);

  const createBudget = useCallback(async (budgetData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await budgetRepository.create({
        ...budgetData,
        startDate: budgetData.startDate || new Date().toISOString(),
        endDate: budgetData.endDate
      });
      
      if (result && (result.success !== false)) {
        const newBudget = result.data || result;
        setBudgets(prev => [newBudget, ...prev]);
        
        await loadBudgetSummary();
        await loadBudgetAlerts();
        
        window.dispatchEvent(new CustomEvent('budgetCreated', { 
          detail: newBudget 
        }));
        
        return { success: true, data: newBudget };
      } else {
        throw new Error(result?.error || 'Failed to create budget');
      }
    } catch (err) {
      console.error('Failed to create budget:', err);
      setError(err.message || 'Failed to create budget');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [budgetRepository, loadBudgetSummary, loadBudgetAlerts]);

  const updateBudget = useCallback(async (budgetId, updates) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await budgetRepository.update(budgetId, updates);
      
      if (result && (result.success !== false)) {
        const updatedBudget = result.data || result;
        setBudgets(prev => prev.map(b => b.id === budgetId ? updatedBudget : b));
        
        await loadBudgetSummary();
        await loadBudgetAlerts();
        
        window.dispatchEvent(new CustomEvent('budgetUpdated', { 
          detail: updatedBudget 
        }));
        
        return { success: true, data: updatedBudget };
      } else {
        throw new Error(result?.error || 'Failed to update budget');
      }
    } catch (err) {
      console.error('Failed to update budget:', err);
      setError(err.message || 'Failed to update budget');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [budgetRepository, loadBudgetSummary, loadBudgetAlerts]);

  const deleteBudget = useCallback(async (budgetId) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await budgetRepository.delete(budgetId);
      
      if (result && (result.success !== false)) {
        setBudgets(prev => prev.filter(b => b.id !== budgetId));
        
        await loadBudgetSummary();
        await loadBudgetAlerts();
        
        window.dispatchEvent(new CustomEvent('budgetDeleted', { 
          detail: { id: budgetId } 
        }));
        
        return { success: true };
      } else {
        throw new Error(result?.error || 'Failed to delete budget');
      }
    } catch (err) {
      console.error('Failed to delete budget:', err);
      setError(err.message || 'Failed to delete budget');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [budgetRepository, loadBudgetSummary, loadBudgetAlerts]);

  const applyFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    loadBudgets(newFilters);
  }, [loadBudgets]);

  const hasError = useCallback((type) => {
    return !!error;
  }, [error]);

  const getError = useCallback(() => {
    return error;
  }, [error]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  useEffect(() => {
    if (budgets.length > 0) {
      loadBudgetSummary();
      loadBudgetAlerts();
    }
  }, [budgets, loadBudgetSummary, loadBudgetAlerts]);

  const value = useMemo(() => ({
    budgets,
    activeBudgets,
    budgetAlerts,
    budgetSummary,
    currentBudget,
    filters,
    isLoading: loading,
    hasError,
    getError,
    actions: {
      loadBudgets,
      loadBudgetSummary,
      loadBudgetAlerts,
      createBudget,
      updateBudget,
      deleteBudget,
      applyFilters,
      clearErrors: clearError,
      refreshBudgets: loadBudgets,
      setCurrentBudget
    }
  }), [
    budgets,
    activeBudgets,
    budgetAlerts,
    budgetSummary,
    currentBudget,
    filters,
    loading,
    hasError,
    getError,
    loadBudgets,
    loadBudgetSummary,
    loadBudgetAlerts,
    createBudget,
    updateBudget,
    deleteBudget,
    applyFilters,
    clearError
  ]);

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudgetContext = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudgetContext must be used within a BudgetProvider');
  }
  return context;
};

export default BudgetProvider;
