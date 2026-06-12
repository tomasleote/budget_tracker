import { BaseRepository, DatabaseResult, FilterOptions, PaginationOptions, SortOptions } from './BaseRepository';
import { Transaction, TransactionWithCategory, CreateTransactionDto, UpdateTransactionDto } from '../types/transaction';
import { supabaseAdmin } from '../config/database';
import {
  buildFindWithCategoriesQuery,
  buildFindAllWithFiltersQuery,
  buildDuplicateBatchOrConditions,
  mapToDuplicatesMap,
  aggregateSummaryStatistics
} from './queries/transactionQueries';

export class TransactionRepository extends BaseRepository<Transaction, CreateTransactionDto, UpdateTransactionDto> {
  protected tableName = 'transactions';
  protected selectFields = '*';

  async findWithCategories(
    filters: FilterOptions = {},
    sort: SortOptions = { field: 'date', ascending: false },
    pagination?: PaginationOptions
  ): Promise<DatabaseResult<TransactionWithCategory[]>> {
    try {
      const query = await buildFindWithCategoriesQuery(this.tableName, filters, sort, pagination);
      const { data, error, count } = await query;

      if (error) {
        return { data: null, error: error.message };
      }

      const result: DatabaseResult<TransactionWithCategory[]> = { data: data || [], error: null };
      if (count !== null && count !== undefined) {
        result.count = count;
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: errorMessage };
    }
  }

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
          return { data: null, error: null };
        }
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: errorMessage };
    }
  }

  async findByCategoryId(categoryId: string, limit?: number): Promise<DatabaseResult<Transaction[]>> {
    const filters: FilterOptions = { category_id: categoryId };
    const sort: SortOptions = { field: 'date', ascending: false };
    const pagination = limit ? { page: 1, limit, offset: 0 } : undefined;
    return this.findAll(filters, sort, pagination);
  }

  async findByType(
    type: 'income' | 'expense',
    pagination?: PaginationOptions
  ): Promise<DatabaseResult<Transaction[]>> {
    return this.findAll({ type }, { field: 'date', ascending: false }, pagination);
  }

  async findByDateRange(
    startDate: string,
    endDate: string,
    pagination?: PaginationOptions
  ): Promise<DatabaseResult<Transaction[]>> {
    const filters: FilterOptions = { 'gte_date': startDate, 'lte_date': endDate };
    return this.findAll(filters, { field: 'date', ascending: false }, pagination);
  }

  async searchByDescription(searchTerm: string, limit = 10): Promise<DatabaseResult<Transaction[]>> {
    const filters: FilterOptions = { 'ilike_description': `%${searchTerm}%` };
    const pagination: PaginationOptions = { page: 1, limit, offset: 0 };
    return this.findAll(filters, { field: 'date', ascending: false }, pagination);
  }

  async getSummaryByDateRange(startDate?: string, endDate?: string): Promise<DatabaseResult<any>> {
    try {
      let query = supabaseAdmin.from(this.tableName).select('type, amount, date');

      if (startDate && endDate) {
        query = query.gte('date', startDate).lte('date', endDate);
      } else if (startDate) {
        query = query.gte('date', startDate);
      } else if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error } = await query;
      if (error) return { data: null, error: error.message };
      return { data: data || [], error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: errorMessage };
    }
  }

  async findByAmountRange(
    minAmount: number,
    maxAmount: number,
    pagination?: PaginationOptions
  ): Promise<DatabaseResult<Transaction[]>> {
    const filters: FilterOptions = { 'gte_amount': minAmount, 'lte_amount': maxAmount };
    return this.findAll(filters, { field: 'amount', ascending: false }, pagination);
  }

  async countByType(type: 'income' | 'expense'): Promise<DatabaseResult<number>> {
    return this.count({ type });
  }

  async countByCategory(categoryId: string): Promise<DatabaseResult<number>> {
    return this.count({ category_id: categoryId });
  }

  async getTotalAmountByType(type: 'income' | 'expense', startDate?: string, endDate?: string): Promise<DatabaseResult<number>> {
    try {
      let query = supabaseAdmin.from(this.tableName).select('amount').eq('type', type);

      if (startDate) query = query.gte('date', startDate);
      if (endDate) query = query.lte('date', endDate);

      const { data, error } = await query;
      if (error) return { data: null, error: error.message };

      const total = (data || []).reduce((sum, t) => sum + Number(t.amount), 0);
      return { data: Number(total.toFixed(2)), error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: errorMessage };
    }
  }

  async getRecent(limit = 10): Promise<DatabaseResult<Transaction[]>> {
    const pagination: PaginationOptions = { page: 1, limit, offset: 0 };
    return this.findAll({}, { field: 'created_at', ascending: false }, pagination);
  }

  async isCategoryUsed(categoryId: string): Promise<DatabaseResult<boolean>> {
    try {
      const result = await this.count({ category_id: categoryId });
      if (result.error) return { data: null, error: result.error };
      return { data: (result.data || 0) > 0, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: errorMessage };
    }
  }

  async findAllWithFilters(filters: any): Promise<Transaction[]> {
    try {
      const query = await buildFindAllWithFiltersQuery(this.tableName, filters);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      throw new Error(errorMessage);
    }
  }

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

      if (error && error.code !== 'PGRST116') throw new Error(error.message);
      return data || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      throw new Error(errorMessage);
    }
  }

  async findDuplicatesBatch(transactions: any[]): Promise<DatabaseResult<{ [key: string]: Transaction }>> {
    try {
      if (transactions.length === 0) return { data: {}, error: null };

      const orConditions = buildDuplicateBatchOrConditions(transactions);
      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select('*')
        .or(orConditions);

      if (error) return { data: null, error: error.message };
      return { data: mapToDuplicatesMap(data || []), error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: errorMessage };
    }
  }

  async checkCategoriesUsedBatch(categoryIds: string[]): Promise<DatabaseResult<string[]>> {
    try {
      if (categoryIds.length === 0) return { data: [], error: null };

      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select('category_id')
        .in('category_id', categoryIds);

      if (error) return { data: null, error: error.message };

      const usedCategoryIds = [...new Set((data || []).map(item => item.category_id))];
      return { data: usedCategoryIds, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: errorMessage };
    }
  }

  async getSummaryStatistics(startDate?: string, endDate?: string): Promise<DatabaseResult<any>> {
    try {
      let query = supabaseAdmin.from(this.tableName).select('type, amount, date');
      if (startDate) query = query.gte('date', startDate);
      if (endDate) query = query.lte('date', endDate);

      const { data, error } = await query;
      if (error) return { data: null, error: error.message };

      return { data: aggregateSummaryStatistics(data || []), error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: errorMessage };
    }
  }
}

export default new TransactionRepository();
