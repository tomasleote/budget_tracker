import BaseTransformer from './BaseTransformer.js';

/**
 * Transaction Transformer
 * Handles data transformation between frontend and backend formats for transactions
 */
class TransactionTransformer extends BaseTransformer {
  /**
   * Transform transaction from backend format to frontend format
   * @param {Object} backendData - Transaction data from API
   * @returns {Object} Frontend formatted transaction
   */
  static fromBackend(backendData) {
    if (!backendData) return null;

    const transformed = {
      id: backendData.id,
      type: backendData.type,
      amount: this.parseAmount(backendData.amount),
      description: this.cleanString(backendData.description),
      categoryId: backendData.category_id,
      date: backendData.date,
      createdAt: backendData.created_at,
      updatedAt: backendData.updated_at
    };

    // Include category data if available
    if (backendData.category) {
      transformed.category = {
        id: backendData.category.id,
        name: backendData.category.name,
        type: backendData.category.type,
        color: backendData.category.color,
        icon: backendData.category.icon
      };
    }

    return transformed;
  }

  /**
   * Transform transaction from frontend format to backend format
   * @param {Object} frontendData - Transaction data from frontend
   * @returns {Object} Backend formatted transaction
   */
  static toBackend(frontendData) {
    if (!frontendData) return null;

    // Handle both new and old field names for backward compatibility
    const categoryId = frontendData.categoryId || frontendData.category_id || 
                      (typeof frontendData.category === 'string' ? frontendData.category : null);

    const transformed = {
      type: frontendData.type,
      amount: this.parseAmount(frontendData.amount),
      description: this.cleanString(frontendData.description),
      category_id: categoryId,
      date: this.formatDateToISO(frontendData.date)
    };

    // Only include ID if it's not a temporary ID
    if (frontendData.id && !this.isTemporaryId(frontendData.id)) {
      transformed.id = frontendData.id;
    }

    return transformed;
  }

  /**
   * Transform transaction for create operation (no ID)
   * @param {Object} frontendData - Transaction data from frontend
   * @returns {Object} Backend formatted transaction for creation
   */
  static toBackendCreate(frontendData) {
    const transformed = this.toBackend(frontendData);
    delete transformed.id; // Remove ID for creation
    return transformed;
  }

  /**
   * Transform transaction for update operation
   * @param {Object} frontendData - Transaction data from frontend
   * @returns {Object} Backend formatted transaction for update
   */
  static toBackendUpdate(frontendData) {
    const transformed = this.toBackend(frontendData);
    // Remove fields that shouldn't be updated
    delete transformed.id;
    delete transformed.created_at;
    return transformed;
  }

  /**
   * Transform bulk transactions for backend
   * @param {Array} transactions - Array of frontend transactions
   * @returns {Array} Array of backend formatted transactions
   */
  static toBulkBackend(transactions) {
    return transactions.map(tx => this.toBackendCreate(tx));
  }

  /**
   * Check if ID is temporary (not a UUID)
   * @param {string} id - Transaction ID
   * @returns {boolean} True if temporary ID
   */
  static isTemporaryId(id) {
    if (!id) return true;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return !uuidRegex.test(id);
  }

  /**
   * Transform transaction summary from backend
   * @param {Object} summary - Summary data from API
   * @returns {Object} Frontend formatted summary
   */
  static summaryFromBackend(summary) {
    if (!summary) return null;

    return {
      totalTransactions: summary.total_transactions || 0,
      totalIncome: this.parseAmount(summary.total_income),
      totalExpenses: this.parseAmount(summary.total_expenses),
      netAmount: this.parseAmount(summary.net_amount),
      averageTransaction: this.parseAmount(summary.average_transaction),
      dateRange: {
        start: summary.date_range?.start,
        end: summary.date_range?.end
      }
    };
  }

  /**
   * Transform filters for backend query
   * @param {Object} filters - Frontend filter object
   * @returns {Object} Backend formatted filters
   */
  static filtersToBackend(filters) {
    const transformed = {};

    if (filters.type) transformed.type = filters.type;
    if (filters.categoryId) transformed.category_id = filters.categoryId;
    if (filters.startDate) transformed.start_date = this.formatDateToISO(filters.startDate);
    if (filters.endDate) transformed.end_date = this.formatDateToISO(filters.endDate);
    if (filters.minAmount !== undefined) transformed.min_amount = this.parseAmount(filters.minAmount);
    if (filters.maxAmount !== undefined) transformed.max_amount = this.parseAmount(filters.maxAmount);
    if (filters.search) transformed.search = filters.search;
    if (filters.sort) transformed.sort = filters.sort;
    if (filters.order) transformed.order = filters.order;
    if (filters.includeCategory !== undefined) transformed.include_category = filters.includeCategory;

    return transformed;
  }

  /**
   * Transform paginated response from backend
   * @param {Object} response - Paginated response from API
   * @returns {Object} Frontend formatted response
   */
  static paginatedFromBackend(response) {
    if (!response) return null;

    return {
      transactions: this.fromBackendArray(response.data || response.transactions || []),
      pagination: {
        page: response.pagination?.page || 1,
        limit: response.pagination?.limit || 20,
        total: response.pagination?.total || 0,
        pages: response.pagination?.pages || 1,
        hasNext: response.pagination?.has_next || false,
        hasPrev: response.pagination?.has_prev || false
      },
      summary: response.summary ? this.summaryFromBackend(response.summary) : null
    };
  }

  /**
   * Validate transaction data before sending to backend
   * @param {Object} transaction - Transaction data
   * @returns {Object} Validation result
   */
  static validate(transaction) {
    const errors = [];

    if (!transaction.type || !['income', 'expense'].includes(transaction.type)) {
      errors.push('Valid transaction type (income/expense) is required');
    }

    if (transaction.amount === undefined || transaction.amount === null || transaction.amount <= 0) {
      errors.push('Amount must be a positive number');
    }

    if (!transaction.description || transaction.description.trim() === '') {
      errors.push('Description is required');
    }

    if (!transaction.categoryId && !transaction.category) {
      errors.push('Category is required');
    }

    if (!transaction.date) {
      errors.push('Date is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default TransactionTransformer;
