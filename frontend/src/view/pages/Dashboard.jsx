import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import PageWrapper from '../components/ui/PageWrapper';
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

import { useDashboard } from '../../controller/hooks/useDashboard';
import { useTransactionContext } from '../../controller/context/providers/TransactionProvider.jsx';
import { useBudgets } from '../../controller/hooks/useBudgets';
import { useUser } from '../../controller/hooks/useUser';
import mockDataGenerator from '../../data/mockDataGenerator.js';

import DashboardHeader from './dashboard/DashboardHeader';
import DashboardAnalyticsSection from './dashboard/DashboardAnalyticsSection';

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
  const [monthsToShow, setMonthsToShow] = useState(6);
  const [lastUpdated, setLastUpdated] = useState(() => new Date());
  const hasInitialized = useRef(false);
  const lastDataHash = useRef('');

  const {
    summary,
    categoryBreakdown,
    recentActivity,
    quickStats,
    financialHealth,
    isLoading: isDashboardLoading,
    currentMonthName,
    lastFullMonthStartDate,
    lastFullMonthEndDate,
    actions,
    utils
  } = useDashboard();

  const {
    transactions: allTransactions,
    actions: { loadAllTransactionsForDashboard }
  } = useTransactionContext();

  const {
    overview: budgetOverview,
    isLoading: budgetIsLoading,
    createMonthlyBudget
  } = useBudgets();

  const { user } = useUser();

  const mockStats = getMockDataStats();
  const hasMockDataLoaded = mockStats.hasData;
  const isLoading = isDashboardLoading;
  const currentDataHash = `${summary.totalTransactions}-${summary.totalBudgets}-${summary.currentBalance}-${recentActivity.length}`;

  const updateTimestamp = useCallback(() => {
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    loadAllTransactionsForDashboard();
  }, [loadAllTransactionsForDashboard]);

  useEffect(() => {
    if (!hasInitialized.current && !isLoading) {
      hasInitialized.current = true;
      updateTimestamp();
      lastDataHash.current = currentDataHash;
      return;
    }
    if (hasInitialized.current && lastDataHash.current !== currentDataHash) {
      updateTimestamp();
      lastDataHash.current = currentDataHash;
    }
  }, [isLoading, currentDataHash, updateTimestamp]);

  const handleRefreshDashboard = useCallback(async () => {
    try {
      updateTimestamp();
      await loadAllTransactionsForDashboard();
      if (actions?.refreshDashboard) {
        await actions.refreshDashboard();
      } else {
        window.dispatchEvent(new CustomEvent('forceDataSync'));
        window.dispatchEvent(new CustomEvent('refreshTransactions'));
        window.dispatchEvent(new CustomEvent('refreshBudgets'));
      }
    } catch (error) {
      console.error('Dashboard refresh error:', error);
      updateTimestamp();
    }
  }, [actions, updateTimestamp, loadAllTransactionsForDashboard]);

  const quickActions = useMemo(() => ({
    addExpense: async (amount, category, description) => {
      try {
        console.log('Add expense:', { amount, category, description });
        updateTimestamp();
        return { success: true };
      } catch (error) {
        console.error('Error adding expense:', error);
        throw error;
      }
    },
    addIncome: async (amount, category, description) => {
      try {
        console.log('Add income:', { amount, category, description });
        updateTimestamp();
        return { success: true };
      } catch (error) {
        console.error('Error adding income:', error);
        throw error;
      }
    },
    createQuickBudget: async (category, amount) => {
      try {
        const result = await createMonthlyBudget(category, amount, `Monthly budget for ${category}`);
        if (result) updateTimestamp();
        return result;
      } catch (error) {
        console.error('Error creating budget:', error);
        throw error;
      }
    },
    refreshDashboard: handleRefreshDashboard
  }), [createMonthlyBudget, handleRefreshDashboard, updateTimestamp]);

  return (
    <PageWrapper
      isLoading={isLoading}
      loadingText="Loading Dashboard..."
      loadingDescription="Preparing your financial overview"
      onError={(error, errorInfo) => console.error('Dashboard Error:', error, errorInfo)}
    >
      <div className="min-h-screen bg-theme-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <DashboardHeader
            user={user}
            lastUpdated={lastUpdated}
            isLoading={isLoading}
            hasMockDataLoaded={hasMockDataLoaded}
            mockStats={mockStats}
            onRefresh={quickActions.refreshDashboard}
          />

          <div className="space-y-6 lg:space-y-8">
            <div className="w-full">
              <QuickStats
                quickStats={quickStats}
                financialHealth={financialHealth}
                isLoading={isLoading}
                timePeriodLabel={currentMonthName}
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
              <div className="xl:col-span-1">
                <BalanceCard
                  summary={summary}
                  isLoading={isLoading}
                  className="h-full"
                  timePeriodLabel={currentMonthName}
                />
              </div>
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
                  timePeriodLabel={currentMonthName}
                />
              </div>
            </div>

            <div className="w-full">
              <RecentTransactions
                recentActivity={recentActivity}
                isLoading={isLoading}
                onViewAll={() => window.location.href = '/transactions'}
              />
            </div>

            <DashboardAnalyticsSection
              allTransactions={allTransactions}
              budgetOverview={budgetOverview}
              lastFullMonthStartDate={lastFullMonthStartDate}
              lastFullMonthEndDate={lastFullMonthEndDate}
              currentMonthName={currentMonthName}
              monthsToShow={monthsToShow}
              onMonthsChange={setMonthsToShow}
              isLoading={isLoading}
              budgetIsLoading={budgetIsLoading}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <QuickActionsWidget actions={quickActions} isLoading={false} />
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
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Dashboard;
