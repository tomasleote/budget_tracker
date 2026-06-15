/**
 * Firestore-backed Transaction repository (users/{uid}/transactions).
 * Category joins are resolved in memory from the user's categories collection.
 */
import { FirestoreBaseRepository } from './FirestoreBaseRepository';
import { Transaction, TransactionWithCategory, CreateTransactionDto, UpdateTransactionDto } from '../../types/transaction';
import { DatabaseResult, FilterOptions, PaginationOptions, SortOptions } from '../BaseRepository';
import { applyFilters, applySorting, paginate, errorMessage } from './helpers/queryHelpers';
import { loadCategoryMap, toCategoryInfo } from './helpers/categoryJoin';

export class TransactionFirestoreRepository extends FirestoreBaseRepository<Transaction, CreateTransactionDto, UpdateTransactionDto> {
  protected collectionName = 'transactions';

  async findWithCategories(
    filters: FilterOptions = {},
    sort: SortOptions = { field: 'date', ascending: false },
    pagination?: PaginationOptions
  ): Promise<DatabaseResult<TransactionWithCategory[]>> {
    try {
      let items = applySorting(applyFilters(await this.getAllItems(), filters), sort);
      const count = items.length;
      items = paginate(items, pagination);
      const categories = await loadCategoryMap();
      const data = items.map(t => ({ ...t, category: toCategoryInfo(categories.get(t.category_id)) }));
      return { data, error: null, ...(pagination && { count }) };
    } catch (err) {
      return { data: null, error: errorMessage(err) };
    }
  }

  async findByIdWithCategory(id: string): Promise<DatabaseResult<TransactionWithCategory>> {
    try {
      const result = await this.findById(id);
      if (result.error || !result.data) return { data: null, error: result.error };
      const categories = await loadCategoryMap();
      return { data: { ...result.data, category: toCategoryInfo(categories.get(result.data.category_id)) }, error: null };
    } catch (err) {
      return { data: null, error: errorMessage(err) };
    }
  }

  async findByCategoryId(categoryId: string, limit?: number): Promise<DatabaseResult<Transaction[]>> {
    const pagination = limit ? { page: 1, limit, offset: 0 } : undefined;
    return this.findAll({ category_id: categoryId }, { field: 'date', ascending: false }, pagination);
  }

  async searchByDescription(searchTerm: string, limit = 10): Promise<DatabaseResult<Transaction[]>> {
    return this.findAll(
      { ilike_description: `%${searchTerm}%` } as FilterOptions,
      { field: 'date', ascending: false },
      { page: 1, limit, offset: 0 }
    );
  }

  async getSummaryByDateRange(startDate?: string, endDate?: string): Promise<DatabaseResult<{ type: string; amount: number; date: string }[]>> {
    try {
      const items = (await this.getAllItems()).filter(t =>
        (!startDate || t.date >= startDate) && (!endDate || t.date <= endDate)
      );
      return { data: items.map(t => ({ type: t.type, amount: t.amount, date: t.date })), error: null };
    } catch (err) {
      return { data: null, error: errorMessage(err) };
    }
  }

  async isCategoryUsed(categoryId: string): Promise<DatabaseResult<boolean>> {
    try {
      const items = await this.getAllItems();
      return { data: items.some(t => t.category_id === categoryId), error: null };
    } catch (err) {
      return { data: null, error: errorMessage(err) };
    }
  }

  async findAllWithFilters(filters: {
    type?: 'income' | 'expense' | ('income' | 'expense')[];
    category_ids?: string[];
    date_from?: string;
    date_to?: string;
    amount_min?: number;
    amount_max?: number;
    search?: string;
  }): Promise<Transaction[]> {
    const items = await this.getAllItems();
    const matches = items.filter(t => {
      if (filters.type) {
        const types = Array.isArray(filters.type) ? filters.type : [filters.type];
        if (!types.includes(t.type)) return false;
      }
      if (filters.category_ids && !filters.category_ids.includes(t.category_id)) return false;
      if (filters.date_from && t.date < filters.date_from) return false;
      if (filters.date_to && t.date > filters.date_to) return false;
      if (filters.amount_min !== undefined && t.amount < filters.amount_min) return false;
      if (filters.amount_max !== undefined && t.amount > filters.amount_max) return false;
      if (filters.search && !t.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
    return applySorting(matches, { field: 'date', ascending: false });
  }

  async findDuplicate(data: CreateTransactionDto): Promise<Transaction | null> {
    const items = await this.getAllItems();
    return items.find(t =>
      t.type === data.type &&
      t.amount === data.amount &&
      t.description === data.description &&
      t.category_id === data.category_id &&
      t.date === data.date
    ) || null;
  }
}

export default new TransactionFirestoreRepository();
