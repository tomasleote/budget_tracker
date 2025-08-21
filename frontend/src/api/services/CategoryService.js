/**
 * Category API Service
 * Handles all category-related API operations
 */

import BaseApiService from './BaseApiService.js';
import API_CONFIG from '../config.js';
import { ValidationError } from '../errors.js';
import api from '../client.js';

class CategoryService extends BaseApiService {
  constructor() {
    super('categories', {
      base: API_CONFIG.ENDPOINTS.CATEGORIES,
      byId: API_CONFIG.ENDPOINTS.CATEGORY_BY_ID,
      bulk: API_CONFIG.ENDPOINTS.CATEGORIES_BULK,
    });
  }

  /**
   * Get all categories with optional filtering
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Categories with pagination
   */
  async getAllCategories(params = {}) {
    const response = await this.getAll(params);
    
    // Transform response if needed
    if (response.data && Array.isArray(response.data)) {
      response.data = response.data.map(category => this.transformResponse(category));
    }
    
    return response;
  }

  /**
   * Get categories by type
   * @param {string} type - Category type (income/expense)
   * @returns {Promise<Array>} Filtered categories
   */
  async getCategoriesByType(type) {
    if (!['income', 'expense'].includes(type)) {
      throw new ValidationError('Invalid category type. Must be "income" or "expense"');
    }

    const response = await this.getAll({ type });
    return response.data || [];
  }

  /**
   * Get category hierarchy (categories with their children)
   * @returns {Promise<Array>} Categories organized in hierarchy
   */
  async getCategoryHierarchy() {
    const response = await this.getAll({ include_children: true });
    const categories = response.data || [];
    
    // Build hierarchy tree
    const rootCategories = categories.filter(cat => !cat.parent_id);
    const categoriesById = {};
    
    categories.forEach(cat => {
      categoriesById[cat.id] = { ...cat, children: [] };
    });
    
    categories.forEach(cat => {
      if (cat.parent_id && categoriesById[cat.parent_id]) {
        categoriesById[cat.parent_id].children.push(categoriesById[cat.id]);
      }
    });
    
    return rootCategories.map(cat => categoriesById[cat.id]);
  }

  /**
   * Create a new category
   * @param {Object} categoryData - Category data
   * @returns {Promise<Object>} Created category
   */
  async createCategory(categoryData) {
    const validatedData = this.validateData(categoryData, 'create');
    const transformedData = this.transformRequest(validatedData);
    
    const response = await this.create(transformedData);
    return this.transformResponse(response);
  }

  /**
   * Update a category
   * @param {string} id - Category ID
   * @param {Object} updates - Update data
   * @returns {Promise<Object>} Updated category
   */
  async updateCategory(id, updates) {
    const validatedData = this.validateData(updates, 'update');
    const transformedData = this.transformRequest(validatedData);
    
    const response = await this.update(id, transformedData);
    return this.transformResponse(response);
  }

  /**
   * Delete a category
   * @param {string} id - Category ID
   * @param {string} replacementId - ID of category to move transactions to
   * @returns {Promise<Object>} Deletion result
   */
  async deleteCategory(id, replacementId = null) {
    if (replacementId) {
      // If replacement category is provided, the backend will handle moving transactions
      const response = await api.delete(this.endpoints.byId(id), {
        params: { replacement_id: replacementId }
      });
      return response;
    }
    
    return this.delete(id);
  }

  /**
   * Bulk create categories
   * @param {Array<Object>} categories - Array of category data
   * @returns {Promise<Object>} Bulk operation result
   */
  async bulkCreateCategories(categories) {
    const validatedCategories = categories.map(cat => 
      this.validateData(cat, 'create')
    ).map(cat => this.transformRequest(cat));
    
    return this.bulkCreate(validatedCategories);
  }

  /**
   * Get default categories
   * @returns {Promise<Array>} Default categories
   */
  async getDefaultCategories() {
    return this.getAll({ is_default: true });
  }

  /**
   * Validate category data
   * @param {Object} data - Category data
   * @param {string} operation - Operation type
   * @returns {Object} Validated data
   */
  validateData(data, operation = 'create') {
    const errors = [];

    if (operation === 'create') {
      // Required fields for creation
      if (!data.name || data.name.trim() === '') {
        errors.push('Category name is required');
      }
      
      if (!data.type || !['income', 'expense'].includes(data.type)) {
        errors.push('Valid category type (income/expense) is required');
      }
    }

    // Validate name length
    if (data.name && data.name.length > 50) {
      errors.push('Category name must be 50 characters or less');
    }

    // Validate color format if provided
    if (data.color && !/^#[0-9A-F]{6}$/i.test(data.color)) {
      errors.push('Color must be a valid hex color (e.g., #FF5733)');
    }

    // Validate icon if provided
    if (data.icon && data.icon.length > 50) {
      errors.push('Icon class name must be 50 characters or less');
    }

    if (errors.length > 0) {
      throw new ValidationError('Category validation failed', errors);
    }

    return data;
  }

  /**
   * Transform request data to API format
   * @param {Object} data - Category data
   * @returns {Object} Transformed data
   */
  transformRequest(data) {
    const transformed = {
      name: data.name,
      type: data.type,
      color: data.color || '#6B7280', // Default gray color
      icon: data.icon || 'fas fa-tag', // Default icon
      is_active: data.is_active !== undefined ? data.is_active : true,
    };

    // Add optional fields
    if (data.parent_id) {
      transformed.parent_id = data.parent_id;
    }

    if (data.description) {
      transformed.description = data.description;
    }

    return transformed;
  }

  /**
   * Transform API response to frontend format
   * @param {Object} category - API category data
   * @returns {Object} Transformed category
   */
  transformResponse(category) {
    if (!category) return null;

    return {
      id: category.id,
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon,
      parentId: category.parent_id || null,
      isActive: category.is_active,
      isDefault: category.is_default || false,
      description: category.description || '',
      createdAt: category.created_at,
      updatedAt: category.updated_at,
    };
  }

  /**
   * Check if category has transactions
   * @param {string} categoryId - Category ID
   * @returns {Promise<boolean>} True if has transactions
   */
  async hasTransactions(categoryId) {
    try {
      const response = await this.getCustom(`${this.endpoints.byId(categoryId)}/transactions/count`);
      return response.count > 0;
    } catch (error) {
      console.error('Error checking category transactions:', error);
      return false;
    }
  }

  /**
   * Get category statistics
   * @param {string} categoryId - Category ID
   * @returns {Promise<Object>} Category statistics
   */
  async getCategoryStats(categoryId) {
    try {
      const response = await this.getCustom(`${this.endpoints.byId(categoryId)}/stats`);
      return response;
    } catch (error) {
      console.error('Error fetching category stats:', error);
      throw error;
    }
  }
}

// Create singleton instance
const categoryService = new CategoryService();

export default categoryService;
export { CategoryService };
