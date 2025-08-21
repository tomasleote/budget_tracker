import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeartbeat,
  faCircleCheck,
  faExclamationTriangle,
  faTimesCircle,
  faInfoCircle,
  faLightbulb
} from '@fortawesome/free-solid-svg-icons';
import Card from '../../ui/Card';

const FinancialHealthWidget = ({ 
  financialHealth = {},
  quickStats = {},
  isLoading = false,
  className = ''
}) => {
  if (isLoading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  // Default values
  const score = financialHealth.score || 0;
  const grade = financialHealth.grade || 'F';
  const recommendations = financialHealth.recommendations || [];

  // Calculate health status
  const getHealthStatus = (score) => {
    if (score >= 80) return { status: 'excellent', color: 'green', icon: faCircleCheck };
    if (score >= 60) return { status: 'good', color: 'blue', icon: faInfoCircle };
    if (score >= 40) return { status: 'warning', color: 'yellow', icon: faExclamationTriangle };
    return { status: 'poor', color: 'red', icon: faTimesCircle };
  };

  const healthStatus = getHealthStatus(score);

  // Generate health insights based on available data
  const generateInsights = () => {
    const insights = [];
    
    // Savings rate insight
    const savingsRate = quickStats.savingsRate?.percentage || 0;
    if (savingsRate < 10) {
      insights.push({
        type: 'warning',
        icon: faExclamationTriangle,
        text: 'Low savings rate - aim for 20% or higher'
      });
    } else if (savingsRate >= 20) {
      insights.push({
        type: 'success',
        icon: faCircleCheck,
        text: 'Excellent savings rate!'
      });
    }

    // Budget status insight
    const budgetStatus = quickStats.budgetStatus || {};
    if (budgetStatus.hasIssues) {
      insights.push({
        type: 'warning',
        icon: faExclamationTriangle,
        text: `${budgetStatus.alerts} budget alert${budgetStatus.alerts > 1 ? 's' : ''} need attention`
      });
    }

    // Balance insight
    const balance = quickStats.balance || {};
    if (!balance.isPositive) {
      insights.push({
        type: 'error',
        icon: faTimesCircle,
        text: 'Negative balance - consider reducing expenses'
      });
    }

    // Add default insights if none generated
    if (insights.length === 0) {
      insights.push({
        type: 'info',
        icon: faInfoCircle,
        text: 'Keep tracking your finances for better insights'
      });
    }

    return insights.slice(0, 3); // Limit to 3 insights
  };

  const insights = recommendations.length > 0 ? 
    recommendations.slice(0, 3).map(rec => ({
      type: rec.type || 'info',
      icon: faLightbulb,
      text: rec.message || rec.text || rec
    })) : 
    generateInsights();

  return (
    <Card 
      title="Financial Health" 
      className={className}
      headerAction={
        <FontAwesomeIcon 
          icon={faHeartbeat} 
          className="text-gray-400" 
        />
      }
    >
      <div className="space-y-4">
        {/* Health Score */}
        <div className="flex items-center space-x-4">
          {/* Score Circle */}
          <div className={`relative w-16 h-16 rounded-full flex items-center justify-center ${
            healthStatus.color === 'green' ? 'bg-green-100' :
            healthStatus.color === 'blue' ? 'bg-blue-100' :
            healthStatus.color === 'yellow' ? 'bg-yellow-100' :
            'bg-red-100'
          }`}>
            <FontAwesomeIcon 
              icon={healthStatus.icon}
              className={`text-lg ${
                healthStatus.color === 'green' ? 'text-green-600' :
                healthStatus.color === 'blue' ? 'text-blue-600' :
                healthStatus.color === 'yellow' ? 'text-yellow-600' :
                'text-red-600'
              }`}
            />
            
            {/* Score Badge */}
            <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
              healthStatus.color === 'green' ? 'bg-green-600' :
              healthStatus.color === 'blue' ? 'bg-blue-600' :
              healthStatus.color === 'yellow' ? 'bg-yellow-600' :
              'bg-red-600'
            }`}>
              {grade}
            </div>
          </div>
          
          {/* Score Details */}
          <div className="flex-1">
            <div className="text-2xl font-bold text-gray-900">
              {score}/100
            </div>
            <div className={`text-sm font-medium capitalize ${
              healthStatus.color === 'green' ? 'text-green-600' :
              healthStatus.color === 'blue' ? 'text-blue-600' :
              healthStatus.color === 'yellow' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {healthStatus.status} Health
            </div>
            <div className="text-xs text-gray-500">
              Grade {grade} Financial Score
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Poor</span>
            <span>Excellent</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                healthStatus.color === 'green' ? 'bg-green-600' :
                healthStatus.color === 'blue' ? 'bg-blue-600' :
                healthStatus.color === 'yellow' ? 'bg-yellow-600' :
                'bg-red-600'
              }`}
              style={{ width: `${Math.max(score, 5)}%` }}
            ></div>
          </div>
        </div>

        {/* Health Insights */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-900 flex items-center space-x-2">
            <FontAwesomeIcon icon={faLightbulb} className="text-yellow-500" />
            <span>Key Insights</span>
          </div>
          
          <div className="space-y-2">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-2 p-2 rounded-lg bg-gray-50">
                <FontAwesomeIcon 
                  icon={insight.icon}
                  className={`text-xs mt-0.5 ${
                    insight.type === 'success' ? 'text-green-600' :
                    insight.type === 'warning' ? 'text-yellow-600' :
                    insight.type === 'error' ? 'text-red-600' :
                    'text-blue-600'
                  }`}
                />
                <span className="text-xs text-gray-700 leading-relaxed">
                  {insight.text}
                </span>
              </div>
            ))}
          </div>
        </div>


      </div>
    </Card>
  );
};

export default FinancialHealthWidget;
