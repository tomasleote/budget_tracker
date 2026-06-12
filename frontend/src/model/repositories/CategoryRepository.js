import { logger } from '../../controller/utils/logger.js';
import BaseRepository from './BaseRepository.js';
import { Category } from '../entities/index.js';
import StorageService from '../services/StorageService.js';
import { applyFilters } from './category/filters.js';
import { computeStats, computeColorDistribution, computeIconDistribution } from './category/stats.js';
import { isValidHexColor, validateHierarchy } from './category/validators.js';
import { toCSV } from './category/serializers.js';

class CategoryRepository extends BaseRepository {
  constructor() {
    super('Category', StorageService.storageKeys.CATEGORIES, Category);
  }

  // Category-specific query methods
  async getByType(type) {
    try {
      return await this.findBy({ type });
    } catch (error) {
      logger.error('Error getting categories by type:', error);
      return [];
    }
  }

  async getIncomeCategories() {
    try {
      return await this.getByType('income');
    } catch (error) {
      logger.error('Error getting income categories:', error);
      return [];
    }
  }

  async getExpenseCategories() {
    try {
      return await this.getByType('expense');
    } catch (error) {
      logger.error('Error getting expense categories:', error);
      return [];
    }
  }

  async getActiveCategories() {
    try {
      return await this.findBy({ isActive: true });
    } catch (error) {
      logger.error('Error getting active categories:', error);
      return [];
    }
  }

  async getInactiveCategories() {
    try {
      return await this.findBy({ isActive: false });
    } catch (error) {
      logger.error('Error getting inactive categories:', error);
      return [];
    }
  }

  async getDefaultCategories() {
    try {
      return await this.findBy({ isDefault: true });
    } catch (error) {
      logger.error('Error getting default categories:', error);
      return [];
    }
  }

  async getCustomCategories() {
    try {
      return await this.findBy({ isDefault: false });
    } catch (error) {
      logger.error('Error getting custom categories:', error);
      return [];
    }
  }

  async getParentCategories() {
    try {
      const allCategories = await this.getAll();
      return allCategories.filter(category => category.parentId === null);
    } catch (error) {
      logger.error('Error getting parent categories:', error);
      return [];
    }
  }

  async getSubcategories(parentId) {
    try {
      return await this.findBy({ parentId });
    } catch (error) {
      logger.error('Error getting subcategories:', error);
      return [];
    }
  }

  // Category-specific operations
  async activateCategory(categoryId) {
    try {
      return await this.update(categoryId, { isActive: true });
    } catch (error) {
      logger.error('Error activating category:', error);
      return { success: false, error: error.message };
    }
  }

  async deactivateCategory(categoryId) {
    try {
      const category = await this.getById(categoryId);
      if (!category) {
        throw new Error('Category not found');
      }

      if (category.isDefault) {
        throw new Error('Cannot deactivate default category');
      }

      return await this.update(categoryId, { isActive: false });
    } catch (error) {
      logger.error('Error deactivating category:', error);
      return { success: false, error: error.message };
    }
  }

  async updateCategoryColor(categoryId, color) {
    try {
      if (!isValidHexColor(color)) {
        throw new Error('Invalid hex color format');
      }

      return await this.update(categoryId, { color });
    } catch (error) {
      logger.error('Error updating category color:', error);
      return { success: false, error: error.message };
    }
  }

  async updateCategoryIcon(categoryId, icon) {
    try {
      if (!icon || icon.trim().length === 0) {
        throw new Error('Icon is required');
      }

      return await this.update(categoryId, { icon: icon.trim() });
    } catch (error) {
      logger.error('Error updating category icon:', error);
      return { success: false, error: error.message };
    }
  }

  // Category filtering and searching
  async getWithFilters(filters = {}) {
    try {
      const categories = await this.getAll();
      return applyFilters(categories, filters, this.sortData.bind(this));
    } catch (error) {
      logger.error('Error getting categories with filters:', error);
      return [];
    }
  }

  // Category statistics and analytics
  async getCategoryStats() {
    try {
      const categories = await this.getAll();
      return computeStats(categories);
    } catch (error) {
      logger.error('Error getting category stats:', error);
      return { total: 0, active: 0, inactive: 0, income: 0, expense: 0, default: 0, custom: 0, parents: 0, children: 0 };
    }
  }

  async getColorDistribution() {
    try {
      const categories = await this.getAll();
      return computeColorDistribution(categories);
    } catch (error) {
      logger.error('Error getting color distribution:', error);
      return [];
    }
  }

  async getIconDistribution() {
    try {
      const categories = await this.getAll();
      return computeIconDistribution(categories);
    } catch (error) {
      logger.error('Error getting icon distribution:', error);
      return [];
    }
  }

  // Category hierarchy operations
  async getCategoryHierarchy() {
    try {
      const allCategories = await this.getAll();
      const parentCategories = allCategories.filter(c => c.parentId === null);

      return parentCategories.map(parent => ({
        ...parent,
        children: allCategories.filter(c => c.parentId === parent.id)
      }));
    } catch (error) {
      logger.error('Error getting category hierarchy:', error);
      return [];
    }
  }

  async moveToParent(categoryId, newParentId) {
    try {
      if (newParentId !== null) {
        const parentExists = await this.exists(newParentId);
        if (!parentExists) {
          throw new Error('Parent category not found');
        }

        const category = await this.getById(categoryId);
        if (category && newParentId === categoryId) {
          throw new Error('Category cannot be its own parent');
        }
      }

      return await this.update(categoryId, { parentId: newParentId });
    } catch (error) {
      logger.error('Error moving category to parent:', error);
      return { success: false, error: error.message };
    }
  }

  // Default category management
  async initializeDefaultCategories() {
    try {
      const existingCategories = await this.getAll();

      if (existingCategories.length > 0) {
        return {
          success: true,
          message: 'Default categories already exist',
          count: existingCategories.length
        };
      }

      const defaultCategories = Category.getDefaultCategories();
      const results = await this.createMultiple(defaultCategories.map(c => c.toJSON()));

      return {
        success: results.successful > 0,
        message: `Created ${results.successful} default categories`,
        count: results.successful,
        errors: results.results.filter(r => !r.success)
      };
    } catch (error) {
      logger.error('Error initializing default categories:', error);
      return { success: false, error: error.message };
    }
  }

  async resetDefaultCategories() {
    try {
      const defaultCategories = await this.getDefaultCategories();
      const defaultIds = defaultCategories.map(c => c.id);

      if (defaultIds.length > 0) {
        await this.deleteMultiple(defaultIds);
      }

      return await this.initializeDefaultCategories();
    } catch (error) {
      logger.error('Error resetting default categories:', error);
      return { success: false, error: error.message };
    }
  }

  // Category validation and cleanup
  async findUnusedCategories(transactionCategories = []) {
    try {
      const allCategories = await this.getAll();
      const usedCategoryNames = new Set(transactionCategories);

      return allCategories.filter(category =>
        !category.isDefault && !usedCategoryNames.has(category.name)
      );
    } catch (error) {
      logger.error('Error finding unused categories:', error);
      return [];
    }
  }

  async validateCategoryHierarchy() {
    try {
      const categories = await this.getAll();
      return validateHierarchy(categories);
    } catch (error) {
      logger.error('Error validating category hierarchy:', error);
      return { total: 0, valid: 0, invalid: 0, errors: [] };
    }
  }

  // Category suggestions
  async suggestSimilarCategories(name, type = 'expense') {
    try {
      const categories = await this.getByType(type);
      const searchTerm = name.toLowerCase();

      return categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm) ||
        searchTerm.includes(category.name.toLowerCase())
      ).slice(0, 5);
    } catch (error) {
      logger.error('Error suggesting similar categories:', error);
      return [];
    }
  }

  // Export functionality specific to categories
  async exportToCSV() {
    try {
      const categories = await this.getAll();
      return toCSV(categories);
    } catch (error) {
      logger.error('Error exporting categories to CSV:', error);
      return null;
    }
  }
}

export default CategoryRepository;
