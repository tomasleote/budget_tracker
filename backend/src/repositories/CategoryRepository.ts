import { BaseRepository, DatabaseResult, FilterOptions } from './BaseRepository';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../types/category';
import { supabaseAdmin } from '../config/database';
import { buildCategoryValidationOrConditions, buildCategoryHierarchy } from './queries/categoryQueries';

export class CategoryRepository extends BaseRepository<Category, CreateCategoryDto, UpdateCategoryDto> {
  protected tableName = 'categories';
  protected selectFields = '*';

  private defaultCategoriesCache: Category[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000;

  async findByNameAndType(name: string, type: 'income' | 'expense'): Promise<DatabaseResult<Category>> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select(this.selectFields)
        .eq('name', name)
        .eq('type', type)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return { data: null, error: null };
        return { data: null, error: error.message };
      }

      return { data: data as unknown as Category, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: errorMessage };
    }
  }

  async validateCategoriesBatch(categories: { name: string; type: 'income' | 'expense' }[]): Promise<DatabaseResult<string[]>> {
    try {
      if (categories.length === 0) return { data: [], error: null };

      const orConditions = buildCategoryValidationOrConditions(categories);
      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select('name, type')
        .or(orConditions);

      if (error) return { data: null, error: error.message };

      const existing = (data || []).map(item => `${item.name}:${item.type}`);
      return { data: existing, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: errorMessage };
    }
  }

  async findByParentId(parentId: string): Promise<DatabaseResult<Category[]>> {
    return this.findAll({ parent_id: parentId } as FilterOptions);
  }

  async findByType(type: 'income' | 'expense', activeOnly = true): Promise<DatabaseResult<Category[]>> {
    const filters: FilterOptions = { type };
    if (activeOnly) filters.is_active = true;
    return this.findAll(filters);
  }

  async findDefaultCategories(): Promise<DatabaseResult<Category[]>> {
    try {
      const now = Date.now();
      if (this.defaultCategoriesCache && (now - this.cacheTimestamp) < this.CACHE_TTL) {
        return { data: this.defaultCategoriesCache, error: null };
      }

      const result = await this.findAll({ is_default: true, is_active: true } as FilterOptions);

      if (result.data && !result.error) {
        this.defaultCategoriesCache = result.data;
        this.cacheTimestamp = now;
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: errorMessage };
    }
  }

  async findRootCategories(type?: 'income' | 'expense'): Promise<DatabaseResult<Category[]>> {
    const filters: FilterOptions = { 'is_null_parent_id': true };
    if (type) filters.type = type;
    return this.findAll(filters);
  }

  async hasChildren(categoryId: string): Promise<DatabaseResult<boolean>> {
    try {
      const { count, error } = await supabaseAdmin
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('parent_id', categoryId);

      if (error) return { data: null, error: error.message };
      return { data: (count || 0) > 0, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: errorMessage };
    }
  }

  async getCategoryHierarchy(type?: 'income' | 'expense'): Promise<DatabaseResult<Category[]>> {
    try {
      let query = supabaseAdmin.from(this.tableName).select(this.selectFields).order('name', { ascending: true });
      if (type) query = query.eq('type', type);

      const { data, error } = await query;
      if (error) return { data: null, error: error.message };
      if (!data || data.length === 0) return { data: [], error: null };

      return { data: buildCategoryHierarchy(data as unknown as Category[]) as Category[], error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: errorMessage };
    }
  }

  async searchByName(searchTerm: string): Promise<DatabaseResult<Category[]>> {
    return this.findAll(
      { 'ilike_name': `%${searchTerm}%` } as FilterOptions,
      { field: 'name', ascending: true }
    );
  }

  async findByNameAndTypeSimple(name: string, type: 'income' | 'expense'): Promise<Category | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select(this.selectFields)
        .eq('name', name)
        .eq('type', type)
        .single();

      if (error && error.code !== 'PGRST116') throw new Error(error.message);
      return (data as unknown as Category) || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      throw new Error(errorMessage);
    }
  }

  async checkCategoriesExistBatch(categoryIds: string[]): Promise<DatabaseResult<string[]>> {
    try {
      if (categoryIds.length === 0) return { data: [], error: null };

      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select('id')
        .in('id', categoryIds);

      if (error) return { data: null, error: error.message };
      return { data: (data || []).map(item => item.id), error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: errorMessage };
    }
  }

  async validateParentsBatch(parentIds: (string | null)[]): Promise<DatabaseResult<{ [key: string]: Category }>> {
    try {
      const validParentIds = parentIds.filter((id): id is string => id !== null);
      if (validParentIds.length === 0) return { data: {}, error: null };

      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select(this.selectFields)
        .in('id', validParentIds);

      if (error) return { data: null, error: error.message };

      const parentMap: { [key: string]: Category } = {};
      ((data || []) as unknown as Category[]).forEach(parent => {
        parentMap[parent.id] = parent;
      });

      return { data: parentMap, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: errorMessage };
    }
  }

  clearCache(): void {
    this.defaultCategoriesCache = null;
    this.cacheTimestamp = 0;
  }
}

export default new CategoryRepository();
