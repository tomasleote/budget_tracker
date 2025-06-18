import React from 'react';
import { useDashboard } from '../../../controller/hooks/useDashboard';
import BalanceCard from './BalanceCard';
import BudgetProgress from './BudgetProgress';
import SpendingChart from './SpendingChart';
import RecentTransactions from './RecentTransactions';
import DashboardHeader from './DashboardHeader';
import DashboardGrid from './DashboardGrid';

/**
 * Dashboard Layout Component
 * Orchestrates the dashboard layout and data flow
 */
const DashboardLayout = () => {
  const { 
    summary, 
    budgetOverview, 
    categoryBreakdown, 
    recentActivity, 
    isLoading 
  } = useDashboard();

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <DashboardHeader />
      
      {/* Main Dashboard Grid */}
      <DashboardGrid>
        {/* Balance Card - Left Column */}
        <DashboardGrid.BalanceSection>
          <BalanceCard 
            summary={summary} 
            isLoading={isLoading}
          />
        </DashboardGrid.BalanceSection>
        
        {/* Budget & Spending - Right Column */}
        <DashboardGrid.AnalyticsSection>
          <BudgetProgress 
            budgetOverview={budgetOverview}
            isLoading={isLoading}
          />
          <SpendingChart 
            categoryBreakdown={categoryBreakdown}
            summary={summary}
            isLoading={isLoading}
          />
        </DashboardGrid.AnalyticsSection>
      </DashboardGrid>
      
      {/* Recent Transactions - Full Width */}
      <DashboardGrid.TransactionsSection>
        <RecentTransactions 
          recentActivity={recentActivity}
          isLoading={isLoading}
        />
      </DashboardGrid.TransactionsSection>
      
      {/* Development Status - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <DashboardGrid.StatusSection>
          <div className="bg-green-50 rounded-lg border border-green-200 p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-4">
              ✅ Phase 4 Step 7 Complete!
            </h3>
            <p className="text-green-700 mb-4">
              All dashboard components have been successfully implemented and integrated.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'BalanceCard', desc: 'Shows financial summary' },
                { name: 'BudgetProgress', desc: 'Tracks budget status' },
                { name: 'SpendingChart', desc: 'Category breakdown' },
                { name: 'RecentTransactions', desc: 'Latest activity' }
              ].map((component) => (
                <div key={component.name} className="text-center p-3 bg-white rounded-lg border border-green-200">
                  <div className="text-green-600 font-semibold">✅ {component.name}</div>
                  <div className="text-sm text-green-600">{component.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </DashboardGrid.StatusSection>
      )}
    </div>
  );
};

export default DashboardLayout;
