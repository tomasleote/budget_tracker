/**
 * API Configuration
 * Central configuration for all API-related settings
 */

const API_CONFIG = {
  // Base URL - defaults to localhost in development
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  
  // Timeout settings (in milliseconds)
  TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000,
  
  // Retry configuration
  RETRY: {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // Initial delay in ms
    RETRY_MULTIPLIER: 2, // Exponential backoff multiplier
    RETRY_STATUSES: [408, 429, 500, 502, 503, 504], // HTTP status codes to retry
  },
  
  // Request defaults
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // API endpoints
  ENDPOINTS: {
    // Categories
    CATEGORIES: '/categories',
    CATEGORY_BY_ID: (id) => `/categories/${id}`,
    CATEGORIES_BULK: '/categories/bulk',
    
    // Transactions
    TRANSACTIONS: '/transactions',
    TRANSACTION_BY_ID: (id) => `/transactions/${id}`,
    TRANSACTIONS_BULK: '/transactions/bulk',
    TRANSACTIONS_SUMMARY: '/transactions/summary',
    TRANSACTIONS_SEARCH: '/transactions/search',
    
    // Budgets
    BUDGETS: '/budgets',
    BUDGET_BY_ID: (id) => `/budgets/${id}`,
    BUDGETS_BULK: '/budgets/bulk',
    BUDGET_PROGRESS: (id) => `/budgets/${id}/progress`,
    
    // Analytics
    ANALYTICS_OVERVIEW: '/analytics/overview',
    ANALYTICS_TRENDS: '/analytics/trends',
    ANALYTICS_CATEGORIES: '/analytics/categories',
    ANALYTICS_INSIGHTS: '/analytics/insights',
    
    // Import/Export
    IMPORT: '/import-export/import',
    EXPORT: '/import-export/export',
    EXPORT_TEMPLATES: '/import-export/templates',
    
    // Health check
    HEALTH: '/health',
  },
  
  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
  
  // Cache configuration (for future use with React Query)
  CACHE: {
    CATEGORIES_STALE_TIME: 60 * 60 * 1000, // 1 hour
    TRANSACTIONS_STALE_TIME: 5 * 60 * 1000, // 5 minutes
    BUDGETS_STALE_TIME: 10 * 60 * 1000, // 10 minutes
    ANALYTICS_STALE_TIME: 30 * 60 * 1000, // 30 minutes
  },
};

// Helper function to build query strings
export const buildQueryString = (params) => {
  const filteredParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map(v => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`).join('&');
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    });
  
  return filteredParams.length > 0 ? `?${filteredParams.join('&')}` : '';
};

// Helper function to get full URL
export const getApiUrl = (endpoint, params = {}) => {
  const queryString = buildQueryString(params);
  return `${API_CONFIG.BASE_URL}${endpoint}${queryString}`;
};

// Environment checks
export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isTest = process.env.NODE_ENV === 'test';

export default API_CONFIG;
