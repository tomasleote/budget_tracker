/**
 * LocalStorage implementation of TransactionRepository
 * Provides the same interface as the database TransactionRepository
 */

import { BaseLocalStorageRepository } from './BaseLocalStorageRepository';
import { Transaction, CreateTransactionDto, UpdateTransactionDto, TransactionFilters, TransactionSummary } from '../../types/transaction';
import { DatabaseResult, FilterOptions, PaginationOptions, SortOptions } from '../BaseRepository';
import { logger } from '../../config/logger';

export class TransactionLocalStorageRepository extends BaseLocalStorageRepository<Transaction, CreateTransactionDto, UpdateTransactionDto> {
  protected storageKey = 'transactions';

  /**
   * Find transactions with advanced filters
   */
  async findWithFilters(
    filters: TransactionFilters,
    sort: SortOptions = { field: 'date', ascending: false },
    pagination?: PaginationOptions
  ): Promise<DatabaseResult<Transaction[]>> {
    try {
      let items = this.getAllItems();

      // Apply transaction-specific filters
      items = this.applyTransactionFilters(items, filters);

      // Apply sorting
      items = this.applySorting(items, sort);

      // Count before pagination
      const count = items.length;

      // Apply pagination
      if (pagination) {
        items = items.slice(pagination.offset, pagination.offset + pagination.limit);
      }

      return { 
        data: items, 
        error: null,
        ...(pagination && { count })
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('TransactionLocalStorageRepository.findWithFilters error:', err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Get transaction summary (total income, expense, balance)
   */
  async getSummary(filters: TransactionFilters = {}): Promise<DatabaseResult<TransactionSummary>> {
    try {
      let items = this.getAllItems();
      items = this.applyTransactionFilters(items, filters);

      const summary: TransactionSummary = {
        total_income: 0,
        total_expense: 0,
        balance: 0,
        transaction_count: items.length,
        avg_income: 0,
        avg_expense: 0,
        largest_income: null,
        largest_expense: null,
        categories_used: new Set()
      };

      const incomeTransactions = items.filter(t => t.type === 'income');
      const expenseTransactions = items.filter(t => t.type === 'expense');

      // Calculate totals
      summary.total_income = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
      summary.total_expense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
      summary.balance = summary.total_income - summary.total_expense;

      // Calculate averages
      summary.avg_income = incomeTransactions.length > 0 ? summary.total_income / incomeTransactions.length : 0;
      summary.avg_expense = expenseTransactions.length > 0 ? summary.total_expense / expenseTransactions.length : 0;

      // Find largest transactions
      if (incomeTransactions.length > 0) {
        summary.largest_income = incomeTransactions.reduce((max, t) => t.amount > max.amount ? t : max, incomeTransactions[0]);
      }
      if (expenseTransactions.length > 0) {
        summary.largest_expense = expenseTransactions.reduce((max, t) => t.amount > max.amount ? t : max, expenseTransactions[0]);
      }

      // Get unique categories
      items.forEach(t => {
        if (t.category_id) {
          (summary.categories_used as Set<string>).add(t.category_id);
        }
      });

      return { data: summary, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('TransactionLocalStorageRepository.getSummary error:', err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Search transactions by text
   */
  async searchTransactions(
    searchTerm: string,
    filters: TransactionFilters = {},
    sort: SortOptions = { field: 'date', ascending: false },
    pagination?: PaginationOptions
  ): Promise<DatabaseResult<Transaction[]>> {
    try {
      let items = this.getAllItems();

      // Apply search filter
      const searchLower = searchTerm.toLowerCase();
      items = items.filter(item => {
        return (
          item.description.toLowerCase().includes(searchLower) ||
          (item.notes && item.notes.toLowerCase().includes(searchLower))
        );
      });

      // Apply other filters
      items = this.applyTransactionFilters(items, filters);

      // Apply sorting
      items = this.applySorting(items, sort);

      // Count before pagination
      const count = items.length;

      // Apply pagination
      if (pagination) {
        items = items.slice(pagination.offset, pagination.offset + pagination.limit);
      }

      return { 
        data: items, 
        error: null,
        ...(pagination && { count })
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('TransactionLocalStorageRepository.searchTransactions error:', err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Get transactions by category
   */
  async findByCategoryId(categoryId: string): Promise<DatabaseResult<Transaction[]>> {
    const filters: FilterOptions = { category_id: categoryId };
    return this.findAll(filters, { field: 'date', ascending: false });
  }

  /**
   * Get transactions by date range
   */
  async findByDateRange(startDate: string, endDate: string): Promise<DatabaseResult<Transaction[]>> {
    try {
      let items = this.getAllItems();
      
      items = items.filter(item => {
        const itemDate = new Date(item.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return itemDate >= start && itemDate <= end;
      });

      // Sort by date descending
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return { data: items, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('TransactionLocalStorageRepository.findByDateRange error:', err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Get monthly spending by category
   */
  async getMonthlySpendingByCategory(year: number, month: number): Promise<DatabaseResult<any>> {
    try {
      const startDate = new Date(year, month - 1, 1).toISOString();
      const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();
      
      const result = await this.findByDateRange(startDate, endDate);
      if (result.error || !result.data) {
        return result;
      }

      const spending: { [categoryId: string]: { total: number; count: number } } = {};
      
      result.data.forEach(transaction => {
        if (transaction.type === 'expense' && transaction.category_id) {
          if (!spending[transaction.category_id]) {
            spending[transaction.category_id] = { total: 0, count: 0 };
          }
          spending[transaction.category_id].total += transaction.amount;
          spending[transaction.category_id].count++;
        }
      });

      return { data: spending, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('TransactionLocalStorageRepository.getMonthlySpendingByCategory error:', err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Check if a category is used in any transaction
   */
  async isCategoryUsed(categoryId: string): Promise<DatabaseResult<boolean>> {
    try {
      const items = this.getAllItems();
      const isUsed = items.some(item => item.category_id === categoryId);
      return { data: isUsed, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('TransactionLocalStorageRepository.isCategoryUsed error:', err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Get recent transactions
   */
  async getRecentTransactions(limit: number = 10): Promise<DatabaseResult<Transaction[]>> {
    return this.findAll({}, { field: 'date', ascending: false }, { page: 1, limit, offset: 0 });
  }

  /**
   * Bulk update transactions (for category migration, etc.)
   */
  async bulkUpdateCategory(oldCategoryId: string, newCategoryId: string): Promise<DatabaseResult<number>> {
    try {
      const items = this.getAllItems();
      let updateCount = 0;

      const updatedItems = items.map(item => {
        if (item.category_id === oldCategoryId) {
          updateCount++;
          return {
            ...item,
            category_id: newCategoryId,
            updated_at: new Date().toISOString()
          };
        }
        return item;
      });

      this.saveAllItems(updatedItems);
      logger.debug(`Bulk updated ${updateCount} transactions from category ${oldCategoryId} to ${newCategoryId}`);
      
      return { data: updateCount, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('TransactionLocalStorageRepository.bulkUpdateCategory error:', err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Apply transaction-specific filters
   */
  private applyTransactionFilters(items: Transaction[], filters: TransactionFilters): Transaction[] {
    return items.filter(item => {
      // Type filter
      if (filters.type && item.type !== filters.type) return false;

      // Category filter
      if (filters.category_id && item.category_id !== filters.category_id) return false;

      // Date range filters
      if (filters.date_from) {
        const itemDate = new Date(item.date);
        const fromDate = new Date(filters.date_from);
        if (itemDate < fromDate) return false;
      }
      if (filters.date_to) {
        const itemDate = new Date(item.date);
        const toDate = new Date(filters.date_to);
        if (itemDate > toDate) return false;
      }

      // Amount range filters
      if (filters.amount_min !== undefined && item.amount < filters.amount_min) return false;
      if (filters.amount_max !== undefined && item.amount > filters.amount_max) return false;

      // Search filter (handled separately in searchTransactions)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matches = 
          item.description.toLowerCase().includes(searchLower) ||
          (item.notes && item.notes.toLowerCase().includes(searchLower));
        if (!matches) return false;
      }

      return true;
    });
  }

  /**
   * Validate transaction data consistency
   */
  async validateTransactionData(transaction: CreateTransactionDto | UpdateTransactionDto): Promise<DatabaseResult<boolean>> {
    try {
      // Check if category exists if specified
      if ('category_id' in transaction && transaction.category_id) {
        // Import CategoryLocalStorageRepository dynamically to avoid circular dependency
        const { default: CategoryRepo } = await import('./CategoryLocalStorageRepository');
        const categoryResult = await CategoryRepo.findById(transaction.category_id);
        
        if (!categoryResult.data) {
          return { data: false, error: 'Category not found' };
        }

        // Validate type matches category type
        if ('type' in transaction && transaction.type !== categoryResult.data.type) {
          return { data: false, error: `Category type "${categoryResult.data.type}" does not match transaction type "${transaction.type}"` };
        }
      }

      return { data: true, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('TransactionLocalStorageRepository.validateTransactionData error:', err);
      return { data: false, error: errorMessage };
    }
  }
}

// Export singleton instance
export default new TransactionLocalStorageRepository();
