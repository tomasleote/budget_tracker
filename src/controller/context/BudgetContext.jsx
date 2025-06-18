import React, { createContext, useContext } from 'react';

// Mock Budget Context Hook
const BudgetContext = createContext();

export const useBudgetContext = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    // Return mock data structure
    return {
      budgets: [],
      overview: [],
      alerts: [],
      isLoading: () => false,
      hasError: () => false,
      getError: () => null,
      actions: {
        loadBudgets: async () => {},
        loadOverview: async () => {},
        loadAlerts: async () => {},
        createBudget: async () => {},
        clearErrors: () => {}
      }
    };
  }
  return context;
};

export default BudgetContext;
