/**
 * Application-specific storage factory
 * Creates an object with methods for persisting app data
 */

export const createAppStorage = (getItem, setItem, removeItem) => ({
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
  exportAllAppData: function() {
    return {
      user: this.getUserData(),
      preferences: this.getUserPreferences(),
      transactions: this.getTransactions(),
      budgets: this.getBudgets(),
      categories: this.getCategories(),
      appSettings: this.getAppSettings(),
      lastSync: this.getLastSync(),
      exportedAt: new Date().toISOString()
    };
  },

  // Import all app data
  importAllAppData: function(data) {
    try {
      if (data.user) this.saveUserData(data.user);
      if (data.preferences) this.saveUserPreferences(data.preferences);
      if (data.transactions) this.saveTransactions(data.transactions);
      if (data.budgets) this.saveBudgets(data.budgets);
      if (data.categories) this.saveCategories(data.categories);
      if (data.appSettings) this.saveAppSettings(data.appSettings);

      this.saveLastSync();
      return true;
    } catch (error) {
      console.error('Error importing app data:', error);
      return false;
    }
  }
});
