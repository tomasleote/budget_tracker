import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch,
  faFilter,
  faSort,
  faTimes,
  faCalendarAlt,
  faArrowUp,
  faArrowDown,
  faDollarSign,
  faTag,
  faList,
  faTh
} from '@fortawesome/free-solid-svg-icons';
import Button from '../ui/Button';
import Input from '../ui/Input';

const TransactionFilterToolbar = ({ 
  onFiltersChange = () => {},
  onSearchChange = () => {},
  filters = {},
  showSearch = true,
  showTypeFilter = true,
  showSortOptions = true,
  showQuickFilters = true,
  compact = false,
  viewMode = 'list',
  onViewModeChange = () => {},
  hasAdvancedFilters = false,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Handle search change
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    onSearchChange(value);
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  // Quick filter options
  const quickFilters = [
    { key: 'all', label: 'All', icon: null },
    { key: 'income', label: 'Income', icon: faArrowUp, color: 'green' },
    { key: 'expense', label: 'Expense', icon: faArrowDown, color: 'red' },
    { key: 'today', label: 'Today', icon: faCalendarAlt, color: 'blue' },
    { key: 'week', label: 'Week', icon: faCalendarAlt, color: 'purple' }
  ];

  // Sort options
  const sortOptions = [
    { key: 'date', label: 'Date', icon: faCalendarAlt },
    { key: 'amount', label: 'Amount', icon: faDollarSign },
    { key: 'category', label: 'Category', icon: faTag }
  ];

  // Active filters count
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'search' || key === 'sortBy' || key === 'sortOrder') return false;
    return value && value !== 'all' && value !== '';
  }).length;

  // Apply quick filter
  const applyQuickFilter = (filterKey) => {
    const today = new Date();
    const newFilters = { ...filters };

    switch (filterKey) {
      case 'income':
        newFilters.type = 'income';
        // Keep existing date filters
        break;
      case 'expense':
        newFilters.type = 'expense';
        // Keep existing date filters
        break;
      case 'today':
        // Keep existing type filter
        newFilters.dateFrom = today.toISOString().split('T')[0];
        newFilters.dateTo = today.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);
        // Keep existing type filter
        newFilters.dateFrom = weekStart.toISOString().split('T')[0];
        newFilters.dateTo = today.toISOString().split('T')[0];
        break;
      default:
        newFilters.type = 'all';
        newFilters.dateFrom = '';
        newFilters.dateTo = '';
    }

    onFiltersChange(newFilters);
  };

  if (compact) {
    return (
      <div className={`flex items-center justify-between space-x-3 ${className}`}>
        {/* Compact Search */}
        {showSearch && (
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              icon={faSearch}
              iconPosition="left"
              size="sm"
            />
          </div>
        )}

        {/* Compact Controls */}
        <div className="flex items-center space-x-2">
          {/* Type Filter */}
          {showTypeFilter && (
            <select
              value={filters.type || 'all'}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="px-2 py-1 text-sm rounded"
              style={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          )}

          {/* Sort */}
          {showSortOptions && (
            <select
              value={filters.sortBy || 'date'}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-2 py-1 text-sm rounded"
              style={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="category">Category</option>
            </select>
          )}

          {/* Filter Toggle */}
          <Button
            variant={showMobileFilters || activeFiltersCount > 0 ? "primary" : "outline"}
            size="sm"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <FontAwesomeIcon icon={faFilter} />
            {activeFiltersCount > 0 && (
              <span className="ml-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>

        {/* Mobile Filters Dropdown */}
        {showMobileFilters && (
          <div className="absolute top-full left-0 right-0 rounded-lg shadow-lg p-4 z-10 mt-2" style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-primary)'
          }}>
            <div className="space-y-3">
              {showQuickFilters && (
                <div className="flex flex-wrap gap-2">
                  {quickFilters.map((filter) => (
                    <Button
                      key={filter.key}
                      variant={
                        (filter.key === 'all' && filters.type === 'all') ||
                        (filter.key === filters.type) ||
                        (filter.key === 'today' && filters.dateFrom === new Date().toISOString().split('T')[0]) ||
                        (filter.key === 'week' && filters.dateFrom)
                          ? 'primary' 
                          : 'outline'
                      }
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
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Quick Filters */}
      {showQuickFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 rounded-lg p-1" style={{
            backgroundColor: 'var(--bg-secondary)'
          }}>
            <button
              onClick={() => onViewModeChange('list')}
              className="p-2 rounded transition-all duration-200"
              style={{
                backgroundColor: viewMode === 'list' ? 'var(--bg-card)' : 'transparent',
                color: viewMode === 'list' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                boxShadow: viewMode === 'list' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              <FontAwesomeIcon icon={faList} className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className="p-2 rounded transition-all duration-200"
              style={{
                backgroundColor: viewMode === 'grid' ? 'var(--bg-card)' : 'transparent',
                color: viewMode === 'grid' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                boxShadow: viewMode === 'grid' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              <FontAwesomeIcon icon={faTh} className="w-4 h-4" />
            </button>
          </div>

          {quickFilters.map((filter) => {
            const isActive = (
              (filter.key === 'all' && (!filters.type || filters.type === 'all') && !filters.dateFrom && !filters.dateTo) ||
              (filter.key === filters.type) ||
              (filter.key === 'today' && filters.dateFrom === new Date().toISOString().split('T')[0] && filters.dateTo === new Date().toISOString().split('T')[0]) ||
              (filter.key === 'week' && filters.dateFrom && filters.dateTo && filters.dateFrom !== new Date().toISOString().split('T')[0])
            );
            
            return (
              <Button
                key={filter.key}
                variant={isActive ? 'primary' : 'outline'}
                size="sm"
                onClick={() => applyQuickFilter(filter.key)}
                className="text-xs"
                style={{
                  color: !isActive && filter.color === 'green' ? 'var(--success)' :
                         !isActive && filter.color === 'red' ? 'var(--error)' :
                         !isActive && filter.color === 'blue' ? 'var(--info)' :
                         !isActive && filter.color === 'purple' ? 'var(--accent-tertiary)' :
                         undefined,
                  borderColor: !isActive && filter.color === 'green' ? 'var(--success-border)' :
                               !isActive && filter.color === 'red' ? 'var(--error-border)' :
                               !isActive && filter.color === 'blue' ? 'var(--info-border)' :
                               !isActive && filter.color === 'purple' ? 'var(--accent-tertiary)' :
                               undefined
                }}
              >
                {filter.icon && <FontAwesomeIcon icon={filter.icon} className="mr-1" />}
                {filter.label}
              </Button>
            );
          })}
        </div>
      )}

      {/* Active Filters Display */}
      {(filters.type && filters.type !== 'all') || filters.dateFrom || (filters.category && filters.category !== 'all') ? (
        <div className="flex flex-wrap gap-2 items-center">
          {/* Type Filter Tag */}
          {filters.type && filters.type !== 'all' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style={{
              backgroundColor: filters.type === 'income' ? 'var(--success-bg)' : 'var(--error-bg)',
              color: filters.type === 'income' ? 'var(--success)' : 'var(--error)'
            }}>
              {filters.type.charAt(0).toUpperCase() + filters.type.slice(1)}
              <button
                onClick={() => {
                  const newFilters = { ...filters, type: 'all' };
                  onFiltersChange(newFilters);
                }}
                className="ml-1 text-xs" 
                style={{
                  color: 'var(--text-secondary)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'var(--text-secondary)';
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </span>
          )}

          {/* Date Range Tags */}
          {(filters.dateFrom || filters.dateTo) && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style={{
              backgroundColor: 'var(--info-bg)',
              color: 'var(--info)'
            }}>
              {filters.dateFrom === filters.dateTo && filters.dateFrom === new Date().toISOString().split('T')[0] ? 'Today' :
               filters.dateFrom && filters.dateTo ? `${filters.dateFrom} to ${filters.dateTo}` :
               filters.dateFrom ? `From ${filters.dateFrom}` :
               `To ${filters.dateTo}`}
              <button
                onClick={() => {
                  const newFilters = { ...filters, dateFrom: '', dateTo: '' };
                  onFiltersChange(newFilters);
                }}
                className="ml-1 text-xs" 
                style={{
                  color: 'var(--text-secondary)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'var(--text-secondary)';
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </span>
          )}

          {/* Category Filter Tag */}
          {filters.category && filters.category !== 'all' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style={{
              backgroundColor: 'var(--accent-tertiary-bg)',
              color: 'var(--accent-tertiary)'
            }}>
              {filters.category}
              <button
                onClick={() => {
                  const newFilters = { ...filters, category: 'all' };
                  onFiltersChange(newFilters);
                }}
                className="ml-1 text-xs" 
                style={{
                  color: 'var(--text-secondary)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'var(--text-secondary)';
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </span>
          )}

          {/* Clear All Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFiltersChange({ type: 'all', dateFrom: '', dateTo: '', category: 'all', search: '' })}
            className="text-xs"
            style={{
              color: 'var(--text-secondary)',
              borderColor: 'var(--border-secondary)'
            }}
          >
            <FontAwesomeIcon icon={faTimes} className="mr-1" />
            Clear All
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default TransactionFilterToolbar;