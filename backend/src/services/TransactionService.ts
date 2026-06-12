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
import { computeTransactionSummary, isFutureDateExceeded, roundAmount } from './transaction/transactionHelpers';

export class TransactionService {
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

      const filters: FilterOptions = {};
      if (type) filters.type = type;
      if (category_id) filters.category_id = category_id;
      if (start_date) filters['gte_date'] = start_date;
      if (end_date) filters['lte_date'] = end_date;
      if (min_amount !== undefined) filters['gte_amount'] = min_amount;
      if (max_amount !== undefined) filters['lte_amount'] = max_amount;
      if (search) filters['ilike_description'] = `%${search}%`;

      const sortOptions: SortOptions = { field: sort, ascending: order === 'asc' };
      const offset = (page - 1) * limit;
      const pagination: PaginationOptions = { page, limit, offset };

      const result = include_category
        ? await TransactionRepository.findWithCategories(filters, sortOptions, pagination)
        : await TransactionRepository.findAll(filters, sortOptions, pagination);

      if (result.error) {
        throw new Error(`Failed to fetch transactions: ${result.error}`);
      }

      const total = result.count || 0;
      const pages = Math.ceil(total / limit);

      return {
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
    } catch (error) {
      logger.error('TransactionService.getTransactions error:', error);
      throw error;
    }
  }

  async getTransactionById(id: string, includeCategory = false): Promise<Transaction | TransactionWithCategory | null> {
    try {
      const result = includeCategory
        ? await TransactionRepository.findByIdWithCategory(id)
        : await TransactionRepository.findById(id);

      if (result.error) {
        throw new Error(`Failed to fetch transaction: ${result.error}`);
      }

      return result.data;
    } catch (error) {
      logger.error('TransactionService.getTransactionById error:', error);
      throw error;
    }
  }

  async createTransaction(transactionData: CreateTransactionDto): Promise<Transaction> {
    try {
      const category = await CategoryService.getCategoryById(transactionData.category_id);
      if (!category) {
        throw new Error('Category not found');
      }

      if (!category.is_active) {
        throw new Error('Cannot create transaction with inactive category');
      }

      if (category.type !== transactionData.type) {
        throw new Error(`Transaction type "${transactionData.type}" does not match category type "${category.type}"`);
      }

      if (transactionData.amount <= 0) {
        throw new Error('Transaction amount must be positive');
      }

      if (isFutureDateExceeded(transactionData.date)) {
        throw new Error('Transaction date cannot be more than 1 day in the future');
      }

      const formattedData = { ...transactionData, amount: roundAmount(transactionData.amount) };

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

  async updateTransaction(id: string, updates: UpdateTransactionDto): Promise<Transaction> {
    try {
      const existing = await this.getTransactionById(id);
      if (!existing) {
        throw new Error('Transaction not found');
      }

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

      if (updates.type && !updates.category_id) {
        const existingCategory = await CategoryService.getCategoryById(existing.category_id);
        if (existingCategory && existingCategory.type !== updates.type) {
          throw new Error(`Transaction type "${updates.type}" does not match category type "${existingCategory.type}"`);
        }
      }

      if (updates.amount !== undefined && updates.amount <= 0) {
        throw new Error('Transaction amount must be positive');
      }

      if (updates.date && isFutureDateExceeded(updates.date)) {
        throw new Error('Transaction date cannot be more than 1 day in the future');
      }

      const updateData = { ...updates };
      if (updates.amount !== undefined) {
        updateData.amount = roundAmount(updates.amount);
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

  async deleteTransaction(id: string): Promise<void> {
    try {
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

  async bulkCreateTransactions(transactions: CreateTransactionDto[]): Promise<Transaction[]> {
    try {
      for (const transaction of transactions) {
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
        if (isFutureDateExceeded(transaction.date)) {
          throw new Error(`Transaction date cannot be more than 1 day in the future: ${transaction.description}`);
        }
      }

      const formattedTransactions = transactions.map(t => ({
        ...t,
        amount: roundAmount(t.amount)
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

  async getTransactionSummary(startDate?: string, endDate?: string): Promise<TransactionSummary> {
    try {
      const result = await TransactionRepository.getSummaryByDateRange(startDate, endDate);

      if (result.error) {
        throw new Error(`Failed to get transaction summary: ${result.error}`);
      }

      return computeTransactionSummary(result.data || [], startDate, endDate);
    } catch (error) {
      logger.error('TransactionService.getTransactionSummary error:', error);
      throw error;
    }
  }

  async searchTransactions(searchTerm: string, limit = 10): Promise<Transaction[]> {
    try {
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

  async getTransactionsByCategory(categoryId: string, limit?: number): Promise<Transaction[]> {
    try {
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
