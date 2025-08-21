import BaseApiRepository from './BaseApiRepository.js';
import { categoryService } from '../../../api/index.js';
import { CategoryTransformer } from '../../transformers/index.js';
import Category from '../../entities/updated/Category.js';

/**
 * ApiCategoryRepository
 * API-based repository for Category entities
 */
class ApiCategoryRepository extends BaseApiRepository {
  constructor() {
    super('categories', categoryService, CategoryTransformer);
    this.EntityClass = Category;
  }

  /**
   * Get categories by type
   * @param {string} type - Category type (income/expense)
   * @returns {Promise<Array>} Categories of specified type
   */
  async getByType(type) {
    try {
      const response = await this.apiService.getCategoriesByType(type);
      return response.map(item => new this.EntityClass(
        this.transformer.fromBackend(item)
      ));
    } catch (error) {
      console.error('Error getting categories by type:', error);
      return [];
    }
  }

  /**
   * Get category hierarchy
   * @returns {Promise<Array>} Categories organized in hierarchy
   */
  async getHierarchy() {
    try {
      const response = await this.apiService.getCategoryHierarchy();
      return response.map(item => new this.EntityClass(
        this.transformer.fromBackend(item)
      ));
    } catch (error) {
      console.error('Error getting category hierarchy:', error);
      return [];
    }
  }

  /**
   * Get income categories
   * @returns {Promise<Array>} Income categories
   */
  async getIncomeCategories() {
    return this.getByType('income');
  }

  /**
   * Get expense categories
   * @returns {Promise<Array>} Expense categories
   */
  async getExpenseCategories() {
    return this.getByType('expense');
  }

  /**
   * Get default categories
   * @returns {Promise<Array>} Default categories
   */
  async getDefaultCategories() {
    try {
      const response = await this.apiService.getDefaultCategories();
      
      if (response && response.data) {
        return response.data.map(item => new this.EntityClass(
          this.transformer.fromBackend(item)
        ));
      }
      
      return [];
    } catch (error) {
      console.error('Error getting default categories:', error);
      return [];
    }
  }

  /**
   * Get active categories
   * @returns {Promise<Array>} Active categories
   */
  async getActiveCategories() {
    try {
      const filters = { isActive: true };
      return await this.getAll(filters);
    } catch (error) {
      console.error('Error getting active categories:', error);
      return [];
    }
  }

  /**
   * Get parent categories
   * @returns {Promise<Array>} Categories without parent
   */
  async getParentCategories() {
    try {
      const filters = { parentId: null };
      return await this.getAll(filters);
    } catch (error) {
      console.error('Error getting parent categories:', error);
      return [];
    }
  }

  /**
   * Get subcategories of a parent
   * @param {string} parentId - Parent category ID
   * @returns {Promise<Array>} Subcategories
   */
  async getSubcategories(parentId) {
    try {
      const filters = { parentId };
      return await this.getAll(filters);
    } catch (error) {
      console.error('Error getting subcategories:', error);
      return [];
    }
  }

  /**
   * Check if category has transactions
   * @param {string} categoryId - Category ID
   * @returns {Promise<boolean>} True if has transactions
   */
  async hasTransactions(categoryId) {
    try {
      return await this.apiService.hasTransactions(categoryId);
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
      return await this.apiService.getCategoryStats(categoryId);
    } catch (error) {
      console.error('Error getting category stats:', error);
      return {
        transactionCount: 0,
        totalAmount: 0,
        averageAmount: 0,
        lastUsed: null
      };
    }
  }

  /**
   * Delete category with replacement
   * @param {string} id - Category ID to delete
   * @param {string} replacementId - Replacement category ID
   * @returns {Promise<Object>} Result
   */
  async deleteWithReplacement(id, replacementId) {
    try {
      await this.apiService.deleteCategory(id, replacementId);
      
      return {
        success: true,
        deletedId: id,
        replacementId
      };
    } catch (error) {
      console.error('Error deleting category with replacement:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Initialize default categories if needed
   * @returns {Promise<Object>} Result
   */
  async initializeDefaults() {
    try {
      const existingCategories = await this.getAll();
      
      if (existingCategories.length === 0) {
        const defaultCategories = CategoryTransformer.getDefaultCategories();
        const response = await this.apiService.bulkCreateCategories(defaultCategories);
        
        return {
          success: true,
          created: response.data ? response.data.length : 0
        };
      }
      
      return {
        success: true,
        created: 0,
        message: 'Categories already exist'
      };
    } catch (error) {
      console.error('Error initializing default categories:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Override create to ensure entity instance creation
   * @param {Object} data - Category data
   * @returns {Promise<Object>} Result with created category
   */
  async create(data) {
    try {
      // Create entity instance to ensure validation
      const entity = new this.EntityClass(data);
      
      // Use parent create method with entity data
      const result = await super.create(entity.toJSON());
      
      if (result.success && result.data) {
        // Return entity instance
        result.data = new this.EntityClass(result.data);
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Override getAll to return entity instances
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} Array of Category entities
   */
  async getAll(filters = {}) {
    const data = await super.getAll(filters);
    return data.map(item => new this.EntityClass(item));
  }

  /**
   * Override getById to return entity instance
   * @param {string} id - Category ID
   * @returns {Promise<Category|null>} Category entity or null
   */
  async getById(id) {
    const data = await super.getById(id);
    return data ? new this.EntityClass(data) : null;
  }

  /**
   * Find category by name and type
   * @param {string} name - Category name
   * @param {string} type - Category type
   * @returns {Promise<Category|null>} Category or null
   */
  async findByNameAndType(name, type) {
    try {
      const categories = await this.getAll({ type });
      const found = categories.find(cat => 
        cat.name.toLowerCase() === name.toLowerCase()
      );
      return found || null;
    } catch (error) {
      console.error('Error finding category by name and type:', error);
      return null;
    }
  }

  /**
   * Activate category
   * @param {string} id - Category ID
   * @returns {Promise<Object>} Result
   */
  async activate(id) {
    return this.update(id, { isActive: true });
  }

  /**
   * Deactivate category
   * @param {string} id - Category ID
   * @returns {Promise<Object>} Result
   */
  async deactivate(id) {
    return this.update(id, { isActive: false });
  }

  /**
   * Get category color map
   * @returns {Promise<Object>} Map of category ID to color
   */
  async getCategoryColorMap() {
    try {
      const categories = await this.getAll();
      const colorMap = {};
      
      categories.forEach(category => {
        colorMap[category.id] = category.color;
      });
      
      return colorMap;
    } catch (error) {
      console.error('Error getting category color map:', error);
      return {};
    }
  }

  /**
   * Validate category against business rules
   * @param {Object} category - Category data
   * @param {Object} context - Validation context
   * @returns {Promise<Object>} Validation result
   */
  async validateBusinessRules(category, context = {}) {
    const errors = [];
    const warnings = [];

    // Check for duplicate names within same type
    if (context.existingCategories) {
      const duplicates = context.existingCategories.filter(c => 
        c.name.toLowerCase() === category.name.toLowerCase() &&
        c.type === category.type &&
        c.id !== category.id
      );

      if (duplicates.length > 0) {
        errors.push(`A ${category.type} category with this name already exists`);
      }
    }

    // Check if category is used before deletion/deactivation
    if (context.checkUsage && category.id) {
      const hasTransactions = await this.hasTransactions(category.id);
      if (hasTransactions) {
        warnings.push('This category has associated transactions');
      }
    }

    return { 
      isValid: errors.length === 0, 
      errors, 
      warnings 
    };
  }
}

// Export singleton instance
const apiCategoryRepository = new ApiCategoryRepository();

export default apiCategoryRepository;
export { ApiCategoryRepository };
