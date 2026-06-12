export const initialTransactionSummary = {
  totalTransactions: 0,
  totalIncome: 0,
  totalExpenses: 0,
  balance: 0,
  averageTransaction: 0,
  largestIncome: 0,
  largestExpense: 0
};

export const initialFilters = {
  search: '',
  type: 'all',
  category: 'all',
  dateRange: 'all',
  amountRange: 'all',
  sortBy: 'date',
  sortOrder: 'desc'
};

export const initialPagination = {
  page: 1,
  limit: 20,
  total: 0,
  pages: 0
};
