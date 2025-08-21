import { 
  Transaction, 
  TransactionWithCategory, 
  CreateTransactionDto, 
  UpdateTransactionDto, 
  TransactionQuery,
  PaginatedTransactions,
  TransactionSummary
} from '../types/transaction';
import { logger } from '../config/logger';
import TransactionRepository from '../repositories/TransactionRepository';
import CategoryService from './CategoryService';
import { FilterOptions, PaginationOptions, SortOptions } from '../repositories/BaseRepository';

export class TransactionService {
  /**
   * Get transactions with filtering, sorting, and pagination
   */
  async getTransactions(query: TransactionQuery = {}): Promise<PaginatedTransactions> {
    try {
      const {
        page = 1,
        limit = 20,
        type,
        category_id,
        start_date,
        end_date,
        min_amount,
        max_amount,
        search,
        sort = 'date',
        order = 'desc',
        include_category = false
      } = query;

      // Build filters
      const filters: FilterOptions = {};
      if (type) filters.type = type;
      if (category_id) filters.category_id = category_id;
      if (start_date) filters['gte_date'] = start_date;
      if (end_date) filters['lte_date'] = end_date;
      if (min_amount !== undefined) filters['gte_amount'] = min_amount;
      if (max_amount !== undefined) filters['lte_amount'] = max_amount;
      if (search) filters['ilike_description'] = `%${search}%`;

      // Build sort options
      const sortOptions: SortOptions = {
        field: sort,
        ascending: order === 'asc'
      };

      // Build pagination
      const offset = (page - 1) * limit;
      const pagination: PaginationOptions = { page, limit, offset };

      // Choose repository method based on include_category flag
      let result;
      if (include_category) {
        result = await TransactionRepository.findWithCategories(filters, sortOptions, pagination);
      } else {
        result = await TransactionRepository.findAll(filters, sortOptions, pagination);
      }

      if (result.error) {
        throw new Error(`Failed to fetch transactions: ${result.error}`);
      }

      // Calculate pagination metadata
      const total = result.count || 0;
      const pages = Math.ceil(total / limit);

      const paginatedResult: PaginatedTransactions = {
        transactions: result.data || [],
        pagination: {
          page,
          limit,
          total,
          pages,
          has_next: page < pages,
          has_prev: page > 1
        }
      };

      return paginatedResult;
    } catch (error) {
      logger.error('TransactionService.getTransactions error:', error);
      throw error;
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(id: string, includeCategory = false): Promise<Transaction | TransactionWithCategory | null> {
    try {
      let result;
      if (includeCategory) {
        result = await TransactionRepository.findByIdWithCategory(id);
      } else {
        result = await TransactionRepository.findById(id);
      }

      if (result.error) {
        throw new Error(`Failed to fetch transaction: ${result.error}`);
      }

      return result.data;
    } catch (error) {
      logger.error('TransactionService.getTransactionById error:', error);
      throw error;
    }
  }

  /**
   * Create new transaction with business logic validation
   */
  async createTransaction(transactionData: CreateTransactionDto): Promise<Transaction> {
    try {
      // Business Rule: Validate category exists and is active
      const category = await CategoryService.getCategoryById(transactionData.category_id);
      if (!category) {
        throw new Error('Category not found');
      }

      if (!category.is_active) {
        throw new Error('Cannot create transaction with inactive category');
      }

      // Business Rule: Transaction type must match category type
      if (category.type !== transactionData.type) {
        throw new Error(`Transaction type "${transactionData.type}" does not match category type "${category.type}"`);
      }

      // Business Rule: Amount must be positive
      if (transactionData.amount <= 0) {
        throw new Error('Transaction amount must be positive');
      }

      // Business Rule: Date cannot be in the future (beyond reasonable limits)
      const transactionDate = new Date(transactionData.date);
      const today = new Date();
      const maxFutureDate = new Date(today.getTime() + (24 * 60 * 60 * 1000)); // 1 day in future
      if (transactionDate > maxFutureDate) {
        throw new Error('Transaction date cannot be more than 1 day in the future');
      }

      // Ensure amount precision (2 decimal places)
      const formattedData = {
        ...transactionData,
        amount: Number(transactionData.amount.toFixed(2))
      };

      const result = await TransactionRepository.create(formattedData);
      
      if (result.error || !result.data) {
        throw new Error(`Failed to create transaction: ${result.error}`);
      }

      logger.info(`Transaction created: ${result.data.description} - $${result.data.amount} (${result.data.id})`);
      return result.data;
    } catch (error) {
      logger.error('TransactionService.createTransaction error:', error);
      throw error;
    }
  }

  /**
   * Update transaction with business logic validation
   */
  async updateTransaction(id: string, updates: UpdateTransactionDto): Promise<Transaction> {
    try {
      // Business Rule: Check if transaction exists
      const existing = await this.getTransactionById(id);
      if (!existing) {
        throw new Error('Transaction not found');
      }

      // Business Rule: Validate category if being updated
      if (updates.category_id) {
        const category = await CategoryService.getCategoryById(updates.category_id);
        if (!category) {
          throw new Error('Category not found');
        }

        if (!category.is_active) {
          throw new Error('Cannot update transaction with inactive category');
        }

        const newType = updates.type || existing.type;
        if (category.type !== newType) {
          throw new Error(`Transaction type "${newType}" does not match category type "${category.type}"`);
        }
      }

      // Business Rule: Validate type matches existing category if not updating category
      if (updates.type && !updates.category_id) {
        const existingCategory = await CategoryService.getCategoryById(existing.category_id);
        if (existingCategory && existingCategory.type !== updates.type) {
          throw new Error(`Transaction type "${updates.type}" does not match category type "${existingCategory.type}"`);
        }
      }

      // Business Rule: Amount must be positive if being updated
      if (updates.amount !== undefined && updates.amount <= 0) {
        throw new Error('Transaction amount must be positive');
      }

      // Business Rule: Date validation if being updated
      if (updates.date) {
        const transactionDate = new Date(updates.date);
        const today = new Date();
        const maxFutureDate = new Date(today.getTime() + (24 * 60 * 60 * 1000));
        if (transactionDate > maxFutureDate) {
          throw new Error('Transaction date cannot be more than 1 day in the future');
        }
      }

      // Ensure amount precision if being updated
      const updateData = { ...updates };
      if (updates.amount !== undefined) {
        updateData.amount = Number(updates.amount.toFixed(2));
      }

      const result = await TransactionRepository.update(id, updateData);
      
      if (result.error || !result.data) {
        throw new Error(`Failed to update transaction: ${result.error}`);
      }

      logger.info(`Transaction updated: ${result.data.description} - $${result.data.amount} (${result.data.id})`);
      return result.data;
    } catch (error) {
      logger.error('TransactionService.updateTransaction error:', error);
      throw error;
    }
  }

  /**
   * Delete transaction
   */
  async deleteTransaction(id: string): Promise<void> {
    try {
      // Business Rule: Check if transaction exists
      const existing = await this.getTransactionById(id);
      if (!existing) {
        throw new Error('Transaction not found');
      }

      const result = await TransactionRepository.delete(id);
      
      if (result.error) {
        throw new Error(`Failed to delete transaction: ${result.error}`);
      }

      logger.info(`Transaction deleted: ${existing.description} - $${existing.amount} (${id})`);
    } catch (error) {
      logger.error('TransactionService.deleteTransaction error:', error);
      throw error;
    }
  }

  /**
   * Bulk create transactions with business logic validation
   */
  async bulkCreateTransactions(transactions: CreateTransactionDto[]): Promise<Transaction[]> {
    try {
      // Business Rule: Validate all transactions before creating any
      for (const transaction of transactions) {
        // Validate category exists and type matches
        const category = await CategoryService.getCategoryById(transaction.category_id);
        if (!category) {
          throw new Error(`Category not found: ${transaction.category_id}`);
        }
        if (category.type !== transaction.type) {
          throw new Error(`Transaction type "${transaction.type}" does not match category type "${category.type}"`);
        }
        if (!category.is_active) {
          throw new Error(`Cannot create transaction with inactive category: ${category.name}`);
        }
        if (transaction.amount <= 0) {
          throw new Error('All transaction amounts must be positive');
        }

        // Validate date
        const transactionDate = new Date(transaction.date);
        const today = new Date();
        const maxFutureDate = new Date(today.getTime() + (24 * 60 * 60 * 1000));
        if (transactionDate > maxFutureDate) {
          throw new Error(`Transaction date cannot be more than 1 day in the future: ${transaction.description}`);
        }
      }

      // Ensure amount precision for all transactions
      const formattedTransactions = transactions.map(t => ({
        ...t,
        amount: Number(t.amount.toFixed(2))
      }));

      const result = await TransactionRepository.bulkCreate(formattedTransactions);
      
      if (result.error || !result.data) {
        throw new Error(`Failed to bulk create transactions: ${result.error}`);
      }

      logger.info(`Bulk created ${result.data.length} transactions`);
      return result.data;
    } catch (error) {
      logger.error('TransactionService.bulkCreateTransactions error:', error);
      throw error;
    }
  }

  /**
   * Delete multiple transactions
   */
  async bulkDeleteTransactions(ids: string[]): Promise<void> {
    try {
      const result = await TransactionRepository.bulkDelete(ids);
      
      if (result.error) {
        throw new Error(`Failed to bulk delete transactions: ${result.error}`);
      }

      logger.info(`Bulk deleted ${ids.length} transactions`);
    } catch (error) {
      logger.error('TransactionService.bulkDeleteTransactions error:', error);
      throw error;
    }
  }

  /**
   * Get transaction summary for a date range
   */
  async getTransactionSummary(startDate?: string, endDate?: string): Promise<TransactionSummary> {
    try {
      const result = await TransactionRepository.getSummaryByDateRange(startDate, endDate);
      
      if (result.error) {
        throw new Error(`Failed to get transaction summary: ${result.error}`);
      }

      const transactions = result.data || [];
      
      // Business logic: Calculate summary statistics
      const totalIncome = transactions
        .filter((t: any) => t.type === 'income')
        .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

      const totalExpenses = transactions
        .filter((t: any) => t.type === 'expense')
        .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

      const netAmount = totalIncome - totalExpenses;
      const averageTransaction = transactions.length > 0 
        ? (totalIncome + totalExpenses) / transactions.length 
        : 0;

      // Get date range
      const dates = transactions.map((t: any) => t.date).sort();
      const dateRange = {
        start: dates[0] || (startDate || new Date().toISOString().split('T')[0]),
        end: dates[dates.length - 1] || (endDate || new Date().toISOString().split('T')[0])
      };

      return {
        total_transactions: transactions.length,
        total_income: Number(totalIncome.toFixed(2)),
        total_expenses: Number(totalExpenses.toFixed(2)),
        net_amount: Number(netAmount.toFixed(2)),
        average_transaction: Number(averageTransaction.toFixed(2)),
        date_range: dateRange
      };
    } catch (error) {
      logger.error('TransactionService.getTransactionSummary error:', error);
      throw error;
    }
  }

  /**
   * Search transactions by description
   */
  async searchTransactions(searchTerm: string, limit = 10): Promise<Transaction[]> {
    try {
      // Business Rule: Minimum search term length
      if (searchTerm.trim().length < 1) {
        throw new Error('Search term must be at least 1 character long');
      }

      const result = await TransactionRepository.searchByDescription(searchTerm, limit);
      
      if (result.error) {
        throw new Error(`Failed to search transactions: ${result.error}`);
      }

      return result.data || [];
    } catch (error) {
      logger.error('TransactionService.searchTransactions error:', error);
      throw error;
    }
  }

  /**
   * Get transactions by category
   */
  async getTransactionsByCategory(categoryId: string, limit?: number): Promise<Transaction[]> {
    try {
      // Business Rule: Validate category exists
      const category = await CategoryService.getCategoryById(categoryId);
      if (!category) {
        throw new Error('Category not found');
      }

      const result = await TransactionRepository.findByCategoryId(categoryId, limit);
      
      if (result.error) {
        throw new Error(`Failed to get transactions by category: ${result.error}`);
      }

      return result.data || [];
    } catch (error) {
      logger.error('TransactionService.getTransactionsByCategory error:', error);
      throw error;
    }
  }
}

export default new TransactionService();
