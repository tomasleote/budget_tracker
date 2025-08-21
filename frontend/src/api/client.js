/**
 * Axios Client Instance
 * Configured axios instance with interceptors and default settings
 */

import axios from 'axios';
import API_CONFIG from './config.js';
import { setupInterceptors } from './interceptors.js';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
  withCredentials: true, // Enable sending cookies with requests
});

// Setup interceptors
setupInterceptors(apiClient);

// Helper methods for common HTTP operations
const api = {
  // GET request
  get: (url, params = {}, config = {}) => {
    return apiClient.get(url, { params, ...config });
  },

  // POST request
  post: (url, data = {}, config = {}) => {
    return apiClient.post(url, data, config);
  },

  // PUT request
  put: (url, data = {}, config = {}) => {
    return apiClient.put(url, data, config);
  },

  // PATCH request
  patch: (url, data = {}, config = {}) => {
    return apiClient.patch(url, data, config);
  },

  // DELETE request
  delete: (url, config = {}) => {
    return apiClient.delete(url, config);
  },

  // Upload file
  upload: (url, formData, onUploadProgress = null) => {
    return apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  },

  // Download file
  download: (url, filename = 'download') => {
    return apiClient.get(url, {
      responseType: 'blob',
    }).then((response) => {
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return response;
    });
  },

  // Batch requests
  batch: (requests) => {
    return Promise.all(requests);
  },

  // Cancel token source (for cancelling requests)
  createCancelToken: () => {
    return axios.CancelToken.source();
  },

  // Check if error is a cancelled request
  isCancel: (error) => {
    return axios.isCancel(error);
  },

  // Set authorization token
  setAuthToken: (token) => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('auth_token', token);
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
      localStorage.removeItem('auth_token');
    }
  },

  // Get current auth token
  getAuthToken: () => {
    return localStorage.getItem('auth_token');
  },

  // Clear auth token
  clearAuthToken: () => {
    delete apiClient.defaults.headers.common['Authorization'];
    localStorage.removeItem('auth_token');
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await apiClient.get('/health');
      return {
        healthy: true,
        data: response,
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
      };
    }
  },

  // Get raw axios instance (for advanced use cases)
  getInstance: () => apiClient,
};

// Export both the configured instance and helper methods
export { apiClient, api };
export default api;
