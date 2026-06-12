import { useMemo } from 'react';

export function useFilteredTransactions(transactions, searchTerm, filters, maxItems) {
  return useMemo(() => {
    let result = transactions;

    result = result.filter((t, index, arr) =>
      arr.findIndex(x => x.id === t.id) === index
    );

    if (searchTerm) {
      result = result.filter(t =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.amount.toString().includes(searchTerm)
      );
    }

    if (filters.type !== 'all') {
      result = result.filter(t => t.type === filters.type);
    }

    if (filters.category !== 'all') {
      result = result.filter(t => t.category === filters.category);
    }

    if (filters.dateFrom) {
      result = result.filter(t => new Date(t.date) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      result = result.filter(t => new Date(t.date) <= new Date(filters.dateTo));
    }

    result = [...result].sort((a, b) => {
      let aValue, bValue;

      switch (filters.sortBy) {
        case 'amount':
          aValue = parseFloat(a.amount);
          bValue = parseFloat(b.amount);
          break;
        case 'category':
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        case 'description':
          aValue = a.description.toLowerCase();
          bValue = b.description.toLowerCase();
          break;
        case 'date':
        default:
          aValue = new Date(a.date);
          bValue = new Date(b.date);
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    if (maxItems) {
      result = result.slice(0, maxItems);
    }

    return result;
  }, [transactions, searchTerm, filters, maxItems]);
}
