import BaseApiRepository from './BaseApiRepository.js';
import { categoryService } from '../../../api/index.js';
import { CategoryTransformer } from '../../transformers/index.js';
import Category from '../../entities/updated/Category.js';
import { validateCategoryBusinessRules } from './category/validators.js';

/**
 * ApiCategoryRepository
 * API-based repository for Category entities
 */
class ApiCategoryRepository extends BaseApiRepository {
  constructor() {
    super('categories', categoryService, CategoryTransformer);
    this.EntityClass = Category;
  }

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

  async getIncomeCategories() {
    return this.getByType('income');
  }

  async getExpenseCategories() {
    return this.getByType('expense');
  }

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

  async getActiveCategories() {
    try {
      return await this.getAll({ isActive: true });
    } catch (error) {
      console.error('Error getting active categories:', error);
      return [];
    }
  }

  async getParentCategories() {
    try {
      return await this.getAll({ parentId: null });
    } catch (error) {
      console.error('Error getting parent categories:', error);
      return [];
    }
  }

  async getSubcategories(parentId) {
    try {
      return await this.getAll({ parentId });
    } catch (error) {
      console.error('Error getting subcategories:', error);
      return [];
    }
  }

  async hasTransactions(categoryId) {
    try {
      return await this.apiService.hasTransactions(categoryId);
    } catch (error) {
      console.error('Error checking category transactions:', error);
      return false;
    }
  }

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

  async deleteWithReplacement(id, replacementId) {
    try {
      await this.apiService.deleteCategory(id, replacementId);
      return { success: true, deletedId: id, replacementId };
    } catch (error) {
      console.error('Error deleting category with replacement:', error);
      return { success: false, error: error.message };
    }
  }

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

      return { success: true, created: 0, message: 'Categories already exist' };
    } catch (error) {
      console.error('Error initializing default categories:', error);
      return { success: false, error: error.message };
    }
  }

  async create(data) {
    try {
      const entity = new this.EntityClass(data);
      const result = await super.create(entity.toJSON());

      if (result.success && result.data) {
        result.data = new this.EntityClass(result.data);
      }

      return result;
    } catch (error) {
      return { success: false, error: error.message, data: null };
    }
  }

  async getAll(filters = {}) {
    const data = await super.getAll(filters);
    return data.map(item => new this.EntityClass(item));
  }

  async getById(id) {
    const data = await super.getById(id);
    return data ? new this.EntityClass(data) : null;
  }

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

  async activate(id) {
    return this.update(id, { isActive: true });
  }

  async deactivate(id) {
    return this.update(id, { isActive: false });
  }

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

  async validateBusinessRules(category, context = {}) {
    const { errors, warnings } = validateCategoryBusinessRules(category, context);

    // hasTransactions is async and requires repo access — cannot be extracted to a pure helper
    if (context.checkUsage && category.id) {
      const hasTransactions = await this.hasTransactions(category.id);
      if (hasTransactions) {
        warnings.push('This category has associated transactions');
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }
}

// Export singleton instance
const apiCategoryRepository = new ApiCategoryRepository();

export default apiCategoryRepository;
export { ApiCategoryRepository };
