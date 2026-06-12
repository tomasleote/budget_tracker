import React from 'react';
import Card from '../../components/ui/Card';

const BudgetAnalyticsCard = ({ analytics }) => {
  if (!analytics) return null;

  return (
    <Card title="Budget Analytics">
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--accent-primary)' }}>
              {analytics.formattedTotalBudget}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Budget Amount</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--error)' }}>
              {analytics.formattedTotalSpent}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Spent</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {analytics.formattedUtilization}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Overall Utilization</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BudgetAnalyticsCard;
