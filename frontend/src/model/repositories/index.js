/**
 * Repositories Index
 * Central export point for all repository implementations
 */

// Import localStorage repositories
import BaseRepository from './BaseRepository.js';
import TransactionRepository from './TransactionRepository.js';
import CategoryRepository from './CategoryRepository.js';
import BudgetRepository from './BudgetRepository.js';
import UserRepository from './UserRepository.js';

// Import API repositories
import {
  apiTransactionRepository,
  apiCategoryRepository,
  apiBudgetRepository,
  ApiTransactionRepository,
  ApiCategoryRepository,
  ApiBudgetRepository
} from './api/index.js';

// Import utilities
import { RepositoryFactory, repositories } from './RepositoryFactory.js';
import offlineHandler from './OfflineHandler.js';

// Export localStorage repositories
export {
  BaseRepository,
  TransactionRepository,
  CategoryRepository,
  BudgetRepository,
  UserRepository
};

// Export API repositories
export {
  apiTransactionRepository,
  apiCategoryRepository,
  apiBudgetRepository,
  ApiTransactionRepository,
  ApiCategoryRepository,
  ApiBudgetRepository
};

// Export utilities
export {
  RepositoryFactory,
  repositories,
  offlineHandler
};

// Default export with smart repositories (auto-switching)
export default repositories;
