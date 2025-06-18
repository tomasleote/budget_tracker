import BaseRepository from './BaseRepository.js';
import { Category } from '../entities/index.js';
import StorageService from '../services/StorageService.js';

class CategoryRepository extends BaseRepository {
  constructor() {
    super('Category', StorageService.storageKeys.CATEGORIES, Category);
  }

  // Category-specific query methods
  async getByType(type) {
    try {
      return await this.findBy({ type });
    } catch (error) {
      console.error('Error getting categories by type:', error);
      return [];
    }
  }

  async getIncomeCategories() {
    try {
      return await this.getByType('income');
    } catch (error) {
      console.error('Error getting income categories:', error);
      return [];
    }
  }

  async getExpenseCategories() {
    try {
      return await this.getByType('expense');
    } catch (error) {
      console.error('Error getting expense categories:', error);
      return [];
    }
  }

  async getActiveCategories() {
    try {
      return await this.findBy({ isActive: true });
    } catch (error) {
      console.error('Error getting active categories:', error);
      return [];
    }
  }

  async getInactiveCategories() {
    try {
      return await this.findBy({ isActive: false });
    } catch (error) {
      console.error('Error getting inactive categories:', error);
      return [];
    }
  }

  async getDefaultCategories() {
    try {
      return await this.findBy({ isDefault: true });
    } catch (error) {
      console.error('Error getting default categories:', error);
      return [];
    }
  }

  async getCustomCategories() {
    try {
      return await this.findBy({ isDefault: false });
    } catch (error) {
      console.error('Error getting custom categories:', error);
      return [];
    }
  }

  async getParentCategories() {
    try {
      const allCategories = await this.getAll();
      return allCategories.filter(category => category.parentId === null);
    } catch (error) {
      console.error('Error getting parent categories:', error);
      return [];
    }
  }

  async getSubcategories(parentId) {
    try {
      return await this.findBy({ parentId });
    } catch (error) {
      console.error('Error getting subcategories:', error);
      return [];
    }
  }

  // Category-specific operations
  async activateCategory(categoryId) {
    try {
      return await this.update(categoryId, { isActive: true });
    } catch (error) {
      console.error('Error activating category:', error);
      return {
        success: false,
        error: error.message
      };
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
      console.error('Error deactivating category:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async updateCategoryColor(categoryId, color) {
    try {
      // Validate hex color
      if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
        throw new Error('Invalid hex color format');
      }

      return await this.update(categoryId, { color });
    } catch (error) {
      console.error('Error updating category color:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async updateCategoryIcon(categoryId, icon) {
    try {
      if (!icon || icon.trim().length === 0) {
        throw new Error('Icon is required');
      }

      return await this.update(categoryId, { icon: icon.trim() });
    } catch (error) {
      console.error('Error updating category icon:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Category filtering and searching
  async getWithFilters(filters = {}) {
    try {
      let categories = await this.getAll();

      // Apply type filter
      if (filters.type && filters.type !== 'all') {
        categories = categories.filter(c => c.type === filters.type);
      }

      // Apply status filter
      if (filters.status) {
        switch (filters.status) {
          case 'active':
            categories = categories.filter(c => c.isActive);
            break;
          case 'inactive':
            categories = categories.filter(c => !c.isActive);
            break;
          case 'default':
            categories = categories.filter(c => c.isDefault);
            break;
          case 'custom':
            categories = categories.filter(c => !c.isDefault);
            break;
        }
      }

      // Apply parent/child filter
      if (filters.parentOnly) {
        categories = categories.filter(c => c.parentId === null);
      }

      if (filters.parentId) {
        categories = categories.filter(c => c.parentId === filters.parentId);
      }

      // Apply search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        categories = categories.filter(c => 
          c.name.toLowerCase().includes(searchTerm) ||
          (c.description && c.description.toLowerCase().includes(searchTerm))
        );
      }

      // Apply color filter
      if (filters.color) {
        categories = categories.filter(c => c.color === filters.color);
      }

      // Apply sorting
      if (filters.sortBy) {
        categories = this.sortData(categories, filters.sortBy, filters.sortOrder || 'asc');
      } else {
        // Default sort by name
        categories = this.sortData(categories, 'name', 'asc');
      }

      // Apply pagination
      if (filters.limit) {
        const offset = filters.offset || 0;
        categories = categories.slice(offset, offset + filters.limit);
      }

      return categories;
    } catch (error) {
      console.error('Error getting categories with filters:', error);
      return [];
    }
  }

  // Category statistics and analytics
  async getCategoryStats() {
    try {
      const categories = await this.getAll();
      const stats = {
        total: categories.length,
        active: 0,
        inactive: 0,
        income: 0,
        expense: 0,
        default: 0,
        custom: 0,
        parents: 0,
        children: 0
      };

      categories.forEach(category => {
        if (category.isActive) {
          stats.active++;
        } else {
          stats.inactive++;
        }

        if (category.type === 'income') {
          stats.income++;
        } else {
          stats.expense++;
        }

        if (category.isDefault) {
          stats.default++;
        } else {
          stats.custom++;
        }

        if (category.parentId === null) {
          stats.parents++;
        } else {
          stats.children++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error getting category stats:', error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        income: 0,
        expense: 0,
        default: 0,
        custom: 0,
        parents: 0,
        children: 0
      };
    }
  }

  async getColorDistribution() {
    try {
      const categories = await this.getAll();
      const colorCounts = {};

      categories.forEach(category => {
        const color = category.color;
        colorCounts[color] = (colorCounts[color] || 0) + 1;
      });

      // Convert to array and sort by count
      return Object.entries(colorCounts)
        .map(([color, count]) => ({ color, count }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error('Error getting color distribution:', error);
      return [];
    }
  }

  async getIconDistribution() {
    try {
      const categories = await this.getAll();
      const iconCounts = {};

      categories.forEach(category => {
        const icon = category.icon;
        iconCounts[icon] = (iconCounts[icon] || 0) + 1;
      });

      // Convert to array and sort by count
      return Object.entries(iconCounts)
        .map(([icon, count]) => ({ icon, count }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error('Error getting icon distribution:', error);
      return [];
    }
  }

  // Category hierarchy operations
  async getCategoryHierarchy() {
    try {
      const allCategories = await this.getAll();
      const hierarchy = [];

      // Get parent categories first
      const parentCategories = allCategories.filter(c => c.parentId === null);

      for (const parent of parentCategories) {
        const parentWithChildren = {
          ...parent,
          children: allCategories.filter(c => c.parentId === parent.id)
        };
        hierarchy.push(parentWithChildren);
      }

      return hierarchy;
    } catch (error) {
      console.error('Error getting category hierarchy:', error);
      return [];
    }
  }

  async moveToParent(categoryId, newParentId) {
    try {
      // Validate that the new parent exists (if not null)
      if (newParentId !== null) {
        const parentExists = await this.exists(newParentId);
        if (!parentExists) {
          throw new Error('Parent category not found');
        }

        // Prevent circular relationships
        const category = await this.getById(categoryId);
        if (category && newParentId === categoryId) {
          throw new Error('Category cannot be its own parent');
        }
      }

      return await this.update(categoryId, { parentId: newParentId });
    } catch (error) {
      console.error('Error moving category to parent:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Default category management
  async initializeDefaultCategories() {
    try {
      const existingCategories = await this.getAll();
      
      // Check if default categories already exist
      if (existingCategories.length > 0) {
        return {
          success: true,
          message: 'Default categories already exist',
          count: existingCategories.length
        };
      }

      // Create default categories using the static method
      const defaultCategories = Category.getDefaultCategories();
      const results = await this.createMultiple(defaultCategories.map(c => c.toJSON()));

      return {
        success: results.successful > 0,
        message: `Created ${results.successful} default categories`,
        count: results.successful,
        errors: results.results.filter(r => !r.success)
      };
    } catch (error) {
      console.error('Error initializing default categories:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async resetDefaultCategories() {
    try {
      // Remove all existing default categories
      const defaultCategories = await this.getDefaultCategories();
      const defaultIds = defaultCategories.map(c => c.id);
      
      if (defaultIds.length > 0) {
        await this.deleteMultiple(defaultIds);
      }

      // Re-create default categories
      return await this.initializeDefaultCategories();
    } catch (error) {
      console.error('Error resetting default categories:', error);
      return {
        success: false,
        error: error.message
      };
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
      console.error('Error finding unused categories:', error);
      return [];
    }
  }

  async validateCategoryHierarchy() {
    try {
      const categories = await this.getAll();
      const errors = [];

      for (const category of categories) {
        if (category.parentId !== null) {
          const parent = categories.find(c => c.id === category.parentId);
          if (!parent) {
            errors.push({
              id: category.id,
              name: category.name,
              error: 'Parent category not found'
            });
          } else if (parent.parentId !== null) {
            errors.push({
              id: category.id,
              name: category.name,
              error: 'Nested subcategories not allowed'
            });
          }
        }
      }

      return {
        total: categories.length,
        valid: categories.length - errors.length,
        invalid: errors.length,
        errors
      };
    } catch (error) {
      console.error('Error validating category hierarchy:', error);
      return {
        total: 0,
        valid: 0,
        invalid: 0,
        errors: []
      };
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
      ).slice(0, 5); // Limit to 5 suggestions
    } catch (error) {
      console.error('Error suggesting similar categories:', error);
      return [];
    }
  }

  // Export functionality specific to categories
  async exportToCSV() {
    try {
      const categories = await this.getAll();
      
      if (categories.length === 0) {
        return '';
      }

      const headers = ['ID', 'Name', 'Type', 'Color', 'Icon', 'Description', 'Is Default', 'Is Active', 'Parent ID', 'Created At'];
      const csvRows = [headers.join(',')];

      categories.forEach(category => {
        const row = [
          category.id,
          `"${category.name}"`,
          category.type,
          category.color,
          category.icon,
          `"${category.description || ''}"`,
          category.isDefault,
          category.isActive,
          category.parentId || '',
          category.createdAt
        ];
        csvRows.push(row.join(','));
      });

      return csvRows.join('\n');
    } catch (error) {
      console.error('Error exporting categories to CSV:', error);
      return null;
    }
  }
}

export default CategoryRepository;