/**
 * Pure helpers: request/response data shaping for the transaction API.
 */

/**
 * Maps frontend transaction shape to the snake_case format the API expects.
 * @param {Object} data
 * @returns {Object}
 */
export function transformTransactionRequest(data) {
  return {
    type: data.type,
    amount: parseFloat(data.amount),
    description: data.description.trim(),
    category_id: data.categoryId || data.category_id,
    date: data.date instanceof Date ? data.date.toISOString() : data.date,
  };
}

/**
 * Maps an API transaction object to the camelCase frontend shape.
 * @param {Object} transaction
 * @returns {Object|null}
 */
export function transformTransactionResponse(transaction) {
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
 * Normalizes the three response envelopes getAllTransactions may receive into
 * { data: TransactionFE[], pagination }.
 * @param {*} response - raw getAll response
 * @param {Function} transform - transformTransactionResponse
 * @returns {{ data: Array, pagination: Object }}
 */
export function normalizeTransactionListResponse(response, transform) {
  if (response && typeof response === 'object') {
    if (Array.isArray(response)) {
      const data = response.map(transform);
      return { data, pagination: { page: 1, limit: data.length, total: data.length } };
    }
    if (response.transactions && Array.isArray(response.transactions)) {
      const data = response.transactions.map(transform);
      return {
        data,
        pagination: response.pagination || { page: 1, limit: data.length, total: data.length },
      };
    }
    if (response.data && Array.isArray(response.data)) {
      const data = response.data.map(transform);
      return {
        data,
        pagination: response.pagination || { page: 1, limit: data.length, total: data.length },
      };
    }
  }
  return { data: [], pagination: { page: 1, limit: 0, total: 0 } };
}
