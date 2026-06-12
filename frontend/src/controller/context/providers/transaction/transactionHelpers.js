/**
 * Pure helper functions for TransactionProvider.
 * No React hooks — safe to call from within callbacks.
 */

/**
 * Extracts a transactions array from the varied response shapes the repository may return.
 * Returns { transactionsData, paginationData }.
 */
export function extractTransactionsData(result) {
  if (Array.isArray(result)) {
    return { transactionsData: result, paginationData: null };
  }
  if (result?.data && Array.isArray(result.data)) {
    return { transactionsData: result.data, paginationData: result.pagination || null };
  }
  if (result?.transactions && Array.isArray(result.transactions)) {
    return { transactionsData: result.transactions, paginationData: result.pagination || null };
  }
  return null;
}

/**
 * Computes a summary object from a transactions array.
 */
export function computeTransactionSummary(transactionsData) {
  const income = transactionsData
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const expenses = transactionsData
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  return {
    totalTransactions: transactionsData.length,
    totalIncome: income,
    totalExpenses: expenses,
    balance: income - expenses,
    averageTransaction: transactionsData.length > 0 ? (income + expenses) / transactionsData.length : 0,
    largestIncome: Math.max(...transactionsData.filter(t => t.type === 'income').map(t => parseFloat(t.amount) || 0), 0),
    largestExpense: Math.max(...transactionsData.filter(t => t.type === 'expense').map(t => parseFloat(t.amount) || 0), 0)
  };
}
