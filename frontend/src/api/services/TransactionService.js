/**
 * Transaction API Service
 * Handles all transaction-related API operations
 */

import BaseApiService from './BaseApiService.js';
import API_CONFIG from '../config.js';
import { ValidationError, BusinessError } from '../errors.js';

class TransactionService extends BaseApiService {
  constructor() {
    super('transactions', {
      base: API_CONFIG.ENDPOINTS.TRANSACTIONS,
      byId: API_CONFIG.ENDPOINTS.TRANSACTION_BY_ID,
      bulk: API_CONFIG.ENDPOINTS.TRANSACTIONS_BULK,
      search: API_CONFIG.ENDPOINTS.TRANSACTIONS_SEARCH,
    });
  }

  /**
   * Get all transactions with advanced filtering
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Transactions with pagination
   */
  async getAllTransactions(params = {}) {
    const {
      page,
      limit,
      type,
      categoryId,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      search,
      sort = 'date',
      order = 'desc',
      includeCategory = true,
    } = params;

    const queryParams = {
      page,
      limit,
      type,
      category_id: categoryId,
      start_date: startDate,
      end_date: endDate,
      min_amount: minAmount,
      max_amount: maxAmount,
      search,
      sort,
      order,
      include_category: includeCategory,
    };

    // Remove undefined values
    Object.keys(queryParams).forEach(key => 
      queryParams[key] === undefined && delete queryParams[key]
    );

    const response = await this.getAll(queryParams);
    
    console.log('🔍 DEBUG - TransactionService raw response:', response);
    
    // Transform response based on the format returned by interceptor
    if (response && typeof response === 'object') {
      if (Array.isArray(response)) {
        // Direct array format - transform each transaction
        const transformedData = response.map(transaction => this.transformResponse(transaction));
        return {
          data: transformedData,
          pagination: { page: 1, limit: transformedData.length, total: transformedData.length }
        };
      } else if (response.transactions && Array.isArray(response.transactions)) {
        // Backend format: { transactions: [...], pagination: {...} }
        const transformedData = response.transactions.map(transaction => this.transformResponse(transaction));
        return {
          data: transformedData,
          pagination: response.pagination || { page: 1, limit: transformedData.length, total: transformedData.length }
        };
      } else if (response.data && Array.isArray(response.data)) {
        // Wrapped format: { data: [...] }
        const transformedData = response.data.map(transaction => this.transformResponse(transaction));
        return {
          data: transformedData,
          pagination: response.pagination || { page: 1, limit: transformedData.length, total: transformedData.length }
        };
      }
    }
    
    console.log('❌ DEBUG - TransactionService: Unknown response format:', response);
    return { data: [], pagination: { page: 1, limit: 0, total: 0 } };
  }

  /**
   * Get transaction by ID with category details
   * @param {string} id - Transaction ID
   * @param {boolean} includeCategory - Include category details
   * @returns {Promise<Object>} Transaction data
   */
  async getTransactionById(id, includeCategory = true) {
    const response = await this.getById(id, { include_category: includeCategory });
    return this.transformResponse(response);
  }

  /**
   * Create a new transaction
   * @param {Object} transactionData - Transaction data
   * @returns {Promise<Object>} Created transaction
   */
  async createTransaction(transactionData) {
    const validatedData = this.validateData(transactionData, 'create');
    const transformedData = this.transformRequest(validatedData);
    
    const response = await this.create(transformedData);
    return this.transformResponse(response);
  }

  /**
   * Update a transaction
   * @param {string} id - Transaction ID
   * @param {Object} updates - Update data
   * @returns {Promise<Object>} Updated transaction
   */
  async updateTransaction(id, updates) {
    const validatedData = this.validateData(updates, 'update');
    const transformedData = this.transformRequest(validatedData);
    
    const response = await this.update(id, transformedData);
    return this.transformResponse(response);
  }

  /**
   * Delete a transaction
   * @param {string} id - Transaction ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteTransaction(id) {
    return this.delete(id);
  }

  /**
   * Bulk create transactions
   * @param {Array<Object>} transactions - Array of transaction data
   * @returns {Promise<Object>} Bulk operation result
   */
  async bulkCreateTransactions(transactions) {
    if (transactions.length > 50) {
      throw new ValidationError('Cannot create more than 50 transactions at once');
    }

    const validatedTransactions = transactions.map(tx => 
      this.validateData(tx, 'create')
    ).map(tx => this.transformRequest(tx));
    
    return this.bulkCreate(validatedTransactions);
  }

  /**
   * Get transaction summary for a date range
   * @param {string} startDate - Start date (ISO string)
   * @param {string} endDate - End date (ISO string)
   * @returns {Promise<Object>} Transaction summary
   */
  async getTransactionSummary(startDate = null, endDate = null) {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response = await this.getCustom(API_CONFIG.ENDPOINTS.TRANSACTIONS_SUMMARY, params);
    return response;
  }

  /**
   * Search transactions by description
   * @param {string} query - Search query
   * @param {number} limit - Result limit
   * @returns {Promise<Array>} Search results
   */
  async searchTransactions(query, limit = 10) {
    const response = await this.search(query, { limit });
    
    if (Array.isArray(response)) {
      return response.map(tx => this.transformResponse(tx));
    }
    
    return [];
  }

  /**
   * Get transactions by category
   * @param {string} categoryId - Category ID
   * @param {Object} params - Additional query parameters
   * @returns {Promise<Object>} Transactions for category
   */
  async getTransactionsByCategory(categoryId, params = {}) {
    return this.getAllTransactions({ ...params, categoryId });
  }

  /**
   * Get recent transactions
   * @param {number} limit - Number of transactions to fetch
   * @returns {Promise<Array>} Recent transactions
   */
  async getRecentTransactions(limit = 5) {
    const response = await this.getAllTransactions({ 
      limit, 
      sort: 'date', 
      order: 'desc' 
    });
    return response.data || [];
  }

  /**
   * Get transactions for a specific month
   * @param {number} year - Year
   * @param {number} month - Month (1-12)
   * @returns {Promise<Object>} Transactions for the month
   */
  async getMonthlyTransactions(year, month) {
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();
    
    return this.getAllTransactions({ startDate, endDate });
  }

  /**
   * Validate transaction data
   * @param {Object} data - Transaction data
   * @param {string} operation - Operation type
   * @returns {Object} Validated data
   */
  validateData(data, operation = 'create') {
    const errors = [];

    if (operation === 'create') {
      // Required fields for creation
      if (!data.type || !['income', 'expense'].includes(data.type)) {
        errors.push('Valid transaction type (income/expense) is required');
      }
      
      if (data.amount === undefined || data.amount === null) {
        errors.push('Amount is required');
      }
      
      if (!data.description || data.description.trim() === '') {
        errors.push('Description is required');
      }
      
      if (!data.categoryId) {
        errors.push('Category is required');
      }
      
      if (!data.date) {
        errors.push('Date is required');
      }
    }

    // Validate amount
    if (data.amount !== undefined) {
      const amount = parseFloat(data.amount);
      if (isNaN(amount) || amount <= 0) {
        errors.push('Amount must be a positive number');
      }
      if (amount > 999999999.99) {
        errors.push('Amount cannot exceed 999,999,999.99');
      }
    }

    // Validate description length
    if (data.description && data.description.length > 255) {
      errors.push('Description must be 255 characters or less');
    }

    // Validate date format
    if (data.date) {
      const date = new Date(data.date);
      if (isNaN(date.getTime())) {
        errors.push('Invalid date format');
      }
    }

    if (errors.length > 0) {
      throw new ValidationError('Transaction validation failed', errors);
    }

    return data;
  }

  /**
   * Transform request data to API format
   * @param {Object} data - Transaction data
   * @returns {Object} Transformed data
   */
  transformRequest(data) {
    return {
      type: data.type,
      amount: parseFloat(data.amount),
      description: data.description.trim(),
      category_id: data.categoryId || data.category_id,
      date: data.date instanceof Date ? data.date.toISOString() : data.date,
    };
  }

  /**
   * Transform API response to frontend format
   * @param {Object} transaction - API transaction data
   * @returns {Object} Transformed transaction
   */
  transformResponse(transaction) {
    if (!transaction) return null;

    const transformed = {
      id: transaction.id,
      type: transaction.type,
      amount: parseFloat(transaction.amount),
      description: transaction.description,
      categoryId: transaction.category_id,
      date: transaction.date,
      createdAt: transaction.created_at,
      updatedAt: transaction.updated_at,
    };

    // Include category data if available
    if (transaction.category) {
      transformed.category = {
        id: transaction.category.id,
        name: transaction.category.name,
        type: transaction.category.type,
        color: transaction.category.color,
        icon: transaction.category.icon,
      };
    }

    return transformed;
  }

  /**
   * Get spending by category for a period
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {Promise<Array>} Spending breakdown by category
   */
  async getSpendingByCategory(startDate, endDate) {
    try {
      const response = await this.getCustom(
        `${API_CONFIG.ENDPOINTS.TRANSACTIONS}/analytics/by-category`,
        { start_date: startDate, end_date: endDate }
      );
      return response;
    } catch (error) {
      console.error('Error fetching spending by category:', error);
      throw error;
    }
  }

  /**
   * Get daily spending trend
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {Promise<Array>} Daily spending data
   */
  async getDailySpendingTrend(startDate, endDate) {
    try {
      const response = await this.getCustom(
        `${API_CONFIG.ENDPOINTS.TRANSACTIONS}/analytics/daily-trend`,
        { start_date: startDate, end_date: endDate }
      );
      return response;
    } catch (error) {
      console.error('Error fetching daily spending trend:', error);
      throw error;
    }
  }

  /**
   * Duplicate a transaction
   * @param {string} transactionId - Transaction ID to duplicate
   * @param {Object} overrides - Fields to override in the duplicate
   * @returns {Promise<Object>} Created duplicate transaction
   */
  async duplicateTransaction(transactionId, overrides = {}) {
    const original = await this.getTransactionById(transactionId);
    
    const duplicateData = {
      ...original,
      ...overrides,
      date: overrides.date || new Date().toISOString(),
    };

    // Remove fields that shouldn't be duplicated
    delete duplicateData.id;
    delete duplicateData.createdAt;
    delete duplicateData.updatedAt;

    return this.createTransaction(duplicateData);
  }

  /**
   * Get transaction statistics
   * @param {Object} params - Filter parameters
   * @returns {Promise<Object>} Transaction statistics
   */
  async getTransactionStats(params = {}) {
    try {
      const response = await this.getCustom(
        `${API_CONFIG.ENDPOINTS.TRANSACTIONS}/stats`,
        params
      );
      return response;
    } catch (error) {
      console.error('Error fetching transaction stats:', error);
      throw error;
    }
  }
}

// Create singleton instance
const transactionService = new TransactionService();

export default transactionService;
export { TransactionService };
