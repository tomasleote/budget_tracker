/**
 * API Repositories Index
 * Export all API-based repository implementations
 */

import apiTransactionRepository, { ApiTransactionRepository } from './ApiTransactionRepository.js';
import apiCategoryRepository, { ApiCategoryRepository } from './ApiCategoryRepository.js';
import apiBudgetRepository, { ApiBudgetRepository } from './ApiBudgetRepository.js';

// Export singleton instances
export {
  apiTransactionRepository,
  apiCategoryRepository,
  apiBudgetRepository
};

// Export classes for testing or custom instantiation
export {
  ApiTransactionRepository,
  ApiCategoryRepository,
  ApiBudgetRepository
};

// Default export with all repositories
const apiRepositories = {
  transactions: apiTransactionRepository,
  categories: apiCategoryRepository,
  budgets: apiBudgetRepository
};

export default apiRepositories;
