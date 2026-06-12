import React from 'react';

const BudgetSummaryStats = ({ healthy, warning, exceeded }) => (
  <div className="grid grid-cols-3 gap-4">
    <div className="text-center p-3 rounded-lg border" style={{
      backgroundColor: 'var(--success-bg)',
      borderColor: 'var(--success-border)'
    }}>
      <div className="text-lg font-bold" style={{ color: 'var(--success)' }}>{healthy}</div>
      <div className="text-xs" style={{ color: 'var(--success)' }}>Healthy</div>
    </div>
    <div className="text-center p-3 rounded-lg border" style={{
      backgroundColor: 'var(--warning-bg)',
      borderColor: 'var(--warning-border)'
    }}>
      <div className="text-lg font-bold" style={{ color: 'var(--warning)' }}>{warning}</div>
      <div className="text-xs" style={{ color: 'var(--warning)' }}>Near Limit</div>
    </div>
    <div className="text-center p-3 rounded-lg border" style={{
      backgroundColor: 'var(--error-bg)',
      borderColor: 'var(--error-border)'
    }}>
      <div className="text-lg font-bold" style={{ color: 'var(--error)' }}>{exceeded}</div>
      <div className="text-xs" style={{ color: 'var(--error)' }}>Exceeded</div>
    </div>
  </div>
);

export default BudgetSummaryStats;
