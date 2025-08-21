/**
 * API Services Index
 * Central export point for all API services
 */

// Import all services
import categoryService, { CategoryService } from './CategoryService.js';
import transactionService, { TransactionService } from './TransactionService.js';
import budgetService, { BudgetService } from './BudgetService.js';
import analyticsService, { AnalyticsService } from './AnalyticsService.js';

// Export singleton instances (recommended for most use cases)
export {
  categoryService,
  transactionService,
  budgetService,
  analyticsService,
};

// Export classes for advanced use cases or testing
export {
  CategoryService,
  TransactionService,
  BudgetService,
  AnalyticsService,
};

// Default export with all services
const apiServices = {
  categories: categoryService,
  transactions: transactionService,
  budgets: budgetService,
  analytics: analyticsService,
};

export default apiServices;
