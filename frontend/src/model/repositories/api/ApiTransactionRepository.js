import BaseApiRepository from './BaseApiRepository.js';
import { transactionService } from '../../../api/index.js';
import { TransactionTransformer } from '../../transformers/index.js';
import Transaction from '../../entities/updated/Transaction.js';

/**
 * ApiTransactionRepository
 * API-based repository for Transaction entities
 */
class ApiTransactionRepository extends BaseApiRepository {
  constructor() {
    super('transactions', transactionService, TransactionTransformer);
    this.EntityClass = Transaction;
  }

  /**
   * Get transactions with enhanced filtering
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Filtered transactions
   */
  async getFiltered(filters = {}) {
    try {
      const response = await this.apiService.getAllTransactions(filters);
      
      if (response && response.data) {
        return this.transformer.fromBackendArray(response.data);
      }
      
      return [];
    } catch (error) {
      console.error('Error getting filtered transactions:', error);
      return [];
    }
  }

  /**
   * Get transactions by type
   * @param {string} type - Transaction type (income/expense)
   * @returns {Promise<Array>} Transactions of specified type
   */
  async getByType(type) {
    return this.getFiltered({ type });
  }

  /**
   * Get transactions by category
   * @param {string} categoryId - Category ID
   * @returns {Promise<Array>} Transactions for category
   */
  async getByCategory(categoryId) {
    return this.getFiltered({ categoryId });
  }

  /**
   * Get transactions for date range
   * @param {Date|string} startDate - Start date
   * @param {Date|string} endDate - End date
   * @returns {Promise<Array>} Transactions in date range
   */
  async getByDateRange(startDate, endDate) {
    return this.getFiltered({ startDate, endDate });
  }

  /**
   * Get recent transactions
   * @param {number} limit - Number of transactions to fetch
   * @returns {Promise<Array>} Recent transactions
   */
  async getRecent(limit = 5) {
    try {
      const response = await this.apiService.getRecentTransactions(limit);
      return this.transformer.fromBackendArray(response);
    } catch (error) {
      console.error('Error getting recent transactions:', error);
      return [];
    }
  }

  /**
   * Get transaction summary
   * @param {Date|string} startDate - Start date
   * @param {Date|string} endDate - End date
   * @returns {Promise<Object>} Transaction summary
   */
  async getSummary(startDate = null, endDate = null) {
    try {
      const response = await this.apiService.getTransactionSummary(startDate, endDate);
      return this.transformer.summaryFromBackend(response);
    } catch (error) {
      console.error('Error getting transaction summary:', error);
      return {
        totalTransactions: 0,
        totalIncome: 0,
        totalExpenses: 0,
        netAmount: 0,
        averageTransaction: 0,
        dateRange: { start: null, end: null }
      };
    }
  }

  /**
   * Search transactions by description
   * @param {string} query - Search query
   * @param {number} limit - Result limit
   * @returns {Promise<Array>} Search results
   */
  async searchByDescription(query, limit = 10) {
    try {
      const response = await this.apiService.searchTransactions(query, limit);
      return this.transformer.fromBackendArray(response);
    } catch (error) {
      console.error('Error searching transactions:', error);
      return [];
    }
  }

  /**
   * Get transactions for current month
   * @returns {Promise<Array>} Current month transactions
   */
  async getCurrentMonthTransactions() {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return this.getByDateRange(startDate, endDate);
  }

  /**
   * Get transactions for specific month
   * @param {number} year - Year
   * @param {number} month - Month (1-12)
   * @returns {Promise<Array>} Monthly transactions
   */
  async getMonthlyTransactions(year, month) {
    try {
      const response = await this.apiService.getMonthlyTransactions(year, month);
      
      if (response && response.data) {
        return this.transformer.fromBackendArray(response.data);
      }
      
      return [];
    } catch (error) {
      console.error('Error getting monthly transactions:', error);
      return [];
    }
  }

  /**
   * Calculate total by type
   * @param {string} type - Transaction type
   * @param {Object} filters - Additional filters
   * @returns {Promise<number>} Total amount
   */
  async calculateTotalByType(type, filters = {}) {
    try {
      const transactions = await this.getFiltered({ ...filters, type });
      return transactions.reduce((sum, tx) => sum + tx.amount, 0);
    } catch (error) {
      console.error('Error calculating total by type:', error);
      return 0;
    }
  }

  /**
   * Get spending by category
   * @param {Date|string} startDate - Start date
   * @param {Date|string} endDate - End date
   * @returns {Promise<Array>} Spending breakdown by category
   */
  async getSpendingByCategory(startDate, endDate) {
    try {
      const response = await this.apiService.getSpendingByCategory(startDate, endDate);
      return response;
    } catch (error) {
      console.error('Error getting spending by category:', error);
      return [];
    }
  }

  /**
   * Duplicate a transaction
   * @param {string} transactionId - Transaction ID to duplicate
   * @param {Object} overrides - Fields to override
   * @returns {Promise<Object>} Result with duplicated transaction
   */
  async duplicate(transactionId, overrides = {}) {
    try {
      const response = await this.apiService.duplicateTransaction(transactionId, overrides);
      const transformedData = this.transformer.fromBackend(response);
      
      return {
        success: true,
        data: transformedData,
        id: transformedData.id
      };
    } catch (error) {
      console.error('Error duplicating transaction:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Override create to ensure entity instance creation
   * @param {Object} data - Transaction data
   * @returns {Promise<Object>} Result with created transaction
   */
  async create(data) {
    try {
      // Create entity instance to ensure validation
      const entity = new this.EntityClass(data);
      
      // Use parent create method with entity data
      const result = await super.create(entity.toJSON());
      
      if (result.success && result.data) {
        // Return entity instance
        result.data = new this.EntityClass(result.data);
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Override getAll to return entity instances
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} Array of Transaction entities
   */
  async getAll(filters = {}) {
    const data = await super.getAll(filters);
    return data.map(item => new this.EntityClass(item));
  }

  /**
   * Override getById to return entity instance
   * @param {string} id - Transaction ID
   * @returns {Promise<Transaction|null>} Transaction entity or null
   */
  async getById(id) {
    const data = await super.getById(id);
    return data ? new this.EntityClass(data) : null;
  }

  /**
   * Get transactions with full category data
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Transactions with category objects
   */
  async getAllWithCategories(filters = {}) {
    try {
      const response = await this.apiService.getAllTransactions({
        ...filters,
        includeCategory: true
      });
      
      if (response && response.data) {
        return response.data.map(item => new this.EntityClass(
          this.transformer.fromBackend(item)
        ));
      }
      
      return [];
    } catch (error) {
      console.error('Error getting transactions with categories:', error);
      return [];
    }
  }

  /**
   * Validate transaction against business rules
   * @param {Object} transaction - Transaction data
   * @param {Object} context - Validation context
   * @returns {Promise<Object>} Validation result
   */
  async validateBusinessRules(transaction, context = {}) {
    const errors = [];
    const warnings = [];

    // Check for duplicates if context provides existing transactions
    if (context.existingTransactions) {
      const duplicates = context.existingTransactions.filter(t => 
        t.amount === transaction.amount &&
        t.description === transaction.description &&
        t.categoryId === transaction.categoryId &&
        Math.abs(new Date(t.date) - new Date(transaction.date)) < 24 * 60 * 60 * 1000
      );

      if (duplicates.length > 0) {
        warnings.push('Possible duplicate transaction detected');
      }
    }

    // Type matching validation
    if (transaction.type && context.categoryType && transaction.type !== context.categoryType) {
      errors.push(`${transaction.type} transaction must use ${transaction.type} category`);
    }

    return { 
      isValid: errors.length === 0, 
      errors, 
      warnings 
    };
  }
}

// Export singleton instance
const apiTransactionRepository = new ApiTransactionRepository();

export default apiTransactionRepository;
export { ApiTransactionRepository };
