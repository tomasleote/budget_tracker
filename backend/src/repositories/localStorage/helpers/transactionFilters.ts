import { Transaction, TransactionFilters } from '../../../types/transaction';

export function applyTransactionFilters(items: Transaction[], filters: TransactionFilters): Transaction[] {
  return items.filter(item => {
    if (filters.type && item.type !== filters.type) return false;

    if (filters.category_id && item.category_id !== filters.category_id) return false;

    if (filters.date_from) {
      const itemDate = new Date(item.date);
      const fromDate = new Date(filters.date_from);
      if (itemDate < fromDate) return false;
    }
    if (filters.date_to) {
      const itemDate = new Date(item.date);
      const toDate = new Date(filters.date_to);
      if (itemDate > toDate) return false;
    }

    if (filters.amount_min !== undefined && item.amount < filters.amount_min) return false;
    if (filters.amount_max !== undefined && item.amount > filters.amount_max) return false;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matches = item.description.toLowerCase().includes(searchLower);
      if (!matches) return false;
    }

    return true;
  });
}
