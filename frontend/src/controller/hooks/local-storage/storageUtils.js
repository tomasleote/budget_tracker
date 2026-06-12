/**
 * Storage utility functions
 * Pure functions for localStorage inspection and formatting
 */

export const createStorageUtils = (isAvailable) => ({
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
});
