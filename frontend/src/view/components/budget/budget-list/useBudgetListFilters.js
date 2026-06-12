import { useState, useMemo } from 'react';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';

const useBudgetListFilters = (budgets) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [sortField, setSortField] = useState('utilizationPercentage');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  const filteredAndSortedBudgets = useMemo(() => {
    if (!budgets || budgets.length === 0) return [];

    let filtered = budgets.filter(budget => {
      const matchesSearch = !searchTerm ||
        budget.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        budget.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = selectedStatus === 'all' ||
        (selectedStatus === 'exceeded' && (budget.isOverBudget || budget.utilizationPercentage > 100)) ||
        (selectedStatus === 'warning' && (budget.isNearLimit || budget.utilizationPercentage >= 80));

      const matchesPeriod = selectedPeriod === 'all' || budget.period === selectedPeriod;

      return matchesSearch && matchesStatus && matchesPeriod;
    });

    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'utilizationPercentage') {
        aValue = a.utilizationPercentage || 0;
        bValue = b.utilizationPercentage || 0;
      } else if (sortField === 'budgetAmount') {
        aValue = a.budgetAmount || 0;
        bValue = b.budgetAmount || 0;
      } else if (sortField === 'category') {
        aValue = (a.category || '').toLowerCase();
        bValue = (b.category || '').toLowerCase();
      } else if (sortField === 'startDate') {
        aValue = new Date(a.startDate || 0);
        bValue = new Date(b.startDate || 0);
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [budgets, searchTerm, selectedStatus, selectedPeriod, sortField, sortDirection]);

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
    setSelectedStatus('all');
    setSelectedPeriod('all');
  };

  return {
    searchTerm, setSearchTerm,
    selectedStatus, setSelectedStatus,
    selectedPeriod, setSelectedPeriod,
    sortField, setSortField,
    showFilters, setShowFilters,
    filteredAndSortedBudgets,
    handleSort,
    getSortIcon,
    clearFilters
  };
};

export { useBudgetListFilters };
