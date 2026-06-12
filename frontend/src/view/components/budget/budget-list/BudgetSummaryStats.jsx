import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const BudgetSummaryStats = ({ budgets }) => {
  const stats = [
    {
      label: 'Total Budgets',
      value: budgets.length,
      icon: faWallet,
      bgColor: 'var(--info-bg)',
      textColor: 'var(--info)',
      borderColor: 'var(--info-border)'
    },
    {
      label: 'Exceeded',
      value: budgets.filter(b => b.isOverBudget || b.utilizationPercentage > 100).length,
      icon: faExclamationTriangle,
      bgColor: 'var(--error-bg)',
      textColor: 'var(--error)',
      borderColor: 'var(--error-border)'
    },
    {
      label: 'Near Limit',
      value: budgets.filter(b =>
        (b.isNearLimit || b.utilizationPercentage >= 80) &&
        !(b.isOverBudget || b.utilizationPercentage > 100)
      ).length,
      icon: faExclamationTriangle,
      bgColor: 'var(--warning-bg)',
      textColor: 'var(--warning)',
      borderColor: 'var(--warning-border)'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="p-4 rounded-lg border" style={{
          backgroundColor: stat.bgColor,
          borderColor: stat.borderColor
        }}>
          <div className="flex items-center space-x-2 mb-2">
            <FontAwesomeIcon
              icon={stat.icon}
              className="w-4 h-4"
              style={{ color: stat.textColor }}
            />
            <span className="text-sm font-medium" style={{ color: stat.textColor }}>
              {stat.label}
            </span>
          </div>
          <div className="text-2xl font-bold" style={{ color: stat.textColor }}>
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BudgetSummaryStats;
