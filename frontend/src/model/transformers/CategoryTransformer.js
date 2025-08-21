import BaseTransformer from './BaseTransformer.js';

/**
 * Category Transformer
 * Handles data transformation between frontend and backend formats for categories
 */
class CategoryTransformer extends BaseTransformer {
  /**
   * Transform category from backend format to frontend format
   * @param {Object} backendData - Category data from API
   * @returns {Object} Frontend formatted category
   */
  static fromBackend(backendData) {
    if (!backendData) return null;

    return {
      id: backendData.id,
      name: this.cleanString(backendData.name),
      type: backendData.type,
      color: backendData.color,
      icon: backendData.icon,
      parentId: backendData.parent_id || null,
      isActive: this.parseBoolean(backendData.is_active),
      isDefault: this.parseBoolean(backendData.is_default),
      description: this.cleanString(backendData.description || ''),
      createdAt: backendData.created_at,
      updatedAt: backendData.updated_at,
      // Include children if present
      children: backendData.children ? this.fromBackendArray(backendData.children) : undefined
    };
  }

  /**
   * Transform category from frontend format to backend format
   * @param {Object} frontendData - Category data from frontend
   * @returns {Object} Backend formatted category
   */
  static toBackend(frontendData) {
    if (!frontendData) return null;

    const transformed = {
      name: this.cleanString(frontendData.name),
      type: frontendData.type,
      color: frontendData.color || '#6B7280',
      icon: frontendData.icon || 'fas fa-tag',
      is_active: this.parseBoolean(frontendData.isActive !== undefined ? frontendData.isActive : true)
    };

    // Only include ID if it's not a temporary ID
    if (frontendData.id && !this.isTemporaryId(frontendData.id)) {
      transformed.id = frontendData.id;
    }

    // Optional fields
    if (frontendData.parentId) {
      transformed.parent_id = frontendData.parentId;
    }

    if (frontendData.description) {
      transformed.description = this.cleanString(frontendData.description);
    }

    // is_default is managed by backend, not sent from frontend

    return transformed;
  }

  /**
   * Transform category for create operation
   * @param {Object} frontendData - Category data from frontend
   * @returns {Object} Backend formatted category for creation
   */
  static toBackendCreate(frontendData) {
    const transformed = this.toBackend(frontendData);
    delete transformed.id; // Remove ID for creation
    delete transformed.is_default; // Backend manages this
    return transformed;
  }

  /**
   * Transform category for update operation
   * @param {Object} frontendData - Category data from frontend
   * @returns {Object} Backend formatted category for update
   */
  static toBackendUpdate(frontendData) {
    const transformed = this.toBackend(frontendData);
    // Remove fields that shouldn't be updated
    delete transformed.id;
    delete transformed.is_default;
    delete transformed.created_at;
    return transformed;
  }

  /**
   * Transform bulk categories for backend
   * @param {Array} categories - Array of frontend categories
   * @returns {Array} Array of backend formatted categories
   */
  static toBulkBackend(categories) {
    return categories.map(cat => this.toBackendCreate(cat));
  }

  /**
   * Check if ID is temporary (not a UUID)
   * @param {string} id - Category ID
   * @returns {boolean} True if temporary ID
   */
  static isTemporaryId(id) {
    if (!id) return true;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return !uuidRegex.test(id);
  }

  /**
   * Build category hierarchy from flat array
   * @param {Array} categories - Flat array of categories
   * @returns {Array} Hierarchical category tree
   */
  static buildHierarchy(categories) {
    if (!Array.isArray(categories)) return [];

    const categoriesById = {};
    const rootCategories = [];

    // First pass: create lookup map
    categories.forEach(category => {
      categoriesById[category.id] = { ...category, children: [] };
    });

    // Second pass: build hierarchy
    categories.forEach(category => {
      if (category.parentId && categoriesById[category.parentId]) {
        categoriesById[category.parentId].children.push(categoriesById[category.id]);
      } else {
        rootCategories.push(categoriesById[category.id]);
      }
    });

    return rootCategories;
  }

  /**
   * Flatten category hierarchy
   * @param {Array} hierarchicalCategories - Hierarchical category tree
   * @returns {Array} Flat array of categories
   */
  static flattenHierarchy(hierarchicalCategories) {
    if (!Array.isArray(hierarchicalCategories)) return [];

    const flat = [];

    const flatten = (categories) => {
      categories.forEach(category => {
        const { children, ...categoryData } = category;
        flat.push(categoryData);
        if (children && children.length > 0) {
          flatten(children);
        }
      });
    };

    flatten(hierarchicalCategories);
    return flat;
  }

  /**
   * Transform filters for backend query
   * @param {Object} filters - Frontend filter object
   * @returns {Object} Backend formatted filters
   */
  static filtersToBackend(filters) {
    const transformed = {};

    if (filters.type) transformed.type = filters.type;
    if (filters.isActive !== undefined) transformed.is_active = this.parseBoolean(filters.isActive);
    if (filters.isDefault !== undefined) transformed.is_default = this.parseBoolean(filters.isDefault);
    if (filters.parentId !== undefined) transformed.parent_id = filters.parentId;
    if (filters.includeChildren !== undefined) transformed.include_children = this.parseBoolean(filters.includeChildren);

    return transformed;
  }

  /**
   * Transform paginated response from backend
   * @param {Object} response - Paginated response from API
   * @returns {Object} Frontend formatted response
   */
  static paginatedFromBackend(response) {
    if (!response) return null;

    return {
      categories: this.fromBackendArray(response.data || response.categories || []),
      pagination: {
        page: response.pagination?.page || 1,
        limit: response.pagination?.limit || 20,
        total: response.pagination?.total || 0,
        pages: response.pagination?.pages || 1,
        hasNext: response.pagination?.has_next || false,
        hasPrev: response.pagination?.has_prev || false
      }
    };
  }

  /**
   * Validate category data before sending to backend
   * @param {Object} category - Category data
   * @returns {Object} Validation result
   */
  static validate(category) {
    const errors = [];

    if (!category.name || category.name.trim() === '') {
      errors.push('Category name is required');
    }

    if (!category.type || !['income', 'expense'].includes(category.type)) {
      errors.push('Valid category type (income/expense) is required');
    }

    if (category.name && category.name.length > 50) {
      errors.push('Category name must be 50 characters or less');
    }

    if (category.color && !/^#[0-9A-F]{6}$/i.test(category.color)) {
      errors.push('Color must be a valid hex color (e.g., #FF5733)');
    }

    if (category.icon && category.icon.length > 50) {
      errors.push('Icon class name must be 50 characters or less');
    }

    if (category.description && category.description.length > 200) {
      errors.push('Description must be 200 characters or less');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get default categories for seeding
   * @returns {Array} Array of default categories in backend format
   */
  static getDefaultCategories() {
    const defaultExpenseCategories = [
      { name: 'Food & Dining', color: '#EF4444', icon: 'fa-solid fa-utensils', type: 'expense' },
      { name: 'Transportation', color: '#F59E0B', icon: 'fa-solid fa-car', type: 'expense' },
      { name: 'Shopping', color: '#8B5CF6', icon: 'fa-solid fa-shopping-bag', type: 'expense' },
      { name: 'Entertainment', color: '#EC4899', icon: 'fa-solid fa-film', type: 'expense' },
      { name: 'Bills & Utilities', color: '#6B7280', icon: 'fa-solid fa-receipt', type: 'expense' },
      { name: 'Healthcare', color: '#10B981', icon: 'fa-solid fa-heart', type: 'expense' },
      { name: 'Education', color: '#3B82F6', icon: 'fa-solid fa-graduation-cap', type: 'expense' },
      { name: 'Personal Care', color: '#F472B6', icon: 'fa-solid fa-user', type: 'expense' },
      { name: 'Home', color: '#059669', icon: 'fa-solid fa-home', type: 'expense' },
      { name: 'Other', color: '#6B7280', icon: 'fa-solid fa-ellipsis-h', type: 'expense' }
    ];

    const defaultIncomeCategories = [
      { name: 'Salary', color: '#10B981', icon: 'fa-solid fa-dollar-sign', type: 'income' },
      { name: 'Freelance', color: '#3B82F6', icon: 'fa-solid fa-laptop', type: 'income' },
      { name: 'Investment', color: '#8B5CF6', icon: 'fa-solid fa-chart-line', type: 'income' },
      { name: 'Gift', color: '#F59E0B', icon: 'fa-solid fa-gift', type: 'income' },
      { name: 'Other Income', color: '#6B7280', icon: 'fa-solid fa-plus', type: 'income' }
    ];

    return [...defaultExpenseCategories, ...defaultIncomeCategories].map(cat => ({
      ...cat,
      is_active: true,
      is_default: true
    }));
  }
}

export default CategoryTransformer;
