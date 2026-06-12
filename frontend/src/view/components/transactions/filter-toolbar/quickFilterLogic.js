import {
  faCalendarAlt,
  faArrowUp,
  faArrowDown,
  faDollarSign,
  faTag
} from '@fortawesome/free-solid-svg-icons';

export const QUICK_FILTERS = [
  { key: 'all', label: 'All', icon: null },
  { key: 'income', label: 'Income', icon: faArrowUp, color: 'green' },
  { key: 'expense', label: 'Expense', icon: faArrowDown, color: 'red' },
  { key: 'today', label: 'Today', icon: faCalendarAlt, color: 'blue' },
  { key: 'week', label: 'Week', icon: faCalendarAlt, color: 'purple' }
];

export const SORT_OPTIONS = [
  { key: 'date', label: 'Date', icon: faCalendarAlt },
  { key: 'amount', label: 'Amount', icon: faDollarSign },
  { key: 'category', label: 'Category', icon: faTag }
];

export function applyQuickFilter(filterKey, filters) {
  const today = new Date();
  const newFilters = { ...filters };

  switch (filterKey) {
    case 'income':
      newFilters.type = 'income';
      break;
    case 'expense':
      newFilters.type = 'expense';
      break;
    case 'today':
      newFilters.dateFrom = today.toISOString().split('T')[0];
      newFilters.dateTo = today.toISOString().split('T')[0];
      break;
    case 'week': {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - 7);
      newFilters.dateFrom = weekStart.toISOString().split('T')[0];
      newFilters.dateTo = today.toISOString().split('T')[0];
      break;
    }
    default:
      newFilters.type = 'all';
      newFilters.dateFrom = '';
      newFilters.dateTo = '';
  }

  return newFilters;
}

export function isQuickFilterActive(filterKey, filters) {
  const todayStr = new Date().toISOString().split('T')[0];
  switch (filterKey) {
    case 'all':
      return (!filters.type || filters.type === 'all') && !filters.dateFrom && !filters.dateTo;
    case 'income':
    case 'expense':
      return filters.type === filterKey;
    case 'today':
      return filters.dateFrom === todayStr && filters.dateTo === todayStr;
    case 'week':
      return Boolean(filters.dateFrom && filters.dateTo && filters.dateFrom !== todayStr);
    default:
      return false;
  }
}
