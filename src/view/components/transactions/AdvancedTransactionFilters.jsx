import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch,
  faFilter,
  faTimes,
  faCalendarAlt,
  faDollarSign,
  faTag,
  faSort,
  faSortAmountDown,
  faSortAmountUp,
  faArrowUp,
  faArrowDown,
  faCheckCircle,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { useTransactions } from '../../../controller/hooks/useTransactions';
import { formatCurrency } from '../../../controller/utils/formatters';

const AdvancedTransactionFilters = ({ 
  onFiltersChange = () => {},
  onSearchChange = () => {},
  initialFilters = {},
  showQuickFilters = true,
  showDatePresets = true,
  showAmountRange = true,
  className = ''
}) => {
  const { transactions } = useTransactions();
  
  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    category: 'all',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: '',
    sortBy: 'date',
    sortOrder: 'desc',
    quickFilter: 'all',
    ...initialFilters
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Update parent when filters change
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  // Update parent when search changes
  useEffect(() => {
    onSearchChange(filters.search);
  }, [filters.search, onSearchChange]);

  // Count active filters
  useEffect(() => {
    const count = Object.entries(filters).filter(([key, value]) => {
      if (key === 'search' || key === 'sortBy' || key === 'sortOrder') return false;
      return value && value !== 'all' && value !== '';
    }).length;
    setActiveFiltersCount(count);
  }, [filters]);

  // Get unique categories
  const categories = [...new Set(transactions.map(t => t.category))].filter(Boolean).sort();

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      category: 'all',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: '',
      sortBy: 'date',
      sortOrder: 'desc',
      quickFilter: 'all'
    });
  };

  // Quick filter presets
  const quickFilters = [
    { key: 'all', label: 'All Transactions', icon: null },
    { key: 'today', label: 'Today', icon: faCalendarAlt },
    { key: 'week', label: 'This Week', icon: faCalendarAlt },
    { key: 'month', label: 'This Month', icon: faCalendarAlt },
    { key: 'income', label: 'Income Only', icon: faArrowUp },
    { key: 'expenses', label: 'Expenses Only', icon: faArrowDown },
    { key: 'large', label: 'Large Amounts (>$100)', icon: faDollarSign }
  ];

  // Date presets
  const datePresets = [
    { label: 'Today', days: 0 },
    { label: 'Yesterday', days: 1 },
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
    { label: 'This month', custom: 'thisMonth' },
    { label: 'Last month', custom: 'lastMonth' }
  ];

  // Apply quick filter
  const applyQuickFilter = (filterKey) => {
    const today = new Date();
    const newFilters = { ...filters, quickFilter: filterKey };

    switch (filterKey) {
      case 'today':
        newFilters.dateFrom = today.toISOString().split('T')[0];
        newFilters.dateTo = today.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        newFilters.dateFrom = weekStart.toISOString().split('T')[0];
        newFilters.dateTo = today.toISOString().split('T')[0];
        break;
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        newFilters.dateFrom = monthStart.toISOString().split('T')[0];
        newFilters.dateTo = today.toISOString().split('T')[0];
        break;
      case 'income':
        newFilters.type = 'income';
        break;
      case 'expenses':
        newFilters.type = 'expense';
        break;
      case 'large':
        newFilters.amountMin = '100';
        break;
      default:
        // Clear date and type filters for 'all'
        newFilters.dateFrom = '';
        newFilters.dateTo = '';
        newFilters.type = 'all';
        newFilters.amountMin = '';
        newFilters.amountMax = '';
    }

    setFilters(newFilters);
  };

  // Apply date preset
  const applyDatePreset = (preset) => {
    const today = new Date();
    let dateFrom, dateTo;

    if (preset.custom === 'thisMonth') {
      dateFrom = new Date(today.getFullYear(), today.getMonth(), 1);
      dateTo = today;
    } else if (preset.custom === 'lastMonth') {
      dateFrom = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      dateTo = new Date(today.getFullYear(), today.getMonth(), 0);
    } else {
      dateFrom = new Date(today);
      dateFrom.setDate(today.getDate() - preset.days);
      dateTo = today;
    }

    setFilters(prev => ({
      ...prev,
      dateFrom: dateFrom.toISOString().split('T')[0],
      dateTo: dateTo.toISOString().split('T')[0]
    }));
  };

  return (
    <Card className={className}>
      {/* Search Bar */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search transactions by description, category, or amount..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              icon={faSearch}
              iconPosition="left"
            />
          </div>
          <Button
            variant={showAdvanced ? 'primary' : 'outline'}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <FontAwesomeIcon icon={faFilter} className="mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <FontAwesomeIcon icon={faTimes} className="mr-2" />
              Clear
            </Button>
          )}
        </div>

        {/* Quick Filters */}
        {showQuickFilters && (
          <div className="flex flex-wrap gap-2">
            {quickFilters.map((filter) => (
              <Button
                key={filter.key}
                variant={filters.quickFilter === filter.key ? 'primary' : 'outline'}
                size="sm"
                onClick={() => applyQuickFilter(filter.key)}
                className="text-xs"
              >
                {filter.icon && <FontAwesomeIcon icon={filter.icon} className="mr-1" />}
                {filter.label}
              </Button>
            ))}
          </div>
        )}

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            {/* Basic Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="income">Income Only</option>
                  <option value="expense">Expenses Only</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <div className="flex space-x-2">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="date">Date</option>
                    <option value="amount">Amount</option>
                    <option value="category">Category</option>
                    <option value="description">Description</option>
                  </select>
                  <Button
                    variant="outline"
                    onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'desc' ? 'asc' : 'desc')}
                    className="px-3"
                  >
                    <FontAwesomeIcon 
                      icon={filters.sortOrder === 'desc' ? faSortAmountDown : faSortAmountUp} 
                    />
                  </Button>
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <div className="space-y-3">
                {/* Date Presets */}
                {showDatePresets && (
                  <div className="flex flex-wrap gap-2">
                    {datePresets.map((preset, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => applyDatePreset(preset)}
                        className="text-xs"
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                )}
                
                {/* Custom Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">From</label>
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">To</label>
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Amount Range */}
            {showAmountRange && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount Range
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Minimum Amount</label>
                    <Input
                      type="text"
                      placeholder="0.00"
                      value={filters.amountMin}
                      onChange={(e) => handleFilterChange('amountMin', e.target.value)}
                      icon={faDollarSign}
                      iconPosition="left"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Maximum Amount</label>
                    <Input
                      type="text"
                      placeholder="No limit"
                      value={filters.amountMax}
                      onChange={(e) => handleFilterChange('amountMax', e.target.value)}
                      icon={faDollarSign}
                      iconPosition="left"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Active Filters Summary */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.type !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Type: {filters.type}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFilterChange('type', 'all')}
                  className="ml-1 p-0 h-4 w-4 text-blue-600 hover:text-blue-800"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-xs" />
                </Button>
              </span>
            )}
            {filters.category !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Category: {filters.category}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFilterChange('category', 'all')}
                  className="ml-1 p-0 h-4 w-4 text-green-600 hover:text-green-800"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-xs" />
                </Button>
              </span>
            )}
            {filters.dateFrom && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                From: {filters.dateFrom}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFilterChange('dateFrom', '')}
                  className="ml-1 p-0 h-4 w-4 text-purple-600 hover:text-purple-800"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-xs" />
                </Button>
              </span>
            )}
            {filters.dateTo && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                To: {filters.dateTo}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFilterChange('dateTo', '')}
                  className="ml-1 p-0 h-4 w-4 text-purple-600 hover:text-purple-800"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-xs" />
                </Button>
              </span>
            )}
            {filters.amountMin && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Min: {formatCurrency(filters.amountMin)}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFilterChange('amountMin', '')}
                  className="ml-1 p-0 h-4 w-4 text-yellow-600 hover:text-yellow-800"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-xs" />
                </Button>
              </span>
            )}
            {filters.amountMax && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Max: {formatCurrency(filters.amountMax)}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFilterChange('amountMax', '')}
                  className="ml-1 p-0 h-4 w-4 text-yellow-600 hover:text-yellow-800"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-xs" />
                </Button>
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default AdvancedTransactionFilters;