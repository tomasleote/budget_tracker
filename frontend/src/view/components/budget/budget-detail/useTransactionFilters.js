import { useState, useMemo } from 'react';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';

const useTransactionFilters = (budgetTransactions) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  const filteredAndSortedTransactions = useMemo(() => {
    if (!budgetTransactions) return [];

    let filtered = budgetTransactions.filter(transaction => {
      const matchesSearch = !searchTerm ||
        (transaction.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.categoryName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.formattedAmount || '').includes(searchTerm);

      const matchesType = selectedType === 'all' || transaction.type === selectedType;

      return matchesSearch && matchesType;
    });

    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'date') {
        aValue = new Date(a.date);
        bValue = new Date(b.date);
      } else if (sortField === 'amount') {
        aValue = Math.abs(a.amount || 0);
        bValue = Math.abs(b.amount || 0);
      } else if (sortField === 'description') {
        aValue = (a.description || '').toLowerCase();
        bValue = (b.description || '').toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [budgetTransactions, searchTerm, selectedType, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return faSort;
    return sortDirection === 'asc' ? faSortUp : faSortDown;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
  };

  return {
    searchTerm, setSearchTerm,
    selectedType, setSelectedType,
    sortField, setSortField,
    sortDirection, setSortDirection,
    showFilters, setShowFilters,
    filteredAndSortedTransactions,
    handleSort,
    getSortIcon,
    clearFilters
  };
};

export { useTransactionFilters };
