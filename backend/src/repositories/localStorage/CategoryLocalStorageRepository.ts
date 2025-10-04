/**
 * LocalStorage implementation of CategoryRepository
 * Provides the same interface as the database CategoryRepository
 */

import { BaseLocalStorageRepository } from './BaseLocalStorageRepository';
import { Category, CreateCategoryDto, UpdateCategoryDto, CategoryWithChildren } from '../../types/category';
import { DatabaseResult, FilterOptions } from '../BaseRepository';
import { logger } from '../../config/logger';

export class CategoryLocalStorageRepository extends BaseLocalStorageRepository<Category, CreateCategoryDto, UpdateCategoryDto> {
  protected storageKey = 'categories';

  // Cache for frequently accessed data
  private defaultCategoriesCache: Category[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Find category by name and type (for duplicate checking)
   */
  async findByNameAndType(name: string, type: 'income' | 'expense'): Promise<DatabaseResult<Category>> {
    try {
      const items = this.getAllItems();
      const category = items.find(item => item.name === name && item.type === type);
      
      return { data: category || null, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Batch validation for multiple categories
   */
  async validateCategoriesBatch(categories: { name: string; type: 'income' | 'expense' }[]): Promise<DatabaseResult<string[]>> {
    try {
      if (categories.length === 0) {
        return { data: [], error: null };
      }

      const items = this.getAllItems();
      const existing: string[] = [];

      categories.forEach(cat => {
        const exists = items.some(item => item.name === cat.name && item.type === cat.type);
        if (exists) {
          existing.push(`${cat.name}:${cat.type}`);
        }
      });

      return { data: existing, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Find children categories by parent ID
   */
  async findByParentId(parentId: string): Promise<DatabaseResult<Category[]>> {
    const filters: FilterOptions = { parent_id: parentId };
    return this.findAll(filters);
  }

  /**
   * Find categories by type
   */
  async findByType(type: 'income' | 'expense', activeOnly = true): Promise<DatabaseResult<Category[]>> {
    const filters: FilterOptions = { type };
    if (activeOnly) {
      filters.is_active = true;
    }
    return this.findAll(filters);
  }

  /**
   * Find default categories with caching
   */
  async findDefaultCategories(): Promise<DatabaseResult<Category[]>> {
    try {
      // Check cache first
      const now = Date.now();
      if (this.defaultCategoriesCache && (now - this.cacheTimestamp) < this.CACHE_TTL) {
        return { data: this.defaultCategoriesCache, error: null };
      }

      const filters: FilterOptions = { is_default: true, is_active: true };
      const result = await this.findAll(filters);
      
      if (result.data && !result.error) {
        // Update cache
        this.defaultCategoriesCache = result.data;
        this.cacheTimestamp = now;
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Find root categories (no parent)
   */
  async findRootCategories(type?: 'income' | 'expense'): Promise<DatabaseResult<Category[]>> {
    try {
      const items = this.getAllItems();
      let rootCategories = items.filter(item => !item.parent_id);
      
      if (type) {
        rootCategories = rootCategories.filter(item => item.type === type);
      }

      return { data: rootCategories, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Check if category has children
   */
  async hasChildren(categoryId: string): Promise<DatabaseResult<boolean>> {
    try {
      const items = this.getAllItems();
      const hasChildren = items.some(item => item.parent_id === categoryId);
      return { data: hasChildren, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Get category hierarchy (with children)
   */
  async getCategoryHierarchy(type?: 'income' | 'expense'): Promise<DatabaseResult<CategoryWithChildren[]>> {
    try {
      let items = this.getAllItems();
      
      // Apply type filter if specified
      if (type) {
        items = items.filter(item => item.type === type);
      }

      // Sort by name
      items.sort((a, b) => a.name.localeCompare(b.name));

      // Build hierarchy
      const categoryMap = new Map<string, CategoryWithChildren>();
      const rootCategories: CategoryWithChildren[] = [];

      // First pass: create map and add children arrays
      items.forEach(category => {
        const categoryWithChildren: CategoryWithChildren = { ...category, children: [] };
        categoryMap.set(category.id, categoryWithChildren);
      });

      // Second pass: build parent-child relationships and identify roots
      items.forEach(category => {
        const categoryWithChildren = categoryMap.get(category.id)!;
        
        if (!category.parent_id) {
          rootCategories.push(categoryWithChildren);
        } else {
          const parent = categoryMap.get(category.parent_id);
          if (parent) {
            parent.children!.push(categoryWithChildren);
          }
        }
      });

      return { data: rootCategories, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Search categories by name
   */
  async searchByName(searchTerm: string): Promise<DatabaseResult<Category[]>> {
    const filters: FilterOptions = { 'ilike_name': `%${searchTerm}%` };
    return this.findAll(filters, { field: 'name', ascending: true });
  }

  /**
   * Find category by name and type for import validation - returns simple result
   */
  async findByNameAndTypeSimple(name: string, type: 'income' | 'expense'): Promise<Category | null> {
    try {
      const result = await this.findByNameAndType(name, type);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      throw new Error(errorMessage);
    }
  }

  /**
   * Batch check for category existence
   */
  async checkCategoriesExistBatch(categoryIds: string[]): Promise<DatabaseResult<string[]>> {
    try {
      if (categoryIds.length === 0) {
        return { data: [], error: null };
      }

      const items = this.getAllItems();
      const existingIds = categoryIds.filter(id => 
        items.some(item => item.id === id)
      );

      return { data: existingIds, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Batch parent validation
   */
  async validateParentsBatch(parentIds: (string | null)[]): Promise<DatabaseResult<{[key: string]: Category}>> {
    try {
      const validParentIds = parentIds.filter(id => id !== null) as string[];
      
      if (validParentIds.length === 0) {
        return { data: {}, error: null };
      }

      const items = this.getAllItems();
      const parentMap: {[key: string]: Category} = {};
      
      validParentIds.forEach(id => {
        const parent = items.find(item => item.id === id);
        if (parent) {
          parentMap[id] = parent;
        }
      });

      return { data: parentMap, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Clear cache (useful for testing or after bulk operations)
   */
  clearCache(): void {
    this.defaultCategoriesCache = null;
    this.cacheTimestamp = 0;
  }
}

// Export singleton instance
export default new CategoryLocalStorageRepository();
