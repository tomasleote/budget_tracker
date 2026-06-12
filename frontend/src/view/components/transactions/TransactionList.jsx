import React, { useState, useMemo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faFilter
} from '@fortawesome/free-solid-svg-icons';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { useTransactions } from '../../../controller/hooks/useTransactions';
import TransactionListSkeleton from './transaction-list/TransactionListSkeleton';
import TransactionListEmpty from './transaction-list/TransactionListEmpty';
import BulkActionBar from './transaction-list/BulkActionBar';
import TransactionRow from './transaction-list/TransactionRow';
import { useFilteredTransactions } from './transaction-list/useFilteredTransactions';

const DEFAULT_FILTERS = {
  type: 'all',
  category: 'all',
  dateFrom: '',
  dateTo: '',
  sortBy: 'date',
  sortOrder: 'desc'
};

const TransactionList = ({
  transactions = [],
  showFilters = true,
  showSearch = true,
  showActions = true,
  maxItems = null,
  onTransactionSelect = () => {},
  onTransactionEdit = () => {},
  onTransactionDelete = () => {},
  onBulkDelete = () => {},
  onAddTransaction = () => {},
  onFiltersChange = () => {},
  parentFilters = {},
  className = ''
}) => {
  const { isLoadingTransactions, isDeletingTransaction } = useTransactions();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selectedTransactions, setSelectedTransactions] = useState(new Set());
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    if (parentFilters && Object.keys(parentFilters).length > 0) {
      setFilters(prev => ({
        ...prev,
        type: parentFilters.type || 'all',
        category: parentFilters.category || 'all',
        dateFrom: parentFilters.dateFrom || '',
        dateTo: parentFilters.dateTo || ''
      }));
    }
  }, [parentFilters]);

  const filteredTransactions = useFilteredTransactions(transactions, searchTerm, filters, maxItems);

  const uniqueCategories = useMemo(() => {
    const categories = [...new Set(transactions.map(t => t.category))];
    return categories.filter(Boolean).sort();
  }, [transactions]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSelectTransaction = (transactionId) => {
    const newSelected = new Set(selectedTransactions);
    if (newSelected.has(transactionId)) {
      newSelected.delete(transactionId);
    } else {
      newSelected.add(transactionId);
    }
    setSelectedTransactions(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTransactions.size === filteredTransactions.length) {
      setSelectedTransactions(new Set());
    } else {
      setSelectedTransactions(new Set(filteredTransactions.map(t => t.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTransactions.size === 0) return;
    await onBulkDelete(Array.from(selectedTransactions));
    setSelectedTransactions(new Set());
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchTerm('');
  };

  const isFiltered = Boolean(
    searchTerm ||
    Object.values(filters).some(f => f !== 'all' && f !== 'date' && f !== 'desc' && f !== '')
  );

  if (isLoadingTransactions) {
    return <TransactionListSkeleton className={className} />;
  }

  return (
    <Card
      className={className}
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-theme-primary">Transactions</h3>
            <span className="px-2 py-1 rounded text-sm bg-theme-secondary text-theme-secondary">
              {filteredTransactions.length}
            </span>
          </div>
        </div>
      }
    >
      {(showSearch || showFilters) && (
        <div className="space-y-4 mb-6">
          {showSearch && (
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={faSearch}
                  iconPosition="left"
                />
              </div>
              {showFilters && (
                <Button
                  variant={showAdvancedFilters ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  <FontAwesomeIcon icon={faFilter} className="mr-2" />
                  Filters
                </Button>
              )}
            </div>
          )}

          {showFilters && showAdvancedFilters && (
            <div className="rounded-lg p-4 space-y-4 bg-theme-secondary border border-theme-primary">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-theme-primary">Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="input-theme w-full px-3 py-2 rounded-lg border"
                  >
                    <option value="all">All Types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-theme-primary">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="input-theme w-full px-3 py-2 rounded-lg border"
                  >
                    <option value="all">All Categories</option>
                    {uniqueCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-theme-primary">From Date</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="input-theme w-full px-3 py-2 rounded-lg border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-theme-primary">To Date</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="input-theme w-full px-3 py-2 rounded-lg border"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-theme-primary">Sort By</label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="input-theme px-3 py-2 rounded-lg border"
                    >
                      <option value="date">Date</option>
                      <option value="amount">Amount</option>
                      <option value="category">Category</option>
                      <option value="description">Description</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-theme-primary">Order</label>
                    <select
                      value={filters.sortOrder}
                      onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                      className="input-theme px-3 py-2 rounded-lg border"
                    >
                      <option value="desc">Descending</option>
                      <option value="asc">Ascending</option>
                    </select>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <BulkActionBar
        selectedCount={selectedTransactions.size}
        onClearSelection={() => setSelectedTransactions(new Set())}
        onBulkDelete={handleBulkDelete}
        isDeleting={isDeletingTransaction}
      />

      {filteredTransactions.length === 0 ? (
        <TransactionListEmpty isFiltered={isFiltered} />
      ) : (
        <div className="space-y-3">
          {showActions && (
            <div className="flex items-center space-x-3 py-2 border-b border-theme-primary">
              <input
                type="checkbox"
                checked={selectedTransactions.size === filteredTransactions.length && filteredTransactions.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded"
                style={{ accentColor: 'var(--accent-primary)' }}
              />
              <span className="text-sm font-medium text-theme-primary">Select All</span>
            </div>
          )}

          <div className="max-h-96 overflow-y-auto rounded-lg border border-theme-primary">
            <div className="space-y-0">
              {filteredTransactions.map((transaction, index) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  isSelected={selectedTransactions.has(transaction.id)}
                  showActions={showActions}
                  isDeleting={isDeletingTransaction}
                  index={index}
                  isLast={index === filteredTransactions.length - 1}
                  onSelect={handleSelectTransaction}
                  onView={onTransactionSelect}
                  onEdit={onTransactionEdit}
                  onDelete={onTransactionDelete}
                />
              ))}
            </div>
          </div>

          {filteredTransactions.length > 10 && (
            <div className="text-center py-2 text-sm text-theme-secondary bg-theme-secondary rounded-lg">
              Showing {filteredTransactions.length} transactions • Scroll to see more
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default TransactionList;
