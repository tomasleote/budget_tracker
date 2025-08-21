import { api, getUserFriendlyErrorMessage } from '../../../api/index.js';

/**
 * BaseApiRepository
 * Base class for API-based repositories that maintains the same interface as localStorage repositories
 */
class BaseApiRepository {
  constructor(entityName, apiService, transformer) {
    this.entityName = entityName;
    this.apiService = apiService;
    this.transformer = transformer;
  }

  /**
   * Create a new entity
   * @param {Object} data - Entity data
   * @returns {Promise<Object>} Result with success status and data/error
   */
  async create(data) {
    try {
      // Validate data if transformer has validation
      if (this.transformer.validate) {
        const validation = this.transformer.validate(data);
        if (!validation.isValid) {
          return {
            success: false,
            error: validation.errors.join(', '),
            data: null
          };
        }
      }

      // Transform data for backend
      const backendData = this.transformer.toBackendCreate(data);
      
      // Call API service
      const response = await this.apiService.create(backendData);
      
      // Transform response back to frontend format
      const transformedData = this.transformer.fromBackend(response);
      
      return {
        success: true,
        data: transformedData,
        id: transformedData.id
      };
    } catch (error) {
      console.error(`Error creating ${this.entityName}:`, error);
      return {
        success: false,
        error: getUserFriendlyErrorMessage(error),
        data: null
      };
    }
  }

  /**
   * Get all entities with optional filtering
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} Array of entities
   */
  async getAll(filters = {}) {
    try {
      // Transform filters if needed
      const backendFilters = this.transformer.filtersToBackend ? 
        this.transformer.filtersToBackend(filters) : filters;
      
      // Call API service
      const response = await this.apiService.getAll(backendFilters);
      
      console.log(`🔍 DEBUG - ${this.entityName} repository response:`, response);
      
      // Handle different response formats from the interceptor
      let dataArray = [];
      
      if (Array.isArray(response)) {
        // Direct array response (categories, budgets)
        dataArray = response;
      } else if (response && typeof response === 'object') {
        // Object response - check for different data properties
        if (response.data && Array.isArray(response.data)) {
          // Format: { data: [...] }
          dataArray = response.data;
        } else if (response.transactions && Array.isArray(response.transactions)) {
          // Format: { transactions: [...], pagination: {...} }
          dataArray = response.transactions;
        } else if (response.categories && Array.isArray(response.categories)) {
          // Format: { categories: [...] }
          dataArray = response.categories;
        } else if (response.budgets && Array.isArray(response.budgets)) {
          // Format: { budgets: [...] }
          dataArray = response.budgets;
        }
      }
      
      console.log(`🔍 DEBUG - ${this.entityName} extracted data array:`, dataArray);
      
      // Transform the data using the transformer
      if (dataArray.length > 0) {
        return this.transformer.fromBackendArray(dataArray);
      } else {
        return [];
      }
    } catch (error) {
      console.error(`Error fetching ${this.entityName}:`, error);
      throw error;
    }
  }

  /**
   * Get entity by ID
   * @param {string} id - Entity ID
   * @returns {Promise<Object|null>} Entity or null if not found
   */
  async getById(id) {
    try {
      const response = await this.apiService.getById(id);
      return this.transformer.fromBackend(response);
    } catch (error) {
      console.error(`Error fetching ${this.entityName} by ID:`, error);
      throw error;
    }
  }

  /**
   * Update an existing entity
   * @param {string} id - Entity ID
   * @param {Object} updates - Update data
   * @returns {Promise<Object>} Result with success status and data/error
   */
  async update(id, updates) {
    try {
      // Validate updates if transformer has validation
      if (this.transformer.validate) {
        const validation = this.transformer.validate(updates, false); // false = not creating
        if (!validation.isValid) {
          return {
            success: false,
            error: validation.errors.join(', '),
            data: null
          };
        }
      }

      // Transform data for backend
      const backendData = this.transformer.toBackendUpdate ? 
        this.transformer.toBackendUpdate(updates) : updates;
      
      // Call API service
      const response = await this.apiService.update(id, backendData);
      
      // Transform response back to frontend format
      const transformedData = this.transformer.fromBackend(response);
      
      return {
        success: true,
        data: transformedData
      };
    } catch (error) {
      console.error(`Error updating ${this.entityName}:`, error);
      return {
        success: false,
        error: getUserFriendlyErrorMessage(error),
        data: null
      };
    }
  }

  /**
   * Delete an entity
   * @param {string} id - Entity ID
   * @returns {Promise<Object>} Result with success status
   */
  async delete(id) {
    try {
      await this.apiService.delete(id);
      return {
        success: true,
        id
      };
    } catch (error) {
      console.error(`Error deleting ${this.entityName}:`, error);
      return {
        success: false,
        error: getUserFriendlyErrorMessage(error)
      };
    }
  }

  /**
   * Search entities
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Array of matching entities
   */
  async search(query, filters = {}) {
    try {
      const searchParams = {
        q: query,
        ...filters
      };
      
      const response = await this.apiService.search ? 
        await this.apiService.search(searchParams) :
        await this.apiService.getAll(searchParams);
      
      // Handle response format consistently with getAll
      let dataArray = [];
      
      if (Array.isArray(response)) {
        dataArray = response;
      } else if (response && typeof response === 'object') {
        if (response.data && Array.isArray(response.data)) {
          dataArray = response.data;
        } else if (response.transactions && Array.isArray(response.transactions)) {
          dataArray = response.transactions;
        } else if (response.categories && Array.isArray(response.categories)) {
          dataArray = response.categories;
        } else if (response.budgets && Array.isArray(response.budgets)) {
          dataArray = response.budgets;
        }
      }
      
      return this.transformer.fromBackendArray(dataArray);
    } catch (error) {
      console.error(`Error searching ${this.entityName}:`, error);
      throw error;
    }
  }
}

export default BaseApiRepository;
