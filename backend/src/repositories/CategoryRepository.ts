import { BaseRepository, DatabaseResult, FilterOptions } from './BaseRepository';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../types/category';
import { supabaseAdmin } from '../config/database';

export class CategoryRepository extends BaseRepository<Category, CreateCategoryDto, UpdateCategoryDto> {
  protected tableName = 'categories';
  protected selectFields = '*';

  // Cache for frequently accessed data
  private defaultCategoriesCache: Category[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * OPTIMIZED: Find category by name and type (for duplicate checking)
   * Uses index: idx_categories_name_type
   */
  async findByNameAndType(name: string, type: 'income' | 'expense'): Promise<DatabaseResult<Category>> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select(this.selectFields)
        .eq('name', name)
        .eq('type', type)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { data: null, error: null }; // Not found is not an error
        }
        return { data: null, error: error.message };
      }

      return { data: data as unknown as Category, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * OPTIMIZED: Batch validation for multiple categories
   * Reduces N database calls to 1 call
   */
  async validateCategoriesBatch(categories: { name: string; type: 'income' | 'expense' }[]): Promise<DatabaseResult<string[]>> {
    try {
      if (categories.length === 0) {
        return { data: [], error: null };
      }

      // Build OR conditions for batch check
      const orConditions = categories.map(cat => 
        `(name.eq.${cat.name},type.eq.${cat.type})`
      ).join(',');

      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select('name, type')
        .or(orConditions);

      if (error) {
        return { data: null, error: error.message };
      }

      // Return array of existing combinations
      const existing = (data || []).map(item => `${item.name}:${item.type}`);
      return { data: existing, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Find children categories by parent ID
   * Uses index: idx_categories_parent_id
   */
  async findByParentId(parentId: string): Promise<DatabaseResult<Category[]>> {
    const filters: FilterOptions = { parent_id: parentId };
    return this.findAll(filters);
  }

  /**
   * OPTIMIZED: Find categories by type
   * Uses index: idx_categories_type_active
   */
  async findByType(type: 'income' | 'expense', activeOnly = true): Promise<DatabaseResult<Category[]>> {
    const filters: FilterOptions = { type };
    if (activeOnly) {
      filters.is_active = true;
    }
    return this.findAll(filters);
  }

  /**
   * OPTIMIZED: Find default categories with caching
   * Uses index: idx_categories_default_active
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
   * Uses index: idx_categories_parent_id (for null values)
   */
  async findRootCategories(type?: 'income' | 'expense'): Promise<DatabaseResult<Category[]>> {
    const filters: FilterOptions = { 'is_null_parent_id': true };
    if (type) {
      filters.type = type;
    }
    return this.findAll(filters);
  }

  /**
   * Check if category has children
   * Uses index: idx_categories_parent_id
   */
  async hasChildren(categoryId: string): Promise<DatabaseResult<boolean>> {
    try {
      const { count, error } = await supabaseAdmin
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('parent_id', categoryId);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: (count || 0) > 0, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * OPTIMIZED: Get category hierarchy (with children)
   * Single query + in-memory hierarchy building O(n) instead of O(n²)
   */
  async getCategoryHierarchy(type?: 'income' | 'expense'): Promise<DatabaseResult<Category[]>> {
    try {
      // OPTIMIZATION: Single query to get ALL categories at once
      let query = supabaseAdmin
        .from(this.tableName)
        .select(this.selectFields)
        .order('name', { ascending: true });

      // Apply type filter if specified
      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;
      
      if (error) {
        return { data: null, error: error.message };
      }

      if (!data || data.length === 0) {
        return { data: [], error: null };
      }

      // OPTIMIZATION: Single-pass hierarchy building O(n)
      const categoryMap = new Map<string, Category & { children?: Category[] }>();
      const rootCategories: (Category & { children?: Category[] })[] = [];

      // First pass: create map and add children arrays
      (data as unknown as Category[]).forEach(category => {
        const categoryWithChildren = { ...category, children: [] };
        categoryMap.set(category.id, categoryWithChildren);
      });

      // Second pass: build parent-child relationships and identify roots
      (data as unknown as Category[]).forEach(category => {
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
   * OPTIMIZED: Search categories by name
   * Uses index: idx_categories_name_search
   */
  async searchByName(searchTerm: string): Promise<DatabaseResult<Category[]>> {
    const filters: FilterOptions = { 'ilike_name': `%${searchTerm}%` };
    return this.findAll(filters, { field: 'name', ascending: true });
  }

  /**
   * OPTIMIZED: Find category by name and type for import validation - returns simple result
   * Uses index: idx_categories_name_type
   */
  async findByNameAndTypeSimple(name: string, type: 'income' | 'expense'): Promise<Category | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select(this.selectFields)
        .eq('name', name)
        .eq('type', type)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(error.message);
      }

      return (data as unknown as Category) || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      throw new Error(errorMessage);
    }
  }

  /**
   * OPTIMIZED: Batch check for category existence
   * Reduces multiple queries to a single query
   */
  async checkCategoriesExistBatch(categoryIds: string[]): Promise<DatabaseResult<string[]>> {
    try {
      if (categoryIds.length === 0) {
        return { data: [], error: null };
      }

      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select('id')
        .in('id', categoryIds);

      if (error) {
        return { data: null, error: error.message };
      }

      const existingIds = (data || []).map(item => item.id);
      return { data: existingIds, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * OPTIMIZED: Batch parent validation
   * Validates multiple parent IDs in a single query
   */
  async validateParentsBatch(parentIds: (string | null)[]): Promise<DatabaseResult<{[key: string]: Category}>> {
    try {
      const validParentIds = parentIds.filter(id => id !== null) as string[];
      
      if (validParentIds.length === 0) {
        return { data: {}, error: null };
      }

      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select(this.selectFields)
        .in('id', validParentIds);

      if (error) {
        return { data: null, error: error.message };
      }

      // Convert to map for easy lookup
      const parentMap: {[key: string]: Category} = {};
      ((data || []) as unknown as Category[]).forEach(parent => {
        parentMap[parent.id] = parent;
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

export default new CategoryRepository();