/**
 * API Module Index
 * Main entry point for the API layer
 */

// Import all dependencies at the top
import api, { apiClient } from './client.js';
import API_CONFIG, { buildQueryString, getApiUrl } from './config.js';
import {
  ApiError,
  NetworkError,
  TimeoutError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ServerError,
  BusinessError,
  createApiError,
  isRetryableError,
  getUserFriendlyErrorMessage,
} from './errors.js';
import {
  categoryService,
  transactionService,
  budgetService,
  analyticsService,
  CategoryService,
  TransactionService,
  BudgetService,
  AnalyticsService,
} from './services/index.js';

// Export the configured API client
export { api as default, apiClient };

// Export configuration
export { API_CONFIG, buildQueryString, getApiUrl };

// Export error classes and utilities
export {
  ApiError,
  NetworkError,
  TimeoutError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ServerError,
  BusinessError,
  createApiError,
  isRetryableError,
  getUserFriendlyErrorMessage,
};

// Export services
export {
  categoryService,
  transactionService,
  budgetService,
  analyticsService,
};

// Export service classes
export {
  CategoryService,
  TransactionService,
  BudgetService,
  AnalyticsService,
};

// Default export with everything organized
const API = {
  // Client
  client: api,
  
  // Services
  services: {
    categories: categoryService,
    transactions: transactionService,
    budgets: budgetService,
    analytics: analyticsService,
  },
  
  // Configuration
  config: API_CONFIG,
  
  // Utilities
  utils: {
    buildQueryString,
    getApiUrl,
    createApiError,
    isRetryableError,
    getUserFriendlyErrorMessage,
  },
};

export { API };
