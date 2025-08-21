import { BaseRepository, DatabaseResult, FilterOptions, PaginationOptions, SortOptions } from './BaseRepository';
import { Transaction, TransactionWithCategory, CreateTransactionDto, UpdateTransactionDto } from '../types/transaction';
import { supabaseAdmin } from '../config/database';

export class TransactionRepository extends BaseRepository<Transaction, CreateTransactionDto, UpdateTransactionDto> {
  protected tableName = 'transactions';
  protected selectFields = '*';

  /**
   * Find transactions with category details included
   */
  async findWithCategories(
    filters: FilterOptions = {},
    sort: SortOptions = { field: 'date', ascending: false },
    pagination?: PaginationOptions
  ): Promise<DatabaseResult<TransactionWithCategory[]>> {
    try {
      let query = supabaseAdmin
        .from(this.tableName)
        .select(`
          *,
          categories (
            id,
            name,
            type,
            color,
            icon
          )
        `, pagination ? { count: 'exact' } : {});

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key.includes('gte_')) {
            query = query.gte(key.replace('gte_', ''), value);
          } else if (key.includes('lte_')) {
            query = query.lte(key.replace('lte_', ''), value);
          } else if (key.includes('ilike_')) {
            query = query.ilike(key.replace('ilike_', ''), value);
          } else {
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
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null, count: count || undefined };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Find transaction by ID with category details
   */
  async findByIdWithCategory(id: string): Promise<DatabaseResult<TransactionWithCategory>> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select(`
          *,
          categories (
            id,
            name,
            type,
            color,
            icon
          )
        `)
        .eq('id', id)
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
   * Find transactions by category ID
   */
  async findByCategoryId(categoryId: string, limit?: number): Promise<DatabaseResult<Transaction[]>> {
    const filters: FilterOptions = { category_id: categoryId };
    const sort: SortOptions = { field: 'date', ascending: false };
    const pagination = limit ? { page: 1, limit, offset: 0 } : undefined;

    return this.findAll(filters, sort, pagination);
  }

  /**
   * Find transactions by type
   */
  async findByType(
    type: 'income' | 'expense',
    pagination?: PaginationOptions
  ): Promise<DatabaseResult<Transaction[]>> {
    const filters: FilterOptions = { type };
    const sort: SortOptions = { field: 'date', ascending: false };

    return this.findAll(filters, sort, pagination);
  }

  /**
   * Find transactions by date range
   */
  async findByDateRange(
    startDate: string,
    endDate: string,
    pagination?: PaginationOptions
  ): Promise<DatabaseResult<Transaction[]>> {
    const filters: FilterOptions = {
      'gte_date': startDate,
      'lte_date': endDate
    };
    const sort: SortOptions = { field: 'date', ascending: false };

    return this.findAll(filters, sort, pagination);
  }

  /**
   * Search transactions by description
   */
  async searchByDescription(searchTerm: string, limit = 10): Promise<DatabaseResult<Transaction[]>> {
    const filters: FilterOptions = { 'ilike_description': `%${searchTerm}%` };
    const sort: SortOptions = { field: 'date', ascending: false };
    const pagination: PaginationOptions = { page: 1, limit, offset: 0 };

    return this.findAll(filters, sort, pagination);
  }

  /**
   * Get transaction summary for date range
   */
  async getSummaryByDateRange(startDate?: string, endDate?: string): Promise<DatabaseResult<any>> {
    try {
      let query = supabaseAdmin
        .from(this.tableName)
        .select('type, amount, date');

      if (startDate) {
        query = query.gte('date', startDate);
      }

      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error } = await query;

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Get transactions by amount range
   */
  async findByAmountRange(
    minAmount: number,
    maxAmount: number,
    pagination?: PaginationOptions
  ): Promise<DatabaseResult<Transaction[]>> {
    const filters: FilterOptions = {
      'gte_amount': minAmount,
      'lte_amount': maxAmount
    };
    const sort: SortOptions = { field: 'amount', ascending: false };

    return this.findAll(filters, sort, pagination);
  }

  /**
   * Count transactions by type
   */
  async countByType(type: 'income' | 'expense'): Promise<DatabaseResult<number>> {
    return this.count({ type });
  }

  /**
   * Count transactions by category
   */
  async countByCategory(categoryId: string): Promise<DatabaseResult<number>> {
    return this.count({ category_id: categoryId });
  }

  /**
   * Get total amount by type
   */
  async getTotalAmountByType(type: 'income' | 'expense', startDate?: string, endDate?: string): Promise<DatabaseResult<number>> {
    try {
      let query = supabaseAdmin
        .from(this.tableName)
        .select('amount')
        .eq('type', type);

      if (startDate) {
        query = query.gte('date', startDate);
      }

      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error } = await query;

      if (error) {
        return { data: null, error: error.message };
      }

      const total = (data || []).reduce((sum, transaction) => sum + Number(transaction.amount), 0);
      return { data: Number(total.toFixed(2)), error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Get recent transactions
   */
  async getRecent(limit = 10): Promise<DatabaseResult<Transaction[]>> {
    const sort: SortOptions = { field: 'created_at', ascending: false };
    const pagination: PaginationOptions = { page: 1, limit, offset: 0 };

    return this.findAll({}, sort, pagination);
  }

  /**
   * Check if category is used in any transactions
   */
  async isCategoryUsed(categoryId: string): Promise<DatabaseResult<boolean>> {
    try {
      const result = await this.count({ category_id: categoryId });
      if (result.error) {
        return result;
      }
      return { data: (result.data || 0) > 0, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Find all transactions with advanced filters for import/export
   */
  async findAllWithFilters(filters: any): Promise<Transaction[]> {
    try {
      let query = supabaseAdmin
        .from(this.tableName)
        .select(`
          *,
          categories (
            id,
            name,
            type,
            color,
            icon
          )
        `);

      // Apply filters
      if (filters.type) {
        if (Array.isArray(filters.type)) {
          query = query.in('type', filters.type);
        } else {
          query = query.eq('type', filters.type);
        }
      }

      if (filters.category_ids) {
        query = query.in('category_id', filters.category_ids);
      }

      if (filters.date_from) {
        query = query.gte('date', filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte('date', filters.date_to);
      }

      if (filters.amount_min) {
        query = query.gte('amount', filters.amount_min);
      }

      if (filters.amount_max) {
        query = query.lte('amount', filters.amount_max);
      }

      if (filters.search) {
        query = query.ilike('description', `%${filters.search}%`);
      }

      // Sort by date descending
      query = query.order('date', { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      throw new Error(errorMessage);
    }
  }

  /**
   * Find duplicate transaction for import validation
   */
  async findDuplicate(transactionData: any): Promise<Transaction | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select('*')
        .eq('type', transactionData.type)
        .eq('amount', transactionData.amount)
        .eq('description', transactionData.description)
        .eq('category_id', transactionData.category_id)
        .eq('date', transactionData.date)
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

export default new TransactionRepository();