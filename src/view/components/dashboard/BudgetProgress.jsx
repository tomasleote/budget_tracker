import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faWallet,
  faExclamationTriangle,
  faCheckCircle,
  faTimesCircle,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import Card from '../ui/Card';

const BudgetProgress = ({ 
  budgetOverview = [],
  isLoading = false,
  className = '',
  onCreateBudget = () => {},
  onViewAllBudgets = () => window.location.href = '/budget',
  showCreateButton = true
}) => {
  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Helper function to get status color and icon
  const getStatusInfo = (percentage, isExceeded) => {
    if (isExceeded || percentage > 100) {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        progressColor: 'bg-red-500',
        icon: faTimesCircle,
        label: 'Over Budget'
      };
    } else if (percentage >= 90) {
      return {
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        progressColor: 'bg-orange-500',
        icon: faExclamationTriangle,
        label: 'Critical'
      };
    } else if (percentage >= 75) {
      return {
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        progressColor: 'bg-yellow-500',
        icon: faExclamationTriangle,
        label: 'Warning'
      };
    } else {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        progressColor: 'bg-green-500',
        icon: faCheckCircle,
        label: 'On Track'
      };
    }
  };

  if (isLoading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                </div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  // Show empty state if no budgets
  if (!budgetOverview || budgetOverview.length === 0) {
    return (
      <Card 
        title="Budget Progress" 
        className={className}
        headerAction={
          <FontAwesomeIcon 
            icon={faWallet} 
            className="text-gray-400" 
          />
        }
      >
        <div className="text-center py-8">
          <FontAwesomeIcon 
            icon={faInfoCircle} 
            className="text-gray-400 text-3xl mb-4" 
          />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Budgets Yet</h3>
          <p className="text-gray-500 mb-4">Create your first budget to track spending</p>
          {showCreateButton && (
            <button 
              onClick={onCreateBudget}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Create Budget
            </button>
          )}
        </div>
      </Card>
    );
  }

  // Calculate summary stats
  const totalBudgets = budgetOverview.length;
  const exceededBudgets = budgetOverview.filter(b => {
    const percentage = b.progressPercentage || (b.spent / b.budgetAmount * 100);
    return percentage > 100;
  }).length;
  const onTrackBudgets = budgetOverview.filter(b => {
    const percentage = b.progressPercentage || (b.spent / b.budgetAmount * 100);
    return percentage <= 75;
  }).length;

  return (
    <Card 
      title="Budget Progress" 
      className={className}
      headerAction={
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            {totalBudgets} Budget{totalBudgets !== 1 ? 's' : ''}
          </div>
          <FontAwesomeIcon 
            icon={faWallet} 
            className="text-gray-400" 
          />
        </div>
      }
    >
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{onTrackBudgets}</div>
            <div className="text-xs text-gray-500">On Track</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {totalBudgets - onTrackBudgets - exceededBudgets}
            </div>
            <div className="text-xs text-gray-500">At Risk</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{exceededBudgets}</div>
            <div className="text-xs text-gray-500">Over Budget</div>
          </div>
        </div>

        {/* Budget List with Scrollbar - Show ALL budgets */}
        <div className="space-y-4 max-h-[28rem] overflow-y-auto pr-2">
          {budgetOverview.map((budget, index) => {
            // Calculate percentage - use provided or calculate from amounts
            const percentage = budget.progressPercentage || 
              (budget.spent && budget.budgetAmount ? (budget.spent / budget.budgetAmount * 100) : 0);
            const isExceeded = percentage > 100;
            const statusInfo = getStatusInfo(percentage, isExceeded);
            
            // Format amounts with fallbacks
            const formattedBudget = budget.formattedBudget || formatCurrency(budget.budgetAmount);
            const formattedSpent = budget.formattedSpent || formatCurrency(budget.spent);
            const formattedRemaining = budget.formattedRemaining || 
              formatCurrency(Math.max(0, (budget.budgetAmount || 0) - (budget.spent || 0)));

            return (
              <div 
                key={budget.id || index} 
                className={`p-4 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor}`}
              >
                {/* Budget Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <FontAwesomeIcon 
                      icon={statusInfo.icon} 
                      className={`${statusInfo.color} text-sm mr-2`} 
                    />
                    <span className="font-medium text-gray-900">
                      {budget.category || 'Unknown Category'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.bgColor} ${statusInfo.color} border ${statusInfo.borderColor}`}>
                      {statusInfo.label}
                    </span>
                    <span className="text-sm font-medium text-gray-600">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${statusInfo.progressColor}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Budget Details */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Spent</div>
                    <div className="font-medium text-gray-900">{formattedSpent}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Budget</div>
                    <div className="font-medium text-gray-900">{formattedBudget}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">
                      {isExceeded ? 'Over' : 'Remaining'}
                    </div>
                    <div className={`font-medium ${isExceeded ? 'text-red-600' : 'text-green-600'}`}>
                      {isExceeded 
                        ? formatCurrency((budget.spent || 0) - (budget.budgetAmount || 0))
                        : formattedRemaining
                      }
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation to Budget Page */}
        {budgetOverview.length > 3 && (
          <div className="text-center">
            <button 
              onClick={onViewAllBudgets}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
            >
              Manage All {budgetOverview.length} Budgets
            </button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default BudgetProgress;
