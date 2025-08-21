import { BaseRepository, DatabaseResult, FilterOptions } from './BaseRepository';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../types/category';
import { supabaseAdmin } from '../config/database';

export class CategoryRepository extends BaseRepository<Category, CreateCategoryDto, UpdateCategoryDto> {
  protected tableName = 'categories';
  protected selectFields = '*';

  /**
   * Find category by name and type (for duplicate checking)
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

      return { data, error: null };
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
   * Find default categories
   */
  async findDefaultCategories(): Promise<DatabaseResult<Category[]>> {
    const filters: FilterOptions = { is_default: true, is_active: true };
    return this.findAll(filters);
  }

  /**
   * Find root categories (no parent)
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
   * Get category hierarchy (with children)
   */
  async getCategoryHierarchy(type?: 'income' | 'expense'): Promise<DatabaseResult<Category[]>> {
    try {
      // Get all categories
      const filters: FilterOptions = {};
      if (type) {
        filters.type = type;
      }
      
      const result = await this.findAll(filters, { field: 'name', ascending: true });
      
      if (result.error || !result.data) {
        return result;
      }

      // Build hierarchy in memory (categories are already fetched)
      const categoryMap = new Map<string, Category & { children?: Category[] }>();
      const rootCategories: (Category & { children?: Category[] })[] = [];

      // First pass: create map and identify root categories
      result.data.forEach(category => {
        const categoryWithChildren = { ...category, children: [] };
        categoryMap.set(category.id, categoryWithChildren);

        if (!category.parent_id) {
          rootCategories.push(categoryWithChildren);
        }
      });

      // Second pass: build parent-child relationships
      result.data.forEach(category => {
        if (category.parent_id && categoryMap.has(category.parent_id)) {
          const parent = categoryMap.get(category.parent_id)!;
          const child = categoryMap.get(category.id)!;
          parent.children!.push(child);
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
      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select(this.selectFields)
        .eq('name', name)
        .eq('type', type)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(error.message);
      }

      return data || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      throw new Error(errorMessage);
    }
  }
}

export default new CategoryRepository();