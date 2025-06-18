import React, { createContext, useContext } from 'react';

// Budget Context
const BudgetContext = createContext();

export const useBudgetContext = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudgetContext must be used within a BudgetProvider');
  }
  return context;
};

export default BudgetContext;