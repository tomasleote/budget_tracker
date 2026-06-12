import BaseApiRepository from './BaseApiRepository.js';
import { transactionService } from '../../../api/index.js';
import { TransactionTransformer } from '../../transformers/index.js';
import Transaction from '../../entities/updated/Transaction.js';
import { validateTransactionBusinessRules } from './transaction/validators.js';

/**
 * ApiTransactionRepository
 * API-based repository for Transaction entities
 */
class ApiTransactionRepository extends BaseApiRepository {
  constructor() {
    super('transactions', transactionService, TransactionTransformer);
    this.EntityClass = Transaction;
  }

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

  async getByType(type) {
    return this.getFiltered({ type });
  }

  async getByCategory(categoryId) {
    return this.getFiltered({ categoryId });
  }

  async getByDateRange(startDate, endDate) {
    return this.getFiltered({ startDate, endDate });
  }

  async getRecent(limit = 5) {
    try {
      const response = await this.apiService.getRecentTransactions(limit);
      return this.transformer.fromBackendArray(response);
    } catch (error) {
      console.error('Error getting recent transactions:', error);
      return [];
    }
  }

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

  async searchByDescription(query, limit = 10) {
    try {
      const response = await this.apiService.searchTransactions(query, limit);
      return this.transformer.fromBackendArray(response);
    } catch (error) {
      console.error('Error searching transactions:', error);
      return [];
    }
  }

  async getCurrentMonthTransactions() {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return this.getByDateRange(startDate, endDate);
  }

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

  async calculateTotalByType(type, filters = {}) {
    try {
      const transactions = await this.getFiltered({ ...filters, type });
      return transactions.reduce((sum, tx) => sum + tx.amount, 0);
    } catch (error) {
      console.error('Error calculating total by type:', error);
      return 0;
    }
  }

  async getSpendingByCategory(startDate, endDate) {
    try {
      const response = await this.apiService.getSpendingByCategory(startDate, endDate);
      return response;
    } catch (error) {
      console.error('Error getting spending by category:', error);
      return [];
    }
  }

  async duplicate(transactionId, overrides = {}) {
    try {
      const response = await this.apiService.duplicateTransaction(transactionId, overrides);
      const transformedData = this.transformer.fromBackend(response);

      return { success: true, data: transformedData, id: transformedData.id };
    } catch (error) {
      console.error('Error duplicating transaction:', error);
      return { success: false, error: error.message, data: null };
    }
  }

  async create(data) {
    try {
      const entity = new this.EntityClass(data);
      const result = await super.create(entity.toJSON());

      if (result.success && result.data) {
        result.data = new this.EntityClass(result.data);
      }

      return result;
    } catch (error) {
      return { success: false, error: error.message, data: null };
    }
  }

  async getAll(filters = {}) {
    const data = await super.getAll(filters);
    return data.map(item => new this.EntityClass(item));
  }

  async getById(id) {
    const data = await super.getById(id);
    return data ? new this.EntityClass(data) : null;
  }

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

  async validateBusinessRules(transaction, context = {}) {
    return validateTransactionBusinessRules(transaction, context);
  }
}

// Export singleton instance
const apiTransactionRepository = new ApiTransactionRepository();

export default apiTransactionRepository;
export { ApiTransactionRepository };
