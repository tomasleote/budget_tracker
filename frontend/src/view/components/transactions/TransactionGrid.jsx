import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import TransactionCard from './TransactionCard';
import { useTransactions } from '../../../controller/hooks/useTransactions';
import TransactionGridSkeleton from './transaction-grid/TransactionGridSkeleton';
import TransactionGridEmpty from './transaction-grid/TransactionGridEmpty';

const DEFAULT_FILTERS = {
  type: 'all',
  category: 'all',
  dateFrom: '',
  dateTo: '',
  sortBy: 'date',
  sortOrder: 'desc'
};

const TransactionGrid = ({
  transactions = [],
  showFilters = true,
  showSearch = true,
  showActions = true,
  maxItems = null,
  onTransactionSelect = () => {},
  onTransactionEdit = () => {},
  onTransactionDelete = () => {},
  onAddTransaction = () => {},
  onViewModeChange = () => {},
  viewMode = 'grid',
  onFiltersChange = () => {},
  parentFilters = {},
  className = ''
}) => {
  const { isLoadingTransactions, deleteTransaction, isDeletingTransaction } = useTransactions();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const filteredTransactions = useMemo(() => {
    let result = transactions;

    if (searchTerm) {
      result = result.filter(t =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.amount.toString().includes(searchTerm)
      );
    }

    if (filters.type !== 'all') result = result.filter(t => t.type === filters.type);
    if (filters.category !== 'all') result = result.filter(t => t.category === filters.category);
    if (filters.dateFrom) result = result.filter(t => new Date(t.date) >= new Date(filters.dateFrom));
    if (filters.dateTo) result = result.filter(t => new Date(t.date) <= new Date(filters.dateTo));

    result = [...result].sort((a, b) => {
      let aValue, bValue;
      switch (filters.sortBy) {
        case 'amount': aValue = parseFloat(a.amount); bValue = parseFloat(b.amount); break;
        case 'category': aValue = a.category.toLowerCase(); bValue = b.category.toLowerCase(); break;
        case 'description': aValue = a.description.toLowerCase(); bValue = b.description.toLowerCase(); break;
        case 'date': default: aValue = new Date(a.date); bValue = new Date(b.date);
      }
      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    if (maxItems) result = result.slice(0, maxItems);
    return result;
  }, [transactions, searchTerm, filters, maxItems]);

  const uniqueCategories = useMemo(() => {
    const categories = [...new Set(transactions.map(t => t.category))];
    return categories.filter(Boolean).sort();
  }, [transactions]);

  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

  const clearFilters = () => { setFilters(DEFAULT_FILTERS); setSearchTerm(''); };

  const isFiltered = Boolean(
    searchTerm ||
    Object.values(filters).some(f => f !== 'all' && f !== 'date' && f !== 'desc' && f !== '')
  );

  if (isLoadingTransactions) {
    return <TransactionGridSkeleton className={className} />;
  }

  return (
    <Card
      className={className}
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-theme-primary">Transactions</h3>
            <span className="bg-theme-secondary text-theme-secondary px-2 py-1 rounded text-sm">
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
                  variant={filters.category !== 'all' || filters.dateFrom || filters.dateTo ? 'primary' : 'outline'}
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
            <div className="bg-theme-secondary rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-1">Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="input-theme w-full border px-3 py-2 rounded-lg"
                  >
                    <option value="all">All Types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-1">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="input-theme w-full border px-3 py-2 rounded-lg"
                  >
                    <option value="all">All Categories</option>
                    {uniqueCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-1">From Date</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="input-theme w-full border px-3 py-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-1">To Date</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="input-theme w-full border px-3 py-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-1">Sort By</label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="input-theme border px-3 py-2 rounded-lg"
                    >
                      <option value="date">Date</option>
                      <option value="amount">Amount</option>
                      <option value="category">Category</option>
                      <option value="description">Description</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-1">Order</label>
                    <select
                      value={filters.sortOrder}
                      onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                      className="input-theme border px-3 py-2 rounded-lg"
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

      {filteredTransactions.length === 0 ? (
        <TransactionGridEmpty isFiltered={isFiltered} />
      ) : (
        <div className="space-y-4">
          <div className="max-h-96 overflow-y-auto border border-theme-primary rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  onView={onTransactionSelect}
                  onEdit={onTransactionEdit}
                  onDelete={(id) => deleteTransaction(id)}
                  showActions={showActions}
                  isDeleting={isDeletingTransaction}
                />
              ))}
            </div>
          </div>

          {filteredTransactions.length > 8 && (
            <div className="text-center py-2 text-sm text-theme-secondary bg-theme-secondary rounded-lg">
              Showing {filteredTransactions.length} transactions • Scroll to see more
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default TransactionGrid;
