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
        bgColor: 'var(--error-bg)',
        textColor: 'var(--error)',
        borderColor: 'var(--error-border)'
      };
    } else if (isNearLimit) {
      return {
        status: 'warning',
        color: 'yellow',
        icon: faExclamationTriangle,
        text: 'Near Limit',
        bgColor: 'var(--warning-bg)',
        textColor: 'var(--warning)',
        borderColor: 'var(--warning-border)'
      };
    } else {
      return {
        status: 'good',
        color: 'green',
        icon: faCheckCircle,
        text: 'On Track',
        bgColor: 'var(--success-bg)',
        textColor: 'var(--success)',
        borderColor: 'var(--success-border)'
      };
    }
  };

  // Handle loading state
  if (isLoading) {
    return (
      <Card className={className} title="Budget Management">
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse p-4 rounded-lg" style={{
              border: '1px solid var(--border-primary)'
            }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full" style={{
                    backgroundColor: 'var(--bg-tertiary)'
                  }}></div>
                  <div>
                    <div className="h-4 rounded w-24 mb-1" style={{
                      backgroundColor: 'var(--bg-tertiary)'
                    }}></div>
                    <div className="h-3 rounded w-16" style={{
                      backgroundColor: 'var(--bg-tertiary)'
                    }}></div>
                  </div>
                </div>
                <div className="h-6 rounded w-20" style={{
                  backgroundColor: 'var(--bg-tertiary)'
                }}></div>
              </div>
              <div className="h-3 rounded mb-2" style={{
                backgroundColor: 'var(--bg-tertiary)'
              }}></div>
              <div className="h-4 rounded w-3/4" style={{
                backgroundColor: 'var(--bg-tertiary)'
              }}></div>
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
            className="text-5xl mb-6" 
            style={{ color: 'var(--text-tertiary)' }}
          />
          <h3 className="text-xl font-medium mb-3" style={{
            color: 'var(--text-primary)'
          }}>
            No Budgets Created Yet
          </h3>
          <p className="mb-8 max-w-md mx-auto" style={{
            color: 'var(--text-secondary)'
          }}>
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
              style={{
                backgroundColor: showFilters ? 'var(--accent-primary)' : 'transparent',
                borderColor: showFilters ? 'var(--accent-primary)' : 'var(--border-primary)',
                color: showFilters ? 'var(--text-inverse)' : 'var(--text-primary)'
              }}
            >
              Filters
            </Button>
          </div>

          {/* Filter Controls */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg" style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)'
            }}>
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{
                  color: 'var(--text-primary)'
                }}>
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg" 
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="all">All Statuses</option>
                  <option value="exceeded">Exceeded</option>
                  <option value="warning">Near Limit</option>
                </select>
              </div>

              {/* Period Filter */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{
                  color: 'var(--text-primary)'
                }}>
                  Period
                </label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
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
                <label className="block text-sm font-medium mb-2" style={{
                  color: 'var(--text-primary)'
                }}>
                  Sort By
                </label>
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
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
              icon: faWallet,
              bgColor: 'var(--info-bg)',
              textColor: 'var(--info)',
              borderColor: 'var(--info-border)'
            },
            { 
              label: 'Exceeded', 
              value: budgets.filter(b => b.isOverBudget || b.utilizationPercentage > 100).length, 
              color: 'red',
              icon: faExclamationTriangle,
              bgColor: 'var(--error-bg)',
              textColor: 'var(--error)',
              borderColor: 'var(--error-border)'
            },
            { 
              label: 'Near Limit', 
              value: budgets.filter(b => (b.isNearLimit || b.utilizationPercentage >= 80) && !(b.isOverBudget || b.utilizationPercentage > 100)).length, 
              color: 'yellow',
              icon: faExclamationTriangle,
              bgColor: 'var(--warning-bg)',
              textColor: 'var(--warning)',
              borderColor: 'var(--warning-border)'
            }
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-lg border" style={{
              backgroundColor: stat.bgColor,
              borderColor: stat.borderColor
            }}>
              <div className="flex items-center space-x-2 mb-2">
                <FontAwesomeIcon 
                  icon={stat.icon} 
                  className="w-4 h-4" 
                  style={{ color: stat.textColor }}
                />
                <span className="text-sm font-medium" style={{
                  color: stat.textColor
                }}>
                  {stat.label}
                </span>
              </div>
              <div className="text-2xl font-bold" style={{
                color: stat.textColor
              }}>
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
                className="p-4 rounded-lg transition-shadow" 
                style={{
                  border: '1px solid var(--border-primary)',
                  backgroundColor: 'var(--bg-card)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                {/* Budget Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-lg" style={{
                      backgroundColor: statusInfo.bgColor
                    }}>
                      <FontAwesomeIcon 
                        icon={statusInfo.icon} 
                        className="w-4 h-4" 
                        style={{ color: statusInfo.textColor }}
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold" style={{
                          color: 'var(--text-primary)'
                        }}>
                          {budget.category}
                        </h3>
                        <span className="px-2 py-1 text-xs rounded-full" style={{
                          backgroundColor: statusInfo.bgColor,
                          color: statusInfo.textColor
                        }}>
                          {statusInfo.text}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm" style={{
                        color: 'var(--text-secondary)'
                      }}>
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
                        style={{
                          color: 'var(--error)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.color = 'var(--error)';
                          e.target.style.backgroundColor = 'var(--error-bg)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = 'var(--error)';
                          e.target.style.backgroundColor = 'transparent';
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>

                {/* Progress Section */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{
                      color: 'var(--text-primary)'
                    }}>
                      Budget Progress
                    </span>
                    <span className="text-sm" style={{
                      color: 'var(--text-secondary)'
                    }}>
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
                  
                  <div className="flex justify-between text-xs mt-1" style={{
                    color: 'var(--text-secondary)'
                  }}>
                    <span>{formatCurrency(spent)} spent</span>
                    <span>{formatCurrency(budgetAmount)} budget</span>
                  </div>
                </div>

                {/* Budget Details */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="mb-1" style={{
                      color: 'var(--text-secondary)'
                    }}>Spent</div>
                    <div className="font-semibold" style={{
                      color: 'var(--error)'
                    }}>
                      {formatCurrency(spent)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="mb-1" style={{
                      color: 'var(--text-secondary)'
                    }}>
                      {remaining >= 0 ? 'Remaining' : 'Over Budget'}
                    </div>
                    <div className="font-semibold" style={{
                      color: remaining >= 0 ? 'var(--success)' : 'var(--error)'
                    }}>
                      {formatCurrency(Math.abs(remaining))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="mb-1" style={{
                      color: 'var(--text-secondary)'
                    }}>Alert Threshold</div>
                    <div className="font-semibold" style={{
                      color: 'var(--text-primary)'
                    }}>
                      {budget.alertThreshold || 80}%
                    </div>
                  </div>
                </div>

                {/* Description */}
                {budget.description && (
                  <div className="mt-4 pt-4" style={{
                    borderTop: '1px solid var(--border-primary)'
                  }}>
                    <div className="text-xs mb-1" style={{
                      color: 'var(--text-secondary)'
                    }}>Description</div>
                    <div className="text-sm" style={{
                      color: 'var(--text-primary)'
                    }}>
                      {budget.description}
                    </div>
                  </div>
                )}

                {/* Status Message */}
                {statusInfo.status === 'exceeded' && (
                  <div className="mt-4 p-3 rounded-lg" style={{
                    backgroundColor: statusInfo.bgColor,
                    border: `1px solid ${statusInfo.borderColor}`
                  }}>
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4" style={{
                        color: statusInfo.textColor
                      }} />
                      <span className="text-sm font-medium" style={{
                        color: statusInfo.textColor
                      }}>
                        Budget exceeded by {formatCurrency(Math.abs(remaining))}
                      </span>
                    </div>
                  </div>
                )}
                
                {statusInfo.status === 'warning' && (
                  <div className="mt-4 p-3 rounded-lg" style={{
                    backgroundColor: statusInfo.bgColor,
                    border: `1px solid ${statusInfo.borderColor}`
                  }}>
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4" style={{
                        color: statusInfo.textColor
                      }} />
                      <span className="text-sm font-medium" style={{
                        color: statusInfo.textColor
                      }}>
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
              className="text-4xl mb-4" 
              style={{ color: 'var(--text-tertiary)' }}
            />
            <h3 className="text-lg font-medium mb-2" style={{
              color: 'var(--text-primary)'
            }}>
              No Budgets Found
            </h3>
            <p className="mb-4" style={{
              color: 'var(--text-secondary)'
            }}>
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