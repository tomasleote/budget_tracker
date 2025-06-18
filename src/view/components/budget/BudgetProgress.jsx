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
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
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
            className="text-gray-400 text-4xl mb-4" 
          />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Budgets Yet
          </h3>
          <p className="text-gray-500 mb-6">
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
        iconColor: 'text-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-700',
        progressColor: 'red'
      };
    } else if (isNearLimit) {
      return {
        status: 'warning',
        color: 'yellow',
        icon: faExclamationTriangle,
        iconColor: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-700',
        progressColor: 'yellow'
      };
    } else {
      return {
        status: 'good',
        color: 'green',
        icon: faCheckCircle,
        iconColor: 'text-green-500',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-700',
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
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-lg font-bold text-green-600">{healthyBudgets}</div>
            <div className="text-xs text-green-600">Healthy</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-lg font-bold text-yellow-600">{warningBudgets}</div>
            <div className="text-xs text-yellow-600">Near Limit</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="text-lg font-bold text-red-600">{exceededBudgets}</div>
            <div className="text-xs text-red-600">Exceeded</div>
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

            return (
              <div
                key={budget.id}
                onClick={() => onBudgetClick(budget)}
                className={`
                  p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md
                  ${statusInfo.bgColor} ${statusInfo.borderColor}
                `}
              >
                {/* Budget Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon 
                        icon={faTag} 
                        className="text-gray-500 w-4 h-4" 
                      />
                      <span className="font-medium text-gray-900">
                        {budget.categoryName || budget.category}
                      </span>
                    </div>
                    <FontAwesomeIcon 
                      icon={statusInfo.icon} 
                      className={`w-4 h-4 ${statusInfo.iconColor}`} 
                    />
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-gray-900">
                      {formatCurrency(budgetAmount)}
                    </div>
                    <div className="text-xs text-gray-500">
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
                        className="text-red-500 w-3 h-3" 
                      />
                      <span className="text-gray-600">Spent</span>
                    </div>
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(spent)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <FontAwesomeIcon 
                        icon={remaining >= 0 ? faArrowTrendDown : faExclamationTriangle} 
                        className={`w-3 h-3 ${remaining >= 0 ? 'text-green-500' : 'text-red-500'}`} 
                      />
                      <span className="text-gray-600">
                        {remaining >= 0 ? 'Remaining' : 'Over Budget'}
                      </span>
                    </div>
                    <div className={`font-semibold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs(remaining))}
                    </div>
                  </div>
                </div>

                {/* Status Message */}
                {statusInfo.status === 'exceeded' && (
                  <div className={`mt-3 p-2 rounded text-xs ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                    <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                    Budget exceeded by {formatCurrency(Math.abs(remaining))}
                  </div>
                )}
                
                {statusInfo.status === 'warning' && (
                  <div className={`mt-3 p-2 rounded text-xs ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                    <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                    {formatPercentage(percentage)} of budget used
                  </div>
                )}

                {/* Period Info */}
                {budget.startDate && budget.endDate && (
                  <div className="mt-3 flex items-center space-x-2 text-xs text-gray-500">
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