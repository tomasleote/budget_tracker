import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWallet,
  faArrowUp,
  faArrowDown,
  faArrowTrendUp,
  faArrowTrendDown,
  faEquals,
  faPiggyBank
} from '@fortawesome/free-solid-svg-icons';
import Card from '../ui/Card';

const QuickStats = ({ 
  quickStats = {},
  financialHealth = {},
  isLoading = false,
  className = ''
}) => {
  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Helper function to get trend icon
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return faArrowTrendUp;
      case 'down': return faArrowTrendDown;
      default: return faEquals;
    }
  };

  // Helper function to get trend color
  const getTrendColor = (trend, isPositiveGood = true) => {
    if (trend === 'stable') return 'text-gray-500';
    if (trend === 'up') return isPositiveGood ? 'text-green-600' : 'text-red-600';
    if (trend === 'down') return isPositiveGood ? 'text-red-600' : 'text-green-600';
    return 'text-gray-500';
  };

  if (isLoading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const stats = [
    {
      id: 'balance',
      title: 'Current Balance',
      value: quickStats.balance?.formatted || formatCurrency(0),
      subValue: quickStats.balance?.isPositive ? 'Positive' : 'Negative',
      icon: faWallet,
      iconColor: quickStats.balance?.isPositive ? 'text-green-600' : 'text-red-600',
      bgColor: quickStats.balance?.isPositive ? 'bg-green-100' : 'bg-red-100',
      trend: quickStats.balance?.trend || 'stable',
      trendIcon: getTrendIcon(quickStats.balance?.trend)
    },
    {
      id: 'income',
      title: 'Monthly Income',
      value: quickStats.monthlyIncome?.formatted || formatCurrency(0),
      subValue: 'This Month',
      icon: faArrowUp,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: quickStats.monthlyIncome?.trend || 'stable',
      trendIcon: getTrendIcon(quickStats.monthlyIncome?.trend)
    },
    {
      id: 'expenses',
      title: 'Monthly Expenses',
      value: quickStats.monthlyExpenses?.formatted || formatCurrency(0),
      subValue: 'This Month',
      icon: faArrowDown,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-100',
      trend: quickStats.monthlyExpenses?.trend || 'stable',
      trendIcon: getTrendIcon(quickStats.monthlyExpenses?.trend)
    },
    {
      id: 'savings',
      title: 'Savings Rate',
      value: quickStats.savingsRate?.formatted || '0%',
      subValue: quickStats.savingsRate?.status || 'poor',
      icon: faPiggyBank,
      iconColor: quickStats.savingsRate?.percentage >= 20 ? 'text-green-600' : 
                 quickStats.savingsRate?.percentage >= 10 ? 'text-yellow-600' : 'text-red-600',
      bgColor: quickStats.savingsRate?.percentage >= 20 ? 'bg-green-100' : 
               quickStats.savingsRate?.percentage >= 10 ? 'bg-yellow-100' : 'bg-red-100',
      trend: 'stable',
      trendIcon: faEquals
    }
  ];

  return (
    <Card 
      title="Quick Stats" 
      className={className}
      headerAction={
        <div className="text-sm text-gray-500">
          Financial Overview
        </div>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.id} className="text-center p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
            {/* Icon */}
            <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center mx-auto mb-3`}>
              <FontAwesomeIcon 
                icon={stat.icon} 
                className={`text-lg ${stat.iconColor}`} 
              />
            </div>
            
            {/* Value */}
            <div className="space-y-1">
              <div className="text-lg font-semibold text-gray-900">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">
                {stat.title}
              </div>
              <div className="flex items-center justify-center space-x-1">
                <span className={`text-xs font-medium capitalize ${
                  stat.id === 'savings' ? 
                    (quickStats.savingsRate?.percentage >= 20 ? 'text-green-600' : 
                     quickStats.savingsRate?.percentage >= 10 ? 'text-yellow-600' : 'text-red-600') :
                    'text-gray-500'
                }`}>
                  {stat.subValue}
                </span>
                {stat.trend !== 'stable' && (
                  <FontAwesomeIcon 
                    icon={stat.trendIcon} 
                    className={`text-xs ${getTrendColor(stat.trend, stat.id !== 'expenses')}`} 
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Financial Health Summary */}
      {financialHealth && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-600">Financial Health Score:</span>
              <span className="ml-2 text-lg font-semibold text-gray-900">
                {financialHealth.formattedScore || '0/100'}
              </span>
              <span className={`ml-2 text-sm font-medium ${
                financialHealth.score >= 80 ? 'text-green-600' :
                financialHealth.score >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                Grade {financialHealth.grade || 'F'}
              </span>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              financialHealth.score >= 80 ? 'bg-green-100' :
              financialHealth.score >= 60 ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <FontAwesomeIcon 
                icon={financialHealth.statusIcon || faWallet} 
                className={`text-sm ${
                  financialHealth.score >= 80 ? 'text-green-600' :
                  financialHealth.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`} 
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default QuickStats;
