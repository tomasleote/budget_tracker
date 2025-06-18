import React from 'react';
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
import { useTransactions } from '../../controller/hooks/useTransactions';
import { useBudgets } from '../../controller/hooks/useBudgets';
import { useUser } from '../../controller/hooks/useUser';
import mockDataGenerator from '../../data/mockDataGenerator.js';
const { getMockDataStats } = mockDataGenerator;

const Dashboard = () => {
  // Hooks for data
  const {
    summary,
    categoryBreakdown,
    recentActivity,
    quickStats,
    financialHealth,
    isLoading: isDashboardLoading,
    refreshDashboard,
    utils
  } = useDashboard();

  const {
    transactions,
    addIncome,
    addExpense,
    isCreatingTransaction
  } = useTransactions();

  const {
    createMonthlyBudget,
    isCreatingBudget
  } = useBudgets();

  const { user } = useUser();

  // Check for mock data
  const mockStats = getMockDataStats();
  const hasMockDataLoaded = mockStats.hasData;

  // Loading state
  const isLoading = isDashboardLoading;

  // Quick actions
  const quickActions = {
    addExpense: async (amount, category, description) => {
      return await addExpense(amount, category, description);
    },
    addIncome: async (amount, category, description) => {
      return await addIncome(amount, category, description);
    },
    createQuickBudget: async (category, amount) => {
      return await createMonthlyBudget(category, amount, `Monthly budget for ${category}`);
    },
    refreshDashboard: async () => {
      return await refreshDashboard();
    }
  };

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
              {/* Last updated info */}
              <div className="hidden sm:flex items-center space-x-2 text-xs lg:text-sm text-gray-500">
                <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4" />
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
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
              />
            </div>
            
            {/* Analytics Section - Takes 3 columns, responsive grid inside */}
            <div className="xl:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <BudgetProgress 
                budgetOverview={summary?.budgetOverview || []}
                isLoading={isLoading}
                onCreateBudget={() => window.location.href = '/budget'}
                className="h-full"
              />
              <SpendingChart 
                categoryBreakdown={categoryBreakdown}
                summary={summary}
                isLoading={isLoading}
                className="h-full"
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
              <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full font-medium">
                Phase 6: Recharts Integration
              </span>
            </div>
            
            {/* Analytics Charts Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
              {/* Spending Trends Chart */}
              <SpendingTrendChart 
                transactions={transactions}
                dateRange={30}
                isLoading={isLoading}
                chartType="line"
                height={350}
              />
              
              {/* Budget Comparison Chart */}
              <BudgetComparisonChart 
                budgets={summary?.budgetOverview || []}
                isLoading={isLoading}
                height={350}
              />
            </div>
            
            {/* Monthly Analytics - Full Width */}
            <div className="w-full">
              <MonthlyAnalyticsChart 
                transactions={transactions}
                budgets={summary?.budgetOverview || []}
                monthsToShow={6}
                isLoading={isLoading}
                height={400}
              />
            </div>
          </div>

          {/* Dashboard Widgets - Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <QuickActionsWidget 
              actions={quickActions}
              isLoading={isCreatingTransaction || isCreatingBudget}
            />
            <FinancialHealthWidget 
              financialHealth={financialHealth}
              quickStats={quickStats}
              isLoading={isLoading}
            />
            <BudgetAlertsWidget 
              budgetOverview={summary?.budgetOverview || []}
              quickStats={quickStats}
              isLoading={isLoading}
              onViewBudgets={() => window.location.href = '/budget'}
            />
            <InsightsWidget 
              quickStats={quickStats}
              financialHealth={financialHealth}
              utils={utils}
              isLoading={isLoading}
            />
          </div>

        </div>
      </div>
    </div>
    </PageWrapper>
  );
};

export default Dashboard;