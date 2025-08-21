import React from 'react';

/**
 * Responsive Dashboard Grid Component
 * Provides structured layout for dashboard sections with proper responsive behavior
 */
const DashboardGrid = ({ children }) => {
  return (
    <div className="space-y-6">
      {children}
    </div>
  );
};

/**
 * Main Dashboard Section - Full width for QuickStats
 */
DashboardGrid.StatsSection = ({ children }) => {
  return (
    <div className="w-full">
      {children}
    </div>
  );
};

/**
 * Primary Dashboard Grid - Balance + Budget/Spending
 */
DashboardGrid.PrimarySection = ({ children }) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6">
      {children}
    </div>
  );
};

/**
 * Balance Section - Responsive column sizing
 */
DashboardGrid.BalanceSection = ({ children }) => {
  return (
    <div className="xl:col-span-1">
      {children}
    </div>
  );
};

/**
 * Analytics Section - Takes remaining space, stacked on mobile
 */
DashboardGrid.AnalyticsSection = ({ children }) => {
  return (
    <div className="xl:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
      {children}
    </div>
  );
};

/**
 * Transactions Section - Full width
 */
DashboardGrid.TransactionsSection = ({ children }) => {
  return (
    <div className="w-full">
      {children}
    </div>
  );
};

/**
 * Widgets Section - Responsive grid for widgets
 */
DashboardGrid.WidgetsSection = ({ children }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {children}
    </div>
  );
};

/**
 * Status Section - Development status
 */
DashboardGrid.StatusSection = ({ children }) => {
  return (
    <div className="w-full">
      {children}
    </div>
  );
};

export default DashboardGrid;
