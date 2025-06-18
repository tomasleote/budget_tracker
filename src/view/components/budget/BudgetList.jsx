import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faWallet,
  faPlus,
  faEdit,
  faTrash,
  faEye,
  faSearch,
  faFilter,
  faSort,
  faSortUp,
  faSortDown,
  faTag,
  faCalendarAlt,
  faDollarSign,
  faCheckCircle,
  faExclamationTriangle,
  faEllipsisV
} from '@fortawesome/free-solid-svg-icons';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import ProgressBar from '../ui/ProgressBar';
import ConfirmationModal from '../ui/ConfirmationModal';
import { formatCurrency, formatPercentage, formatDate } from '../../../controller/utils/formatters';

const BudgetList = ({ 
  budgets = [],
  isLoading = false,
  onCreateBudget = () => {},
  onEditBudget = () => {},
  onDeleteBudget = () => {},
  onViewBudget = () => {},
  showActions = true,
  className = ''
}) => {
  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [sortField, setSortField] = useState('utilizationPercentage');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  
  // State for delete confirmation modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    budget: null,
    isDeleting: false
  });

  // Filter and sort budgets
  const filteredAndSortedBudgets = useMemo(() => {
    if (!budgets || budgets.length === 0) {
      return [];
    }

    let filtered = budgets.filter(budget => {
      // Search filter
      const matchesSearch = !searchTerm || 
        budget.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        budget.description?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = selectedStatus === 'all' || 
        (selectedStatus === 'exceeded' && (budget.isOverBudget || budget.utilizationPercentage > 100)) ||
        (selectedStatus === 'warning' && (budget.isNearLimit || budget.utilizationPercentage >= 80));

      // Period filter
      const matchesPeriod = selectedPeriod === 'all' || budget.period === selectedPeriod;

      return matchesSearch && matchesStatus && matchesPeriod;
    });

    // Sort budgets
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle special sorting cases
      if (sortField === 'utilizationPercentage') {
        aValue = a.utilizationPercentage || 0;
        bValue = b.utilizationPercentage || 0;
      } else if (sortField === 'budgetAmount') {
        aValue = a.budgetAmount || 0;
        bValue = b.budgetAmount || 0;
      } else if (sortField === 'category') {
        aValue = (a.category || '').toLowerCase();
        bValue = (b.category || '').toLowerCase();
      } else if (sortField === 'startDate') {
        aValue = new Date(a.startDate || 0);
        bValue = new Date(b.startDate || 0);
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [budgets, searchTerm, selectedStatus, selectedPeriod, sortField, sortDirection]);

  // Handle delete modal
  const handleDeleteClick = (budget) => {
    setDeleteModal({
      isOpen: true,
      budget: budget,
      isDeleting: false
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.budget) return;
    
    setDeleteModal(prev => ({ ...prev, isDeleting: true }));
    
    try {
      await onDeleteBudget(deleteModal.budget.id);
      setDeleteModal({ isOpen: false, budget: null, isDeleting: false });
    } catch (error) {
      console.error('Error deleting budget:', error);
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, budget: null, isDeleting: false });
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

  // Handle loading state
  if (isLoading) {
    return (
      <Card className={className} title="Budget Management">
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // Handle empty state
  if (!budgets || budgets.length === 0) {
    return (
      <Card className={className} title="Budget Management">
        <div className="text-center py-12">
          <FontAwesomeIcon 
            icon={faWallet} 
            className="text-gray-400 text-5xl mb-6" 
          />
          <h3 className="text-xl font-medium text-gray-900 mb-3">
            No Budgets Created Yet
          </h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Create your first budget to start tracking your spending and stay on top of your financial goals.
          </p>
          <Button
            variant="primary"
            onClick={onCreateBudget}
            icon={faPlus}
            size="lg"
          >
            Create Your First Budget
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card 
        className={className}
        title="Budget Management"
        headerAction={showActions ? (
          <Button
            variant="primary"
            onClick={onCreateBudget}
            icon={faPlus}
          >
            New Budget
          </Button>
        ) : null}
      >
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <Input
                placeholder="Search budgets by category or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={faSearch}
                iconPosition="left"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              icon={faFilter}
              className={showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}
            >
              Filters
            </Button>
          </div>

          {/* Filter Controls */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="exceeded">Exceeded</option>
                  <option value="warning">Near Limit</option>
                </select>
              </div>

              {/* Period Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Period
                </label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Periods</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              {/* Sort Controls */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="utilizationPercentage">Usage %</option>
                  <option value="budgetAmount">Amount</option>
                  <option value="category">Category</option>
                  <option value="startDate">Start Date</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Budget Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { 
              label: 'Total Budgets', 
              value: budgets.length, 
              color: 'blue',
              icon: faWallet 
            },
            { 
              label: 'Exceeded', 
              value: budgets.filter(b => b.isOverBudget || b.utilizationPercentage > 100).length, 
              color: 'red',
              icon: faExclamationTriangle 
            },
            { 
              label: 'Near Limit', 
              value: budgets.filter(b => (b.isNearLimit || b.utilizationPercentage >= 80) && !(b.isOverBudget || b.utilizationPercentage > 100)).length, 
              color: 'yellow',
              icon: faExclamationTriangle 
            }
          ].map((stat) => (
            <div key={stat.label} className={`p-4 rounded-lg border bg-${stat.color}-50 border-${stat.color}-200`}>
              <div className="flex items-center space-x-2 mb-2">
                <FontAwesomeIcon 
                  icon={stat.icon} 
                  className={`text-${stat.color}-600 w-4 h-4`} 
                />
                <span className={`text-sm font-medium text-${stat.color}-700`}>
                  {stat.label}
                </span>
              </div>
              <div className={`text-2xl font-bold text-${stat.color}-600`}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Budget List */}
        <div className="space-y-4 max-h-[40rem] overflow-y-auto pr-2">
          {filteredAndSortedBudgets.map((budget) => {
            const statusInfo = getBudgetStatusInfo(budget);
            const percentage = budget.utilizationPercentage || 0;
            const spent = budget.progress?.spent || 0;
            const remaining = budget.progress?.remaining || budget.budgetAmount;
            const budgetAmount = budget.budgetAmount || 0;

            return (
              <div
                key={budget.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white"
              >
                {/* Budget Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${statusInfo.bgColor}`}>
                      <FontAwesomeIcon 
                        icon={statusInfo.icon} 
                        className={`w-4 h-4 ${statusInfo.textColor}`} 
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {budget.category}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                          {statusInfo.text}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <FontAwesomeIcon icon={faDollarSign} className="w-3 h-3" />
                          <span>{formatCurrency(budgetAmount)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3" />
                          <span>{budget.period}</span>
                        </div>
                        {budget.startDate && (
                          <div className="flex items-center space-x-1">
                            <span>Starts: {formatDate(budget.startDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Menu */}
                  {showActions && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewBudget(budget);
                        }}
                        icon={faEye}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditBudget(budget);
                        }}
                        icon={faEdit}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(budget);
                        }}
                        icon={faTrash}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>

                {/* Progress Section */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Budget Progress
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatPercentage(percentage)}
                    </span>
                  </div>
                  
                  <ProgressBar
                    value={percentage}
                    max={100}
                    color="dynamic"
                    size="md"
                    animated={true}
                  />
                  
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>{formatCurrency(spent)} spent</span>
                    <span>{formatCurrency(budgetAmount)} budget</span>
                  </div>
                </div>

                {/* Budget Details */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600 mb-1">Spent</div>
                    <div className="font-semibold text-red-600">
                      {formatCurrency(spent)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-gray-600 mb-1">
                      {remaining >= 0 ? 'Remaining' : 'Over Budget'}
                    </div>
                    <div className={`font-semibold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs(remaining))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-gray-600 mb-1">Alert Threshold</div>
                    <div className="font-semibold text-gray-900">
                      {budget.alertThreshold || 80}%
                    </div>
                  </div>
                </div>

                {/* Description */}
                {budget.description && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">Description</div>
                    <div className="text-sm text-gray-700">
                      {budget.description}
                    </div>
                  </div>
                )}

                {/* Status Message */}
                {statusInfo.status === 'exceeded' && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 w-4 h-4" />
                      <span className="text-sm text-red-700 font-medium">
                        Budget exceeded by {formatCurrency(Math.abs(remaining))}
                      </span>
                    </div>
                  </div>
                )}
                
                {statusInfo.status === 'warning' && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500 w-4 h-4" />
                      <span className="text-sm text-yellow-700 font-medium">
                        {formatPercentage(percentage)} of budget used - approaching limit
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* No filtered results */}
        {filteredAndSortedBudgets.length === 0 && budgets.length > 0 && (
          <div className="text-center py-8">
            <FontAwesomeIcon 
              icon={faSearch} 
              className="text-gray-400 text-4xl mb-4" 
            />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Budgets Found
            </h3>
            <p className="text-gray-500 mb-4">
              No budgets match your current search and filter criteria.
            </p>
            <div className="space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStatus('all');
                  setSelectedPeriod('all');
                }}
              >
                Clear Filters
              </Button>
              <Button
                variant="primary"
                onClick={onCreateBudget}
                icon={faPlus}
              >
                Create New Budget
              </Button>
            </div>
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
        message={`Are you sure you want to delete the "${deleteModal.budget?.category}" budget? This action cannot be undone and will permanently remove all budget data.`}
        confirmText="Delete Budget"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteModal.isDeleting}
      />
    </>
  );
};

export default BudgetList;