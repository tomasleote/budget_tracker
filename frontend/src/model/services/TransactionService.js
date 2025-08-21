import { Transaction } from '../entities/index.js';
import TransactionRepository from '../repositories/TransactionRepository.js';
import { 
  validateTransaction, 
  validateBusinessRules,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  calculateBalance,
  calculateSpendingByCategory,
  getDateRange,
  formatExportFilename,
  safeExecute,
  asyncSafeExecute
} from '../../controller/utils/index.js';

class TransactionService {
  constructor() {
    this.transactionRepository = new TransactionRepository();
  }

  // Create a new transaction
  async createTransaction(transactionData) {
    return asyncSafeExecute(async () => {
      // Validate input data
      const validation = validateTransaction(transactionData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Check for duplicates
      const existingTransactions = await this.transactionRepository.getAll();
      const businessValidation = validateBusinessRules(
        { ...transactionData, type: 'transaction' },
        { existingTransactions }
      );

      // Create transaction using repository
      const result = await this.transactionRepository.create(transactionData);
      if (!result.success) {
        throw new Error(result.error);
      }

      return {
        success: true,
        transaction: result.data,
        warnings: [...validation.warnings, ...businessValidation.warnings],
        message: SUCCESS_MESSAGES.TRANSACTION.CREATED
      };
    }, {
      success: false,
      error: ERROR_MESSAGES.TRANSACTION.CREATE_FAILED,
      transaction: null
    });
  }

  // Update existing transaction
  async updateTransaction(transactionId, updateData) {
    return asyncSafeExecute(async () => {
      const validation = validateTransaction(updateData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const result = await this.transactionRepository.update(transactionId, updateData);
      if (!result.success) {
        throw new Error(result.error);
      }

      return {
        success: true,
        transaction: result.data,
        message: SUCCESS_MESSAGES.TRANSACTION.UPDATED
      };
    }, {
      success: false,
      error: ERROR_MESSAGES.TRANSACTION.UPDATE_FAILED,
      transaction: null
    });
  }

  // Delete transaction
  async deleteTransaction(transactionId) {
    return asyncSafeExecute(async () => {
      const result = await this.transactionRepository.delete(transactionId);
      if (!result.success) {
        throw new Error(result.error);
      }

      return { 
        success: true,
        message: SUCCESS_MESSAGES.TRANSACTION.DELETED
      };
    }, {
      success: false,
      error: ERROR_MESSAGES.TRANSACTION.DELETE_FAILED
    });
  }

  // Get all transactions
  async getAllTransactions() {
    return asyncSafeExecute(async () => {
      return await this.transactionRepository.getAll();
    }, []);
  }

  // Get transaction by ID
  async getTransactionById(transactionId) {
    return asyncSafeExecute(async () => {
      return await this.transactionRepository.getById(transactionId);
    }, null);
  }

  // Get transactions with filters
  async getTransactions(filters = {}) {
    return asyncSafeExecute(async () => {
      return await this.transactionRepository.getWithFilters(filters);
    }, []);
  }

  // Get recent transactions
  async getRecentTransactions(limit = 5) {
    return asyncSafeExecute(async () => {
      return await this.transactionRepository.getRecent(limit);
    }, []);
  }

  // Get transactions by date range
  async getTransactionsByDateRange(startDate, endDate) {
    return asyncSafeExecute(async () => {
      return await this.transactionRepository.getByDateRange(startDate, endDate);
    }, []);
  }

  // Get transactions by category
  async getTransactionsByCategory(category) {
    return asyncSafeExecute(async () => {
      return await this.transactionRepository.getByCategory(category);
    }, []);
  }

  // Get spending summary using utility functions
  async getSpendingSummary(period = 'month', date = new Date()) {
    return asyncSafeExecute(async () => {
      const dateRange = getDateRange(period, date);
      const transactions = await this.transactionRepository.getByDateRange(
        dateRange.start,
        dateRange.end
      );

      return calculateBalance(transactions);
    }, { income: 0, expenses: 0, balance: 0 });
  }

  // Get category breakdown using utility functions
  async getCategoryBreakdown(type = 'expense', period = 'month', date = new Date()) {
    return asyncSafeExecute(async () => {
      const dateRange = getDateRange(period, date);
      const transactions = await this.transactionRepository.getByDateRange(
        dateRange.start,
        dateRange.end
      );

      return calculateSpendingByCategory(transactions, type);
    }, []);
  }

  // Bulk operations
  async createMultipleTransactions(transactionsData) {
    return asyncSafeExecute(async () => {
      const results = [];
      
      for (const transactionData of transactionsData) {
        const result = await this.createTransaction(transactionData);
        results.push(result);
      }

      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      return {
        total: results.length,
        successful: successful.length,
        failed: failed.length,
        results,
        transactions: successful.map(r => r.transaction),
        message: `${successful.length} transactions imported successfully`
      };
    }, {
      total: 0,
      successful: 0,
      failed: 0,
      error: 'Failed to import transactions'
    });
  }

  async deleteMultipleTransactions(transactionIds) {
    return asyncSafeExecute(async () => {
      const result = await this.transactionRepository.deleteMultiple(transactionIds);
      return {
        total: transactionIds.length,
        successful: result.success ? result.deletedCount : 0,
        failed: result.success ? 0 : transactionIds.length,
        results: result,
        message: `${result.deletedCount || 0} transactions deleted successfully`
      };
    }, {
      total: transactionIds.length,
      successful: 0,
      failed: transactionIds.length,
      error: 'Failed to delete transactions'
    });
  }

  // Auto-categorization with improved keyword matching
  async suggestCategory(description, amount) {
    return asyncSafeExecute(async () => {
      const transactions = await this.transactionRepository.getAll();
      
      // Simple pattern matching based on existing transactions
      const matches = transactions.filter(t => 
        t.description.toLowerCase().includes(description.toLowerCase().substring(0, 5))
      );

      if (matches.length > 0) {
        // Return most common category from matches
        const categoryCount = {};
        matches.forEach(t => {
          categoryCount[t.category] = (categoryCount[t.category] || 0) + 1;
        });

        const suggestedCategory = Object.keys(categoryCount).reduce((a, b) => 
          categoryCount[a] > categoryCount[b] ? a : b
        );

        return {
          category: suggestedCategory,
          confidence: Math.min(matches.length / 5, 1), // Max confidence at 5 matches
          matches: matches.length
        };
      }

      // Fallback to keyword-based categorization
      return this.categorizeByKeywords(description);
    }, { category: 'Other', confidence: 0, matches: 0 });
  }

  // Enhanced keyword categorization
  categorizeByKeywords(description) {
    const keywords = {
      'Food & Dining': ['restaurant', 'food', 'cafe', 'pizza', 'burger', 'lunch', 'dinner', 'grocery', 'market'],
      'Transportation': ['gas', 'fuel', 'uber', 'lyft', 'taxi', 'bus', 'train', 'parking', 'car', 'metro'],
      'Shopping': ['amazon', 'store', 'mall', 'shop', 'clothing', 'electronics', 'target', 'walmart'],
      'Bills & Utilities': ['electric', 'water', 'internet', 'phone', 'insurance', 'rent', 'mortgage', 'utility'],
      'Entertainment': ['movie', 'netflix', 'spotify', 'game', 'concert', 'theater', 'entertainment'],
      'Healthcare': ['doctor', 'medical', 'pharmacy', 'hospital', 'dentist', 'health', 'clinic'],
      'Education': ['school', 'university', 'course', 'book', 'tuition', 'education', 'learning']
    };

    const desc = description.toLowerCase();
    
    for (const [category, categoryKeywords] of Object.entries(keywords)) {
      const matchCount = categoryKeywords.filter(keyword => desc.includes(keyword)).length;
      if (matchCount > 0) {
        return {
          category,
          confidence: Math.min(matchCount * 0.3, 0.8), // Higher confidence for more matches
          matches: 0
        };
      }
    }

    return { category: 'Other', confidence: 0.3, matches: 0 };
  }

  // Analytics and insights using utility functions
  async getTransactionInsights(period = 'month', date = new Date()) {
    return asyncSafeExecute(async () => {
      const dateRange = getDateRange(period, date);
      const transactions = await this.transactionRepository.getByDateRange(
        dateRange.start,
        dateRange.end
      );

      const balance = calculateBalance(transactions);
      const categoryBreakdown = calculateSpendingByCategory(transactions, 'expense');
      
      // Enhanced insights with utility functions
      return {
        period,
        dateRange,
        summary: balance,
        categoryBreakdown,
        topCategories: categoryBreakdown.slice(0, 5),
        transactionCount: transactions.length,
        averageTransaction: transactions.length > 0 ? 
          (balance.income + balance.expenses) / transactions.length : 0,
        insights: this.generateInsights(balance, categoryBreakdown, transactions)
      };
    }, null);
  }

  // Generate actionable insights
  generateInsights(balance, categoryBreakdown, transactions) {
    const insights = [];

    // Spending insights
    if (balance.expenses > balance.income) {
      insights.push({
        type: 'warning',
        title: 'Spending Exceeds Income',
        message: `You spent $${balance.expenses - balance.income} more than you earned this period.`,
        action: 'Review your expenses and identify areas to cut back.'
      });
    }

    // Top category insights
    if (categoryBreakdown.length > 0) {
      const topCategory = categoryBreakdown[0];
      const categoryPercentage = balance.expenses > 0 ? (topCategory.amount / balance.expenses * 100) : 0;
      
      if (categoryPercentage > 40) {
        insights.push({
          type: 'info',
          title: 'High Category Spending',
          message: `${topCategory.category} represents ${categoryPercentage.toFixed(1)}% of your expenses.`,
          action: 'Consider setting a budget for this category.'
        });
      }
    }

    // Transaction frequency insights
    if (transactions.length > 30) {
      insights.push({
        type: 'tip',
        title: 'Frequent Transactions',
        message: `You made ${transactions.length} transactions this period.`,
        action: 'Consider consolidating purchases to better track spending.'
      });
    }

    return insights;
  }

  // Data validation and cleanup
  async validateAllTransactions() {
    return asyncSafeExecute(async () => {
      return await this.transactionRepository.validateData();
    }, null);
  }

  async cleanupTransactions() {
    return asyncSafeExecute(async () => {
      return await this.transactionRepository.removeInvalidTransactions();
    }, null);
  }

  // Export functionality with utility functions
  async exportTransactions(format = 'json', filters = {}) {
    return asyncSafeExecute(async () => {
      const transactions = await this.transactionRepository.getWithFilters(filters);
      
      switch (format.toLowerCase()) {
        case 'csv':
          return await this.transactionRepository.exportToCSV();
        case 'json':
          return JSON.stringify(transactions, null, 2);
        default:
          throw new Error('Unsupported export format');
      }
    }, null);
  }

  // Import functionality with enhanced validation
  async importTransactions(data, format = 'json') {
    return asyncSafeExecute(async () => {
      let transactionsData = [];
      
      if (format === 'json') {
        transactionsData = JSON.parse(data);
      } else if (format === 'csv') {
        // Enhanced CSV parsing
        const lines = data.split('\n').filter(line => line.trim());
        if (lines.length < 2) throw new Error('CSV must have header and at least one data row');
        
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length === headers.length) {
            const transaction = {};
            headers.forEach((header, index) => {
              transaction[header] = values[index];
            });
            transactionsData.push(transaction);
          }
        }
      }

      return await this.createMultipleTransactions(transactionsData);
    }, {
      total: 0,
      successful: 0,
      failed: 0,
      error: 'Failed to import transactions'
    });
  }

  // Statistics with enhanced calculations
  async getTransactionStatistics() {
    return asyncSafeExecute(async () => {
      return await this.transactionRepository.getStatistics();
    }, null);
  }

  // Enhanced duplicate detection
  async findDuplicateTransactions(transactionId) {
    return asyncSafeExecute(async () => {
      const transaction = await this.transactionRepository.getById(transactionId);
      if (!transaction) {
        return [];
      }

      return await this.transactionRepository.findPotentialDuplicates(transaction);
    }, []);
  }

  // Search transactions with improved matching
  async searchTransactions(query, filters = {}) {
    return asyncSafeExecute(async () => {
      const allTransactions = await this.transactionRepository.getAll();
      const searchTerm = query.toLowerCase().trim();
      
      if (!searchTerm) return allTransactions;

      return allTransactions.filter(transaction => {
        const matchesSearch = 
          transaction.description.toLowerCase().includes(searchTerm) ||
          transaction.category.toLowerCase().includes(searchTerm) ||
          transaction.amount.toString().includes(searchTerm);

        // Apply additional filters
        const matchesFilters = Object.entries(filters).every(([key, value]) => {
          if (!value) return true;
          if (key === 'dateFrom') return new Date(transaction.date) >= new Date(value);
          if (key === 'dateTo') return new Date(transaction.date) <= new Date(value);
          if (key === 'minAmount') return parseFloat(transaction.amount) >= parseFloat(value);
          if (key === 'maxAmount') return parseFloat(transaction.amount) <= parseFloat(value);
          return transaction[key] === value;
        });

        return matchesSearch && matchesFilters;
      });
    }, []);
  }

  // Get transaction suggestions for forms
  async getTransactionSuggestions(field, query) {
    return asyncSafeExecute(async () => {
      const transactions = await this.transactionRepository.getAll();
      const suggestions = new Set();

      transactions.forEach(transaction => {
        const value = transaction[field];
        if (value && value.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(value);
        }
      });

      return Array.from(suggestions).slice(0, 10);
    }, []);
  }
}

// Create singleton instance
const transactionService = new TransactionService();

export default transactionService;
