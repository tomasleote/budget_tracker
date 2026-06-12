import React from 'react';
import Card from '../../ui/Card';

function TransactionGridSkeleton({ className }) {
  return (
    <Card className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="animate-pulse">
            <div className="card-theme border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-theme-tertiary rounded-full"></div>
                  <div className="w-6 h-6 bg-theme-tertiary rounded-full"></div>
                </div>
                <div className="text-right">
                  <div className="h-5 bg-theme-tertiary rounded w-16 mb-1"></div>
                  <div className="h-3 bg-theme-tertiary rounded w-12"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-theme-tertiary rounded w-3/4"></div>
                <div className="h-3 bg-theme-tertiary rounded w-1/2"></div>
                <div className="h-3 bg-theme-tertiary rounded w-1/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default TransactionGridSkeleton;
