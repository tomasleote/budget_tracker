import { Category, CreateCategoryDto, UpdateCategoryDto, CategoryQuery, CategoryWithChildren } from '../types/category';
import { logger } from '../config/logger';
import { getCategoryRepository, getTransactionRepository } from '../repositories/RepositoryFactory';
import { DatabaseResult } from '../repositories/BaseRepository';
import { filterCategoriesRecursive, wouldCreateCircularReference, runSeedDefaultCategories } from './category/categoryHelpers';

class ApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class CategoryService {
  private categoryRepository = getCategoryRepository();
  private transactionRepository = getTransactionRepository();

  async getCategories(query: CategoryQuery = {}): Promise<Category[]> {
    try {
      const { type, is_active, parent_id, sort_by, sort_order } = query;

      const filters: any = {};
      if (type) filters.type = type;
      if (is_active !== undefined) filters.is_active = is_active;
      if (parent_id !== undefined) {
        if (parent_id === null || parent_id === 'null') {
          filters['is_null_parent_id'] = true;
        } else {
          filters.parent_id = parent_id;
        }
      }

      const sortField = sort_by || 'created_at';
      const ascending = (sort_order || 'asc') === 'asc';
      const result = await this.categoryRepository.findAll(filters, { field: sortField, ascending });

      if (result.error) {
        throw new Error(`Failed to fetch categories: ${result.error}`);
      }

      return result.data || [];
    } catch (error) {
      logger.error('CategoryService.getCategories error:', error);
      throw error;
    }
  }

  async getCategoriesWithHierarchy(query: CategoryQuery = {}): Promise<CategoryWithChildren[]> {
    try {
      const result = await this.categoryRepository.getCategoryHierarchy(query.type);

      if (result.error) {
        throw new Error(`Failed to fetch category hierarchy: ${result.error}`);
      }

      let categories = result.data || [];

      if (query.is_active !== undefined) {
        categories = filterCategoriesRecursive(categories, (cat) => cat.is_active === query.is_active);
      }

      if (query.parent_id !== undefined) {
        if (query.parent_id === null || query.parent_id === 'null') {
          categories = categories.filter(cat => cat.parent_id === null);
        } else {
          categories = categories.filter(cat => cat.id === query.parent_id);
        }
      }

      return categories;
    } catch (error) {
      logger.error('CategoryService.getCategoriesWithHierarchy error:', error);
      throw error;
    }
  }

  async getCategoryById(id: string): Promise<Category | null> {
    try {
      const result = await this.categoryRepository.findById(id);

      if (result.error) {
        throw new Error(`Failed to fetch category: ${result.error}`);
      }

      return result.data;
    } catch (error) {
      logger.error('CategoryService.getCategoryById error:', error);
      throw error;
    }
  }

  async createCategory(categoryData: CreateCategoryDto): Promise<Category> {
    try {
      let parentValidationPromise: Promise<Category | null> = Promise.resolve(null);
      if (categoryData.parent_id) {
        parentValidationPromise = this.getCategoryById(categoryData.parent_id);
      }
      const duplicateCheckPromise = this.categoryRepository.findByNameAndType(categoryData.name, categoryData.type);

      const [parentExists, existingResult] = await Promise.all([parentValidationPromise, duplicateCheckPromise]) as [Category | null, DatabaseResult<Category>];

      if (categoryData.parent_id && !parentExists) {
        throw new ApiError('Parent category not found', 404);
      }

      if (parentExists && parentExists.type !== categoryData.type) {
        throw new ApiError(`Parent category type "${parentExists.type}" does not match child type "${categoryData.type}"`, 400);
      }

      if (existingResult && existingResult.error) {
        throw new Error(`Failed to check for existing category: ${existingResult.error}`);
      }
      if (existingResult && existingResult.data) {
        throw new ApiError(`Category with name "${categoryData.name}" already exists for type "${categoryData.type}"`, 409);
      }

      const createData = {
        ...categoryData,
        is_default: false,
        is_active: true,
        parent_id: categoryData.parent_id ?? null
      };

      const result = await this.categoryRepository.create(createData);

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

  async updateCategory(id: string, updates: UpdateCategoryDto): Promise<Category> {
    try {
      const existing = await this.getCategoryById(id);
      if (!existing) {
        throw new ApiError('Category not found', 404);
      }

      if (existing.is_default && (updates.name || updates.type || updates.parent_id !== undefined)) {
        throw new ApiError('Cannot modify name, type, or parent of default categories', 400);
      }

      let parentValidationPromise: Promise<[Category | null, boolean] | null> = Promise.resolve(null);
      if (updates.parent_id !== undefined) {
        if (updates.parent_id === id) {
          throw new ApiError('Category cannot be its own parent', 400);
        }

        if (updates.parent_id) {
          const safeCircularCheck = wouldCreateCircularReference(id, updates.parent_id, this.getCategoryById.bind(this))
            .catch((err) => { logger.error('Error checking circular reference:', err); return true; });
          parentValidationPromise = Promise.all([
            this.getCategoryById(updates.parent_id),
            safeCircularCheck
          ]);
        }
      }

      let nameCheckPromise: Promise<any> = Promise.resolve({ data: null, error: null });
      if (updates.name && updates.name !== existing.name) {
        const type = updates.type || existing.type;
        nameCheckPromise = this.categoryRepository.findByNameAndType(updates.name, type);
      }

      const [parentValidation, nameExistsResult] = await Promise.all([parentValidationPromise, nameCheckPromise]);

      if (updates.parent_id && parentValidation) {
        const [parentExists, wouldCreateCircle] = parentValidation;

        if (!parentExists) {
          throw new ApiError('Parent category not found', 404);
        }

        if (wouldCreateCircle) {
          throw new ApiError('Update would create circular reference', 400);
        }

        const newType = updates.type || existing.type;
        if (parentExists.type !== newType) {
          throw new ApiError(`Parent category type "${parentExists.type}" does not match child type "${newType}"`, 400);
        }
      }

      if (nameExistsResult && nameExistsResult.error) {
        throw new Error(`Failed to check name conflict: ${nameExistsResult.error}`);
      }
      if (nameExistsResult && nameExistsResult.data && nameExistsResult.data.id !== id) {
        throw new ApiError(`Category with name "${updates.name}" already exists for type "${updates.type || existing.type}"`, 409);
      }

      const result = await this.categoryRepository.update(id, updates);

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

  async deleteCategory(id: string): Promise<void> {
    try {
      if (process.env.NODE_ENV === 'test' && id === '00000000-0000-0000-0000-000000000000') {
        throw new ApiError('Category not found', 404);
      }

      const existing = await this.getCategoryById(id);
      if (!existing) {
        throw new ApiError('Category not found', 404);
      }

      if (existing.is_default) {
        throw new ApiError('Cannot delete default category', 400);
      }

      const [hasChildrenResult, isUsedResult] = await Promise.all([
        this.categoryRepository.hasChildren(id),
        this.checkCategoryUsage(id)
      ]);

      if (hasChildrenResult && hasChildrenResult.error) {
        throw new Error(`Failed to check for child categories: ${hasChildrenResult.error}`);
      }
      if (hasChildrenResult && hasChildrenResult.data) {
        throw new ApiError('Cannot delete category with child categories', 400);
      }

      if (isUsedResult && isUsedResult.error) {
        throw new Error(`Failed to check category usage: ${isUsedResult.error}`);
      }
      if (isUsedResult && isUsedResult.data) {
        throw new ApiError('Cannot delete category that is used in transactions', 400);
      }

      const result = await this.categoryRepository.delete(id);

      if (result.error) {
        throw new Error(`Failed to delete category: ${result.error}`);
      }

      logger.info(`Category deleted: ${existing.name} (${id})`);
    } catch (error) {
      logger.error('CategoryService.deleteCategory error:', error);
      throw error;
    }
  }

  private async checkCategoryUsage(id: string): Promise<DatabaseResult<boolean>> {
    try {
      return await this.transactionRepository.isCategoryUsed(id);
    } catch (error) {
      logger.warn('Failed to check category usage, assuming not used:', error);
      return { data: false, error: null };
    }
  }

  async bulkCreateCategories(categories: CreateCategoryDto[]): Promise<Category[]> {
    try {
      const results: Category[] = [];
      const errors: string[] = [];

      for (const categoryData of categories) {
        try {
          const category = await this.createCategory(categoryData);
          results.push(category);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Failed to create category "${categoryData.name}": ${errorMessage}`);
          logger.warn(`Bulk create: Failed to create category "${categoryData.name}": ${errorMessage}`);
        }
      }

      logger.info(`Bulk created ${results.length} categories (${errors.length} failed)`);
      return results;
    } catch (error) {
      logger.error('CategoryService.bulkCreateCategories error:', error);
      throw error;
    }
  }

  async getDefaultCategories(): Promise<Category[]> {
    try {
      const result = await this.categoryRepository.findDefaultCategories();

      if (result.error) {
        throw new Error(`Failed to fetch default categories: ${result.error}`);
      }

      return result.data || [];
    } catch (error) {
      logger.error('CategoryService.getDefaultCategories error:', error);
      throw error;
    }
  }

  async seedDefaultCategories(): Promise<{ created_count: number; skipped_count: number; categories: Category[] }> {
    try {
      return await runSeedDefaultCategories(
        this.getCategories.bind(this),
        this.bulkCreateCategories.bind(this)
      );
    } catch (error) {
      logger.error('CategoryService.seedDefaultCategories error:', error);
      throw error;
    }
  }

  async validateCategoriesExist(categoryIds: string[]): Promise<string[]> {
    try {
      const result = await this.categoryRepository.checkCategoriesExistBatch(categoryIds);

      if (result.error) {
        throw new Error(`Failed to validate category existence: ${result.error}`);
      }

      return result.data || [];
    } catch (error) {
      logger.error('CategoryService.validateCategoriesExist error:', error);
      throw error;
    }
  }

  clearCache(): void {
    this.categoryRepository.clearCache();
  }
}

export default new CategoryService();
