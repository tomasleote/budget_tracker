/**
 * Transaction API Service
 * Handles all transaction-related API operations
 */

import BaseApiService from './BaseApiService.js';
import API_CONFIG from '../config.js';
import { ValidationError } from '../errors.js';
import { buildTransactionQueryParams } from './transaction/queryParams.js';
import {
  transformTransactionRequest,
  transformTransactionResponse,
  normalizeTransactionListResponse,
} from './transaction/transforms.js';
import { validateTransactionData } from './transaction/validators.js';

class TransactionService extends BaseApiService {
  constructor() {
    super('transactions', {
      base: API_CONFIG.ENDPOINTS.TRANSACTIONS,
      byId: API_CONFIG.ENDPOINTS.TRANSACTION_BY_ID,
      bulk: API_CONFIG.ENDPOINTS.TRANSACTIONS_BULK,
      search: API_CONFIG.ENDPOINTS.TRANSACTIONS_SEARCH,
    });
  }

  async getAllTransactions(params = {}) {
    const queryParams = buildTransactionQueryParams(params);
    const response = await this.getAll(queryParams);
    return normalizeTransactionListResponse(response, tx => this.transformResponse(tx));
  }

  async getTransactionById(id, includeCategory = true) {
    const response = await this.getById(id, { include_category: includeCategory });
    return this.transformResponse(response);
  }

  async createTransaction(transactionData) {
    const validatedData = this.validateData(transactionData, 'create');
    const transformedData = this.transformRequest(validatedData);
    const response = await this.create(transformedData);
    return this.transformResponse(response);
  }

  async updateTransaction(id, updates) {
    const validatedData = this.validateData(updates, 'update');
    const transformedData = this.transformRequest(validatedData);
    const response = await this.update(id, transformedData);
    return this.transformResponse(response);
  }

  async deleteTransaction(id) {
    return this.delete(id);
  }

  async bulkCreateTransactions(transactions) {
    if (transactions.length > 50) {
      throw new ValidationError('Cannot create more than 50 transactions at once');
    }
    const validatedTransactions = transactions
      .map(tx => this.validateData(tx, 'create'))
      .map(tx => this.transformRequest(tx));
    return this.bulkCreate(validatedTransactions);
  }

  async getTransactionSummary(startDate = null, endDate = null) {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    return this.getCustom(API_CONFIG.ENDPOINTS.TRANSACTIONS_SUMMARY, params);
  }

  async searchTransactions(query, limit = 10) {
    const response = await this.search(query, { limit });
    if (Array.isArray(response)) {
      return response.map(tx => this.transformResponse(tx));
    }
    return [];
  }

  async getTransactionsByCategory(categoryId, params = {}) {
    return this.getAllTransactions({ ...params, categoryId });
  }

  async getRecentTransactions(limit = 5) {
    const response = await this.getAllTransactions({ limit, sort: 'date', order: 'desc' });
    return response.data || [];
  }

  async getMonthlyTransactions(year, month) {
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();
    return this.getAllTransactions({ startDate, endDate });
  }

  validateData(data, operation = 'create') {
    return validateTransactionData(data, operation);
  }

  transformRequest(data) {
    return transformTransactionRequest(data);
  }

  transformResponse(transaction) {
    return transformTransactionResponse(transaction);
  }

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

  async duplicateTransaction(transactionId, overrides = {}) {
    const original = await this.getTransactionById(transactionId);
    const duplicateData = {
      ...original,
      ...overrides,
      date: overrides.date || new Date().toISOString(),
    };
    delete duplicateData.id;
    delete duplicateData.createdAt;
    delete duplicateData.updatedAt;
    return this.createTransaction(duplicateData);
  }

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

const transactionService = new TransactionService();

export default transactionService;
export { TransactionService };
