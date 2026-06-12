/**
 * Base API Service
 * Abstract base class for all API services with common CRUD operations
 */

import api from '../client.js';
import API_CONFIG from '../config.js';
import { NotFoundError, ValidationError } from '../errors.js';
import { normalizeGetAllResponse } from './base/responseNormalizer.js';

class BaseApiService {
  constructor(resourceName, endpoints) {
    this.resourceName = resourceName;
    this.endpoints = endpoints;
  }

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

      return normalizeGetAllResponse(response, page, limit);
    } catch (error) {
      console.error(`Error fetching ${this.resourceName}:`, error);
      throw error;
    }
  }

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

  async search(query, params = {}) {
    if (!query || typeof query !== 'string') {
      throw new ValidationError('Search query is required');
    }

    if (!this.endpoints.search) {
      return this.getAll({ ...params, search: query });
    }

    try {
      const response = await api.get(this.endpoints.search, { q: query, ...params });
      return response;
    } catch (error) {
      console.error(`Error searching ${this.resourceName}:`, error);
      throw error;
    }
  }

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

  async count(filters = {}) {
    try {
      const response = await this.getAll({ ...filters, limit: 1 });
      return response.pagination?.total || 0;
    } catch (error) {
      console.error(`Error counting ${this.resourceName}:`, error);
      return 0;
    }
  }

  async getCustom(endpoint, params = {}) {
    try {
      const response = await api.get(endpoint, params);
      return response;
    } catch (error) {
      console.error(`Error fetching custom endpoint ${endpoint}:`, error);
      throw error;
    }
  }

  async postCustom(endpoint, data = {}) {
    try {
      const response = await api.post(endpoint, data);
      return response;
    } catch (error) {
      console.error(`Error posting to custom endpoint ${endpoint}:`, error);
      throw error;
    }
  }

  // Template methods — override in subclasses
  validateData(data) { return data; }
  transformResponse(data) { return data; }
  transformRequest(data) { return data; }
}

export default BaseApiService;
