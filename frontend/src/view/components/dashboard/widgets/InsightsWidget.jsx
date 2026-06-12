import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb } from '@fortawesome/free-solid-svg-icons';
import Card from '../../ui/Card';
import generateInsights from './insights/generateInsights';
import InsightCard from './insights/InsightCard';
import InsightSummary from './insights/InsightSummary';

const InsightsWidget = ({
  quickStats = {},
  financialHealth = {},
  utils = {},
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
              <div key={i} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full mt-1"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const insights = generateInsights({ quickStats, financialHealth, utils });

  return (
    <Card
      title="Smart Insights"
      className={className}
      headerAction={
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {insights.length} insight{insights.length !== 1 ? 's' : ''}
          </span>
          <FontAwesomeIcon icon={faLightbulb} className="text-yellow-500" />
        </div>
      }
    >
      <div className="space-y-4">
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <InsightCard key={index} insight={insight} />
          ))}
        </div>
        <InsightSummary insights={insights} />
      </div>
    </Card>
  );
};

export default InsightsWidget;
