import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFilter,
  faChevronDown,
  faChevronUp,
  faRotateLeft,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import Button from './Button';
import Card from './Card';
import useFilters from './advanced-filters/useFilters';
import ExpandedFilters, { DATE_PRESETS } from './advanced-filters/ExpandedFilters';

const SELECT_CLASS = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

const AdvancedFilters = ({
  onFiltersChange,
  categories = [],
  transactions = [],
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    filters,
    handleDatePresetChange,
    handleCategoryToggle,
    handleFilterChange,
    handleNestedFilterChange,
    handleResetFilters,
    activeFilterCount
  } = useFilters(onFiltersChange);

  return (
    <Card className={`transition-all duration-300 ${className}`}>
      <div className="p-4">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              value={filters.dateRange.preset}
              onChange={(e) => handleDatePresetChange(e.target.value)}
              className={SELECT_CLASS}
            >
              {DATE_PRESETS.map(preset => (
                <option key={preset.value} value={preset.value}>{preset.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
            <select
              value={filters.transactionType}
              onChange={(e) => handleFilterChange('transactionType', e.target.value)}
              className={SELECT_CLASS}
            >
              <option value="all">All Transactions</option>
              <option value="income">Income Only</option>
              <option value="expense">Expenses Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
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

        {isExpanded && (
          <ExpandedFilters
            filters={filters}
            categories={categories}
            onNestedFilterChange={handleNestedFilterChange}
            onFilterChange={handleFilterChange}
            onCategoryToggle={handleCategoryToggle}
          />
        )}
      </div>
    </Card>
  );
};

export default AdvancedFilters;