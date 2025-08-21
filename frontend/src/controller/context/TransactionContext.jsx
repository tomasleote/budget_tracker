import React, { createContext, useContext } from 'react';

// Create TransactionContext
const TransactionContext = createContext();

// Hook to use TransactionContext
export const useTransactionContext = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactionContext must be used within a TransactionProvider');
  }
  return context;
};

export default TransactionContext;
