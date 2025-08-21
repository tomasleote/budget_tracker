import React from 'react';
import { AppProvider as AppContextProvider } from '../AppContext.jsx';
import { TransactionProvider } from './TransactionProvider.jsx';
import { BudgetProvider } from './BudgetProvider.jsx';
import { CategoryProvider } from './CategoryProvider.jsx';
import { UserProvider } from './UserProvider.jsx';

/**
 * Root provider that combines all context providers in the correct order
 * This is the main provider that should wrap the entire application
 * 
 * Provider hierarchy:
 * AppProvider (global state) 
 *   -> UserProvider (user preferences/auth)
 *     -> CategoryProvider (category management)
 *       -> TransactionProvider (transaction operations)
 *         -> BudgetProvider (budget management)
 */
export const AppProvider = ({ children }) => {
  return (
    <AppContextProvider>
      <UserProvider>
        <CategoryProvider>
          <TransactionProvider>
            <BudgetProvider>
              {children}
            </BudgetProvider>
          </TransactionProvider>
        </CategoryProvider>
      </UserProvider>
    </AppContextProvider>
  );
};

export default AppProvider;