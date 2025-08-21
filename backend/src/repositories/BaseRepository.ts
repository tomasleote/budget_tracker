import { supabaseAdmin } from '../config/database';
import { logger } from '../config/logger';

export interface DatabaseResult<T> {
  data: T | null;
  error: string | null;
  count?: number;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  offset: number;
}

export interface FilterOptions {
  [key: string]: any;
}

export interface SortOptions {
  field: string;
  ascending: boolean;
}

export abstract class BaseRepository<T, CreateDto, UpdateDto> {
  protected abstract tableName: string;
  protected abstract selectFields: string;

  /**
   * Create a new record
   */
  async create(data: CreateDto): Promise<DatabaseResult<T>> {
    try {
      const { data: result, error } = await supabaseAdmin
        .from(this.tableName)
        .insert([data])
        .select(this.selectFields)
        .single();

      if (error) {
        logger.error(`Error creating ${this.tableName}:`, error);
        return { data: null, error: error.message };
      }

      return { data: result as T, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error(`Repository create error in ${this.tableName}:`, err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Find record by ID
   */
  async findById(id: string): Promise<DatabaseResult<T>> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select(this.selectFields)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { data: null, error: null }; // Not found is not an error
        }
        logger.error(`Error finding ${this.tableName} by ID:`, error);
        return { data: null, error: error.message };
      }

      return { data: data as T, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error(`Repository findById error in ${this.tableName}:`, err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Find all records with optional filtering, sorting, and pagination
   */
  async findAll(
    filters: FilterOptions = {},
    sort: SortOptions = { field: 'created_at', ascending: false },
    pagination?: PaginationOptions
  ): Promise<DatabaseResult<T[]>> {
    try {
      let query = supabaseAdmin
        .from(this.tableName)
        .select(this.selectFields, pagination ? { count: 'exact' } : {});

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key.includes('gte_')) {
            query = query.gte(key.replace('gte_', ''), value);
          } else if (key.includes('lte_')) {
            query = query.lte(key.replace('lte_', ''), value);
          } else if (key.includes('ilike_')) {
            query = query.ilike(key.replace('ilike_', ''), value);
          } else if (key.includes('is_null_')) {
            query = query.is(key.replace('is_null_', ''), null);
          } else if (value !== null) {
            query = query.eq(key, value);
          }
        }
      });

      // Apply sorting
      query = query.order(sort.field, { ascending: sort.ascending });

      // Apply pagination
      if (pagination) {
        query = query.range(pagination.offset, pagination.offset + pagination.limit - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        logger.error(`Error finding all ${this.tableName}:`, error);
        return { data: null, error: error.message };
      }

      return { data: (data as T[]) || [], error: null, ...(count != null && { count }) };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error(`Repository findAll error in ${this.tableName}:`, err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Update record by ID
   */
  async update(id: string, updates: Partial<UpdateDto>): Promise<DatabaseResult<T>> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(this.selectFields)
        .single();

      if (error) {
        logger.error(`Error updating ${this.tableName}:`, error);
        return { data: null, error: error.message };
      }

      return { data: data as T, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error(`Repository update error in ${this.tableName}:`, err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Delete record by ID
   */
  async delete(id: string): Promise<DatabaseResult<boolean>> {
    try {
      const { error } = await supabaseAdmin
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        logger.error(`Error deleting ${this.tableName}:`, error);
        return { data: null, error: error.message };
      }

      return { data: true, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error(`Repository delete error in ${this.tableName}:`, err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Bulk create records
   */
  async bulkCreate(dataArray: CreateDto[]): Promise<DatabaseResult<T[]>> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .insert(dataArray)
        .select(this.selectFields);

      if (error) {
        logger.error(`Error bulk creating ${this.tableName}:`, error);
        return { data: null, error: error.message };
      }

      return { data: (data as T[]) || [], error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error(`Repository bulkCreate error in ${this.tableName}:`, err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Bulk delete records by IDs
   */
  async bulkDelete(ids: string[]): Promise<DatabaseResult<boolean>> {
    try {
      const { error } = await supabaseAdmin
        .from(this.tableName)
        .delete()
        .in('id', ids);

      if (error) {
        logger.error(`Error bulk deleting ${this.tableName}:`, error);
        return { data: null, error: error.message };
      }

      return { data: true, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error(`Repository bulkDelete error in ${this.tableName}:`, err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Count records with optional filters
   */
  async count(filters: FilterOptions = {}): Promise<DatabaseResult<number>> {
    try {
      let query = supabaseAdmin
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      const { count, error } = await query;

      if (error) {
        logger.error(`Error counting ${this.tableName}:`, error);
        return { data: null, error: error.message };
      }

      return { data: count || 0, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error(`Repository count error in ${this.tableName}:`, err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Check if record exists
   */
  async exists(id: string): Promise<DatabaseResult<boolean>> {
    try {
      const { data } = await this.findById(id);
      return { data: data !== null, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: errorMessage };
    }
  }
}
