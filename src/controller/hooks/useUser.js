import { useUserContext } from '../context/UserContext.jsx';
import { useState, useCallback, useEffect } from 'react';
import { CURRENCY_CONFIG } from '../utils/constants.js';

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
 * Enhanced User Controller Hook with Theme System
 * 
 * Phase 2 Implementation: Adds theme switching, preferences management,
 * and currency formatting with user settings.
 */
export const useUser = () => {
  const context = useUserContext();
  
  // Local state for theme management
  const [currentTheme, setCurrentTheme] = useState(() => {
    // Initialize theme from context, localStorage, or default
    const contextTheme = context.user?.preferences?.theme;
    const storedTheme = localStorage.getItem('budget_tracker_theme');
    return contextTheme || storedTheme || 'light';
  });
  
  // Apply theme to document
  const applyTheme = useCallback((theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('budget_tracker_theme', theme);
    setCurrentTheme(theme);
  }, []);
  
  // Initialize theme on mount
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme, applyTheme]);
  
  // Theme switching methods
  const setTheme = useCallback((theme) => {
    if (['light', 'dark', 'auto'].includes(theme)) {
      applyTheme(theme);
      
      // TODO: Save to user context/backend
      console.log(`Theme changed to: ${theme}`);
    }
  }, [applyTheme]);
  
  const toggleTheme = useCallback(() => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [currentTheme, setTheme]);
  
  // Preference update methods
  const updatePreference = useCallback((key, value) => {
    try {
      // TODO: Implement with user context
      console.log(`Updating preference ${key}:`, value);
      
      // Handle theme preference specially
      if (key === 'theme') {
        setTheme(value);
      }
      
      // For now, just store in localStorage
      const preferences = JSON.parse(localStorage.getItem('budget_tracker_preferences') || '{}');
      preferences[key] = value;
      localStorage.setItem('budget_tracker_preferences', JSON.stringify(preferences));
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error updating preference:', error);
      return Promise.reject(error);
    }
  }, [setTheme]);
  
  const updatePreferences = useCallback((newPreferences) => {
    try {
      // TODO: Implement with user context
      console.log('Updating preferences:', newPreferences);
      
      // Apply theme if included
      if (newPreferences.theme) {
        setTheme(newPreferences.theme);
      }
      
      // Store in localStorage for now
      const existingPreferences = JSON.parse(localStorage.getItem('budget_tracker_preferences') || '{}');
      const updatedPreferences = { ...existingPreferences, ...newPreferences };
      localStorage.setItem('budget_tracker_preferences', JSON.stringify(updatedPreferences));
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error updating preferences:', error);
      return Promise.reject(error);
    }
  }, [setTheme]);
  
  // Get current preferences (with fallbacks)
  const getPreferences = useCallback(() => {
    try {
      const contextPrefs = context.user?.preferences || {};
      const storedPrefs = JSON.parse(localStorage.getItem('budget_tracker_preferences') || '{}');
      
      return {
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        theme: currentTheme,
        language: 'en',
        defaultView: 'dashboard',
        budgetAlerts: true,
        emailNotifications: false,
        ...contextPrefs,
        ...storedPrefs
      };
    } catch (error) {
      console.error('Error getting preferences:', error);
      return {
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        theme: currentTheme,
        language: 'en',
        defaultView: 'dashboard',
        budgetAlerts: true,
        emailNotifications: false
      };
    }
  }, [context.user?.preferences, currentTheme]);
  
  // Enhanced currency formatting with user preferences
  const formatCurrency = useCallback((amount, options = {}) => {
    const preferences = getPreferences();
    const currency = options.currency || preferences.currency || 'USD';
    const decimalPlaces = options.decimalPlaces ?? context.user?.settings?.decimalPlaces ?? 2;
    
    try {
      const currencyInfo = CURRENCY_CONFIG.SUPPORTED.find(c => c.code === currency);
      const locale = currencyInfo?.locale || 'en-US';
      
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces
      }).format(parseFloat(amount) || 0);
    } catch (error) {
      // Fallback formatting
      const currencyInfo = CURRENCY_CONFIG.SUPPORTED.find(c => c.code === currency);
      const symbol = currencyInfo?.symbol || '$';
      return `${symbol}${(parseFloat(amount) || 0).toFixed(decimalPlaces)}`;
    }
  }, [getPreferences, context.user?.settings?.decimalPlaces]);
  
  // Enhanced date formatting with user preferences
  const formatDate = useCallback((date, options = {}) => {
    const preferences = getPreferences();
    const format = options.format || preferences.dateFormat || 'MM/DD/YYYY';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj)) return 'Invalid Date';
    
    try {
      switch (format) {
        case 'DD/MM/YYYY':
          return dateObj.toLocaleDateString('en-GB');
        case 'YYYY-MM-DD':
          return dateObj.toISOString().split('T')[0];
        case 'MM/DD/YYYY':
        default:
          return dateObj.toLocaleDateString('en-US');
      }
    } catch (error) {
      return dateObj.toLocaleDateString();
    }
  }, [getPreferences]);
  
  return {
    // Basic user data
    user: context.user || { name: 'User', email: '' },
    profile: context.profile || null,
    preferences: getPreferences(),
    
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
    
    // Enhanced formatting with user preferences
    formatCurrency,
    formatDate,
    
    // Enhanced theme and preference methods
    getCurrentTheme: () => currentTheme,
    getCurrentCurrency: () => getPreferences().currency,
    getLocale: () => {
      const currency = getPreferences().currency;
      const currencyInfo = CURRENCY_CONFIG.SUPPORTED.find(c => c.code === currency);
      return currencyInfo?.locale || 'en-US';
    },
    
    // Theme helpers
    isDarkMode: () => currentTheme === 'dark',
    isLightMode: () => currentTheme === 'light',
    isAutoMode: () => currentTheme === 'auto',
    
    // Theme management
    setTheme,
    toggleTheme,
    
    // Preference management
    updatePreference,
    updatePreferences,
    getPreferences,
    
    // Enhanced preference checks
    areNotificationsEnabled: () => getPreferences().budgetAlerts,
    areBudgetAlertsEnabled: () => getPreferences().budgetAlerts,
    areEmailNotificationsEnabled: () => getPreferences().emailNotifications,
    
    // Currency helpers
    setCurrency: (currency) => updatePreference('currency', currency),
    setDateFormat: (format) => updatePreference('dateFormat', format),
    
    // Basic validation
    isUserDataComplete: () => !!(context.user),
    hasUserProfile: () => !!(context.user || context.profile),
    isFirstTimeSetup: () => !context.user,
    
    // Enhanced user operations
    enableNotifications: () => updatePreference('budgetAlerts', true),
    disableNotifications: () => updatePreference('budgetAlerts', false),
    updateProfile: () => Promise.resolve(),
    savePreferences: updatePreferences,
    
    // Context access
    contexts: {
      user: context
    }
  };
};

export default useUser;