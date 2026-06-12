import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { QUICK_FILTERS, applyQuickFilter } from './quickFilterLogic';

function CompactToolbar({
  filters,
  onFiltersChange,
  onSearchChange,
  showSearch,
  showTypeFilter,
  showSortOptions,
  showQuickFilters,
  activeFiltersCount
}) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearchChange(value);
  };

  return (
    <div className="flex items-center justify-between space-x-3">
      {showSearch && (
        <div className="flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            icon={faSearch}
            iconPosition="left"
            size="sm"
          />
        </div>
      )}

      <div className="flex items-center space-x-2">
        {showTypeFilter && (
          <select
            value={filters.type || 'all'}
            onChange={(e) => onFiltersChange({ ...filters, type: e.target.value })}
            className="input-theme border px-2 py-1 text-sm rounded"
          >
            <option value="all">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        )}

        {showSortOptions && (
          <select
            value={filters.sortBy || 'date'}
            onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value })}
            className="input-theme border px-2 py-1 text-sm rounded"
          >
            <option value="date">Date</option>
            <option value="amount">Amount</option>
            <option value="category">Category</option>
          </select>
        )}

        <Button
          variant={showMobileFilters || activeFiltersCount > 0 ? 'primary' : 'outline'}
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

      {showMobileFilters && (
        <div className="absolute top-full left-0 right-0 card-theme border rounded-lg shadow-lg p-4 z-10 mt-2">
          <div className="space-y-3">
            {showQuickFilters && (
              <div className="flex flex-wrap gap-2">
                {QUICK_FILTERS.map((filter) => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  const isActive =
                    (filter.key === 'all' && filters.type === 'all') ||
                    (filter.key === filters.type) ||
                    (filter.key === 'today' && filters.dateFrom === todayStr) ||
                    (filter.key === 'week' && filters.dateFrom);
                  return (
                    <Button
                      key={filter.key}
                      variant={isActive ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => onFiltersChange(applyQuickFilter(filter.key, filters))}
                      className="text-xs"
                    >
                      {filter.icon && <FontAwesomeIcon icon={filter.icon} className="mr-1" />}
                      {filter.label}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CompactToolbar;
