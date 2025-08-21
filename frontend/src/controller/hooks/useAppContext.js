import { useContext } from 'react';
import { useAppContext as useAppContextProvider } from '../context/AppContext.jsx';

/**
 * Custom hook to access App Context
 * Provides global app state, loading states, notifications, and UI controls
 */
export const useAppContext = () => {
  const context = useAppContextProvider();
  
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }

  return {
    // State access
    ...context,
    
    // Convenience methods
    isGlobalLoading: context.isLoading('global'),
    hasGlobalError: context.hasError('global'),
    globalError: context.getError('global'),
    
    // UI state helpers
    isDarkMode: context.currentTheme === 'dark',
    isSidebarCollapsed: context.state.ui.sidebarCollapsed,
    currentPage: context.currentPage,
    
    // Modal helpers
    isAddTransactionModalOpen: context.isModalOpen('addTransaction'),
    isAddBudgetModalOpen: context.isModalOpen('addBudget'),
    isSettingsModalOpen: context.isModalOpen('settings'),
    
    // Notification helpers
    hasNotifications: context.notifications.length > 0,
    unreadNotifications: context.notifications.filter(n => !n.read).length,
    
    // Quick actions
    showSuccess: context.actions.showSuccess,
    showError: context.actions.showError,
    showInfo: context.actions.showInfo,
    showWarning: context.actions.showWarning,
    
    // UI actions
    toggleTheme: () => {
      const newTheme = context.currentTheme === 'light' ? 'dark' : 'light';
      context.actions.setTheme(newTheme);
    },
    
    toggleSidebar: context.actions.toggleSidebar,
    
    openModal: (modal) => context.actions.toggleModal(modal, true),
    closeModal: (modal) => context.actions.toggleModal(modal, false),
    
    // App control
    setCurrentPage: context.actions.setCurrentPage,
    clearAllErrors: context.actions.clearAllErrors,
    clearAllNotifications: context.actions.clearNotifications
  };
};

export default useAppContext;