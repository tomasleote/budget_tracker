import BaseRepository from './BaseRepository.js';
import { Transaction } from '../entities/index.js';
import StorageService from '../services/StorageService.js';

/**
 * TransactionRepository - LOGGING CLEANED
 * 
 * Repository for transaction-specific database operations
 * 
 * LOGGING CLEANUP:
 * - Removed excessive transaction loading logs
 * - Only keep essential error logs and major operations
 * - Reduced verbosity in repository operations
 */
class TransactionRepository extends BaseRepository {
  constructor() {
    super('Transaction', StorageService.storageKeys.TRANSACTIONS, Transaction);
  }

  // Override getAll to add minimal debugging
  async getAll() {
    try {
      const transactions = await super.getAll();
      // Only log in development when debugging storage issues
      if (process.env.NODE_ENV === 'development' && transactions.length === 0) {
        console.log('⚠️ TransactionRepository found no transactions');
      }
      return transactions;
    } catch (error) {
      console.error('Error in TransactionRepository.getAll():', error);
      return [];
    }
  }

  // Transaction-specific query methods
  async getByType(type) {
    try {
      return await this.findBy({ type });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error getting transactions by type:', error);
      }
      return [];
    }
  }

  async getByCategory(category) {
    try {
      return await this.findBy({ category });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error getting transactions by category:', error);
      }
      return [];
    }
  }

  async getByDateRange(startDate, endDate) {
    try {
      const allTransactions = await this.getAll();
      const start = new Date(startDate);
      const end = new Date(endDate);

      return allTransactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= start && transactionDate <= end;
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error getting transactions by date range:', error);
      }
      return [];
    }
  }

  async getByAmountRange(minAmount, maxAmount) {
    try {
      const allTransactions = await this.getAll();
      
      return allTransactions.filter(transaction => {
        const amount = parseFloat(transaction.amount);
        return amount >= minAmount && amount <= maxAmount;
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error getting transactions by amount range:', error);
      }
      return [];
    }
  }

  async getRecent(limit = 10) {
    try {
      const allTransactions = await this.getAll();
      const sortedTransactions = this.sortData(allTransactions, 'date', 'desc');
      return sortedTransactions.slice(0, limit);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error getting recent transactions:', error);
      }
      return [];
    }
  }

  // Advanced filtering
  async getWithFilters(filters = {}) {
    try {
      let transactions = await this.getAll();

      // Apply type filter
      if (filters.type && filters.type !== 'all') {
        transactions = transactions.filter(t => t.type === filters.type);
      }

      // Apply category filter
      if (filters.category && filters.category !== 'all') {
        transactions = transactions.filter(t => t.category === filters.category);
      }

      // Apply date range filter
      if (filters.dateFrom || filters.dateTo) {
        transactions = transactions.filter(t => {
          const transactionDate = new Date(t.date);
          const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : new Date('1900-01-01');
          const toDate = filters.dateTo ? new Date(filters.dateTo) : new Date('2100-12-31');
          
          return transactionDate >= fromDate && transactionDate <= toDate;
        });
      }

      // Apply amount range filter
      if (filters.minAmount !== undefined) {
        transactions = transactions.filter(t => t.amount >= parseFloat(filters.minAmount));
      }

      if (filters.maxAmount !== undefined) {
        transactions = transactions.filter(t => t.amount <= parseFloat(filters.maxAmount));
      }

      // Apply search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        transactions = transactions.filter(t => 
          t.description.toLowerCase().includes(searchTerm) ||
          t.category.toLowerCase().includes(searchTerm)
        );
      }

      // Apply sorting
      if (filters.sortBy) {
        transactions = this.sortData(transactions, filters.sortBy, filters.sortOrder || 'desc');
      }

      // Apply pagination
      if (filters.limit) {
        const offset = filters.offset || 0;
        transactions = transactions.slice(offset, offset + filters.limit);
      }

      return transactions;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error getting transactions with filters:', error);
      }
      return [];
    }
  }

  // Transaction-specific aggregations
  async getTotalsByType() {
    try {
      const allTransactions = await this.getAll();
      const totals = {
        income: 0,
        expense: 0,
        count: {
          income: 0,
          expense: 0
        }
      };

      allTransactions.forEach(transaction => {
        const amount = parseFloat(transaction.amount) || 0;
        if (transaction.type === 'income') {
          totals.income += amount;
          totals.count.income++;
        } else if (transaction.type === 'expense') {
          totals.expense += amount;
          totals.count.expense++;
        }
      });

      totals.balance = totals.income - totals.expense;
      totals.total = allTransactions.length;

      return totals;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error getting totals by type:', error);
      }
      return {
        income: 0,
        expense: 0,
        balance: 0,
        count: { income: 0, expense: 0 },
        total: 0
      };
    }
  }

  async getTotalsByCategory(type = null) {
    try {
      const allTransactions = await this.getAll();
      const categoryTotals = {};

      allTransactions
        .filter(t => !type || t.type === type)
        .forEach(transaction => {
          const category = transaction.category || 'Uncategorized';
          const amount = parseFloat(transaction.amount) || 0;

          if (!categoryTotals[category]) {
            categoryTotals[category] = {
              category,
              amount: 0,
              count: 0
            };
          }

          categoryTotals[category].amount += amount;
          categoryTotals[category].count++;
        });

      // Convert to array and sort by amount
      return Object.values(categoryTotals)
        .sort((a, b) => b.amount - a.amount);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error getting totals by category:', error);
      }
      return [];
    }
  }

  async getMonthlyTotals(year) {
    try {
      const allTransactions = await this.getAll();
      const monthlyTotals = {};

      // Initialize all months
      for (let month = 0; month < 12; month++) {
        const key = `${year}-${(month + 1).toString().padStart(2, '0')}`;
        monthlyTotals[key] = {
          month: month + 1,
          year,
          income: 0,
          expense: 0,
          balance: 0,
          count: 0
        };
      }

      // Aggregate transactions by month
      allTransactions
        .filter(t => new Date(t.date).getFullYear() === year)
        .forEach(transaction => {
          const date = new Date(transaction.date);
          const month = date.getMonth() + 1;
          const key = `${year}-${month.toString().padStart(2, '0')}`;
          const amount = parseFloat(transaction.amount) || 0;

          if (monthlyTotals[key]) {
            if (transaction.type === 'income') {
              monthlyTotals[key].income += amount;
            } else if (transaction.type === 'expense') {
              monthlyTotals[key].expense += amount;
            }
            monthlyTotals[key].count++;
          }
        });

      // Calculate balances
      Object.values(monthlyTotals).forEach(month => {
        month.balance = month.income - month.expense;
      });

      return Object.values(monthlyTotals);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error getting monthly totals:', error);
      }
      return [];
    }
  }

  // Duplicate detection
  async findPotentialDuplicates(transaction) {
    try {
      const allTransactions = await this.getAll();
      const transactionDate = new Date(transaction.date);
      
      return allTransactions.filter(t => {
        if (t.id === transaction.id) return false; // Exclude self
        
        const tDate = new Date(t.date);
        const daysDiff = Math.abs(transactionDate - tDate) / (1000 * 60 * 60 * 24);
        
        return (
          t.amount === transaction.amount &&
          t.description === transaction.description &&
          t.category === transaction.category &&
          daysDiff <= 1 // Within 1 day
        );
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error finding potential duplicates:', error);
      }
      return [];
    }
  }

  // Statistics
  async getStatistics() {
    try {
      const allTransactions = await this.getAll();
      
      if (allTransactions.length === 0) {
        return {
          total: 0,
          totalIncome: 0,
          totalExpense: 0,
          balance: 0,
          averageTransaction: 0,
          largestTransaction: 0,
          smallestTransaction: 0,
          categoriesCount: 0,
          dateRange: null
        };
      }

      const totals = await this.getTotalsByType();
      const amounts = allTransactions.map(t => parseFloat(t.amount));
      const categories = new Set(allTransactions.map(t => t.category));
      const dates = allTransactions.map(t => new Date(t.date)).sort();

      return {
        total: allTransactions.length,
        totalIncome: totals.income,
        totalExpense: totals.expense,
        balance: totals.balance,
        averageTransaction: (totals.income + totals.expense) / allTransactions.length,
        largestTransaction: Math.max(...amounts),
        smallestTransaction: Math.min(...amounts),
        categoriesCount: categories.size,
        dateRange: {
          earliest: dates[0],
          latest: dates[dates.length - 1]
        }
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error getting statistics:', error);
      }
      return null;
    }
  }

  // Data cleanup
  async removeInvalidTransactions() {
    try {
      const allTransactions = await this.getAll();
      const validTransactions = [];
      let removedCount = 0;

      for (const transactionData of allTransactions) {
        try {
          // Try to create Transaction entity to validate
          new Transaction(transactionData);
          validTransactions.push(transactionData);
        } catch (error) {
          removedCount++;
          if (process.env.NODE_ENV === 'development') {
            console.warn(`Invalid transaction removed: ${transactionData.id}`, error);
          }
        }
      }

      // Save cleaned data
      const saved = this.storageService.setItem(this.storageKey, validTransactions);
      
      return {
        success: saved,
        original: allTransactions.length,
        cleaned: validTransactions.length,
        removed: removedCount
      };
    } catch (error) {
      console.error('Error removing invalid transactions:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Export functionality specific to transactions
  async exportToCSV() {
    try {
      const transactions = await this.getAll();
      
      if (transactions.length === 0) {
        return '';
      }

      const headers = ['ID', 'Type', 'Amount', 'Description', 'Category', 'Date', 'Created At'];
      const csvRows = [headers.join(',')];

      transactions.forEach(transaction => {
        const row = [
          transaction.id,
          transaction.type,
          transaction.amount,
          `"${transaction.description}"`,
          transaction.category,
          transaction.date,
          transaction.createdAt
        ];
        csvRows.push(row.join(','));
      });

      return csvRows.join('\n');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error exporting transactions to CSV:', error);
      }
      return null;
    }
  }
}

export default TransactionRepository;
