import React from 'react';
import Card from '../../ui/Card';

const BudgetListSkeleton = ({ className }) => (
  <Card className={className} title="Budget Management">
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="animate-pulse p-4 rounded-lg" style={{
          border: '1px solid var(--border-primary)'
        }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full" style={{
                backgroundColor: 'var(--bg-tertiary)'
              }}></div>
              <div>
                <div className="h-4 rounded w-24 mb-1" style={{
                  backgroundColor: 'var(--bg-tertiary)'
                }}></div>
                <div className="h-3 rounded w-16" style={{
                  backgroundColor: 'var(--bg-tertiary)'
                }}></div>
              </div>
            </div>
            <div className="h-6 rounded w-20" style={{
              backgroundColor: 'var(--bg-tertiary)'
            }}></div>
          </div>
          <div className="h-3 rounded mb-2" style={{
            backgroundColor: 'var(--bg-tertiary)'
          }}></div>
          <div className="h-4 rounded w-3/4" style={{
            backgroundColor: 'var(--bg-tertiary)'
          }}></div>
        </div>
      ))}
    </div>
  </Card>
);

export default BudgetListSkeleton;
