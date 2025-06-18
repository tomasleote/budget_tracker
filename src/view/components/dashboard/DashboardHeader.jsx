import React from 'react';

/**
 * Dashboard Header Component
 * Contains the dashboard title and description
 */
const DashboardHeader = () => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Welcome back! Here's your financial overview.
        </p>
      </div>
      <div className="text-sm text-gray-400">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default DashboardHeader;
