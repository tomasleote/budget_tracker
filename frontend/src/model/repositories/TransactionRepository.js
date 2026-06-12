import { logger } from '../../controller/utils/logger.js';
import BaseRepository from './BaseRepository.js';
import { Transaction } from '../entities/index.js';
import StorageService from '../services/StorageService.js';
import { applyTransactionFilters } from './transaction/transactionFilters.js';
import {
  computeTotalsByType,
  computeTotalsByCategory,
  computeMonthlyTotals,
  computeStatistics,
  findPotentialDuplicates,
  filterInvalidTransactions,
  buildTransactionCSV,
} from './transaction/transactionAggregations.js';

class TransactionRepository extends BaseRepository {
  constructor() {
    super('Transaction', StorageService.storageKeys.TRANSACTIONS, Transaction);
  }

  // Override getAll to add minimal debugging
  async getAll() {
    try {
      const transactions = await super.getAll();
      if (process.env.NODE_ENV === 'development' && transactions.length === 0) {
        logger.debug('⚠️ TransactionRepository found no transactions');
      }
      return transactions;
    } catch (error) {
      logger.error('Error in TransactionRepository.getAll():', error);
      return [];
    }
  }

  // Transaction-specific query methods
  async getByType(type) {
    try { return await this.findBy({ type }); }
    catch (error) { if (process.env.NODE_ENV === 'development') logger.error('Error getting transactions by type:', error); return []; }
  }

  async getByCategory(category) {
    try { return await this.findBy({ category }); }
    catch (error) { if (process.env.NODE_ENV === 'development') logger.error('Error getting transactions by category:', error); return []; }
  }

  async getByDateRange(startDate, endDate) {
    try {
      const allTransactions = await this.getAll();
      const start = new Date(startDate);
      const end = new Date(endDate);
      return allTransactions.filter(t => {
        const d = new Date(t.date);
        return d >= start && d <= end;
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') logger.error('Error getting transactions by date range:', error);
      return [];
    }
  }

  async getByAmountRange(minAmount, maxAmount) {
    try {
      const allTransactions = await this.getAll();
      return allTransactions.filter(t => {
        const amount = parseFloat(t.amount);
        return amount >= minAmount && amount <= maxAmount;
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') logger.error('Error getting transactions by amount range:', error);
      return [];
    }
  }

  async getRecent(limit = 10) {
    try {
      const allTransactions = await this.getAll();
      return this.sortData(allTransactions, 'date', 'desc').slice(0, limit);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') logger.error('Error getting recent transactions:', error);
      return [];
    }
  }

  async getWithFilters(filters = {}) {
    try {
      const transactions = await this.getAll();
      return applyTransactionFilters(transactions, filters);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') logger.error('Error getting transactions with filters:', error);
      return [];
    }
  }

  // Transaction-specific aggregations
  async getTotalsByType() {
    try { return computeTotalsByType(await this.getAll()); }
    catch (error) {
      if (process.env.NODE_ENV === 'development') logger.error('Error getting totals by type:', error);
      return { income: 0, expense: 0, balance: 0, count: { income: 0, expense: 0 }, total: 0 };
    }
  }

  async getTotalsByCategory(type = null) {
    try { return computeTotalsByCategory(await this.getAll(), type); }
    catch (error) {
      if (process.env.NODE_ENV === 'development') logger.error('Error getting totals by category:', error);
      return [];
    }
  }

  async getMonthlyTotals(year) {
    try { return computeMonthlyTotals(await this.getAll(), year); }
    catch (error) {
      if (process.env.NODE_ENV === 'development') logger.error('Error getting monthly totals:', error);
      return [];
    }
  }

  async findPotentialDuplicates(transaction) {
    try { return findPotentialDuplicates(await this.getAll(), transaction); }
    catch (error) {
      if (process.env.NODE_ENV === 'development') logger.error('Error finding potential duplicates:', error);
      return [];
    }
  }

  async getStatistics() {
    try {
      const allTransactions = await this.getAll();
      if (allTransactions.length === 0) return computeStatistics([], { income: 0, expense: 0, balance: 0 });
      const totals = computeTotalsByType(allTransactions);
      return computeStatistics(allTransactions, totals);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') logger.error('Error getting statistics:', error);
      return null;
    }
  }

  async removeInvalidTransactions() {
    try {
      const allTransactions = await this.getAll();
      const { validTransactions, removedCount } = filterInvalidTransactions(allTransactions);
      if (process.env.NODE_ENV === 'development' && removedCount > 0) {
        logger.warn(`${removedCount} invalid transaction(s) removed`);
      }
      const saved = this.storageService.setItem(this.storageKey, validTransactions);
      return { success: saved, original: allTransactions.length, cleaned: validTransactions.length, removed: removedCount };
    } catch (error) {
      logger.error('Error removing invalid transactions:', error);
      return { success: false, error: error.message };
    }
  }

  async exportToCSV() {
    try { return buildTransactionCSV(await this.getAll()); }
    catch (error) {
      if (process.env.NODE_ENV === 'development') logger.error('Error exporting transactions to CSV:', error);
      return null;
    }
  }
}

export default TransactionRepository;
