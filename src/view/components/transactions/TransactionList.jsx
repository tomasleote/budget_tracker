import React, { useState, useMemo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch,
  faFilter,
  faSort,
  faPlus,
  faEdit,
  faTrash,
  faEye,
  faArrowUp,
  faArrowDown,
  faCalendarAlt,
  faDollarSign,
  faTag,
  faSpinner,
  faInfoCircle,
  faUtensils,
  faCar,
  faShoppingBag,
  faHome,
  faFilm,
  faHospital,
  faGraduationCap,
  faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { useTransactions } from '../../../controller/hooks/useTransactions';
import { formatCurrency, formatDate } from '../../../controller/utils/formatters';

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
  const {
    isLoadingTransactions,
    searchTransactions,
    filterByCategory,
    filterByType,
    filterByDateRange,
    sortByAmount,
    sortByDate,
    sortByCategory,
    deleteTransaction,
    isDeletingTransaction
  } = useTransactions();

  // Use the passed transactions prop instead of loading from hook
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
  const [selectedTransactions, setSelectedTransactions] = useState(new Set());
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Sync internal filters with parent filters
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

  // Get category icon
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'food & dining': faUtensils,
      'food': faUtensils,
      'dining': faUtensils,
      'restaurants': faUtensils,
      'transportation': faCar,
      'car': faCar,
      'gas': faCar,
      'shopping': faShoppingBag,
      'store': faShoppingBag,
      'clothes': faShoppingBag,
      'home': faHome,
      'house': faHome,
      'entertainment': faFilm,
      'movies': faFilm,
      'games': faFilm,
      'healthcare': faHospital,
      'medical': faHospital,
      'doctor': faHospital,
      'education': faGraduationCap,
      'school': faGraduationCap,
      'books': faGraduationCap
    };

    const category = (categoryName || '').toLowerCase();
    return Object.keys(iconMap).find(key => category.includes(key)) 
      ? iconMap[Object.keys(iconMap).find(key => category.includes(key))]
      : faQuestionCircle;
  };

  // Filtered and sorted transactions with duplicate removal
  const filteredTransactions = useMemo(() => {
    let result = transactionsToUse;

    // Remove duplicates first (safety measure)
    result = result.filter((transaction, index, arr) => 
      arr.findIndex(t => t.id === transaction.id) === index
    );

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
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    // Notify parent component about filter changes
    onFiltersChange(newFilters);
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  // Handle selection
  const handleSelectTransaction = (transactionId) => {
    const newSelected = new Set(selectedTransactions);
    if (newSelected.has(transactionId)) {
      newSelected.delete(transactionId);
    } else {
      newSelected.add(transactionId);
    }
    setSelectedTransactions(newSelected);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedTransactions.size === filteredTransactions.length) {
      setSelectedTransactions(new Set());
    } else {
      setSelectedTransactions(new Set(filteredTransactions.map(t => t.id)));
    }
  };

  // Handle delete
  const handleDelete = async (transactionId) => {
    await onTransactionDelete(transactionId);
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedTransactions.size === 0) return;
    
    // Pass the selected transaction IDs to the parent component
    const transactionIds = Array.from(selectedTransactions);
    await onBulkDelete(transactionIds);
    setSelectedTransactions(new Set());
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

  // Loading state
  if (isLoadingTransactions) {
    return (
      <Card className={className}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 rounded w-1/3" style={{
            backgroundColor: 'var(--bg-tertiary)'
          }}></div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full" style={{
                backgroundColor: 'var(--bg-tertiary)'
              }}></div>
              <div className="flex-1 space-y-1">
                <div className="h-4 rounded w-3/4" style={{
                  backgroundColor: 'var(--bg-tertiary)'
                }}></div>
                <div className="h-3 rounded w-1/2" style={{
                  backgroundColor: 'var(--bg-tertiary)'
                }}></div>
              </div>
              <div className="h-4 rounded w-16" style={{
                backgroundColor: 'var(--bg-tertiary)'
              }}></div>
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
            <h3 className="text-lg font-semibold" style={{
              color: 'var(--text-primary)'
            }}>Transactions</h3>
            <span className="px-2 py-1 rounded text-sm" style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-secondary)'
            }}>
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

          {/* Advanced Filters */}
          {showFilters && showAdvancedFilters && (
            <div className="rounded-lg p-4 space-y-4" style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)'
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium mb-1" style={{
                    color: 'var(--text-primary)'
                  }}>
                    Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="all">All Types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium mb-1" style={{
                    color: 'var(--text-primary)'
                  }}>
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)'
                    }}
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
                  <label className="block text-sm font-medium mb-1" style={{
                    color: 'var(--text-primary)'
                  }}>
                    From Date
                  </label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                {/* Date To */}
                <div>
                  <label className="block text-sm font-medium mb-1" style={{
                    color: 'var(--text-primary)'
                  }}>
                    To Date
                  </label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
              </div>

              {/* Sort Options */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{
                      color: 'var(--text-primary)'
                    }}>
                      Sort By
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="px-3 py-2 rounded-lg"
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-primary)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <option value="date">Date</option>
                      <option value="amount">Amount</option>
                      <option value="category">Category</option>
                      <option value="description">Description</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{
                      color: 'var(--text-primary)'
                    }}>
                      Order
                    </label>
                    <select
                      value={filters.sortOrder}
                      onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                      className="px-3 py-2 rounded-lg"
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-primary)',
                        color: 'var(--text-primary)'
                      }}
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

      {/* Bulk Actions */}
      {selectedTransactions.size > 0 && (
        <div className="rounded-lg p-4 mb-4" style={{
          backgroundColor: 'var(--info-bg)',
          border: '1px solid var(--info-border)'
        }}>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{
              color: 'var(--info)'
            }}>
              {selectedTransactions.size} transaction(s) selected
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTransactions(new Set())}
              >
                Clear Selection
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleBulkDelete}
                disabled={isDeletingTransaction}
              >
                <FontAwesomeIcon icon={faTrash} className="mr-2" />
                Delete Selected
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction List */}
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-8">
          <FontAwesomeIcon 
            icon={faInfoCircle} 
            className="text-3xl mb-4" 
            style={{ color: 'var(--text-tertiary)' }}
          />
          <h3 className="text-lg font-medium mb-2" style={{
            color: 'var(--text-primary)'
          }}>
            {searchTerm || Object.values(filters).some(f => f !== 'all' && f !== 'date' && f !== 'desc' && f !== '') 
              ? 'No transactions found' 
              : 'No transactions yet'
            }
          </h3>
          <p className="mb-4" style={{
            color: 'var(--text-secondary)'
          }}>
            {searchTerm || Object.values(filters).some(f => f !== 'all' && f !== 'date' && f !== 'desc' && f !== '')
              ? 'Try adjusting your search or filters'
              : 'Start by adding your first transaction'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Select All Header */}
          {showActions && (
            <div className="flex items-center space-x-3 py-2" style={{
              borderBottom: '1px solid var(--border-primary)'
            }}>
              <input
                type="checkbox"
                checked={selectedTransactions.size === filteredTransactions.length && filteredTransactions.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded"
                style={{
                  accentColor: 'var(--accent-primary)'
                }}
              />
              <span className="text-sm font-medium" style={{
                color: 'var(--text-primary)'
              }}>
                Select All
              </span>
            </div>
          )}

          {/* Transaction Items - Scrollable Container */}
          <div className="max-h-96 overflow-y-auto rounded-lg" style={{
            border: '1px solid var(--border-primary)'
          }}>
            <div className="space-y-0">
              {filteredTransactions.map((transaction, index) => {
                const isIncome = transaction.type === 'income';
                const categoryIcon = getCategoryIcon(transaction.category);
                const isSelected = selectedTransactions.has(transaction.id);
                
                return (
                  <div 
                    key={transaction.id}
                    className="flex items-center space-x-3 p-4 transition-colors cursor-pointer"
                    style={{
                      borderBottom: index !== filteredTransactions.length - 1 ? '1px solid var(--border-secondary)' : 'none',
                      backgroundColor: isSelected 
                        ? 'var(--info-bg)' 
                        : 'var(--bg-card)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                      }
                    }}
                  >
                    {/* Selection Checkbox */}
                    {showActions && (
                      <input
                        type="checkbox"
                        checked={selectedTransactions.has(transaction.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectTransaction(transaction.id);
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    )}

                    {/* Transaction Icon */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isIncome 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      <FontAwesomeIcon 
                        icon={categoryIcon} 
                        className="text-lg" 
                      />
                    </div>

                    {/* Transaction Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {transaction.description}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center space-x-2">
                            <FontAwesomeIcon icon={faTag} className="w-3 h-3" />
                            <span>{transaction.category}</span>
                            <span>•</span>
                            <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3" />
                            <span>{formatDate(transaction.date)}</span>
                          </div>
                        </div>
                        
                        {/* Amount */}
                        <div className="text-right ml-4 flex-shrink-0">
                          <div className={`text-sm font-semibold ${
                            isIncome ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {isIncome ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                          </div>
                          <div className="text-xs text-gray-500">
                            <FontAwesomeIcon 
                              icon={isIncome ? faArrowUp : faArrowDown} 
                              className="mr-1" 
                            />
                            {isIncome ? 'Income' : 'Expense'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {showActions && (
                      <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTransactionSelect(transaction);
                          }}
                          className="text-gray-400 hover:text-blue-600"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onTransactionEdit(transaction);
                          }}
                          className="text-gray-400 hover:text-yellow-600"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(transaction.id);
                          }}
                          className="text-gray-400 hover:text-red-600"
                          disabled={isDeletingTransaction}
                        >
                          {isDeletingTransaction ? (
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                          ) : (
                            <FontAwesomeIcon icon={faTrash} />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transaction Count Info */}
          {filteredTransactions.length > 10 && (
            <div className="text-center py-2 text-sm text-gray-500 bg-gray-50 rounded-lg">
              Showing {filteredTransactions.length} transactions • Scroll to see more
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default TransactionList;