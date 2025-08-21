/**
 * Repository Factory
 * Creates repository instances based on configuration
 * Allows switching between localStorage and API implementations
 */

// Import localStorage repositories
import TransactionRepository from './TransactionRepository.js';
import CategoryRepository from './CategoryRepository.js';
import BudgetRepository from './BudgetRepository.js';
import UserRepository from './UserRepository.js';

// Import API repositories
import {
  apiTransactionRepository,
  apiCategoryRepository,
  apiBudgetRepository
} from './api/index.js';

/**
 * Repository Factory Class
 */
class RepositoryFactory {
  // Static singleton instances
  static _instances = {
    transactions: null,
    categories: null,
    budgets: null,
    users: null
  };

  /**
   * Check if API mode is enabled
   * @returns {boolean} True if API should be used
   */
  static isApiEnabled() {
    return process.env.REACT_APP_USE_API === 'true';
  }

  /**
   * Check if offline mode is active
   * @returns {boolean} True if offline
   */
  static isOffline() {
    return !navigator.onLine;
  }

  /**
   * Create Transaction Repository
   * @param {boolean} forceLocalStorage - Force localStorage implementation
   * @returns {TransactionRepository|ApiTransactionRepository} Repository instance
   */
  static createTransactionRepository(forceLocalStorage = false) {
    // Return cached instance if exists and conditions haven't changed
    if (this._instances.transactions && !forceLocalStorage) {
      return this._instances.transactions;
    }

    if (forceLocalStorage || !this.isApiEnabled() || this.isOffline()) {
      console.log('Using localStorage TransactionRepository');
      this._instances.transactions = new TransactionRepository();
    } else {
      console.log('Using API TransactionRepository');
      this._instances.transactions = apiTransactionRepository;
    }
    
    return this._instances.transactions;
  }

  /**
   * Create Category Repository
   * @param {boolean} forceLocalStorage - Force localStorage implementation
   * @returns {CategoryRepository|ApiCategoryRepository} Repository instance
   */
  static createCategoryRepository(forceLocalStorage = false) {
    // Return cached instance if exists and conditions haven't changed
    if (this._instances.categories && !forceLocalStorage) {
      return this._instances.categories;
    }

    if (forceLocalStorage || !this.isApiEnabled() || this.isOffline()) {
      console.log('Using localStorage CategoryRepository');
      this._instances.categories = new CategoryRepository();
    } else {
      console.log('Using API CategoryRepository');
      this._instances.categories = apiCategoryRepository;
    }
    
    return this._instances.categories;
  }

  /**
   * Create Budget Repository
   * @param {boolean} forceLocalStorage - Force localStorage implementation
   * @returns {BudgetRepository|ApiBudgetRepository} Repository instance
   */
  static createBudgetRepository(forceLocalStorage = false) {
    // Return cached instance if exists and conditions haven't changed
    if (this._instances.budgets && !forceLocalStorage) {
      return this._instances.budgets;
    }

    if (forceLocalStorage || !this.isApiEnabled() || this.isOffline()) {
      console.log('Using localStorage BudgetRepository');
      this._instances.budgets = new BudgetRepository();
    } else {
      console.log('Using API BudgetRepository');
      this._instances.budgets = apiBudgetRepository;
    }
    
    return this._instances.budgets;
  }

  /**
   * Create User Repository
   * @param {boolean} forceLocalStorage - Force localStorage implementation
   * @returns {UserRepository} Repository instance
   */
  static createUserRepository(forceLocalStorage = false) {
    // Return cached instance if exists
    if (this._instances.users && !forceLocalStorage) {
      return this._instances.users;
    }

    // User repository is always localStorage for now
    console.log('Using localStorage UserRepository');
    this._instances.users = new UserRepository();
    return this._instances.users;
  }

  /**
   * Create all repositories
   * @param {boolean} forceLocalStorage - Force localStorage implementation
   * @returns {Object} Object with all repositories
   */
  static createAllRepositories(forceLocalStorage = false) {
    return {
      transactions: this.createTransactionRepository(forceLocalStorage),
      categories: this.createCategoryRepository(forceLocalStorage),
      budgets: this.createBudgetRepository(forceLocalStorage),
      users: this.createUserRepository(forceLocalStorage)
    };
  }

  /**
   * Clear all cached instances (useful for testing or when switching modes)
   */
  static clearInstances() {
    this._instances = {
      transactions: null,
      categories: null,
      budgets: null,
      users: null
    };
  }

  /**
   * Get repository configuration info
   * @returns {Object} Configuration information
   */
  static getConfiguration() {
    return {
      apiEnabled: this.isApiEnabled(),
      offline: this.isOffline(),
      apiUrl: process.env.REACT_APP_API_URL || 'Not configured',
      implementation: this.isApiEnabled() && !this.isOffline() ? 'API' : 'localStorage'
    };
  }

  /**
   * Listen for online/offline changes
   * @param {Function} callback - Callback when online status changes
   * @returns {Function} Cleanup function
   */
  static onConnectionChange(callback) {
    const handleOnline = () => {
      // Clear instances when going online to switch to API repositories
      if (this.isApiEnabled()) {
        console.log('🌐 Going online - switching to API repositories');
        this.clearInstances();
      }
      callback(true);
    };
    
    const handleOffline = () => {
      // Clear instances when going offline to switch to localStorage
      console.log('📴 Going offline - switching to localStorage repositories');
      this.clearInstances();
      callback(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Return cleanup function
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }
}

// Create singleton repository accessor object
// This ensures the same instance is always returned for each repository type
const repositories = {
  get transactions() {
    return RepositoryFactory.createTransactionRepository();
  },
  
  get categories() {
    return RepositoryFactory.createCategoryRepository();
  },
  
  get budgets() {
    return RepositoryFactory.createBudgetRepository();
  },
  
  get users() {
    return RepositoryFactory.createUserRepository();
  }
};

// Export factory and repositories
export { RepositoryFactory, repositories };
export default RepositoryFactory;
