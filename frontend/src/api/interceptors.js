/**
 * Axios Interceptors
 * Handle request/response intercepting for authentication, logging, and error handling
 */

import { createApiError, isRetryableError } from './errors.js';
import API_CONFIG from './config.js';

// Request ID generator for tracking
let requestCounter = 0;
const generateRequestId = () => {
  return `req_${Date.now()}_${++requestCounter}`;
};

// Retry delay calculator with exponential backoff
const calculateRetryDelay = (retryCount) => {
  return API_CONFIG.RETRY.RETRY_DELAY * Math.pow(API_CONFIG.RETRY.RETRY_MULTIPLIER, retryCount - 1);
};

// Request interceptor
export const setupRequestInterceptor = (axiosInstance) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      // Add timestamp for performance tracking
      config.metadata = { startTime: new Date() };
      
      // Log request in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
          params: config.params,
          data: config.data,
          headers: config.headers,
        });
      }
      
      // Add auth token if available (for future use)
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    },
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(createApiError(error));
    }
  );
};

// Response interceptor with retry logic
export const setupResponseInterceptor = (axiosInstance) => {
  axiosInstance.interceptors.response.use(
    (response) => {
      // Calculate request duration
      const duration = new Date() - response.config.metadata.startTime;
      
      // Log response in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
          status: response.status,
          duration: `${duration}ms`,
          data: response.data,
        });
      }
      
      // Add performance warning for slow requests
      if (duration > 5000) {
        console.warn(`⚠️ Slow API request detected: ${response.config.url} took ${duration}ms`);
      }
      
      // Handle different response formats
      if (response.data && typeof response.data === 'object') {
        // If the response has a standard format with success flag
        if ('success' in response.data && !response.data.success) {
          // Server returned an error in a 200 response
          const error = createApiError({
            response: {
              status: response.status,
              data: response.data,
            },
          });
          return Promise.reject(error);
        }
        
        // Handle backend response format: { success: true, data: {...}, meta: {...} }
        if (response.data.success && response.data.data !== undefined) {
          // Return the inner data object which contains the actual data structure
          // For transactions: { transactions: [...], pagination: {...} }
          // For categories: [...] (direct array)
          // For budgets: [...] (direct array)
          return response.data.data;
        }
      }
      
      // Fallback: return the response data as-is
      return response.data;
    },
    async (error) => {
      const originalRequest = error.config;
      
      // Log error in development
      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
        });
      }
      
      // Convert to custom error
      const apiError = createApiError(error);
      
      // Check if we should retry
      if (
        originalRequest &&
        !originalRequest._retry &&
        isRetryableError(apiError) &&
        API_CONFIG.RETRY.RETRY_STATUSES.includes(apiError.statusCode)
      ) {
        // Mark request as retried
        originalRequest._retry = true;
        originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
        
        // Check if we've exceeded max retries
        if (originalRequest._retryCount > API_CONFIG.RETRY.MAX_RETRIES) {
          console.error(`Max retries exceeded for ${originalRequest.url}`);
          return Promise.reject(apiError);
        }
        
        // Calculate delay with exponential backoff
        const delay = calculateRetryDelay(originalRequest._retryCount);
        
        console.log(`🔄 Retrying request ${originalRequest.url} (attempt ${originalRequest._retryCount}/${API_CONFIG.RETRY.MAX_RETRIES}) after ${delay}ms`);
        
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(axiosInstance(originalRequest));
          }, delay);
        });
      }
      
      return Promise.reject(apiError);
    }
  );
};

// Setup both interceptors
export const setupInterceptors = (axiosInstance) => {
  setupRequestInterceptor(axiosInstance);
  setupResponseInterceptor(axiosInstance);
};

export default {
  setupInterceptors,
  setupRequestInterceptor,
  setupResponseInterceptor
};
