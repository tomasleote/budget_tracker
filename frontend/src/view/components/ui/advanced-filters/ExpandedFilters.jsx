import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faTags, faDollarSign, faCheck } from '@fortawesome/free-solid-svg-icons';

const DATE_PRESETS = [
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

const SORT_OPTIONS = [
  { value: 'date', label: 'Date' },
  { value: 'amount', label: 'Amount' },
  { value: 'category', label: 'Category' },
  { value: 'description', label: 'Description' }
];

const SELECT_CLASS = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

const ExpandedFilters = ({ filters, categories, onNestedFilterChange, onFilterChange, onCategoryToggle }) => (
  <div className="space-y-6 pt-4 border-t border-gray-200">
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
              onChange={(e) => onNestedFilterChange('dateRange', 'start', e.target.value)}
              className={SELECT_CLASS}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">End Date</label>
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => onNestedFilterChange('dateRange', 'end', e.target.value)}
              className={SELECT_CLASS}
            />
          </div>
        </div>
      </div>
    )}

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
            onChange={(e) => onNestedFilterChange('amountRange', 'min', e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className={SELECT_CLASS}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Maximum Amount</label>
          <input
            type="number"
            value={filters.amountRange.max}
            onChange={(e) => onNestedFilterChange('amountRange', 'max', e.target.value)}
            placeholder="No limit"
            step="0.01"
            min="0"
            className={SELECT_CLASS}
          />
        </div>
      </div>
    </div>

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
                onChange={() => onCategoryToggle(category)}
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

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Sorting</label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Sort By</label>
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange('sortBy', e.target.value)}
            className={SELECT_CLASS}
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Sort Order</label>
          <select
            value={filters.sortOrder}
            onChange={(e) => onFilterChange('sortOrder', e.target.value)}
            className={SELECT_CLASS}
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>
    </div>
  </div>
);

export { DATE_PRESETS };
export default ExpandedFilters;
