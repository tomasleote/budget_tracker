import { useState, useEffect } from 'react';

const DEFAULT_FILTERS = {
  dateRange: { start: '', end: '', preset: 'thisMonth' },
  categories: [],
  amountRange: { min: '', max: '' },
  transactionType: 'all',
  searchText: '',
  sortBy: 'date',
  sortOrder: 'desc'
};

const useFilters = (onFiltersChange) => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleDatePresetChange = (preset) => {
    const now = new Date();
    let start, end;

    switch (preset) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case 'yesterday':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
        break;
      case 'thisWeek': {
        const dayOfWeek = now.getDay();
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (6 - dayOfWeek), 23, 59, 59);
        break;
      }
      case 'lastWeek': {
        const lastWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() - 7);
        start = lastWeekStart;
        end = new Date(lastWeekStart.getFullYear(), lastWeekStart.getMonth(), lastWeekStart.getDate() + 6, 23, 59, 59);
        break;
      }
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        break;
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        break;
      case 'last3Months':
        start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        end = now;
        break;
      case 'last6Months':
        start = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        end = now;
        break;
      case 'thisYear':
        start = new Date(now.getFullYear(), 0, 1);
        end = now;
        break;
      case 'lastYear':
        start = new Date(now.getFullYear() - 1, 0, 1);
        end = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
        break;
      case 'custom':
        return;
      default:
        start = '';
        end = '';
    }

    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        preset,
        start: start ? start.toISOString().split('T')[0] : '',
        end: end ? end.toISOString().split('T')[0] : ''
      }
    }));
  };

  const handleCategoryToggle = (category) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleNestedFilterChange = (parentKey, childKey, value) => {
    setFilters(prev => ({
      ...prev,
      [parentKey]: { ...prev[parentKey], [childKey]: value }
    }));
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    handleDatePresetChange('thisMonth');
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.amountRange.min || filters.amountRange.max) count++;
    if (filters.transactionType !== 'all') count++;
    if (filters.searchText) count++;
    if (filters.dateRange.preset !== 'thisMonth') count++;
    return count;
  };

  return {
    filters,
    handleDatePresetChange,
    handleCategoryToggle,
    handleFilterChange,
    handleNestedFilterChange,
    handleResetFilters,
    activeFilterCount: getActiveFilterCount()
  };
};

export default useFilters;
