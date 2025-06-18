import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFilter,
  faCalendarAlt,
  faTags,
  faDollarSign,
  faChevronDown,
  faChevronUp,
  faTimes,
  faCheck,
  faRotateLeft,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import Button from './Button';
import Card from './Card';
import Input from './Input';

const AdvancedFilters = ({
  onFiltersChange,
  categories = [],
  transactions = [],
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: {
      start: '',
      end: '',
      preset: 'thisMonth'
    },
    categories: [],
    amountRange: {
      min: '',
      max: ''
    },
    transactionType: 'all', // 'all', 'income', 'expense'
    searchText: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // Date range presets
  const datePresets = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'lastWeek', label: 'Last Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'last3Months', label: 'Last 3 Months' },
    { value: 'last6Months', label: 'Last 6 Months' },
    { value: 'thisYear', label: 'This Year' },
    { value: 'lastYear', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  // Sort options
  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'amount', label: 'Amount' },
    { value: 'category', label: 'Category' },
    { value: 'description', label: 'Description' }
  ];

  // Update filters and notify parent
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  // Handle date preset change
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
      case 'thisWeek':
        const dayOfWeek = now.getDay();
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (6 - dayOfWeek), 23, 59, 59);
        break;
      case 'lastWeek':
        const lastWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() - 7);
        start = lastWeekStart;
        end = new Date(lastWeekStart.getFullYear(), lastWeekStart.getMonth(), lastWeekStart.getDate() + 6, 23, 59, 59);
        break;
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
        return; // Don't auto-set dates for custom
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

  // Handle category toggle
  const handleCategoryToggle = (category) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle nested filter change
  const handleNestedFilterChange = (parentKey, childKey, value) => {
    setFilters(prev => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey],
        [childKey]: value
      }
    }));
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      dateRange: {
        start: '',
        end: '',
        preset: 'thisMonth'
      },
      categories: [],
      amountRange: {
        min: '',
        max: ''
      },
      transactionType: 'all',
      searchText: '',
      sortBy: 'date',
      sortOrder: 'desc'
    });
    handleDatePresetChange('thisMonth');
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.amountRange.min || filters.amountRange.max) count++;
    if (filters.transactionType !== 'all') count++;
    if (filters.searchText) count++;
    if (filters.dateRange.preset !== 'thisMonth') count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Card className={`transition-all duration-300 ${className}`}>
      <div className="p-4">
        {/* Filter Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <FontAwesomeIcon icon={faFilter} className="text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
            {activeFilterCount > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                {activeFilterCount} active
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {activeFilterCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                icon={faRotateLeft}
              >
                Reset
              </Button>
            )}
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FontAwesomeIcon 
                icon={isExpanded ? faChevronUp : faChevronDown} 
                className="text-gray-500" 
              />
            </button>
          </div>
        </div>

        {/* Quick Filters (Always Visible) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Date Range Preset */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              value={filters.dateRange.preset}
              onChange={(e) => handleDatePresetChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {datePresets.map(preset => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>

          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Type
            </label>
            <select
              value={filters.transactionType}
              onChange={(e) => handleFilterChange('transactionType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Transactions</option>
              <option value="income">Income Only</option>
              <option value="expense">Expenses Only</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <FontAwesomeIcon 
                icon={faSearch} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
              />
              <input
                type="text"
                value={filters.searchText}
                onChange={(e) => handleFilterChange('searchText', e.target.value)}
                placeholder="Search descriptions..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="space-y-6 pt-4 border-t border-gray-200">
            {/* Custom Date Range */}
            {filters.dateRange.preset === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                  Custom Date Range
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={filters.dateRange.start}
                      onChange={(e) => handleNestedFilterChange('dateRange', 'start', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">End Date</label>
                    <input
                      type="date"
                      value={filters.dateRange.end}
                      onChange={(e) => handleNestedFilterChange('dateRange', 'end', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Amount Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FontAwesomeIcon icon={faDollarSign} className="mr-2" />
                Amount Range
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Minimum Amount</label>
                  <input
                    type="number"
                    value={filters.amountRange.min}
                    onChange={(e) => handleNestedFilterChange('amountRange', 'min', e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Maximum Amount</label>
                  <input
                    type="number"
                    value={filters.amountRange.max}
                    onChange={(e) => handleNestedFilterChange('amountRange', 'max', e.target.value)}
                    placeholder="No limit"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faTags} className="mr-2" />
                  Categories ({filters.categories.length} selected)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {categories.map((category) => (
                    <label
                      key={category}
                      className={`flex items-center p-2 border rounded-lg cursor-pointer transition-colors ${
                        filters.categories.includes(category)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium truncate">{category}</span>
                      {filters.categories.includes(category) && (
                        <FontAwesomeIcon icon={faCheck} className="ml-auto text-blue-600" />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Sorting */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sorting
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Sort Order</label>
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AdvancedFilters;