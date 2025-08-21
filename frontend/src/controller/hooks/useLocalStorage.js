import { useState, useEffect, useCallback } from 'react';

/**
 * Local Storage Controller Hook
 * Simple storage operations controller for data persistence
 * Connects View to Model through localStorage operations
 */
export const useLocalStorage = () => {
  const [isAvailable, setIsAvailable] = useState(false);

  // Check if localStorage is available
  useEffect(() => {
    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      setIsAvailable(true);
    } catch (error) {
      console.warn('localStorage is not available:', error);
      setIsAvailable(false);
    }
  }, []);

  // Generic get function with error handling
  const getItem = useCallback((key, defaultValue = null) => {
    if (!isAvailable) return defaultValue;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  }, [isAvailable]);

  // Generic set function with error handling
  const setItem = useCallback((key, value) => {
    if (!isAvailable) return false;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
      return false;
    }
  }, [isAvailable]);

  // Generic remove function
  const removeItem = useCallback((key) => {
    if (!isAvailable) return false;
    
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
      return false;
    }
  }, [isAvailable]);

  // Clear all localStorage
  const clear = useCallback(() => {
    if (!isAvailable) return false;
    
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }, [isAvailable]);

  // Get storage usage info
  const getStorageInfo = useCallback(() => {
    if (!isAvailable) return { used: 0, available: false };
    
    try {
      let used = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }
      
      return {
        used,
        available: true,
        usedFormatted: `${(used / 1024).toFixed(2)} KB`
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { used: 0, available: false };
    }
  }, [isAvailable]);

  // Application-specific storage methods
  const appStorage = {
    // User data
    saveUserData: (userData) => setItem('budget_tracker_user', userData),
    getUserData: () => getItem('budget_tracker_user'),
    clearUserData: () => removeItem('budget_tracker_user'),

    // User preferences
    saveUserPreferences: (preferences) => setItem('budget_tracker_preferences', preferences),
    getUserPreferences: () => getItem('budget_tracker_preferences'),
    clearUserPreferences: () => removeItem('budget_tracker_preferences'),

    // Transactions
    saveTransactions: (transactions) => setItem('budget_tracker_transactions', transactions),
    getTransactions: () => getItem('budget_tracker_transactions', []),
    clearTransactions: () => removeItem('budget_tracker_transactions'),

    // Budgets
    saveBudgets: (budgets) => setItem('budget_tracker_budgets', budgets),
    getBudgets: () => getItem('budget_tracker_budgets', []),
    clearBudgets: () => removeItem('budget_tracker_budgets'),

    // Categories
    saveCategories: (categories) => setItem('budget_tracker_categories', categories),
    getCategories: () => getItem('budget_tracker_categories', []),
    clearCategories: () => removeItem('budget_tracker_categories'),

    // App settings
    saveAppSettings: (settings) => setItem('budget_tracker_app_settings', settings),
    getAppSettings: () => getItem('budget_tracker_app_settings', {}),
    clearAppSettings: () => removeItem('budget_tracker_app_settings'),

    // Last sync timestamp
    saveLastSync: (timestamp = new Date().toISOString()) => setItem('budget_tracker_last_sync', timestamp),
    getLastSync: () => getItem('budget_tracker_last_sync'),
    clearLastSync: () => removeItem('budget_tracker_last_sync'),

    // Clear all app data
    clearAllAppData: () => {
      const appKeys = [
        'budget_tracker_user',
        'budget_tracker_preferences', 
        'budget_tracker_transactions',
        'budget_tracker_budgets',
        'budget_tracker_categories',
        'budget_tracker_app_settings',
        'budget_tracker_last_sync'
      ];
      
      let cleared = 0;
      appKeys.forEach(key => {
        if (removeItem(key)) cleared++;
      });
      
      return cleared;
    },

    // Export all app data
    exportAllAppData: () => {
      return {
        user: appStorage.getUserData(),
        preferences: appStorage.getUserPreferences(),
        transactions: appStorage.getTransactions(),
        budgets: appStorage.getBudgets(),
        categories: appStorage.getCategories(),
        appSettings: appStorage.getAppSettings(),
        lastSync: appStorage.getLastSync(),
        exportedAt: new Date().toISOString()
      };
    },

    // Import all app data
    importAllAppData: (data) => {
      try {
        if (data.user) appStorage.saveUserData(data.user);
        if (data.preferences) appStorage.saveUserPreferences(data.preferences);
        if (data.transactions) appStorage.saveTransactions(data.transactions);
        if (data.budgets) appStorage.saveBudgets(data.budgets);
        if (data.categories) appStorage.saveCategories(data.categories);
        if (data.appSettings) appStorage.saveAppSettings(data.appSettings);
        
        appStorage.saveLastSync();
        return true;
      } catch (error) {
        console.error('Error importing app data:', error);
        return false;
      }
    }
  };

  // Backup and restore functionality
  const backup = {
    // Create backup of all data
    createBackup: () => {
      const backupData = appStorage.exportAllAppData();
      const backupString = JSON.stringify(backupData);
      
      return {
        data: backupString,
        filename: `budget_tracker_backup_${new Date().toISOString().split('T')[0]}.json`,
        size: backupString.length
      };
    },

    // Restore from backup
    restoreFromBackup: (backupString) => {
      try {
        const backupData = JSON.parse(backupString);
        return appStorage.importAllAppData(backupData);
      } catch (error) {
        console.error('Error restoring from backup:', error);
        return false;
      }
    },

    // Download backup file
    downloadBackup: () => {
      const backup = backup.createBackup();
      const blob = new Blob([backup.data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = backup.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return true;
    }
  };

  // State synchronization helpers
  const sync = {
    // Simple state sync - save data to localStorage
    saveState: (key, state) => {
      return setItem(`budget_tracker_state_${key}`, {
        data: state,
        timestamp: new Date().toISOString()
      });
    },

    // Load state from localStorage
    loadState: (key) => {
      const stateData = getItem(`budget_tracker_state_${key}`);
      return stateData ? stateData.data : null;
    },

    // Check if state is stale (older than specified minutes)
    isStateStale: (key, maxAgeMinutes = 30) => {
      const stateData = getItem(`budget_tracker_state_${key}`);
      if (!stateData || !stateData.timestamp) return true;
      
      const stateAge = Date.now() - new Date(stateData.timestamp).getTime();
      const maxAge = maxAgeMinutes * 60 * 1000; // Convert to milliseconds
      
      return stateAge > maxAge;
    }
  };

  return {
    // Basic operations
    getItem,
    setItem,
    removeItem,
    clear,
    getStorageInfo,
    
    // Availability
    isAvailable,
    
    // App-specific storage
    appStorage,
    
    // Backup and restore
    backup,
    
    // State synchronization
    sync,
    
    // Utility functions
    utils: {
      // Check if a key exists
      hasKey: (key) => isAvailable && localStorage.getItem(key) !== null,
      
      // Get all keys
      getAllKeys: () => {
        if (!isAvailable) return [];
        return Object.keys(localStorage);
      },
      
      // Get all app-related keys
      getAppKeys: () => {
        if (!isAvailable) return [];
        return Object.keys(localStorage).filter(key => key.startsWith('budget_tracker_'));
      },
      
      // Format size in human readable format
      formatSize: (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
      }
    }
  };
};

export default useLocalStorage;