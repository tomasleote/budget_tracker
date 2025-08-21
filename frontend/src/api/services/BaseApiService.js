/**
 * Base API Service
 * Abstract base class for all API services with common CRUD operations
 */

import api from '../client.js';
import API_CONFIG, { buildQueryString } from '../config.js';
import { NotFoundError, ValidationError } from '../errors.js';

class BaseApiService {
  constructor(resourceName, endpoints) {
    this.resourceName = resourceName;
    this.endpoints = endpoints;
  }

  /**
   * Get all resources with pagination and filtering
   * @param {Object} params - Query parameters (page, limit, filters, etc.)
   * @returns {Promise<Object>} Paginated response with data and metadata
   */
  async getAll(params = {}) {
    try {
      const {
        page = API_CONFIG.PAGINATION.DEFAULT_PAGE,
        limit = API_CONFIG.PAGINATION.DEFAULT_LIMIT,
        ...filters
      } = params;

      const response = await api.get(this.endpoints.base, {
        page,
        limit: Math.min(limit, API_CONFIG.PAGINATION.MAX_LIMIT),
        ...filters,
      });

      // Handle different response formats
      if (response && typeof response === 'object') {
        // If response has data and pagination properties
        if ('data' in response && 'pagination' in response) {
          return response;
        }
        // If response is an array, wrap it
        if (Array.isArray(response)) {
          return {
            data: response,
            pagination: {
              page,
              limit,
              total: response.length,
              pages: 1,
              has_next: false,
              has_prev: false,
            },
          };
        }
      }

      return response;
    } catch (error) {
      console.error(`Error fetching ${this.resourceName}:`, error);
      throw error;
    }
  }

  /**
   * Get a single resource by ID
   * @param {string} id - Resource ID
   * @param {Object} params - Additional query parameters
   * @returns {Promise<Object>} Resource data
   */
  async getById(id, params = {}) {
    if (!id) {
      throw new ValidationError('ID is required');
    }

    try {
      const response = await api.get(this.endpoints.byId(id), params);
      return response;
    } catch (error) {
      if (error.statusCode === 404) {
        throw new NotFoundError(this.resourceName, id);
      }
      throw error;
    }
  }

  /**
   * Create a new resource
   * @param {Object} data - Resource data
   * @returns {Promise<Object>} Created resource
   */
  async create(data) {
    if (!data || typeof data !== 'object') {
      throw new ValidationError('Invalid data provided');
    }

    try {
      const response = await api.post(this.endpoints.base, data);
      return response;
    } catch (error) {
      console.error(`Error creating ${this.resourceName}:`, error);
      throw error;
    }
  }

  /**
   * Update a resource
   * @param {string} id - Resource ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated resource
   */
  async update(id, data) {
    if (!id) {
      throw new ValidationError('ID is required');
    }

    if (!data || typeof data !== 'object') {
      throw new ValidationError('Invalid data provided');
    }

    try {
      const response = await api.put(this.endpoints.byId(id), data);
      return response;
    } catch (error) {
      if (error.statusCode === 404) {
        throw new NotFoundError(this.resourceName, id);
      }
      throw error;
    }
  }

  /**
   * Partially update a resource
   * @param {string} id - Resource ID
   * @param {Object} data - Partial update data
   * @returns {Promise<Object>} Updated resource
   */
  async patch(id, data) {
    if (!id) {
      throw new ValidationError('ID is required');
    }

    if (!data || typeof data !== 'object') {
      throw new ValidationError('Invalid data provided');
    }

    try {
      const response = await api.patch(this.endpoints.byId(id), data);
      return response;
    } catch (error) {
      if (error.statusCode === 404) {
        throw new NotFoundError(this.resourceName, id);
      }
      throw error;
    }
  }

  /**
   * Delete a resource
   * @param {string} id - Resource ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async delete(id) {
    if (!id) {
      throw new ValidationError('ID is required');
    }

    try {
      const response = await api.delete(this.endpoints.byId(id));
      return response;
    } catch (error) {
      if (error.statusCode === 404) {
        throw new NotFoundError(this.resourceName, id);
      }
      throw error;
    }
  }

  /**
   * Bulk create resources
   * @param {Array<Object>} dataArray - Array of resources to create
   * @returns {Promise<Object>} Bulk operation result
   */
  async bulkCreate(dataArray) {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      throw new ValidationError('Data array is required');
    }

    if (!this.endpoints.bulk) {
      throw new Error(`Bulk operations not supported for ${this.resourceName}`);
    }

    try {
      const response = await api.post(this.endpoints.bulk, {
        action: 'create',
        [this.resourceName]: dataArray,
      });
      return response;
    } catch (error) {
      console.error(`Error bulk creating ${this.resourceName}:`, error);
      throw error;
    }
  }

  /**
   * Bulk update resources
   * @param {Array<Object>} updates - Array of updates with IDs
   * @returns {Promise<Object>} Bulk operation result
   */
  async bulkUpdate(updates) {
    if (!Array.isArray(updates) || updates.length === 0) {
      throw new ValidationError('Updates array is required');
    }

    if (!this.endpoints.bulk) {
      throw new Error(`Bulk operations not supported for ${this.resourceName}`);
    }

    try {
      const response = await api.post(this.endpoints.bulk, {
        action: 'update',
        [this.resourceName]: updates,
      });
      return response;
    } catch (error) {
      console.error(`Error bulk updating ${this.resourceName}:`, error);
      throw error;
    }
  }

  /**
   * Bulk delete resources
   * @param {Array<string>} ids - Array of resource IDs to delete
   * @returns {Promise<Object>} Bulk operation result
   */
  async bulkDelete(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ValidationError('IDs array is required');
    }

    if (!this.endpoints.bulk) {
      throw new Error(`Bulk operations not supported for ${this.resourceName}`);
    }

    try {
      const response = await api.post(this.endpoints.bulk, {
        action: 'delete',
        [this.resourceName]: ids.map(id => ({ id })),
      });
      return response;
    } catch (error) {
      console.error(`Error bulk deleting ${this.resourceName}:`, error);
      throw error;
    }
  }

  /**
   * Search resources
   * @param {string} query - Search query
   * @param {Object} params - Additional parameters
   * @returns {Promise<Array>} Search results
   */
  async search(query, params = {}) {
    if (!query || typeof query !== 'string') {
      throw new ValidationError('Search query is required');
    }

    if (!this.endpoints.search) {
      // Fallback to getAll with search parameter
      return this.getAll({ ...params, search: query });
    }

    try {
      const response = await api.get(this.endpoints.search, {
        q: query,
        ...params,
      });
      return response;
    } catch (error) {
      console.error(`Error searching ${this.resourceName}:`, error);
      throw error;
    }
  }

  /**
   * Check if a resource exists
   * @param {string} id - Resource ID
   * @returns {Promise<boolean>} True if exists, false otherwise
   */
  async exists(id) {
    try {
      await this.getById(id);
      return true;
    } catch (error) {
      if (error instanceof NotFoundError) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get count of resources
   * @param {Object} filters - Filter parameters
   * @returns {Promise<number>} Resource count
   */
  async count(filters = {}) {
    try {
      const response = await this.getAll({ ...filters, limit: 1 });
      return response.pagination?.total || 0;
    } catch (error) {
      console.error(`Error counting ${this.resourceName}:`, error);
      return 0;
    }
  }

  /**
   * Get resource with custom endpoint
   * @param {string} endpoint - Custom endpoint
   * @param {Object} params - Query parameters
   * @returns {Promise<any>} Response data
   */
  async getCustom(endpoint, params = {}) {
    try {
      const response = await api.get(endpoint, params);
      return response;
    } catch (error) {
      console.error(`Error fetching custom endpoint ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Post to custom endpoint
   * @param {string} endpoint - Custom endpoint
   * @param {Object} data - Request data
   * @returns {Promise<any>} Response data
   */
  async postCustom(endpoint, data = {}) {
    try {
      const response = await api.post(endpoint, data);
      return response;
    } catch (error) {
      console.error(`Error posting to custom endpoint ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Validate data before sending to API
   * Override this method in child classes for custom validation
   * @param {Object} data - Data to validate
   * @param {string} operation - Operation type (create, update)
   * @returns {Object} Validated data
   */
  validateData(data, operation = 'create') {
    // Override in child classes
    return data;
  }

  /**
   * Transform API response data
   * Override this method in child classes for custom transformation
   * @param {Object} data - API response data
   * @returns {Object} Transformed data
   */
  transformResponse(data) {
    // Override in child classes
    return data;
  }

  /**
   * Transform data before sending to API
   * Override this method in child classes for custom transformation
   * @param {Object} data - Data to send
   * @returns {Object} Transformed data
   */
  transformRequest(data) {
    // Override in child classes
    return data;
  }
}

export default BaseApiService;
