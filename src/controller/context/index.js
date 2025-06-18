// Context exports for centralized access
export { default as AppContext, AppProvider, useAppContext } from './AppContext.jsx';
export { default as TransactionContext, TransactionProvider, useTransactionContext } from './TransactionContext.jsx';
export { default as BudgetContext, BudgetProvider, useBudgetContext } from './BudgetContext.jsx';
export { default as CategoryContext, CategoryProvider, useCategoryContext } from './CategoryContext.jsx';
export { default as UserContext, UserProvider, useUserContext } from './UserContext.jsx';

// Combined provider component for wrapping the entire app
import React from 'react';
import { AppProvider } from './AppContext.jsx';
import { TransactionProvider } from './TransactionContext.jsx';
import { BudgetProvider } from './BudgetContext.jsx';
import { CategoryProvider } from './CategoryContext.jsx';
import { UserProvider } from './UserContext.jsx';

/**
 * Combined provider that wraps all context providers in the correct order
 * Order matters: AppContext -> UserContext -> CategoryContext -> TransactionContext -> BudgetContext
 * This ensures dependencies are available when needed
 */
export const ContextProviders = ({ children }) => {
  return (
    <AppProvider>
      <UserProvider>
        <CategoryProvider>
          <TransactionProvider>
            <BudgetProvider>
              {children}
            </BudgetProvider>
          </TransactionProvider>
        </CategoryProvider>
      </UserProvider>
    </AppProvider>
  );
};

// Hook to use multiple contexts at once
export const useAppState = () => {
  const appContext = useAppContext();
  const userContext = useUserContext();
  const categoryContext = useCategoryContext();
  const transactionContext = useTransactionContext();
  const budgetContext = useBudgetContext();

  return {
    app: appContext,
    user: userContext,
    categories: categoryContext,
    transactions: transactionContext,
    budgets: budgetContext,
    
    // Convenience methods for common operations
    isLoading: () => {
      return (
        appContext.isLoading('global') ||
        userContext.isLoading('user') ||
        categoryContext.isLoading('categories') ||
        transactionContext.isLoading('transactions') ||
        budgetContext.isLoading('budgets')
      );
    },
    
    hasErrors: () => {
      return (
        appContext.hasError('global') ||
        userContext.hasError('load') ||
        categoryContext.hasError('load') ||
        transactionContext.hasError('load') ||
        budgetContext.hasError('load')
      );
    },
    
    clearAllErrors: () => {
      appContext.actions.clearAllErrors();
      userContext.actions.clearErrors();
      categoryContext.actions.clearErrors();
      transactionContext.actions.clearErrors();
      budgetContext.actions.clearErrors();
    },
    
    refreshAllData: async () => {
      await Promise.all([
        userContext.actions.refreshData(),
        categoryContext.actions.refreshData(),
        transactionContext.actions.refreshData(),
        budgetContext.actions.refreshData()
      ]);
    }
  };
};

// Context state selectors for performance optimization
export const useAppSelector = (selector) => {
  const appState = useAppState();
  return selector(appState);
};

// Common selectors
export const selectors = {
  // User selectors
  getCurrentUser: (state) => state.user.user,
  getCurrentTheme: (state) => state.user.getCurrentTheme(),
  getCurrentCurrency: (state) => state.user.getCurrentCurrency(),
  isAuthenticated: (state) => state.user.isAuthenticated(),
  
  // Transaction selectors
  getAllTransactions: (state) => state.transactions.transactions,
  getTransactionSummary: (state) => state.transactions.summary,
  getRecentTransactions: (state) => state.transactions.recentTransactions,
  
  // Budget selectors
  getAllBudgets: (state) => state.budgets.budgets,
  getActiveBudgets: (state) => state.budgets.activeBudgets,
  getBudgetOverview: (state) => state.budgets.overview,
  getBudgetAlerts: (state) => state.budgets.alerts,
  
  // Category selectors
  getAllCategories: (state) => state.categories.categories,
  getActiveCategories: (state) => state.categories.getFilteredCategories().filter(c => c.isActive),
  getCategoryStats: (state) => state.categories.stats,
  
  // Combined selectors
  getDashboardData: (state) => ({
    user: state.user.user,
    transactions: state.transactions.recentTransactions,
    summary: state.transactions.summary,
    budgets: state.budgets.overview,
    alerts: state.budgets.alerts,
    categories: state.categories.stats
  }),
  
  getAppStatus: (state) => ({
    isLoading: state.isLoading(),
    hasErrors: state.hasErrors(),
    isAuthenticated: state.user.isAuthenticated(),
    theme: state.user.getCurrentTheme(),
    currency: state.user.getCurrentCurrency()
  })
};