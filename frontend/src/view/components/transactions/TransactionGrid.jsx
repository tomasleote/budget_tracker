import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch,
  faFilter,
  faPlus,
  faInfoCircle,
  faSpinner,
  faTh,
  faList
} from '@fortawesome/free-solid-svg-icons';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import TransactionCard from './TransactionCard';
import { useTransactions } from '../../../controller/hooks/useTransactions';

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
  const {
    isLoadingTransactions,
    deleteTransaction,
    isDeletingTransaction
  } = useTransactions();

  // Use the passed transactions prop
  const transactionsToUse = transactions;

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    dateFrom: '',
    dateTo: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    let result = transactionsToUse;

    // Apply search
    if (searchTerm) {
      result = result.filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.amount.toString().includes(searchTerm)
      );
    }

    // Apply type filter
    if (filters.type !== 'all') {
      result = result.filter(t => t.type === filters.type);
    }

    // Apply category filter
    if (filters.category !== 'all') {
      result = result.filter(t => t.category === filters.category);
    }

    // Apply date range filter
    if (filters.dateFrom) {
      result = result.filter(t => new Date(t.date) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      result = result.filter(t => new Date(t.date) <= new Date(filters.dateTo));
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'amount':
          aValue = parseFloat(a.amount);
          bValue = parseFloat(b.amount);
          break;
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'category':
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        case 'description':
          aValue = a.description.toLowerCase();
          bValue = b.description.toLowerCase();
          break;
        default:
          aValue = new Date(a.date);
          bValue = new Date(b.date);
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Apply limit if specified
    if (maxItems) {
      result = result.slice(0, maxItems);
    }

    return result;
  }, [transactionsToUse, searchTerm, filters, maxItems]);

  // Get unique categories for filter dropdown
  const uniqueCategories = useMemo(() => {
    const categories = [...new Set(transactionsToUse.map(t => t.category))];
    return categories.filter(Boolean).sort();
  }, [transactionsToUse]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      type: 'all',
      category: 'all',
      dateFrom: '',
      dateTo: '',
      sortBy: 'date',
      sortOrder: 'desc'
    });
    setSearchTerm('');
  };

  // Handle delete
  const handleDelete = async (transactionId) => {
    await deleteTransaction(transactionId);
  };

  // Loading state
  if (isLoadingTransactions) {
    return (
      <Card className={className}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="animate-pulse">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-5 bg-gray-200 rounded w-16 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className={className}
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900">Transactions</h3>
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
          {filteredTransactions.length}
          </span>
          </div>
        </div>
      }
    >
      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="space-y-4 mb-6">
          {/* Search Bar */}
          {showSearch && (
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
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

          {/* Advanced Filters */}
          {showFilters && showAdvancedFilters && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Categories</option>
                    {uniqueCategories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date From */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Date To */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Sort Options */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sort By
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="date">Date</option>
                      <option value="amount">Amount</option>
                      <option value="category">Category</option>
                      <option value="description">Description</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order
                    </label>
                    <select
                      value={filters.sortOrder}
                      onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="desc">Descending</option>
                      <option value="asc">Ascending</option>
                    </select>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transaction Grid */}
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <FontAwesomeIcon 
            icon={faInfoCircle} 
            className="text-gray-400 text-4xl mb-4" 
          />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || Object.values(filters).some(f => f !== 'all' && f !== 'date' && f !== 'desc' && f !== '') 
              ? 'No transactions found' 
              : 'No transactions yet'
            }
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || Object.values(filters).some(f => f !== 'all' && f !== 'date' && f !== 'desc' && f !== '')
              ? 'Try adjusting your search or filters'
              : 'Start by adding your first transaction'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Scrollable Grid Container */}
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  onView={onTransactionSelect}
                  onEdit={onTransactionEdit}
                  onDelete={handleDelete}
                  showActions={showActions}
                  isDeleting={isDeletingTransaction}
                />
              ))}
            </div>
          </div>

          {/* Transaction Count Info */}
          {filteredTransactions.length > 8 && (
            <div className="text-center py-2 text-sm text-gray-500 bg-gray-50 rounded-lg">
              Showing {filteredTransactions.length} transactions • Scroll to see more
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default TransactionGrid;