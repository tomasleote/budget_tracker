import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft,
  faWallet,
  faCalendarAlt,
  faDollarSign,
  faExclamationTriangle,
  faCheckCircle,
  faEdit,
  faTrash,
  faSearch,
  faFilter,
  faSort,
  faSortUp,
  faSortDown,
  faReceipt,
  faTag,
  faEye,
  faPlus,
  faMinus
} from '@fortawesome/free-solid-svg-icons';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import ProgressBar from '../ui/ProgressBar';
import ConfirmationModal from '../ui/ConfirmationModal';
import { formatCurrency, formatPercentage, formatDate } from '../../../controller/utils/formatters';
import { useTransactions } from '../../../controller/hooks/useTransactions';

const BudgetDetail = ({ 
  budget,
  onBack = () => {},
  onEditBudget = () => {},
  onDeleteBudget = () => {},
  className = ''
}) => {
  // State for filtering and sorting transactions
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  
  // State for delete confirmation modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    isDeleting: false
  });

  // Get transactions
  const { transactions } = useTransactions();

  // Filter transactions for this budget category
  const budgetTransactions = useMemo(() => {
    if (!budget || !transactions) return [];
    
    // Filter transactions that match this budget's category
    const filtered = transactions.filter(transaction => {
      const transactionCategory = transaction.category || transaction.categoryName || '';
      const budgetCategory = budget.category || '';
      
      // Match by category
      const matchesCategory = transactionCategory.toLowerCase() === budgetCategory.toLowerCase();
      
      // If we have budget date range, filter by dates too
      if (budget.startDate && budget.endDate) {
        const transactionDate = new Date(transaction.date);
        const startDate = new Date(budget.startDate);
        const endDate = new Date(budget.endDate);
        const withinDateRange = transactionDate >= startDate && transactionDate <= endDate;
        return matchesCategory && withinDateRange;
      }
      
      return matchesCategory;
    });

    return filtered;
  }, [budget, transactions]);

  // Filter and sort transactions based on user input
  const filteredAndSortedTransactions = useMemo(() => {
    if (!budgetTransactions) return [];

    let filtered = budgetTransactions.filter(transaction => {
      // Search filter
      const matchesSearch = !searchTerm || 
        (transaction.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.categoryName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.formattedAmount || '').includes(searchTerm);

      // Type filter
      const matchesType = selectedType === 'all' || transaction.type === selectedType;

      return matchesSearch && matchesType;
    });

    // Sort transactions
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'date') {
        aValue = new Date(a.date);
        bValue = new Date(b.date);
      } else if (sortField === 'amount') {
        aValue = Math.abs(a.amount || 0);
        bValue = Math.abs(b.amount || 0);
      } else if (sortField === 'description') {
        aValue = (a.description || '').toLowerCase();
        bValue = (b.description || '').toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [budgetTransactions, searchTerm, selectedType, sortField, sortDirection]);

  // Calculate transaction statistics for this budget
  const transactionStats = useMemo(() => {
    const expenses = budgetTransactions.filter(t => t.type === 'expense');
    const income = budgetTransactions.filter(t => t.type === 'income');
    
    const totalExpenses = expenses.reduce((sum, t) => sum + (Math.abs(t.amount) || 0), 0);
    const totalIncome = income.reduce((sum, t) => sum + (Math.abs(t.amount) || 0), 0);
    const netAmount = totalIncome - totalExpenses;
    
    return {
      totalTransactions: budgetTransactions.length,
      expenseCount: expenses.length,
      incomeCount: income.length,
      totalExpenses,
      totalIncome,
      netAmount,
      averageTransaction: budgetTransactions.length > 0 ? totalExpenses / expenses.length : 0
    };
  }, [budgetTransactions]);

  // Get budget status info
  const getBudgetStatusInfo = (budget) => {
    const percentage = budget.utilizationPercentage || 0;
    const isExceeded = budget.isOverBudget || percentage > 100;
    const isNearLimit = budget.isNearLimit || (percentage >= 80 && !isExceeded);
    
    if (isExceeded) {
      return {
        status: 'exceeded',
        color: 'red',
        icon: faExclamationTriangle,
        text: 'Exceeded',
        bgColor: 'bg-red-50',
        textColor: 'text-red-600'
      };
    } else if (isNearLimit) {
      return {
        status: 'warning',
        color: 'yellow',
        icon: faExclamationTriangle,
        text: 'Near Limit',
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-600'
      };
    } else {
      return {
        status: 'good',
        color: 'green',
        icon: faCheckCircle,
        text: 'On Track',
        bgColor: 'bg-green-50',
        textColor: 'text-green-600'
      };
    }
  };

  // Handle delete modal
  const handleDeleteClick = () => {
    setDeleteModal({ isOpen: true, isDeleting: false });
  };

  const handleDeleteConfirm = async () => {
    setDeleteModal(prev => ({ ...prev, isDeleting: true }));
    
    try {
      await onDeleteBudget(budget.id);
      onBack(); // Go back after successful deletion
    } catch (error) {
      console.error('Error deleting budget:', error);
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, isDeleting: false });
  };

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Get sort icon
  const getSortIcon = (field) => {
    if (sortField !== field) return faSort;
    return sortDirection === 'asc' ? faSortUp : faSortDown;
  };

  if (!budget) {
    return (
      <Card className={className}>
        <div className="p-6 text-center">
          <p className="text-gray-500">No budget selected</p>
        </div>
      </Card>
    );
  }

  const statusInfo = getBudgetStatusInfo(budget);
  const percentage = budget.utilizationPercentage || 0;
  const spent = budget.progress?.spent || transactionStats.totalExpenses;
  const remaining = budget.progress?.remaining || (budget.budgetAmount - spent);
  const budgetAmount = budget.budgetAmount || 0;

  return (
    <div className={className}>
      {/* Back Button - Prominent placement at top */}
      <div className="mb-4">
        <Button
          variant="outline"
          onClick={onBack}
          icon={faArrowLeft}
          className="bg-white shadow-sm"
        >
          Back to Budget List
        </Button>
      </div>

      {/* Header with Budget Overview */}
      <Card 
        className="mb-6"
        headerAction={
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditBudget(budget)}
              icon={faEdit}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              icon={faTrash}
              className="text-red-600 hover:text-red-700"
            >
              Delete
            </Button>
          </div>
        }
      >
        <div className="p-6">
          {/* Budget Overview */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${statusInfo.bgColor}`}>
                <FontAwesomeIcon 
                  icon={statusInfo.icon} 
                  className={`w-6 h-6 ${statusInfo.textColor}`} 
                />
              </div>
              
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {budget.category} Budget
                  </h1>
                  <span className={`px-3 py-1 text-sm rounded-full ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                    {statusInfo.text}
                  </span>
                </div>
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <FontAwesomeIcon icon={faDollarSign} className="w-4 h-4" />
                    <span>{formatCurrency(budgetAmount)} budget</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4" />
                    <span>{budget.period}</span>
                  </div>
                  {budget.startDate && (
                    <div className="flex items-center space-x-1">
                      <span>
                        {formatDate(budget.startDate)} - {budget.endDate ? formatDate(budget.endDate) : 'Ongoing'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Budget Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Budget Progress</h3>
              <span className="text-lg font-semibold text-gray-900">
                {formatPercentage(percentage)}
              </span>
            </div>
            
            <ProgressBar
              value={percentage}
              max={100}
              color="dynamic"
              size="lg"
              animated={true}
            />
            
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>{formatCurrency(spent)} spent</span>
              <span>{formatCurrency(budgetAmount)} total budget</span>
            </div>
          </div>

          {/* Budget Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600 mb-1">Total Budget</div>
              <div className="text-xl font-bold text-blue-600">
                {formatCurrency(budgetAmount)}
              </div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-sm text-red-600 mb-1">Spent</div>
              <div className="text-xl font-bold text-red-600">
                {formatCurrency(spent)}
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${remaining >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className={`text-sm mb-1 ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {remaining >= 0 ? 'Remaining' : 'Over Budget'}
              </div>
              <div className={`text-xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(remaining))}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Alert Threshold</div>
              <div className="text-xl font-bold text-gray-600">
                {budget.alertThreshold || 80}%
              </div>
            </div>
          </div>

          {/* Description */}
          {budget.description && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
              <p className="text-gray-700">{budget.description}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Transaction Analysis */}
      <Card title="Transaction Analysis" className="mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {transactionStats.totalTransactions}
              </div>
              <div className="text-sm text-gray-600">Total Transactions</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {transactionStats.expenseCount}
              </div>
              <div className="text-sm text-gray-600">Expenses</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {transactionStats.incomeCount}
              </div>
              <div className="text-sm text-gray-600">Income</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {formatCurrency(transactionStats.averageTransaction)}
              </div>
              <div className="text-sm text-gray-600">Avg. Expense</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Transactions List */}
      <Card 
        title={`Transactions in ${budget.category} (${filteredAndSortedTransactions.length})`}
        headerAction={
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              icon={faFilter}
              className={showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}
            >
              Filters
            </Button>
          </div>
        }
      >
        <div className="p-6 space-y-6">
          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={faSearch}
                  iconPosition="left"
                />
              </div>
            </div>

            {/* Filter Controls */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value="expense">Expenses</option>
                    <option value="income">Income</option>
                  </select>
                </div>

                {/* Sort Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="date">Date</option>
                    <option value="amount">Amount</option>
                    <option value="description">Description</option>
                  </select>
                </div>

                {/* Sort Direction */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort Order
                  </label>
                  <select
                    value={sortDirection}
                    onChange={(e) => setSortDirection(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Transactions Table */}
          {filteredAndSortedTransactions.length > 0 ? (
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('date')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Date</span>
                          <FontAwesomeIcon icon={getSortIcon('date')} className="w-3 h-3" />
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('description')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Description</span>
                          <FontAwesomeIcon icon={getSortIcon('description')} className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th 
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('amount')}
                      >
                        <div className="flex items-center justify-end space-x-1">
                          <span>Amount</span>
                          <FontAwesomeIcon icon={getSortIcon('amount')} className="w-3 h-3" />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center space-x-2">
                            <FontAwesomeIcon 
                              icon={transaction.type === 'income' ? faPlus : faMinus} 
                              className={`w-3 h-3 ${
                                transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                              }`} 
                            />
                            <span>{transaction.description || 'No description'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            transaction.type === 'income' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <span className={
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }>
                            {transaction.type === 'income' ? '+' : '-'}
                            {formatCurrency(Math.abs(transaction.amount))}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FontAwesomeIcon 
                icon={faReceipt} 
                className="text-gray-400 text-4xl mb-4" 
              />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Transactions Found
              </h3>
              <p className="text-gray-500">
                {budgetTransactions.length === 0 
                  ? `No transactions found for the ${budget.category} category.`
                  : 'No transactions match your current search and filter criteria.'
                }
              </p>
              {budgetTransactions.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedType('all');
                  }}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>
      
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Budget"
        message={`Are you sure you want to delete the "${budget?.category}" budget? This action cannot be undone and will permanently remove all budget data and transaction associations.`}
        confirmText="Delete Budget"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteModal.isDeleting}
      />
    </div>
  );
};

export default BudgetDetail;