import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import Button from '../../ui/Button';

function ActiveFilterTags({ filters, onFiltersChange }) {
  const hasActiveFilters =
    (filters.type && filters.type !== 'all') ||
    filters.dateFrom ||
    (filters.category && filters.category !== 'all');

  if (!hasActiveFilters) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {filters.type && filters.type !== 'all' && (
        <span
          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: filters.type === 'income' ? 'var(--success-bg)' : 'var(--error-bg)',
            color: filters.type === 'income' ? 'var(--success)' : 'var(--error)'
          }}
        >
          {filters.type.charAt(0).toUpperCase() + filters.type.slice(1)}
          <button
            onClick={() => onFiltersChange({ ...filters, type: 'all' })}
            className="ml-1 text-xs text-theme-secondary"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </span>
      )}

      {(filters.dateFrom || filters.dateTo) && (
        <span
          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info)' }}
        >
          {filters.dateFrom === filters.dateTo && filters.dateFrom === todayStr
            ? 'Today'
            : filters.dateFrom && filters.dateTo
              ? `${filters.dateFrom} to ${filters.dateTo}`
              : filters.dateFrom
                ? `From ${filters.dateFrom}`
                : `To ${filters.dateTo}`}
          <button
            onClick={() => onFiltersChange({ ...filters, dateFrom: '', dateTo: '' })}
            className="ml-1 text-xs text-theme-secondary"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </span>
      )}

      {filters.category && filters.category !== 'all' && (
        <span
          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: 'var(--accent-tertiary-bg)',
            color: 'var(--accent-tertiary)'
          }}
        >
          {filters.category}
          <button
            onClick={() => onFiltersChange({ ...filters, category: 'all' })}
            className="ml-1 text-xs text-theme-secondary"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </span>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onFiltersChange({ type: 'all', dateFrom: '', dateTo: '', category: 'all', search: '' })}
        className="text-xs text-theme-secondary border-theme-secondary"
      >
        <FontAwesomeIcon icon={faTimes} className="mr-1" />
        Clear All
      </Button>
    </div>
  );
}

export default ActiveFilterTags;
