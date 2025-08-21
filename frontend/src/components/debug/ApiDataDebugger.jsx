/**
 * Debug component to test real API data loading
 * This will show in the console and browser whether real data is being loaded
 */
import React, { useEffect } from 'react';
import { useCategoryContext } from '../../controller/context/providers/CategoryProvider.jsx';
import { useTransactionContext } from '../../controller/context/providers/TransactionProvider.jsx';
import { useBudgetContext } from '../../controller/context/providers/BudgetProvider.jsx';

const ApiDataDebugger = () => {
  const categoryContext = useCategoryContext();
  const transactionContext = useTransactionContext();
  const budgetContext = useBudgetContext();

  useEffect(() => {
    console.log('🔍 API Data Debugger - Phase 5 Status');
    console.log('📂 Categories:', {
      count: categoryContext.categories?.length || 0,
      loading: categoryContext.isLoading,
      hasError: categoryContext.hasError(),
      error: categoryContext.getError()
    });
    console.log('💰 Transactions:', {
      count: transactionContext.transactions?.length || 0,
      loading: transactionContext.isLoading,
      hasError: transactionContext.hasError(),
      error: transactionContext.getError()
    });
    console.log('🎯 Budgets:', {
      count: budgetContext.budgets?.length || 0,
      loading: budgetContext.isLoading,
      hasError: budgetContext.hasError(),
      error: budgetContext.getError()
    });
    
    // Show summary
    if (categoryContext.categories?.length > 0 || 
        transactionContext.transactions?.length > 0 || 
        budgetContext.budgets?.length > 0) {
      console.log('✅ SUCCESS: Real API data is loading!');
    } else {
      console.log('⚠️ No data loaded yet - this could be normal on first run');
    }
  }, [
    categoryContext.categories,
    transactionContext.transactions,
    budgetContext.budgets,
    categoryContext.isLoading,
    transactionContext.isLoading,
    budgetContext.isLoading
  ]);

  // This component doesn't render anything visible
  return null;
};

export default ApiDataDebugger;
