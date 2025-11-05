import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome,
  faRefresh,
  faCalendarAlt,
  faUser,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import Button from '../components/ui/Button';
import PageWrapper from '../components/ui/PageWrapper';
import { PageLoading } from '../components/ui/LoadingSpinner';
import MockDataLoader from '../../components/debug/MockDataLoader.jsx';

// Dashboard components
import {
  BalanceCard,
  BudgetProgress,
  SpendingChart,
  RecentTransactions,
  QuickStats,
  QuickActionsWidget,
  FinancialHealthWidget,
  BudgetAlertsWidget,
  InsightsWidget
} from '../components/dashboard';

// Enhanced chart components
import {
  SpendingPieChart,
  SpendingTrendChart,
  BudgetComparisonChart,
  MonthlyAnalyticsChart
} from '../components/charts';

// Hooks
import { useDashboard } from '../../controller/hooks/useDashboard';
import { useTransactionContext } from '../../controller/context/providers/TransactionProvider.jsx';
import { useBudgets } from '../../controller/hooks/useBudgets';
import { useUser } from '../../controller/hooks/useUser';
import mockDataGenerator from '../../data/mockDataGenerator.js';
const { getMockDataStats } = mockDataGenerator;

/**
 * Dashboard Component - Performance Optimized
 * 
 * TIMESTAMP MANAGEMENT OPTIMIZATIONS (Phase 3):
 * - Initializes timestamp immediately (no "Loading..." state)
 * - Uses data hash to detect real changes vs re-renders
 * - Updates timestamp only when:
 *   1. Initial load completes
 *   2. Data actually changes (transactions, budgets, balance)
 *   3. Manual refresh is triggered
 *   4. User performs actions (add transaction, create budget)
 * - Stable functions with useCallback and useMemo
 * - Development mode indicators for debugging
 * 
 * This prevents the "Last updated" from changing every second due to re-renders.
 */
const Dashboard = () => {
  // State for Monthly Analytics time period
  const [monthsToShow, setMonthsToShow] = useState(6);
  
  // State for tracking when data was last updated - OPTIMIZED
  const [lastUpdated, setLastUpdated] = useState(() => new Date()); // Initialize immediately
  const hasInitialized = useRef(false);
  const lastDataHash = useRef(''); // Track actual data changes
  
  // Hooks for data
  const {
    summary,
    categoryBreakdown,
    recentActivity,
    quickStats,
    financialHealth,
    isLoading: isDashboardLoading,
    currentMonthName, // FIX BUG #2: Get the current month name
    lastFullMonthStartDate, // FIX BUG #2: Get start date
    lastFullMonthEndDate, // FIX BUG #2: Get end date
    actions,
    utils
  } = useDashboard();

  // Get transaction context for dashboard analytics
  const {
    transactions: allTransactions,
    actions: { loadAllTransactionsForDashboard }
  } = useTransactionContext();

  const {
    overview: budgetOverview,
    isLoading: budgetIsLoading,
    createMonthlyBudget,
    isCreatingBudget
  } = useBudgets();

  const { user } = useUser();

  // Check for mock data
  const mockStats = getMockDataStats();
  const hasMockDataLoaded = mockStats.hasData;

  // Loading state
  const isLoading = isDashboardLoading;

  // Create a stable data hash to detect real changes
  const currentDataHash = `${summary.totalTransactions}-${summary.totalBudgets}-${summary.currentBalance}-${recentActivity.length}`;

  // Optimized timestamp update function
  const updateTimestamp = useCallback((reason = 'data_change') => {
    // Only log in development mode and not too frequently
    if (process.env.NODE_ENV === 'development') {
      console.log(`🕒 Updating timestamp: ${reason}`);
    }
    setLastUpdated(new Date());
  }, []);

  // Load all transactions for dashboard analytics on mount
  useEffect(() => {
    const loadDashboardData = async () => {
      console.log('🔍 DASHBOARD API CALL: Loading transactions for analytics charts...');
      await loadAllTransactionsForDashboard();
    };
    
    loadDashboardData();
  }, [loadAllTransactionsForDashboard]);

  // Update timestamp only when data actually changes or on initial load
  useEffect(() => {
    // Initial load - set timestamp once
    if (!hasInitialized.current && !isLoading) {
      hasInitialized.current = true;
      updateTimestamp('initial_load');
      lastDataHash.current = currentDataHash;
      return;
    }

    // Data change detection - only update if data actually changed
    if (hasInitialized.current && lastDataHash.current !== currentDataHash) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`📊 Data changed: ${lastDataHash.current} → ${currentDataHash}`);
      }
      updateTimestamp('data_change');
      lastDataHash.current = currentDataHash;
    }
  }, [
    isLoading,
    currentDataHash,
    updateTimestamp
  ]);

  // Manual refresh function for better control - OPTIMIZED
  const handleRefreshDashboard = useCallback(async () => {
    try {
      console.log('🔄 Manual dashboard refresh triggered...');
      
      // Update the last updated timestamp immediately for manual refresh
      updateTimestamp('manual_refresh');
      
      // Refresh all dashboard data
      await loadAllTransactionsForDashboard();
      
      // Use the dashboard action instead of custom events
      if (actions && actions.refreshDashboard) {
        await actions.refreshDashboard();
      } else {
        // Fallback to custom events if action not available
        window.dispatchEvent(new CustomEvent('forceDataSync'));
        window.dispatchEvent(new CustomEvent('refreshTransactions'));
        window.dispatchEvent(new CustomEvent('refreshBudgets'));
      }
      
      console.log('✅ Dashboard refresh complete');
      
    } catch (error) {
      console.error('❌ Dashboard refresh error:', error);
      // Still update timestamp even if refresh fails
      updateTimestamp('refresh_error');
    }
  }, [actions, updateTimestamp, loadAllTransactionsForDashboard]);

  // Quick actions with timestamp updates - OPTIMIZED
  const quickActions = useMemo(() => ({
    addExpense: async (amount, category, description) => {
      try {
        // TODO: Implement addExpense functionality through transaction context
        console.log('Add expense:', { amount, category, description });
        updateTimestamp('expense_added');
        return { success: true };
      } catch (error) {
        console.error('Error adding expense:', error);
        throw error;
      }
    },
    
    addIncome: async (amount, category, description) => {
      try {
        // TODO: Implement addIncome functionality through transaction context
        console.log('Add income:', { amount, category, description });
        updateTimestamp('income_added');
        return { success: true };
      } catch (error) {
        console.error('Error adding income:', error);
        throw error;
      }
    },
    
    createQuickBudget: async (category, amount) => {
      try {
        const result = await createMonthlyBudget(category, amount, `Monthly budget for ${category}`);
        if (result) {
          updateTimestamp('budget_created');
        }
        return result;
      } catch (error) {
        console.error('Error creating budget:', error);
        throw error;
      }
    },
    
    refreshDashboard: handleRefreshDashboard
  }), [
    createMonthlyBudget,
    handleRefreshDashboard,
    updateTimestamp
  ]);

  // Get current time of day for greeting
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <PageWrapper
      isLoading={isLoading}
      loadingText="Loading Dashboard..."
      loadingDescription="Preparing your financial overview"
      onError={(error, errorInfo) => {
        console.error('Dashboard Error:', error, errorInfo);
      }}
    >
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Dashboard Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <div className="flex items-center space-x-3 mb-2">
                <FontAwesomeIcon icon={faHome} className="text-blue-600 text-xl" />
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Dashboard
                </h1>
                {/* Mock Data Indicator */}
                {hasMockDataLoaded && process.env.NODE_ENV === 'development' && (
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                    🎭 Mock Data ({mockStats.transactionCount} transactions)
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm lg:text-base">
                {getTimeGreeting()}, {user?.name || 'User'}! Here's your financial overview.
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Last updated info - OPTIMIZED */}
              <div className="hidden sm:flex items-center space-x-2 text-xs lg:text-sm text-gray-500">
                <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4" />
                <span>
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
                {/* Development mode: show update reason */}
                {process.env.NODE_ENV === 'development' && (
                  <span className="text-xs text-blue-500">
                    🕒
                  </span>
                )}
              </div>
              
              {/* Refresh button */}
              <Button
                variant="outline"
                size="sm"
                onClick={quickActions.refreshDashboard}
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

        <div className="space-y-6 lg:space-y-8">
          {/* QuickStats - Full Width */}
          <div className="w-full">
            <QuickStats 
              quickStats={quickStats}
              financialHealth={financialHealth}
              isLoading={isLoading}
              timePeriodLabel={currentMonthName} // FIX BUG #2: Pass month name
            />
          </div>

          {/* Primary Dashboard Grid - Balance + Analytics */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
            {/* Balance Card - Takes 1 column on XL+ */}
            <div className="xl:col-span-1">
              <BalanceCard 
                summary={summary} 
                isLoading={isLoading}
                className="h-full"
                timePeriodLabel={currentMonthName} // FIX BUG #2: Pass month name
              />
            </div>
            
            {/* Analytics Section - Takes 3 columns, responsive grid inside */}
            <div className="xl:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <BudgetProgress 
                budgetOverview={budgetOverview || []}
                isLoading={isLoading || budgetIsLoading}
                onCreateBudget={() => window.location.href = '/budget'}
                onViewAllBudgets={() => window.location.href = '/budget'}
                className="h-full"
                showCreateButton={false}
              />
              <SpendingChart 
                categoryBreakdown={categoryBreakdown}
                summary={summary}
                isLoading={isLoading}
                className="h-full"
                timePeriodLabel={currentMonthName} // FIX BUG #2: Pass month name
              />
            </div>
          </div>

          {/* Recent Transactions - Full Width */}
          <div className="w-full">
            <RecentTransactions 
            recentActivity={recentActivity}
            isLoading={isLoading}
            onViewAll={() => window.location.href = '/transactions'}
            />
          </div>

          {/* Enhanced Analytics Section - Phase 6 Charts */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">📊 Enhanced Analytics</h2>
            </div>
            
            {/* Analytics Charts Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
              {/* Spending Trends Chart - FIX BUG #2: Pass last full month dates */}
              <SpendingTrendChart 
                transactions={allTransactions}
                customStartDate={lastFullMonthStartDate}
                customEndDate={lastFullMonthEndDate}
                timePeriodLabel={currentMonthName}
                isLoading={isLoading}
                chartType="line"
                height={350}
              />
              
              {/* Budget Comparison Chart */}
              <BudgetComparisonChart 
                budgets={budgetOverview || []}
                isLoading={isLoading || budgetIsLoading}
                height={350}
              />
            </div>
            
            {/* Monthly Analytics - Full Width */}
            <div className="w-full">
              <MonthlyAnalyticsChart 
                transactions={allTransactions}
                budgets={budgetOverview || []}
                monthsToShow={monthsToShow}
                onMonthsChange={setMonthsToShow}
                isLoading={isLoading || budgetIsLoading}
                height={400}
              />
            </div>
          </div>

          {/* Dashboard Widgets - Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <QuickActionsWidget 
              actions={quickActions}
              isLoading={false}
            />
            <FinancialHealthWidget 
              financialHealth={financialHealth}
              quickStats={quickStats}
              isLoading={isLoading}
            />
            <BudgetAlertsWidget 
              budgetOverview={budgetOverview || []}
              quickStats={quickStats}
              isLoading={isLoading || budgetIsLoading}
              onViewBudgets={() => window.location.href = '/budget'}
            />
            <InsightsWidget 
              quickStats={quickStats}
              financialHealth={financialHealth}
              utils={utils}
              isLoading={isLoading}
            />
          </div>

          {/* Development Tools - Only shown in development mode */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6">
              <MockDataLoader />
            </div>
          )}

        </div>
      </div>
    </div>
    </PageWrapper>
  );
};

export default Dashboard;
