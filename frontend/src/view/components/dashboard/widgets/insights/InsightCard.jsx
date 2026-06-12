import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import getInsightStyling from './getInsightStyling';

const InsightCard = ({ insight }) => {
  const styling = getInsightStyling(insight.type);
  return (
    <div className={`p-3 rounded-lg border ${styling.bgColor} ${styling.borderColor} hover:shadow-sm transition-shadow`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <FontAwesomeIcon icon={insight.icon} className={`text-sm ${styling.iconColor} mt-0.5`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-medium ${styling.titleColor} mb-1`}>
            {insight.title}
          </div>
          <div className="text-sm text-gray-700 mb-2">
            {insight.message}
          </div>
          {insight.action && (
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-600 italic">
                💡 {insight.action}
              </div>
              {insight.priority === 'high' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  High Priority
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsightCard;
