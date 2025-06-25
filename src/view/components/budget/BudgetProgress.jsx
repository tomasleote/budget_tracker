import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faWallet,
  faExclamationTriangle,
  faCheckCircle,
  faInfoCircle,
  faArrowTrendUp,
  faArrowTrendDown,
  faCalendarAlt,
  faTag,
  faChartLine,
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import Card from '../ui/Card';
import ProgressBar from '../ui/ProgressBar';
import Button from '../ui/Button';
import { formatCurrency, formatPercentage } from '../../../controller/utils/formatters';

const BudgetProgress = ({ 
  budgetOverview = [],
  isLoading = false,
  onBudgetClick = () => {},
  onCreateBudget = () => {},
  showCreateButton = true,
  className = ''
}) => {
  // Handle loading state
  if (isLoading) {
    return (
      <Card className={className} title="Budget Progress">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 rounded mb-2" style={{
                backgroundColor: 'var(--bg-tertiary)'
              }}></div>
              <div className="h-6 rounded mb-2" style={{
                backgroundColor: 'var(--bg-tertiary)'
              }}></div>
              <div className="h-3 rounded" style={{
                backgroundColor: 'var(--bg-tertiary)'
              }}></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // Handle empty state
  if (!budgetOverview || budgetOverview.length === 0) {
    return (
      <Card className={className} title="Budget Progress">
        <div className="text-center py-8">
          <FontAwesomeIcon 
            icon={faWallet} 
            className="text-4xl mb-4" 
            style={{ color: 'var(--text-tertiary)' }}
          />
          <h3 className="text-lg font-medium mb-2" style={{
            color: 'var(--text-primary)'
          }}>
            No Budgets Yet
          </h3>
          <p className="mb-6" style={{
            color: 'var(--text-secondary)'
          }}>
            Create your first budget to track spending and stay on target.
          </p>
          {showCreateButton && (
            <Button
              variant="primary"
              onClick={onCreateBudget}
              icon={faWallet}
            >
              Create Your First Budget
            </Button>
          )}
        </div>
      </Card>
    );
  }

  // Get budget status info
  const getBudgetStatusInfo = (budget) => {
    const percentage = budget.progressPercentage || 0;
    const isExceeded = budget.isExceeded || percentage > 100;
    const isNearLimit = budget.isNearLimit || (percentage >= 80 && !isExceeded);
    
    if (isExceeded) {
      return {
        status: 'exceeded',
        color: 'red',
        icon: faExclamationTriangle,
        progressColor: 'red'
      };
    } else if (isNearLimit) {
      return {
        status: 'warning',
        color: 'yellow',
        icon: faExclamationTriangle,
        progressColor: 'yellow'
      };
    } else {
      return {
        status: 'good',
        color: 'green',
        icon: faCheckCircle,
        progressColor: 'dynamic'
      };
    }
  };

  // Calculate summary stats
  const totalBudgets = budgetOverview.length;
  const exceededBudgets = budgetOverview.filter(b => 
    (b.isExceeded || b.progressPercentage > 100)
  ).length;
  const warningBudgets = budgetOverview.filter(b => 
    (b.isNearLimit || b.progressPercentage >= 80) && 
    !(b.isExceeded || b.progressPercentage > 100)
  ).length;
  const healthyBudgets = totalBudgets - exceededBudgets - warningBudgets;

  return (
    <Card 
      className={className}
      title="Budget Progress"
      headerAction={showCreateButton ? (
        <Button
          variant="primary"
          onClick={onCreateBudget}
          icon={faPlus}
        >
          New Budget
        </Button>
      ) : null}
    >
      <div className="space-y-6 pt-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg border" style={{
            backgroundColor: 'var(--success-bg)',
            borderColor: 'var(--success-border)'
          }}>
            <div className="text-lg font-bold" style={{
              color: 'var(--success)'
            }}>{healthyBudgets}</div>
            <div className="text-xs" style={{
              color: 'var(--success)'
            }}>Healthy</div>
          </div>
          <div className="text-center p-3 rounded-lg border" style={{
            backgroundColor: 'var(--warning-bg)',
            borderColor: 'var(--warning-border)'
          }}>
            <div className="text-lg font-bold" style={{
              color: 'var(--warning)'
            }}>{warningBudgets}</div>
            <div className="text-xs" style={{
              color: 'var(--warning)'
            }}>Near Limit</div>
          </div>
          <div className="text-center p-3 rounded-lg border" style={{
            backgroundColor: 'var(--error-bg)',
            borderColor: 'var(--error-border)'
          }}>
            <div className="text-lg font-bold" style={{
              color: 'var(--error)'
            }}>{exceededBudgets}</div>
            <div className="text-xs" style={{
              color: 'var(--error)'
            }}>Exceeded</div>
          </div>
        </div>

        {/* Budget List */}
        <div className="space-y-4 max-h-[28rem] overflow-y-auto pr-2">
          {budgetOverview.map((budget) => {
            const statusInfo = getBudgetStatusInfo(budget);
            const percentage = budget.progressPercentage || 0;
            const spent = budget.progress?.spent || 0;
            const remaining = budget.progress?.remaining || budget.budgetAmount;
            const budgetAmount = budget.budgetAmount || 0;

            // Get status-based colors
            const getStatusColors = () => {
              if (statusInfo.status === 'exceeded') {
                return {
                  bg: 'var(--error-bg)',
                  border: 'var(--error-border)',
                  icon: 'var(--error)',
                  statusBg: 'var(--error-bg)',
                  statusText: 'var(--error)'
                };
              } else if (statusInfo.status === 'warning') {
                return {
                  bg: 'var(--warning-bg)',
                  border: 'var(--warning-border)',
                  icon: 'var(--warning)',
                  statusBg: 'var(--warning-bg)',
                  statusText: 'var(--warning)'
                };
              } else {
                return {
                  bg: 'var(--bg-card)',
                  border: 'var(--border-primary)',
                  icon: 'var(--success)',
                  statusBg: 'var(--success-bg)',
                  statusText: 'var(--success)'
                };
              }
            };

            const colors = getStatusColors();

            return (
              <div
                key={budget.id}
                onClick={() => onBudgetClick(budget)}
                className="p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md"
                style={{
                  backgroundColor: colors.bg,
                  borderColor: colors.border
                }}
              >
                {/* Budget Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon 
                        icon={faTag} 
                        className="w-4 h-4" 
                        style={{ color: 'var(--text-secondary)' }}
                      />
                      <span className="font-medium" style={{
                        color: 'var(--text-primary)'
                      }}>
                        {budget.categoryName || budget.category}
                      </span>
                    </div>
                    <FontAwesomeIcon 
                      icon={statusInfo.icon} 
                      className="w-4 h-4" 
                      style={{ color: colors.icon }}
                    />
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold" style={{
                      color: 'var(--text-primary)'
                    }}>
                      {formatCurrency(budgetAmount)}
                    </div>
                    <div className="text-xs" style={{
                      color: 'var(--text-secondary)'
                    }}>
                      {budget.formattedPeriod || budget.period || 'monthly'}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <ProgressBar
                    value={percentage}
                    max={100}
                    color={statusInfo.progressColor}
                    size="md"
                    animated={true}
                    showPercentage={true}
                    label={`${formatCurrency(spent)} spent of ${formatCurrency(budgetAmount)}`}
                  />
                </div>

                {/* Budget Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <FontAwesomeIcon 
                        icon={faArrowTrendUp} 
                        className="w-3 h-3" 
                        style={{ color: 'var(--error)' }}
                      />
                      <span style={{ color: 'var(--text-secondary)' }}>Spent</span>
                    </div>
                    <div className="font-semibold" style={{
                      color: 'var(--text-primary)'
                    }}>
                      {formatCurrency(spent)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <FontAwesomeIcon 
                        icon={remaining >= 0 ? faArrowTrendDown : faExclamationTriangle} 
                        className="w-3 h-3" 
                        style={{ color: remaining >= 0 ? 'var(--success)' : 'var(--error)' }}
                      />
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {remaining >= 0 ? 'Remaining' : 'Over Budget'}
                      </span>
                    </div>
                    <div className="font-semibold" style={{
                      color: remaining >= 0 ? 'var(--success)' : 'var(--error)'
                    }}>
                      {formatCurrency(Math.abs(remaining))}
                    </div>
                  </div>
                </div>

                {/* Status Message */}
                {statusInfo.status === 'exceeded' && (
                  <div className="mt-3 p-2 rounded text-xs" style={{
                    backgroundColor: colors.statusBg,
                    color: colors.statusText
                  }}>
                    <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                    Budget exceeded by {formatCurrency(Math.abs(remaining))}
                  </div>
                )}
                
                {statusInfo.status === 'warning' && (
                  <div className="mt-3 p-2 rounded text-xs" style={{
                    backgroundColor: colors.statusBg,
                    color: colors.statusText
                  }}>
                    <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                    {formatPercentage(percentage)} of budget used
                  </div>
                )}

                {/* Period Info */}
                {budget.startDate && budget.endDate && (
                  <div className="mt-3 flex items-center space-x-2 text-xs" style={{
                    color: 'var(--text-secondary)'
                  }}>
                    <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3" />
                    <span>
                      {new Date(budget.startDate).toLocaleDateString()} - {new Date(budget.endDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default BudgetProgress;