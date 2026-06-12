import { Transaction } from '../../../types/transaction';

// Matches the filter shape used by TransactionLocalStorageRepository; the shared
// TransactionFilters type referenced there is not exported from types/transaction.
interface TransactionFilterParams {
  type?: string;
  category_id?: string;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  search?: string;
}

export function applyTransactionFilters(items: Transaction[], filters: TransactionFilterParams): Transaction[] {
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
      const matches =
        item.description.toLowerCase().includes(searchLower) ||
        (item.notes && item.notes.toLowerCase().includes(searchLower));
      if (!matches) return false;
    }

    return true;
  });
}
