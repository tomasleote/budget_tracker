import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faExclamationTriangle,
  faExclamationCircle,
  faInfoCircle,
  faBell,
  faTimes,
  faFilter,
  faCheckCircle,
  faWallet,
  faCalendarAlt,
  faTag
} from '@fortawesome/free-solid-svg-icons';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { formatCurrency, formatPercentage, formatDate } from '../../../controller/utils/formatters';

const BudgetAlerts = ({ 
  alerts = [],
  isLoading = false,
  onAlertClick = () => {},
  onDismissAlert = () => {},
  onViewBudget = () => {},
  className = ''
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState('all');

  // Handle loading state
  if (isLoading) {
    return (
      <Card className={className} title="Budget Alerts">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // Filter alerts by severity
  const filteredAlerts = selectedSeverity === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.severity === selectedSeverity);

  // Group alerts by severity
  const alertsBySeverity = {
    high: alerts.filter(a => a.severity === 'high'),
    medium: alerts.filter(a => a.severity === 'medium'),
    low: alerts.filter(a => a.severity === 'low')
  };

  // Get alert styling based on severity
  const getAlertStyling = (severity) => {
    switch (severity) {
      case 'high':
        return {
          icon: faExclamationTriangle,
          iconColor: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700',
          badgeColor: 'bg-red-100 text-red-800'
        };
      case 'medium':
        return {
          icon: faExclamationCircle,
          iconColor: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-700',
          badgeColor: 'bg-yellow-100 text-yellow-800'
        };
      case 'low':
        return {
          icon: faInfoCircle,
          iconColor: 'text-blue-500',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-700',
          badgeColor: 'bg-blue-100 text-blue-800'
        };
      default:
        return {
          icon: faInfoCircle,
          iconColor: 'text-gray-500',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-700',
          badgeColor: 'bg-gray-100 text-gray-800'
        };
    }
  };

  // Handle empty state
  if (!alerts || alerts.length === 0) {
    return (
      <Card className={className} title="Budget Alerts">
        <div className="text-center py-8">
          <FontAwesomeIcon 
            icon={faCheckCircle} 
            className="text-green-400 text-4xl mb-4" 
          />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            All Clear!
          </h3>
          <p className="text-gray-500">
            No budget alerts at the moment. Your budgets are on track.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className={className}
      title={
        <div className="flex items-center space-x-2">
          <FontAwesomeIcon icon={faBell} className="text-red-500" />
          <span>Budget Alerts</span>
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
            {alerts.length}
          </span>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Alert Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="text-lg font-bold text-red-600">{alertsBySeverity.high.length}</div>
            <div className="text-xs text-red-600">Critical</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-lg font-bold text-yellow-600">{alertsBySeverity.medium.length}</div>
            <div className="text-xs text-yellow-600">Warning</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-lg font-bold text-blue-600">{alertsBySeverity.low.length}</div>
            <div className="text-xs text-blue-600">Info</div>
          </div>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center space-x-2">
          <FontAwesomeIcon icon={faFilter} className="text-gray-400 w-4 h-4" />
          <span className="text-sm text-gray-600">Filter by severity:</span>
          <div className="flex space-x-2">
            {[
              { value: 'all', label: 'All', count: alerts.length },
              { value: 'high', label: 'Critical', count: alertsBySeverity.high.length },
              { value: 'medium', label: 'Warning', count: alertsBySeverity.medium.length },
              { value: 'low', label: 'Info', count: alertsBySeverity.low.length }
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelectedSeverity(filter.value)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  selectedSeverity === filter.value
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const styling = getAlertStyling(alert.severity);
            
            return (
              <div
                key={alert.id}
                className={`
                  p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md
                  ${styling.bgColor} ${styling.borderColor}
                  ${alert.dismissed ? 'opacity-60' : ''}
                `}
                onClick={() => onAlertClick(alert)}
              >
                {/* Alert Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <FontAwesomeIcon 
                      icon={styling.icon} 
                      className={`w-5 h-5 ${styling.iconColor}`} 
                    />
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-gray-900">
                          {alert.title || getDefaultAlertTitle(alert)}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${styling.badgeColor}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        {alert.dismissed && (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                            Dismissed
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${styling.textColor}`}>
                        {alert.message || getDefaultAlertMessage(alert)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!alert.dismissed && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDismissAlert(alert.id);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Alert Details */}
                <div className="space-y-2">
                  {/* Budget Info */}
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faTag} className="text-gray-500 w-3 h-3" />
                      <span className="text-gray-600">Budget:</span>
                      <span className="font-medium text-gray-900">
                        {alert.categoryName || alert.category}
                      </span>
                    </div>
                    
                    {alert.amount && (
                      <div className="flex items-center space-x-2">
                        <FontAwesomeIcon icon={faWallet} className="text-gray-500 w-3 h-3" />
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium text-gray-900">
                          {alert.formattedAmount || formatCurrency(alert.amount)}
                        </span>
                      </div>
                    )}
                    
                    {alert.percentage && (
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">Usage:</span>
                        <span className={`font-medium ${
                          alert.percentage > 100 ? 'text-red-600' : 
                          alert.percentage >= 80 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {alert.formattedPercentage || formatPercentage(alert.percentage)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3" />
                    <span>
                      {alert.createdAt ? formatDate(alert.createdAt) : 'Recently'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewBudget(alert.budgetId || alert.category);
                    }}
                    icon={faWallet}
                  >
                    View Budget
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* No filtered results */}
        {filteredAlerts.length === 0 && selectedSeverity !== 'all' && (
          <div className="text-center py-6">
            <FontAwesomeIcon 
              icon={faInfoCircle} 
              className="text-gray-400 text-3xl mb-3" 
            />
            <p className="text-gray-500">
              No {selectedSeverity} severity alerts found.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedSeverity('all')}
              className="mt-2"
            >
              Show All Alerts
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

// Helper functions for default alert content
const getDefaultAlertTitle = (alert) => {
  switch (alert.type) {
    case 'budget_exceeded':
      return 'Budget Exceeded';
    case 'budget_warning':
      return 'Budget Warning';
    case 'budget_info':
      return 'Budget Update';
    default:
      return 'Budget Alert';
  }
};

const getDefaultAlertMessage = (alert) => {
  if (alert.percentage > 100) {
    return `You've exceeded your ${alert.category} budget by ${formatPercentage(alert.percentage - 100)}.`;
  } else if (alert.percentage >= 80) {
    return `You've used ${formatPercentage(alert.percentage)} of your ${alert.category} budget.`;
  } else {
    return `Budget update for ${alert.category}.`;
  }
};

export default BudgetAlerts;