/**
 * Environment Configuration Helper
 * Centralized configuration management for the frontend application
 */

/**
 * Environment Configuration Object
 */
const config = {
  // API Configuration
  api: {
    enabled: process.env.REACT_APP_USE_API === 'true',
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
    timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 10000,
    healthEndpoint: process.env.REACT_APP_HEALTH_ENDPOINT || 'http://localhost:3001/health',
  },

  // Development Settings
  development: {
    isDebug: process.env.REACT_APP_DEBUG === 'true',
    isDevelopment: process.env.NODE_ENV === 'development',
    showErrorDetails: process.env.REACT_APP_SHOW_ERROR_DETAILS === 'true',
    enableReduxDevTools: process.env.REACT_APP_ENABLE_REDUX_DEVTOOLS === 'true',
  },

  // Offline Mode Configuration
  offline: {
    enabled: process.env.REACT_APP_ENABLE_OFFLINE === 'true',
    retryAttempts: parseInt(process.env.REACT_APP_OFFLINE_RETRY_ATTEMPTS) || 3,
    retryDelay: parseInt(process.env.REACT_APP_OFFLINE_RETRY_DELAY) || 5000,
  },

  // Caching Configuration
  cache: {
    enabled: process.env.REACT_APP_ENABLE_CACHE === 'true',
    expiry: parseInt(process.env.REACT_APP_CACHE_EXPIRY) || 300000, // 5 minutes
  },

  // Error Handling
  errors: {
    showDetails: process.env.REACT_APP_SHOW_ERROR_DETAILS === 'true',
    enableReporting: process.env.REACT_APP_ENABLE_ERROR_REPORTING === 'true',
  },

  // Performance Settings
  performance: {
    defaultPageSize: parseInt(process.env.REACT_APP_DEFAULT_PAGE_SIZE) || 20,
    maxPageSize: parseInt(process.env.REACT_APP_MAX_PAGE_SIZE) || 100,
    debounceDelay: parseInt(process.env.REACT_APP_DEBOUNCE_DELAY) || 300,
  },
};

/**
 * Configuration Helper Functions
 */
export const configHelpers = {
  /**
   * Check if API mode is enabled
   * @returns {boolean}
   */
  isApiEnabled: () => config.api.enabled,

  /**
   * Check if in development mode
   * @returns {boolean}
   */
  isDevelopment: () => config.development.isDevelopment,

  /**
   * Check if debug mode is enabled
   * @returns {boolean}
   */
  isDebugMode: () => config.development.isDebug,

  /**
   * Check if offline mode is enabled
   * @returns {boolean}
   */
  isOfflineEnabled: () => config.offline.enabled,

  /**
   * Get API base URL
   * @returns {string}
   */
  getApiBaseUrl: () => config.api.baseUrl,

  /**
   * Get full API endpoint URL
   * @param {string} endpoint - API endpoint path
   * @returns {string}
   */
  getApiUrl: (endpoint) => {
    const baseUrl = config.api.baseUrl.endsWith('/') 
      ? config.api.baseUrl.slice(0, -1) 
      : config.api.baseUrl;
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${path}`;
  },

  /**
   * Get configuration summary for debugging
   * @returns {Object}
   */
  getConfigSummary: () => ({
    apiEnabled: config.api.enabled,
    apiBaseUrl: config.api.baseUrl,
    isDevelopment: config.development.isDevelopment,
    isDebug: config.development.isDebug,
    offlineEnabled: config.offline.enabled,
    cacheEnabled: config.cache.enabled,
  }),

  /**
   * Log configuration info (development only)
   */
  logConfig: () => {
    if (!config.development.isDevelopment) return;

    console.group('🔧 Frontend Configuration');
    console.log('API Mode:', config.api.enabled ? '✅ Enabled' : '❌ Disabled (using localStorage)');
    console.log('API URL:', config.api.baseUrl);
    console.log('Debug Mode:', config.development.isDebug ? '✅ Enabled' : '❌ Disabled');
    console.log('Offline Support:', config.offline.enabled ? '✅ Enabled' : '❌ Disabled');
    console.log('Caching:', config.cache.enabled ? '✅ Enabled' : '❌ Disabled');
    console.groupEnd();
  },

  /**
   * Validate configuration
   * @returns {Object} Validation result
   */
  validateConfig: () => {
    const issues = [];
    const warnings = [];

    // Check required API configuration
    if (config.api.enabled) {
      if (!config.api.baseUrl) {
        issues.push('REACT_APP_API_URL is required when API mode is enabled');
      }

      if (config.api.baseUrl && !config.api.baseUrl.startsWith('http')) {
        issues.push('REACT_APP_API_URL must be a valid HTTP/HTTPS URL');
      }
    }

    // Check for potential issues
    if (config.api.timeout < 5000) {
      warnings.push('API timeout is very low (< 5 seconds), may cause issues');
    }

    if (config.performance.defaultPageSize > 50) {
      warnings.push('Default page size is large (> 50), may impact performance');
    }

    return {
      valid: issues.length === 0,
      issues,
      warnings,
    };
  },
};

// Export configuration and helpers
export { config };
export default config;

// Auto-log configuration in development
if (config.development.isDevelopment && config.development.isDebug) {
  configHelpers.logConfig();
  
  const validation = configHelpers.validateConfig();
  if (!validation.valid) {
    console.error('❌ Configuration Issues:', validation.issues);
  }
  if (validation.warnings.length > 0) {
    console.warn('⚠️ Configuration Warnings:', validation.warnings);
  }
}
