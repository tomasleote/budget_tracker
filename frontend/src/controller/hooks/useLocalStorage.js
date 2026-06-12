import { useState, useEffect, useCallback } from 'react';
import { createAppStorage } from './local-storage/appStorage.js';
import { createBackup, createSync } from './local-storage/backupRestore.js';
import { createStorageUtils } from './local-storage/storageUtils.js';

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
  const appStorage = createAppStorage(getItem, setItem, removeItem);

  // Backup and restore functionality
  const backup = createBackup(appStorage);

  // State synchronization helpers
  const sync = createSync(getItem, setItem);

  // Utility functions
  const utils = createStorageUtils(isAvailable);

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
    utils
  };
};

export default useLocalStorage;