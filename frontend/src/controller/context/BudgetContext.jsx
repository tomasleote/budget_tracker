import React, { createContext, useContext } from 'react';

// Create BudgetContext
const BudgetContext = createContext();

// Hook to use BudgetContext
export const useBudgetContext = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudgetContext must be used within a BudgetProvider');
  }
  return context;
};

export default BudgetContext;
