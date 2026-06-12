import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faCalendarAlt, faRefresh, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Button from '../../components/ui/Button';

const DashboardHeader = ({ user, lastUpdated, isLoading, hasMockDataLoaded, mockStats, onRefresh }) => {
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="mb-6 lg:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="mb-4 sm:mb-0">
          <div className="flex items-center space-x-3 mb-2">
            <FontAwesomeIcon icon={faHome} className="text-blue-600 text-xl" />
            <h1 className="text-2xl lg:text-3xl font-bold text-theme-primary">Dashboard</h1>
            {hasMockDataLoaded && process.env.NODE_ENV === 'development' && (
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                🎭 Mock Data ({mockStats.transactionCount} transactions)
              </span>
            )}
          </div>
          <p className="text-theme-secondary text-sm lg:text-base">
            {getTimeGreeting()}, {user?.name || 'User'}! Here's your financial overview.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 text-xs lg:text-sm text-theme-secondary">
            <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4" />
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            {process.env.NODE_ENV === 'development' && (
              <span className="text-xs text-blue-500">🕒</span>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            icon={faRefresh}
          >
            {isLoading ? (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
            ) : (
              'Refresh'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
