import React from 'react';
import Card from '../../ui/Card';

function TransactionListSkeleton({ className }) {
  return (
    <Card className={className}>
      <div className="animate-pulse space-y-4">
        <div className="h-6 rounded w-1/3 bg-theme-tertiary"></div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-theme-tertiary"></div>
            <div className="flex-1 space-y-1">
              <div className="h-4 rounded w-3/4 bg-theme-tertiary"></div>
              <div className="h-3 rounded w-1/2 bg-theme-tertiary"></div>
            </div>
            <div className="h-4 rounded w-16 bg-theme-tertiary"></div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default TransactionListSkeleton;
