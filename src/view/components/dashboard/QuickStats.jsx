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
    if (trend === 'stable') return 'var(--text-tertiary)';
    if (trend === 'up') return isPositiveGood ? 'var(--success)' : 'var(--error)';
    if (trend === 'down') return isPositiveGood ? 'var(--error)' : 'var(--success)';
    return 'var(--text-tertiary)';
  };

  if (isLoading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <div className="space-y-4">
          <div className="h-6 rounded w-1/3" style={{
            backgroundColor: 'var(--bg-tertiary)'
          }}></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-12 rounded" style={{
                  backgroundColor: 'var(--bg-tertiary)'
                }}></div>
                <div className="h-4 rounded w-3/4" style={{
                  backgroundColor: 'var(--bg-tertiary)'
                }}></div>
                <div className="h-3 rounded w-1/2" style={{
                  backgroundColor: 'var(--bg-tertiary)'
                }}></div>
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
      iconColor: quickStats.balance?.isPositive ? 'var(--success)' : 'var(--error)',
      bgColor: quickStats.balance?.isPositive ? 'var(--success-bg)' : 'var(--error-bg)',
      trend: quickStats.balance?.trend || 'stable',
      trendIcon: getTrendIcon(quickStats.balance?.trend)
    },
    {
      id: 'income',
      title: 'Monthly Income',
      value: quickStats.monthlyIncome?.formatted || formatCurrency(0),
      subValue: 'This Month',
      icon: faArrowUp,
      iconColor: 'var(--success)',
      bgColor: 'var(--success-bg)',
      trend: quickStats.monthlyIncome?.trend || 'stable',
      trendIcon: getTrendIcon(quickStats.monthlyIncome?.trend)
    },
    {
      id: 'expenses',
      title: 'Monthly Expenses',
      value: quickStats.monthlyExpenses?.formatted || formatCurrency(0),
      subValue: 'This Month',
      icon: faArrowDown,
      iconColor: 'var(--error)',
      bgColor: 'var(--error-bg)',
      trend: quickStats.monthlyExpenses?.trend || 'stable',
      trendIcon: getTrendIcon(quickStats.monthlyExpenses?.trend)
    },
    {
      id: 'savings',
      title: 'Savings Rate',
      value: quickStats.savingsRate?.formatted || '0%',
      subValue: quickStats.savingsRate?.status || 'poor',
      icon: faPiggyBank,
      iconColor: quickStats.savingsRate?.percentage >= 20 ? 'var(--success)' : 
                 quickStats.savingsRate?.percentage >= 10 ? 'var(--warning)' : 'var(--error)',
      bgColor: quickStats.savingsRate?.percentage >= 20 ? 'var(--success-bg)' : 
               quickStats.savingsRate?.percentage >= 10 ? 'var(--warning-bg)' : 'var(--error-bg)',
      trend: 'stable',
      trendIcon: faEquals
    }
  ];

  return (
    <Card 
      title="Quick Stats" 
      className={className}
      headerAction={
        <div className="text-sm" style={{
          color: 'var(--text-secondary)'
        }}>
          Financial Overview
        </div>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.id} className="text-center p-4 rounded-lg border transition-colors" style={{
            borderColor: 'var(--border-primary)',
            '&:hover': {
              borderColor: 'var(--border-secondary)'
            }
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = 'var(--border-secondary)';
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = 'var(--border-primary)';
          }}>
            {/* Icon */}
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{
              backgroundColor: stat.bgColor
            }}>
              <FontAwesomeIcon 
                icon={stat.icon} 
                className="text-lg" 
                style={{ color: stat.iconColor }}
              />
            </div>
            
            {/* Value */}
            <div className="space-y-1">
              <div className="text-lg font-semibold" style={{
                color: 'var(--text-primary)'
              }}>
                {stat.value}
              </div>
              <div className="text-sm" style={{
                color: 'var(--text-secondary)'
              }}>
                {stat.title}
              </div>
              <div className="flex items-center justify-center space-x-1">
                <span className="text-xs font-medium capitalize" style={{
                  color: stat.id === 'savings' ? 
                    (quickStats.savingsRate?.percentage >= 20 ? 'var(--success)' : 
                     quickStats.savingsRate?.percentage >= 10 ? 'var(--warning)' : 'var(--error)') :
                    'var(--text-secondary)'
                }}>
                  {stat.subValue}
                </span>
                {stat.trend !== 'stable' && (
                  <FontAwesomeIcon 
                    icon={stat.trendIcon} 
                    className="text-xs" 
                    style={{ color: getTrendColor(stat.trend, stat.id !== 'expenses') }}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Financial Health Summary */}
      {financialHealth && (
        <div className="mt-6 pt-6" style={{
          borderTop: '1px solid var(--border-primary)'
        }}>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm" style={{
                color: 'var(--text-secondary)'
              }}>Financial Health Score:</span>
              <span className="ml-2 text-lg font-semibold" style={{
                color: 'var(--text-primary)'
              }}>
                {financialHealth.formattedScore || '0/100'}
              </span>
              <span className="ml-2 text-sm font-medium" style={{
                color: financialHealth.score >= 80 ? 'var(--success)' :
                       financialHealth.score >= 60 ? 'var(--warning)' : 'var(--error)'
              }}>
                Grade {financialHealth.grade || 'F'}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{
              backgroundColor: financialHealth.score >= 80 ? 'var(--success-bg)' :
                               financialHealth.score >= 60 ? 'var(--warning-bg)' : 'var(--error-bg)'
            }}>
              <FontAwesomeIcon 
                icon={financialHealth.statusIcon || faWallet} 
                className="text-sm" 
                style={{
                  color: financialHealth.score >= 80 ? 'var(--success)' :
                         financialHealth.score >= 60 ? 'var(--warning)' : 'var(--error)'
                }}
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default QuickStats;
