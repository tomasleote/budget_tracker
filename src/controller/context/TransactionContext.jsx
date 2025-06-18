import React, { createContext, useContext } from 'react';

// Mock Transaction Context
const TransactionContext = createContext();

export const useTransactionContext = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    // Return mock data structure
    return {
      transactions: [],
      recentTransactions: [],
      summary: { income: 0, expenses: 0, balance: 0 },
      categoryBreakdown: [],
      isLoading: () => false,
      hasError: () => false,
      getError: () => null,
      actions: {
        loadTransactions: async () => {},
        loadSummary: async () => {},
        loadRecentTransactions: async () => {},
        createTransaction: async () => {},
        clearErrors: () => {}
      }
    };
  }
  return context;
};

export default TransactionContext;
