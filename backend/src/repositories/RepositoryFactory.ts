/**
 * Repository Factory
 * Returns the appropriate repository implementation based on storage configuration
 */

import { storageConfig } from '../config/storage';
import { logger } from '../config/logger';

// Database repositories
import CategoryRepositoryDB from './CategoryRepository';
import TransactionRepositoryDB from './TransactionRepository';
import BudgetRepositoryDB from './BudgetRepository';
import AnalyticsRepositoryDB from './AnalyticsRepository';

// LocalStorage repositories
import CategoryRepositoryLS from './localStorage/CategoryLocalStorageRepository';
import TransactionRepositoryLS from './localStorage/TransactionLocalStorageRepository';
import BudgetRepositoryLS from './localStorage/BudgetLocalStorageRepository';
import AnalyticsRepositoryLS from './localStorage/AnalyticsLocalStorageRepository';

class RepositoryFactory {
  private static instance: RepositoryFactory;
  private repositories: Map<string, any> = new Map();

  private constructor() {
    this.initializeRepositories();
  }

  static getInstance(): RepositoryFactory {
    if (!RepositoryFactory.instance) {
      RepositoryFactory.instance = new RepositoryFactory();
    }
    return RepositoryFactory.instance;
  }

  private initializeRepositories() {
    const isLocalStorage = storageConfig.isLocalStorage();
    
    logger.info(`Initializing repositories with ${isLocalStorage ? 'localStorage' : 'database'} storage`);

    if (isLocalStorage) {
      // Use localStorage implementations
      this.repositories.set('category', CategoryRepositoryLS);
      this.repositories.set('transaction', TransactionRepositoryLS);
      this.repositories.set('budget', BudgetRepositoryLS);
      this.repositories.set('analytics', AnalyticsRepositoryLS);
    } else {
      // Use database implementations
      this.repositories.set('category', CategoryRepositoryDB);
      this.repositories.set('transaction', TransactionRepositoryDB);
      this.repositories.set('budget', BudgetRepositoryDB);
      this.repositories.set('analytics', AnalyticsRepositoryDB);
    }
  }

  /**
   * Get Category Repository
   */
  getCategoryRepository() {
    return this.repositories.get('category');
  }

  /**
   * Get Transaction Repository
   */
  getTransactionRepository() {
    return this.repositories.get('transaction');
  }

  /**
   * Get Budget Repository
   */
  getBudgetRepository() {
    return this.repositories.get('budget');
  }

  /**
   * Get Analytics Repository
   */
  getAnalyticsRepository() {
    return this.repositories.get('analytics');
  }

  /**
   * Clear all repositories (useful for testing)
   */
  async clearAllData() {
    if (storageConfig.isLocalStorage()) {
      logger.warn('Clearing all localStorage data...');
      
      for (const [name, repo] of this.repositories) {
        if (repo.clearAll) {
          await repo.clearAll();
          logger.debug(`Cleared ${name} repository`);
        }
      }
    } else {
      logger.warn('Clear all data is only available for localStorage mode');
    }
  }

  /**
   * Seed default data
   */
  async seedDefaultData() {
    logger.info('Seeding default data...');
    
    const categoryRepo = this.getCategoryRepository();
    
    // Seed default categories
    const defaultCategories = [
      // Expense categories
      { name: 'Food & Dining', type: 'expense' as const, color: '#FF6B6B', icon: 'utensils', is_default: true, is_active: true },
      { name: 'Transportation', type: 'expense' as const, color: '#4ECDC4', icon: 'car', is_default: true, is_active: true },
      { name: 'Shopping', type: 'expense' as const, color: '#95E1D3', icon: 'shopping-bag', is_default: true, is_active: true },
      { name: 'Entertainment', type: 'expense' as const, color: '#F6D55C', icon: 'gamepad', is_default: true, is_active: true },
      { name: 'Bills & Utilities', type: 'expense' as const, color: '#ED553B', icon: 'file-invoice-dollar', is_default: true, is_active: true },
      { name: 'Healthcare', type: 'expense' as const, color: '#20639B', icon: 'heartbeat', is_default: true, is_active: true },
      { name: 'Education', type: 'expense' as const, color: '#173F5F', icon: 'graduation-cap', is_default: true, is_active: true },
      { name: 'Personal Care', type: 'expense' as const, color: '#3CAEA3', icon: 'spa', is_default: true, is_active: true },
      { name: 'Home', type: 'expense' as const, color: '#F6D55C', icon: 'home', is_default: true, is_active: true },
      { name: 'Other', type: 'expense' as const, color: '#95A5A6', icon: 'ellipsis-h', is_default: true, is_active: true },
      // Income categories
      { name: 'Salary', type: 'income' as const, color: '#2ECC71', icon: 'briefcase', is_default: true, is_active: true },
      { name: 'Freelance', type: 'income' as const, color: '#3498DB', icon: 'laptop', is_default: true, is_active: true },
      { name: 'Investment', type: 'income' as const, color: '#9B59B6', icon: 'chart-line', is_default: true, is_active: true },
      { name: 'Business', type: 'income' as const, color: '#E74C3C', icon: 'store', is_default: true, is_active: true },
      { name: 'Gift', type: 'income' as const, color: '#F39C12', icon: 'gift', is_default: true, is_active: true },
      { name: 'Other Income', type: 'income' as const, color: '#95A5A6', icon: 'plus-circle', is_default: true, is_active: true }
    ];

    // Check if categories already exist
    const existingResult = await categoryRepo.findAll();
    if (existingResult.data && existingResult.data.length > 0) {
      logger.info(`Categories already exist (${existingResult.data.length}), skipping seed`);
      return;
    }

    // Create categories
    const createdCategories = [];
    for (const category of defaultCategories) {
      const result = await categoryRepo.create(category);
      if (result.data) {
        createdCategories.push(result.data);
      }
    }

    logger.info(`Seeded ${createdCategories.length} default categories`);
  }

  /**
   * Get storage mode
   */
  getStorageMode() {
    return storageConfig.mode;
  }

  /**
   * Check if using localStorage
   */
  isUsingLocalStorage() {
    return storageConfig.isLocalStorage();
  }

  /**
   * Check if using database
   */
  isUsingDatabase() {
    return storageConfig.isDatabase();
  }
}

// Export singleton instance
const repositoryFactory = RepositoryFactory.getInstance();

// Export individual repository getters for convenience
export const getCategoryRepository = () => repositoryFactory.getCategoryRepository();
export const getTransactionRepository = () => repositoryFactory.getTransactionRepository();
export const getBudgetRepository = () => repositoryFactory.getBudgetRepository();
export const getAnalyticsRepository = () => repositoryFactory.getAnalyticsRepository();

export default repositoryFactory;
