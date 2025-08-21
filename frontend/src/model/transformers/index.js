/**
 * Data Transformers Index
 * Central export point for all data transformation utilities
 */

import BaseTransformer from './BaseTransformer.js';
import TransactionTransformer from './TransactionTransformer.js';
import CategoryTransformer from './CategoryTransformer.js';
import BudgetTransformer from './BudgetTransformer.js';

// Export individual transformers
export {
  BaseTransformer,
  TransactionTransformer,
  CategoryTransformer,
  BudgetTransformer
};

// Export commonly used methods directly
export const transformers = {
  // Transaction transformations
  transaction: {
    fromBackend: TransactionTransformer.fromBackend.bind(TransactionTransformer),
    toBackend: TransactionTransformer.toBackend.bind(TransactionTransformer),
    toBackendCreate: TransactionTransformer.toBackendCreate.bind(TransactionTransformer),
    toBackendUpdate: TransactionTransformer.toBackendUpdate.bind(TransactionTransformer),
    validate: TransactionTransformer.validate.bind(TransactionTransformer)
  },
  
  // Category transformations
  category: {
    fromBackend: CategoryTransformer.fromBackend.bind(CategoryTransformer),
    toBackend: CategoryTransformer.toBackend.bind(CategoryTransformer),
    toBackendCreate: CategoryTransformer.toBackendCreate.bind(CategoryTransformer),
    toBackendUpdate: CategoryTransformer.toBackendUpdate.bind(CategoryTransformer),
    validate: CategoryTransformer.validate.bind(CategoryTransformer)
  },
  
  // Budget transformations
  budget: {
    fromBackend: BudgetTransformer.fromBackend.bind(BudgetTransformer),
    toBackend: BudgetTransformer.toBackend.bind(BudgetTransformer),
    toBackendCreate: BudgetTransformer.toBackendCreate.bind(BudgetTransformer),
    toBackendUpdate: BudgetTransformer.toBackendUpdate.bind(BudgetTransformer),
    validate: BudgetTransformer.validate.bind(BudgetTransformer)
  }
};

// Default export
export default transformers;
