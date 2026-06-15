/**
 * Repository Factory
 * Selects repository implementations based on the runtime app mode:
 *   'authed' -> API repositories (Express via api/client.js, Bearer token)
 *   'demo'   -> localStorage repositories (mock data, offline)
 *   null     -> logged out; defaults to localStorage so consumers never crash
 */

import { logger } from '../../controller/utils/logger.js';
import { getAppMode } from '../../controller/appMode.js';

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

class RepositoryFactory {
  static _instances = {
    transactions: null,
    categories: null,
    budgets: null,
    users: null
  };

  // Mode the cached instances were built for; a change invalidates the cache.
  static _cachedMode = undefined;

  /**
   * @returns {'authed'|'demo'|null} Current runtime mode.
   */
  static getMode() {
    return getAppMode();
  }

  /**
   * @returns {boolean} True when API repositories should back the data layer.
   */
  static useApi() {
    return this.getMode() === 'authed';
  }

  /**
   * Drop cached instances when the mode changes so a login/logout/demo switch
   * transparently rebinds repositories on the next access.
   */
  static _syncMode() {
    const mode = this.getMode();
    if (mode !== this._cachedMode) {
      logger.debug(`RepositoryFactory mode change: ${this._cachedMode} -> ${mode}`);
      this._cachedMode = mode;
      this.clearInstances();
    }
  }

  static createTransactionRepository() {
    this._syncMode();
    if (this._instances.transactions) return this._instances.transactions;

    this._instances.transactions = this.useApi()
      ? apiTransactionRepository
      : new TransactionRepository();
    return this._instances.transactions;
  }

  static createCategoryRepository() {
    this._syncMode();
    if (this._instances.categories) return this._instances.categories;

    this._instances.categories = this.useApi()
      ? apiCategoryRepository
      : new CategoryRepository();
    return this._instances.categories;
  }

  static createBudgetRepository() {
    this._syncMode();
    if (this._instances.budgets) return this._instances.budgets;

    this._instances.budgets = this.useApi()
      ? apiBudgetRepository
      : new BudgetRepository();
    return this._instances.budgets;
  }

  static createUserRepository() {
    this._syncMode();
    if (this._instances.users) return this._instances.users;

    // No API user repository yet; profile data stays in localStorage.
    this._instances.users = new UserRepository();
    return this._instances.users;
  }

  static createAllRepositories() {
    return {
      transactions: this.createTransactionRepository(),
      categories: this.createCategoryRepository(),
      budgets: this.createBudgetRepository(),
      users: this.createUserRepository()
    };
  }

  /**
   * Clear cached instances (mode switches call this automatically; exposed for tests).
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
   * @returns {Object} Current configuration snapshot.
   */
  static getConfiguration() {
    const mode = this.getMode();
    return {
      mode,
      apiEnabled: this.useApi(),
      implementation: this.useApi() ? 'API' : 'localStorage',
      apiUrl: process.env.REACT_APP_API_URL || 'Not configured'
    };
  }
}

// Singleton accessor object - same instance per type, rebound on mode change.
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

export { RepositoryFactory, repositories };
export default RepositoryFactory;
