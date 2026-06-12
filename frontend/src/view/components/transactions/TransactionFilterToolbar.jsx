import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faTh } from '@fortawesome/free-solid-svg-icons';
import Button from '../ui/Button';
import ActiveFilterTags from './filter-toolbar/ActiveFilterTags';
import CompactToolbar from './filter-toolbar/CompactToolbar';
import { QUICK_FILTERS, applyQuickFilter, isQuickFilterActive } from './filter-toolbar/quickFilterLogic';

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
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'search' || key === 'sortBy' || key === 'sortOrder') return false;
    return value && value !== 'all' && value !== '';
  }).length;

  if (compact) {
    return (
      <div className={`${className}`}>
        <CompactToolbar
          filters={filters}
          onFiltersChange={onFiltersChange}
          onSearchChange={onSearchChange}
          showSearch={showSearch}
          showTypeFilter={showTypeFilter}
          showSortOptions={showSortOptions}
          showQuickFilters={showQuickFilters}
          activeFiltersCount={activeFiltersCount}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {showQuickFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center space-x-1 rounded-lg p-1 bg-theme-secondary">
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-theme-card text-theme-accent shadow-sm'
                  : 'bg-transparent text-theme-secondary'
              }`}
            >
              <FontAwesomeIcon icon={faList} className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded transition-all duration-200 ${
                viewMode === 'grid'
                  ? 'bg-theme-card text-theme-accent shadow-sm'
                  : 'bg-transparent text-theme-secondary'
              }`}
            >
              <FontAwesomeIcon icon={faTh} className="w-4 h-4" />
            </button>
          </div>

          {QUICK_FILTERS.map((filter) => {
            const isActive = isQuickFilterActive(filter.key, filters);
            return (
              <Button
                key={filter.key}
                variant={isActive ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onFiltersChange(applyQuickFilter(filter.key, filters))}
                className="text-xs"
                style={!isActive && filter.color ? {
                  color: filter.color === 'green' ? 'var(--success)' :
                         filter.color === 'red' ? 'var(--error)' :
                         filter.color === 'blue' ? 'var(--info)' :
                         filter.color === 'purple' ? 'var(--accent-tertiary)' : undefined,
                  borderColor: filter.color === 'green' ? 'var(--success-border)' :
                               filter.color === 'red' ? 'var(--error-border)' :
                               filter.color === 'blue' ? 'var(--info-border)' :
                               filter.color === 'purple' ? 'var(--accent-tertiary)' : undefined
                } : undefined}
              >
                {filter.icon && <FontAwesomeIcon icon={filter.icon} className="mr-1" />}
                {filter.label}
              </Button>
            );
          })}
        </div>
      )}

      <ActiveFilterTags filters={filters} onFiltersChange={onFiltersChange} />
    </div>
  );
};

export default TransactionFilterToolbar;
