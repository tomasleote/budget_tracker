import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLightbulb,
  faArrowTrendUp,
  faArrowTrendDown,
  faExclamationTriangle,
  faCheckCircle,
  faInfoCircle,
  faArrowRight,
  faChartLine,
  faPiggyBank,
  faWallet
} from '@fortawesome/free-solid-svg-icons';
import Card from '../../ui/Card';

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

  // Generate smart insights based on financial data
  const generateInsights = () => {
    const insights = [];
    
    // Get financial insights from utils if available
    if (utils.getFinancialInsights && typeof utils.getFinancialInsights === 'function') {
      const utilInsights = utils.getFinancialInsights();
      insights.push(...utilInsights);
    }

    // Savings Rate Analysis
    const savingsRate = quickStats.savingsRate?.percentage || 0;
    if (savingsRate < 5) {
      insights.push({
        type: 'critical',
        icon: faExclamationTriangle,
        title: 'Critical Savings Rate',
        message: 'Your savings rate is very low. Try to save at least 10% of your income.',
        action: 'Review your budget and find areas to reduce spending',
        priority: 'high'
      });
    } else if (savingsRate < 15) {
      insights.push({
        type: 'warning',
        icon: faPiggyBank,
        title: 'Improve Savings Rate',
        message: `Current savings rate: ${quickStats.savingsRate?.formatted}. Aim for 20% or higher.`,
        action: 'Identify unnecessary expenses to increase savings',
        priority: 'medium'
      });
    } else if (savingsRate >= 20) {
      insights.push({
        type: 'success',
        icon: faCheckCircle,
        title: 'Excellent Savings Rate!',
        message: `Great job! You're saving ${quickStats.savingsRate?.formatted} of your income.`,
        action: 'Consider investing your surplus savings',
        priority: 'low'
      });
    }

    // Balance Analysis
    const balance = quickStats.balance || {};
    if (!balance.isPositive) {
      insights.push({
        type: 'critical',
        icon: faExclamationTriangle,
        title: 'Negative Balance Alert',
        message: `Your current balance is ${balance.formatted}. Immediate action needed.`,
        action: 'Reduce expenses or increase income urgently',
        priority: 'high'
      });
    } else if (balance.amount < 1000) {
      insights.push({
        type: 'warning',
        icon: faWallet,
        title: 'Low Emergency Fund',
        message: 'Consider building an emergency fund of 3-6 months of expenses.',
        action: 'Set up automatic savings to build your emergency fund',
        priority: 'medium'
      });
    }

    // Budget Status Analysis
    const budgetStatus = quickStats.budgetStatus || {};
    if (budgetStatus.hasIssues && budgetStatus.alerts > 0) {
      insights.push({
        type: 'warning',
        icon: faExclamationTriangle,
        title: 'Budget Alerts Active',
        message: `You have ${budgetStatus.alerts} budget alert${budgetStatus.alerts > 1 ? 's' : ''} requiring attention.`,
        action: 'Review and adjust your spending in flagged categories',
        priority: 'medium'
      });
    }

    // Spending Trend Analysis
    const spendingTrend = utils.getSpendingTrend ? utils.getSpendingTrend() : { trend: 'stable' };
    if (spendingTrend.trend === 'up' && spendingTrend.percentage > 10) {
      insights.push({
        type: 'warning',
        icon: faArrowTrendUp,
        title: 'Spending Increase Detected',
        message: `Your spending has increased by ${spendingTrend.percentage}% this month.`,
        action: 'Review recent transactions to identify the cause',
        priority: 'medium'
      });
    } else if (spendingTrend.trend === 'down') {
      insights.push({
        type: 'success',
        icon: faArrowTrendDown,
        title: 'Spending Reduction Success',
        message: 'Great job! Your spending has decreased compared to last month.',
        action: 'Keep up the good spending habits',
        priority: 'low'
      });
    }

    // Financial Health Analysis
    const healthScore = financialHealth.score || 0;
    if (healthScore < 40) {
      insights.push({
        type: 'critical',
        icon: faExclamationTriangle,
        title: 'Financial Health Needs Attention',
        message: `Your financial health score is ${healthScore}/100. Focus on basic financial stability.`,
        action: 'Start with budgeting and emergency fund building',
        priority: 'high'
      });
    } else if (healthScore >= 80) {
      insights.push({
        type: 'success',
        icon: faCheckCircle,
        title: 'Excellent Financial Health',
        message: `Outstanding! Your financial health score is ${healthScore}/100.`,
        action: 'Consider advanced investment strategies',
        priority: 'low'
      });
    }

    // Default insights if none generated
    if (insights.length === 0) {
      insights.push({
        type: 'info',
        icon: faInfoCircle,
        title: 'Keep Building Good Habits',
        message: 'Continue tracking your finances to get personalized insights.',
        action: 'Add more transactions to improve recommendations',
        priority: 'low'
      });
    }

    // Sort by priority and limit to top 4
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return insights
      .sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0))
      .slice(0, 4);
  };

  const insights = generateInsights();

  // Get insight type styling
  const getInsightStyling = (type) => {
    switch (type) {
      case 'critical':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          titleColor: 'text-red-900'
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-900'
        };
      case 'success':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          titleColor: 'text-green-900'
        };
      default:
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-900'
        };
    }
  };

  return (
    <Card 
      title="Smart Insights" 
      className={className}
      headerAction={
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {insights.length} insight{insights.length !== 1 ? 's' : ''}
          </span>
          <FontAwesomeIcon 
            icon={faLightbulb} 
            className="text-yellow-500" 
          />
        </div>
      }
    >
      <div className="space-y-4">
        {/* Insights List */}
        <div className="space-y-3">
          {insights.map((insight, index) => {
            const styling = getInsightStyling(insight.type);
            
            return (
              <div 
                key={index}
                className={`p-3 rounded-lg border ${styling.bgColor} ${styling.borderColor} hover:shadow-sm transition-shadow`}
              >
                <div className="flex items-start space-x-3">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <FontAwesomeIcon 
                      icon={insight.icon}
                      className={`text-sm ${styling.iconColor} mt-0.5`}
                    />
                  </div>
                  
                  {/* Content */}
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
          })}
        </div>

        {/* Insight Summary */}
        <div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-red-600">
                {insights.filter(i => i.priority === 'high').length}
              </div>
              <div className="text-xs text-gray-500">High Priority</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-yellow-600">
                {insights.filter(i => i.priority === 'medium').length}
              </div>
              <div className="text-xs text-gray-500">Medium</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">
                {insights.filter(i => i.type === 'success').length}
              </div>
              <div className="text-xs text-gray-500">Positive</div>
            </div>
          </div>
        </div>


      </div>
    </Card>
  );
};

export default InsightsWidget;
