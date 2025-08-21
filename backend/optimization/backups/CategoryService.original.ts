import { Category, CreateCategoryDto, UpdateCategoryDto, CategoryQuery, CategoryWithChildren } from '../types/category';
import { logger } from '../config/logger';
import CategoryRepository from '../repositories/CategoryRepository';

export class CategoryService {
  /**
   * Get all categories with optional filtering
   */
  async getCategories(query: CategoryQuery = {}): Promise<Category[]> {
    try {
      const {
        type,
        is_active,
        parent_id
      } = query;

      const filters: any = {};
      if (type) filters.type = type;
      if (is_active !== undefined) filters.is_active = is_active;
      if (parent_id !== undefined) {
        if (parent_id === null) {
          filters['is_null_parent_id'] = true;
        } else {
          filters.parent_id = parent_id;
        }
      }

      const result = await CategoryRepository.findAll(filters, { field: 'created_at', ascending: true });
      
      if (result.error) {
        throw new Error(`Failed to fetch categories: ${result.error}`);
      }

      return result.data || [];
    } catch (error) {
      logger.error('CategoryService.getCategories error:', error);
      throw error;
    }
  }

  /**
   * Get categories with hierarchy structure
   */
  async getCategoriesWithHierarchy(query: CategoryQuery = {}): Promise<CategoryWithChildren[]> {
    try {
      const result = await CategoryRepository.getCategoryHierarchy(query.type);
      
      if (result.error) {
        throw new Error(`Failed to fetch category hierarchy: ${result.error}`);
      }

      return result.data || [];
    } catch (error) {
      logger.error('CategoryService.getCategoriesWithHierarchy error:', error);
      throw error;
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string): Promise<Category | null> {
    try {
      const result = await CategoryRepository.findById(id);
      
      if (result.error) {
        throw new Error(`Failed to fetch category: ${result.error}`);
      }

      return result.data;
    } catch (error) {
      logger.error('CategoryService.getCategoryById error:', error);
      throw error;
    }
  }

  /**
   * Create new category with business logic validation
   */
  async createCategory(categoryData: CreateCategoryDto): Promise<Category> {
    try {
      // Business Rule: Validate parent category exists if specified
      if (categoryData.parent_id) {
        const parentExists = await this.getCategoryById(categoryData.parent_id);
        if (!parentExists) {
          throw new Error('Parent category not found');
        }

        // Business Rule: Parent and child must have same type
        if (parentExists.type !== categoryData.type) {
          throw new Error(`Parent category type "${parentExists.type}" does not match child type "${categoryData.type}"`);
        }
      }

      // Business Rule: Check for duplicate name within the same type
      const existingResult = await CategoryRepository.findByNameAndType(categoryData.name, categoryData.type);
      if (existingResult.error) {
        throw new Error(`Failed to check for existing category: ${existingResult.error}`);
      }
      if (existingResult.data) {
        throw new Error(`Category with name "${categoryData.name}" already exists for type "${categoryData.type}"`);
      }

      // Create category with default values
      const createData = {
        ...categoryData,
        is_default: false,
        is_active: true
      };

      const result = await CategoryRepository.create(createData);
      
      if (result.error || !result.data) {
        throw new Error(`Failed to create category: ${result.error}`);
      }

      logger.info(`Category created: ${result.data.name} (${result.data.id})`);
      return result.data;
    } catch (error) {
      logger.error('CategoryService.createCategory error:', error);
      throw error;
    }
  }

  /**
   * Update category with business logic validation
   */
  async updateCategory(id: string, updates: UpdateCategoryDto): Promise<Category> {
    try {
      // Business Rule: Check if category exists
      const existing = await this.getCategoryById(id);
      if (!existing) {
        throw new Error('Category not found');
      }

      // Business Rule: Cannot modify default categories structure (only activation)
      if (existing.is_default && (updates.name || updates.type || updates.parent_id !== undefined)) {
        throw new Error('Cannot modify name, type, or parent of default categories');
      }

      // Business Rule: Validate parent category if being updated
      if (updates.parent_id !== undefined) {
        if (updates.parent_id === id) {
          throw new Error('Category cannot be its own parent');
        }
        
        if (updates.parent_id) {
          const parentExists = await this.getCategoryById(updates.parent_id);
          if (!parentExists) {
            throw new Error('Parent category not found');
          }

          // Business Rule: Check for circular reference
          const wouldCreateCircle = await this.wouldCreateCircularReference(id, updates.parent_id);
          if (wouldCreateCircle) {
            throw new Error('Update would create circular reference');
          }

          // Business Rule: Parent and child must have same type
          const newType = updates.type || existing.type;
          if (parentExists.type !== newType) {
            throw new Error(`Parent category type "${parentExists.type}" does not match child type "${newType}"`);
          }
        }
      }

      // Business Rule: Check for name conflicts if name is being updated
      if (updates.name && updates.name !== existing.name) {
        const type = updates.type || existing.type;
        const nameExistsResult = await CategoryRepository.findByNameAndType(updates.name, type);
        if (nameExistsResult.error) {
          throw new Error(`Failed to check name conflict: ${nameExistsResult.error}`);
        }
        if (nameExistsResult.data && nameExistsResult.data.id !== id) {
          throw new Error(`Category with name "${updates.name}" already exists for type "${type}"`);
        }
      }

      const result = await CategoryRepository.update(id, updates);
      
      if (result.error || !result.data) {
        throw new Error(`Failed to update category: ${result.error}`);
      }

      logger.info(`Category updated: ${result.data.name} (${result.data.id})`);
      return result.data;
    } catch (error) {
      logger.error('CategoryService.updateCategory error:', error);
      throw error;
    }
  }

  /**
   * Delete category with business logic validation
   */
  async deleteCategory(id: string): Promise<void> {
    try {
      // Business Rule: Check if category exists
      const existing = await this.getCategoryById(id);
      if (!existing) {
        throw new Error('Category not found');
      }

      // Business Rule: Prevent deletion of default categories
      if (existing.is_default) {
        throw new Error('Cannot delete default category');
      }

      // Business Rule: Check for child categories
      const hasChildrenResult = await CategoryRepository.hasChildren(id);
      if (hasChildrenResult.error) {
        throw new Error(`Failed to check for child categories: ${hasChildrenResult.error}`);
      }
      if (hasChildrenResult.data) {
        throw new Error('Cannot delete category with child categories');
      }

      // Business Rule: Check for transactions using this category
      // Import TransactionRepository to check usage
      const TransactionRepository = (await import('../repositories/TransactionRepository')).default;
      const isUsedResult = await TransactionRepository.isCategoryUsed(id);
      if (isUsedResult.error) {
        throw new Error(`Failed to check category usage: ${isUsedResult.error}`);
      }
      if (isUsedResult.data) {
        throw new Error('Cannot delete category that is used in transactions');
      }

      const result = await CategoryRepository.delete(id);
      
      if (result.error) {
        throw new Error(`Failed to delete category: ${result.error}`);
      }

      logger.info(`Category deleted: ${existing.name} (${id})`);
    } catch (error) {
      logger.error('CategoryService.deleteCategory error:', error);
      throw error;
    }
  }

  /**
   * Bulk operations for categories
   */
  async bulkCreateCategories(categories: CreateCategoryDto[]): Promise<Category[]> {
    try {
      // Business Rule: Validate all categories before creating any
      for (const category of categories) {
        // Check for duplicate names
        const existingResult = await CategoryRepository.findByNameAndType(category.name, category.type);
        if (existingResult.error) {
          throw new Error(`Failed to validate category "${category.name}": ${existingResult.error}`);
        }
        if (existingResult.data) {
          throw new Error(`Category with name "${category.name}" already exists for type "${category.type}"`);
        }

        // Validate parent if specified
        if (category.parent_id) {
          const parentExists = await this.getCategoryById(category.parent_id);
          if (!parentExists) {
            throw new Error(`Parent category not found for "${category.name}"`);
          }
          if (parentExists.type !== category.type) {
            throw new Error(`Parent type mismatch for category "${category.name}"`);
          }
        }
      }

      // Add default values
      const categoriesWithDefaults = categories.map(cat => ({
        ...cat,
        is_default: false,
        is_active: true
      }));

      const result = await CategoryRepository.bulkCreate(categoriesWithDefaults);
      
      if (result.error || !result.data) {
        throw new Error(`Failed to bulk create categories: ${result.error}`);
      }

      logger.info(`Bulk created ${result.data.length} categories`);
      return result.data;
    } catch (error) {
      logger.error('CategoryService.bulkCreateCategories error:', error);
      throw error;
    }
  }

  /**
   * Get default categories for seeding
   */
  async getDefaultCategories(): Promise<Category[]> {
    try {
      const result = await CategoryRepository.findDefaultCategories();
      
      if (result.error) {
        throw new Error(`Failed to fetch default categories: ${result.error}`);
      }

      return result.data || [];
    } catch (error) {
      logger.error('CategoryService.getDefaultCategories error:', error);
      throw error;
    }
  }

  /**
   * Seed default categories (business logic for seeding)
   */
  async seedDefaultCategories(): Promise<void> {
    try {
      const existingCategories = await this.getCategories();
      
      if (existingCategories.length > 0) {
        logger.info('Default categories already exist, skipping seed');
        return;
      }

      logger.info('Seeding default categories...');
      
      // Note: Default categories are already seeded in the database migration
      // This method serves as a placeholder for future seeding logic
      
      logger.info('Default categories seeding completed');
    } catch (error) {
      logger.error('CategoryService.seedDefaultCategories error:', error);
      throw error;
    }
  }

  /**
   * Helper method to check for circular references
   */
  private async wouldCreateCircularReference(categoryId: string, newParentId: string): Promise<boolean> {
    try {
      let currentParentId: string | null = newParentId;
      const visited = new Set<string>();

      while (currentParentId && !visited.has(currentParentId)) {
        if (currentParentId === categoryId) {
          return true; // Circular reference detected
        }

        visited.add(currentParentId);
        const parent = await this.getCategoryById(currentParentId);
        currentParentId = parent?.parent_id || null;
      }

      return false;
    } catch (error) {
      logger.error('Error checking circular reference:', error);
      return true; // Err on the side of caution
    }
  }
}

export default new CategoryService();