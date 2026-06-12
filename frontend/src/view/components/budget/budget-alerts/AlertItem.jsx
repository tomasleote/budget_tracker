import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faWallet,
  faCalendarAlt,
  faTag
} from '@fortawesome/free-solid-svg-icons';
import Button from '../../ui/Button';
import { formatCurrency, formatPercentage, formatDate } from '../../../../controller/utils/formatters';
import { getAlertStyling, getDefaultAlertTitle, getDefaultAlertMessage } from './alertHelpers';

const AlertItem = ({ alert, onAlertClick, onDismissAlert, onViewBudget }) => {
  const styling = getAlertStyling(alert.severity);

  return (
    <div
      className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${styling.bgColor} ${styling.borderColor} ${alert.dismissed ? 'opacity-60' : ''}`}
      onClick={() => onAlertClick(alert)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <FontAwesomeIcon icon={styling.icon} className={`w-5 h-5 ${styling.iconColor}`} />
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

        {!alert.dismissed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onDismissAlert(alert.id); }}
            className="text-gray-400 hover:text-gray-600"
          >
            <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faTag} className="text-gray-500 w-3 h-3" />
            <span className="text-gray-600">Budget:</span>
            <span className="font-medium text-gray-900">{alert.categoryName || alert.category}</span>
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

        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3" />
          <span>{alert.createdAt ? formatDate(alert.createdAt) : 'Recently'}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center space-x-3">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => { e.stopPropagation(); onViewBudget(alert.budgetId || alert.category); }}
          icon={faWallet}
        >
          View Budget
        </Button>
      </div>
    </div>
  );
};

export default AlertItem;
