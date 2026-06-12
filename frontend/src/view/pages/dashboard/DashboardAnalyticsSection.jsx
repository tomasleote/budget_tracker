import React from 'react';
import {
  SpendingTrendChart,
  BudgetComparisonChart,
  MonthlyAnalyticsChart
} from '../../components/charts';

const DashboardAnalyticsSection = ({
  allTransactions,
  budgetOverview,
  lastFullMonthStartDate,
  lastFullMonthEndDate,
  currentMonthName,
  monthsToShow,
  onMonthsChange,
  isLoading,
  budgetIsLoading
}) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-bold text-theme-primary">📊 Enhanced Analytics</h2>
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
      <SpendingTrendChart
        transactions={allTransactions}
        customStartDate={lastFullMonthStartDate}
        customEndDate={lastFullMonthEndDate}
        timePeriodLabel={currentMonthName}
        isLoading={isLoading}
        chartType="line"
        height={350}
      />
      <BudgetComparisonChart
        budgets={budgetOverview || []}
        isLoading={isLoading || budgetIsLoading}
        height={350}
      />
    </div>

    <div className="w-full">
      <MonthlyAnalyticsChart
        transactions={allTransactions}
        budgets={budgetOverview || []}
        monthsToShow={monthsToShow}
        onMonthsChange={onMonthsChange}
        isLoading={isLoading || budgetIsLoading}
        height={400}
      />
    </div>
  </div>
);

export default DashboardAnalyticsSection;
