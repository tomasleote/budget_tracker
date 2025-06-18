import { useUserContext } from '../context/UserContext.jsx';

// Simple safe execute function
const safeExecute = (fn, fallback) => {
  try {
    return fn();
  } catch (error) {
    console.warn('Safe execute error:', error);
    return fallback;
  }
};

/**
 * Simplified User Controller Hook
 */
export const useUser = () => {
  const context = useUserContext();

  return {
    // Basic user data
    user: context.user || { name: 'User', email: '' },
    profile: context.profile || null,
    preferences: context.preferences || {},
    
    // State helpers
    isLoading: (typeof context.isLoading === 'function') ? context.isLoading() : false,
    hasError: (typeof context.hasError === 'function') ? context.hasError() : false,
    getError: (typeof context.getError === 'function') ? context.getError() : null,
    
    // Quick state checks
    isLoadingUser: false,
    isLoadingPreferences: false,
    isUpdatingProfile: false,
    
    // Basic operations
    loadUser: context.actions?.loadUser || (() => Promise.resolve()),
    clearErrors: context.actions?.clearErrors || (() => {}),
    
    // Convenience getters
    getUserDisplayName: () => {
      return safeExecute(() => {
        return context.user?.name || context.profile?.name || 'User';
      }, 'User');
    },
    
    getUserEmail: () => {
      return safeExecute(() => {
        return context.user?.email || context.profile?.email || '';
      }, '');
    },
    
    // Basic helpers
    formatCurrency: (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount);
    },
    
    formatDate: (date) => {
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'short'
      }).format(new Date(date));
    },
    
    // Basic settings
    getCurrentTheme: () => 'light',
    getCurrentCurrency: () => 'USD',
    getLocale: () => 'en-US',
    
    // Theme helpers
    isDarkMode: () => false,
    isLightMode: () => true,
    
    // Basic preference checks
    areNotificationsEnabled: () => true,
    areBudgetAlertsEnabled: () => true,
    
    // Basic validation
    isUserDataComplete: () => !!(context.user),
    hasUserProfile: () => !!(context.user || context.profile),
    isFirstTimeSetup: () => !context.user,
    
    // No-op functions for compatibility
    setTheme: () => {},
    setCurrency: () => {},
    toggleTheme: () => {},
    enableNotifications: () => {},
    disableNotifications: () => {},
    updateProfile: () => Promise.resolve(),
    savePreferences: () => Promise.resolve(),
    
    // Context access
    contexts: {
      user: context
    }
  };
};

export default useUser;
