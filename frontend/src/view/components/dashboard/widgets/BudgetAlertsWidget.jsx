import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faExclamationTriangle,
  faTimesCircle,
  faCheckCircle,
  faInfoCircle,
  faWallet,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import Card from '../../ui/Card';
import Button from '../../ui/Button';

const BudgetAlertsWidget = ({ 
  budgetOverview = [],
  quickStats = {},
  isLoading = false,
  className = ''
}) => {
  if (isLoading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  // Generate alerts from budget overview
  const generateAlerts = () => {
    const alerts = [];
    
    budgetOverview.forEach(budget => {
      if (budget.isExceeded) {
        alerts.push({
          id: budget.id,
          type: 'exceeded',
          severity: 'error',
          icon: faTimesCircle,
          title: `${budget.category} Budget Exceeded`,
          message: `Spent ${budget.formattedSpent} of ${budget.formattedBudget}`,
          percentage: budget.progressPercentage,
          action: 'Review Spending'
        });
      } else if (budget.isNearLimit) {
        alerts.push({
          id: budget.id,
          type: 'warning',
          severity: 'warning',
          icon: faExclamationTriangle,
          title: `${budget.category} Near Limit`,
          message: `${budget.formattedRemaining} remaining`,
          percentage: budget.progressPercentage,
          action: 'Monitor Closely'
        });
      }
    });

    // Add budget status summary
    const budgetStatus = quickStats.budgetStatus || {};
    if (budgetStatus.total === 0) {
      alerts.unshift({
        id: 'no-budgets',
        type: 'info',
        severity: 'info',
        icon: faInfoCircle,
        title: 'No Budgets Set',
        message: 'Create budgets to track spending',
        action: 'Create Budget'
      });
    }

    return alerts.slice(0, 4); // Limit to 4 alerts
  };

  const alerts = generateAlerts();
  const budgetStatus = quickStats.budgetStatus || {};

  // Get alert summary
  const getAlertSummary = () => {
    if (alerts.length === 0) {
      return {
        icon: faCheckCircle,
        color: 'green',
        title: 'All Good!',
        message: 'No budget alerts'
      };
    }

    const exceededCount = alerts.filter(a => a.type === 'exceeded').length;
    const warningCount = alerts.filter(a => a.type === 'warning').length;

    if (exceededCount > 0) {
      return {
        icon: faTimesCircle,
        color: 'red',
        title: `${exceededCount} Budget${exceededCount > 1 ? 's' : ''} Exceeded`,
        message: `${warningCount} more near limit`
      };
    }

    if (warningCount > 0) {
      return {
        icon: faExclamationTriangle,
        color: 'yellow',
        title: `${warningCount} Budget${warningCount > 1 ? 's' : ''} Near Limit`,
        message: 'Monitor spending closely'
      };
    }

    return {
      icon: faCheckCircle,
      color: 'green',
      title: 'Budgets On Track',
      message: 'All budgets within limits'
    };
  };

  const summary = getAlertSummary();

  return (
    <Card 
      title="Budget Alerts" 
      className={className}
      headerAction={
        <div className="flex items-center space-x-2">
          {budgetStatus.alerts > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {budgetStatus.alerts}
            </span>
          )}
          <FontAwesomeIcon 
            icon={faBell} 
            className="text-gray-400" 
          />
        </div>
      }
    >
      <div className="space-y-4">
        {/* Alert Summary */}
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            summary.color === 'green' ? 'bg-green-100' :
            summary.color === 'yellow' ? 'bg-yellow-100' :
            'bg-red-100'
          }`}>
            <FontAwesomeIcon 
              icon={summary.icon}
              className={`text-sm ${
                summary.color === 'green' ? 'text-green-600' :
                summary.color === 'yellow' ? 'text-yellow-600' :
                'text-red-600'
              }`}
            />
          </div>
          
          <div className="flex-1">
            <div className="font-medium text-gray-900">
              {summary.title}
            </div>
            <div className="text-sm text-gray-500">
              {summary.message}
            </div>
          </div>
        </div>

        {/* Alert List */}
        {alerts.length > 0 ? (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <FontAwesomeIcon 
                  icon={alert.icon}
                  className={`text-sm ${
                    alert.severity === 'error' ? 'text-red-600' :
                    alert.severity === 'warning' ? 'text-yellow-600' :
                    alert.severity === 'info' ? 'text-blue-600' :
                    'text-gray-600'
                  }`}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {alert.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {alert.message}
                  </div>
                  {alert.percentage && (
                    <div className="mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className={`h-1 rounded-full ${
                            alert.severity === 'error' ? 'bg-red-600' :
                            alert.severity === 'warning' ? 'bg-yellow-600' :
                            'bg-blue-600'
                          }`}
                          style={{ width: `${Math.min(alert.percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <FontAwesomeIcon 
              icon={faCheckCircle} 
              className="text-2xl text-green-600 mb-2" 
            />
            <div className="text-sm text-gray-500">
              All budgets are within their limits
            </div>
          </div>
        )}

        {/* Budget Summary Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {budgetStatus.total || 0}
            </div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {budgetStatus.active || 0}
            </div>
            <div className="text-xs text-gray-500">Active</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-semibold ${
              budgetStatus.alerts > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {budgetStatus.alerts || 0}
            </div>
            <div className="text-xs text-gray-500">Alerts</div>
          </div>
        </div>


      </div>
    </Card>
  );
};

export default BudgetAlertsWidget;
