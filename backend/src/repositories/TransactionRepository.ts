import { BaseRepository, DatabaseResult, FilterOptions, PaginationOptions, SortOptions } from './BaseRepository';
import { Transaction, TransactionWithCategory, CreateTransactionDto, UpdateTransactionDto } from '../types/transaction';
import { supabaseAdmin } from '../config/database';

export class TransactionRepository extends BaseRepository<Transaction, CreateTransactionDto, UpdateTransactionDto> {
  protected tableName = 'transactions';
  protected selectFields = '*';

  /**
   * OPTIMIZED: Find transactions with category details included
   * Uses optimized filter ordering for index usage
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

      // OPTIMIZATION: Apply filters in index-optimal order
      // 1. Equality filters first (uses exact index matches)
      // 2. Range filters second (uses index ranges)
      // 3. Pattern matching last (may require scans)

      // Equality filters (best index usage)
      const equalityKeys = ['type', 'category_id', 'id'];
      equalityKeys.forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          query = query.eq(key, filters[key]);
        }
      });

      // Range filters (good index usage)
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key.startsWith('gte_')) {
            query = query.gte(key.replace('gte_', ''), value);
          } else if (key.startsWith('lte_')) {
            query = query.lte(key.replace('lte_', ''), value);
          } else if (key.startsWith('gt_')) {
            query = query.gt(key.replace('gt_', ''), value);
          } else if (key.startsWith('lt_')) {
            query = query.lt(key.replace('lt_', ''), value);
          }
        }
      });

      // Pattern matching filters (potentially slower)
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key.startsWith('ilike_')) {
          query = query.ilike(key.replace('ilike_', ''), value);
        }
      });

      // Apply sorting - use indexes when possible
      query = query.order(sort.field, { ascending: sort.ascending });

      // Apply pagination
      if (pagination) {
        query = query.range(pagination.offset, pagination.offset + pagination.limit - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        return { data: null, error: error.message };
      }

      const result: DatabaseResult<TransactionWithCategory[]> = { 
        data: data || [], 
        error: null 
      };
      if (count !== null && count !== undefined) {
        result.count = count;
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Find transaction by ID with category details
   * Uses primary key index
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
   * OPTIMIZED: Find transactions by category ID
   * Uses index: idx_transactions_category_date
   */
  async findByCategoryId(categoryId: string, limit?: number): Promise<DatabaseResult<Transaction[]>> {
    const filters: FilterOptions = { category_id: categoryId };
    const sort: SortOptions = { field: 'date', ascending: false };
    const pagination = limit ? { page: 1, limit, offset: 0 } : undefined;

    return this.findAll(filters, sort, pagination);
  }

  /**
   * OPTIMIZED: Find transactions by type
   * Uses index: idx_transactions_type_date
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
   * OPTIMIZED: Find transactions by date range
   * Uses index: idx_transactions_date_type
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
   * OPTIMIZED: Search transactions by description
   * Uses index: idx_transactions_description_search
   */
  async searchByDescription(searchTerm: string, limit = 10): Promise<DatabaseResult<Transaction[]>> {
    const filters: FilterOptions = { 'ilike_description': `%${searchTerm}%` };
    const sort: SortOptions = { field: 'date', ascending: false };
    const pagination: PaginationOptions = { page: 1, limit, offset: 0 };

    return this.findAll(filters, sort, pagination);
  }

  /**
   * OPTIMIZED: Get transaction summary for date range
   * Single query instead of multiple aggregations
   */
  async getSummaryByDateRange(startDate?: string, endDate?: string): Promise<DatabaseResult<any>> {
    try {
      let query = supabaseAdmin
        .from(this.tableName)
        .select('type, amount, date');

      // Apply date filters in optimal order
      if (startDate && endDate) {
        query = query.gte('date', startDate).lte('date', endDate);
      } else if (startDate) {
        query = query.gte('date', startDate);
      } else if (endDate) {
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
   * OPTIMIZED: Get transactions by amount range
   * Uses index: idx_transactions_amount
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
   * Uses index: idx_transactions_type
   */
  async countByType(type: 'income' | 'expense'): Promise<DatabaseResult<number>> {
    return this.count({ type });
  }

  /**
   * Count transactions by category
   * Uses index: idx_transactions_category_id
   */
  async countByCategory(categoryId: string): Promise<DatabaseResult<number>> {
    return this.count({ category_id: categoryId });
  }

  /**
   * OPTIMIZED: Get total amount by type
   * Uses index: idx_transactions_type_date for efficient filtering
   */
  async getTotalAmountByType(type: 'income' | 'expense', startDate?: string, endDate?: string): Promise<DatabaseResult<number>> {
    try {
      let query = supabaseAdmin
        .from(this.tableName)
        .select('amount')
        .eq('type', type);

      // Apply date filters if provided
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
   * OPTIMIZED: Get recent transactions
   * Uses index: idx_transactions_created_at
   */
  async getRecent(limit = 10): Promise<DatabaseResult<Transaction[]>> {
    const sort: SortOptions = { field: 'created_at', ascending: false };
    const pagination: PaginationOptions = { page: 1, limit, offset: 0 };

    return this.findAll({}, sort, pagination);
  }

  /**
   * Check if category is used in any transactions
   * Uses index: idx_transactions_category_id
   */
  async isCategoryUsed(categoryId: string): Promise<DatabaseResult<boolean>> {
    try {
      const result = await this.count({ category_id: categoryId });
      if (result.error) {
        return { data: null, error: result.error };
      }
      return { data: (result.data || 0) > 0, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * OPTIMIZED: Find all transactions with advanced filters for import/export
   * Uses optimal filter ordering for best index usage
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

      // OPTIMIZATION: Apply filters in optimal order for index usage
      
      // 1. Type filter first (highest selectivity, uses idx_transactions_type_date)
      if (filters.type) {
        if (Array.isArray(filters.type)) {
          query = query.in('type', filters.type);
        } else {
          query = query.eq('type', filters.type);
        }
      }

      // 2. Category filters (uses idx_transactions_category_date)
      if (filters.category_ids) {
        query = query.in('category_id', filters.category_ids);
      }

      // 3. Date range filters (uses date indexes)
      if (filters.date_from && filters.date_to) {
        query = query.gte('date', filters.date_from).lte('date', filters.date_to);
      } else if (filters.date_from) {
        query = query.gte('date', filters.date_from);
      } else if (filters.date_to) {
        query = query.lte('date', filters.date_to);
      }

      // 4. Amount range filters (uses idx_transactions_amount)
      if (filters.amount_min && filters.amount_max) {
        query = query.gte('amount', filters.amount_min).lte('amount', filters.amount_max);
      } else if (filters.amount_min) {
        query = query.gte('amount', filters.amount_min);
      } else if (filters.amount_max) {
        query = query.lte('amount', filters.amount_max);
      }

      // 5. Search filter last (least selective, may require scan)
      if (filters.search) {
        query = query.ilike('description', `%${filters.search}%`);
      }

      // Sort by date descending (uses idx_transactions_date)
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
   * OPTIMIZED: Find duplicate transaction for import validation
   * Uses composite index for efficient duplicate detection
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

  /**
   * OPTIMIZED: Batch duplicate checking for import operations
   * Reduces N queries to 1 query for bulk operations
   */
  async findDuplicatesBatch(transactions: any[]): Promise<DatabaseResult<{[key: string]: Transaction}>> {
    try {
      if (transactions.length === 0) {
        return { data: {}, error: null };
      }

      // Build OR conditions for all transactions
      const orConditions = transactions.map((tx, index) => 
        `(type.eq.${tx.type},amount.eq.${tx.amount},description.eq.${tx.description},category_id.eq.${tx.category_id},date.eq.${tx.date})`
      );

      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select('*')
        .or(orConditions.join(','));

      if (error) {
        return { data: null, error: error.message };
      }

      // Create lookup map
      const duplicatesMap: {[key: string]: Transaction} = {};
      (data || []).forEach(transaction => {
        const key = `${transaction.type}:${transaction.amount}:${transaction.description}:${transaction.category_id}:${transaction.date}`;
        duplicatesMap[key] = transaction;
      });

      return { data: duplicatesMap, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * OPTIMIZED: Bulk category usage check
   * Check if multiple categories are used in transactions
   */
  async checkCategoriesUsedBatch(categoryIds: string[]): Promise<DatabaseResult<string[]>> {
    try {
      if (categoryIds.length === 0) {
        return { data: [], error: null };
      }

      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select('category_id')
        .in('category_id', categoryIds);

      if (error) {
        return { data: null, error: error.message };
      }

      // Get unique category IDs that are used
      const usedCategoryIds = [...new Set((data || []).map(item => item.category_id))];
      return { data: usedCategoryIds, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * OPTIMIZED: Get summary statistics in a single query
   * Calculates totals, counts, and averages efficiently
   */
  async getSummaryStatistics(startDate?: string, endDate?: string): Promise<DatabaseResult<any>> {
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

      // Calculate all statistics in a single pass
      const stats = (data || []).reduce((acc, transaction) => {
        const amount = Number(transaction.amount);
        const type = transaction.type as 'income' | 'expense';

        acc.total_count++;
        if (type === 'income') {
          acc.income_count++;
          acc.income_total += amount;
        } else {
          acc.expense_count++;
          acc.expense_total += amount;
        }

        return acc;
      }, {
        total_count: 0,
        income_count: 0,
        expense_count: 0,
        income_total: 0,
        expense_total: 0
      });

      // Calculate averages
      const result = {
        ...stats,
        income_average: stats.income_count > 0 ? Number((stats.income_total / stats.income_count).toFixed(2)) : 0,
        expense_average: stats.expense_count > 0 ? Number((stats.expense_total / stats.expense_count).toFixed(2)) : 0,
        net_total: Number((stats.income_total - stats.expense_total).toFixed(2))
      };

      return { data: result, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: errorMessage };
    }
  }
}

export default new TransactionRepository();