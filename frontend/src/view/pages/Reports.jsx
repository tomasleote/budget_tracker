import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faDownload } from '@fortawesome/free-solid-svg-icons';
import Button from '../components/ui/Button';
import { ExportPanel } from '../components/ui';

import { useTransactions } from '../../controller/hooks/useTransactions';
import { useBudgets } from '../../controller/hooks/useBudgets';
import { useDashboard } from '../../controller/hooks/useDashboard';

import { useReportsData } from './reports/useReportsData';
import ReportsControls, { DATE_RANGES } from './reports/ReportsControls';
import ReportsOverview from './reports/ReportsOverview';
import ReportsSpending from './reports/ReportsSpending';
import ReportsBudget from './reports/ReportsBudget';
import ReportsTrends from './reports/ReportsTrends';

const Reports = () => {
  const [dateRange, setDateRange] = useState('thisMonth');
  const [reportType, setReportType] = useState('overview');
  const [showExportPanel, setShowExportPanel] = useState(false);

  const {
    transactions,
    summary,
    categoryBreakdown,
    getTransactionsByDateRange,
    getTransactionStats,
    isLoading: isLoadingTransactions
  } = useTransactions();

  const {
    budgets,
    getBudgetStatistics,
    isLoading: isLoadingBudgets
  } = useBudgets();

  const {
    financialHealth,
    isLoading: isLoadingDashboard
  } = useDashboard();

  const filteredData = useReportsData({
    dateRange,
    transactions,
    getTransactionsByDateRange,
    summary,
    categoryBreakdown
  });

  const budgetStats = getBudgetStatistics();
  const transactionStats = getTransactionStats();
  const isLoading = isLoadingTransactions || isLoadingBudgets || isLoadingDashboard;

  const getDateRangeLabel = () => {
    const selected = DATE_RANGES.find(r => r.value === dateRange);
    return selected ? selected.label : 'Custom Range';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-theme-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 rounded w-64 bg-theme-tertiary"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card-theme border p-6 rounded-lg">
                  <div className="h-4 rounded mb-2 bg-theme-tertiary"></div>
                  <div className="h-8 rounded bg-theme-tertiary"></div>
                </div>
              ))}
            </div>
            <div className="card-theme border p-6 rounded-lg">
              <div className="h-64 rounded bg-theme-tertiary"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <div className="flex items-center space-x-3 mb-2">
                <FontAwesomeIcon icon={faChartBar} className="text-xl" style={{ color: 'var(--accent-primary)' }} />
                <h1 className="text-2xl lg:text-3xl font-bold text-theme-primary">Financial Reports</h1>
              </div>
              <p className="text-sm lg:text-base text-theme-secondary">
                Comprehensive insights into your financial performance
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
              <Button variant="primary" onClick={() => setShowExportPanel(true)} icon={faDownload}>
                Export Report
              </Button>
            </div>
          </div>
        </div>

        <ReportsControls
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          reportType={reportType}
          onReportTypeChange={setReportType}
        />

        <div className="space-y-6">
          {reportType === 'overview' && (
            <ReportsOverview filteredData={filteredData} financialHealth={financialHealth} />
          )}
          {reportType === 'spending' && (
            <ReportsSpending filteredData={filteredData} budgets={budgets} />
          )}
          {reportType === 'budget' && (
            <ReportsBudget budgets={budgets} budgetStats={budgetStats} />
          )}
          {reportType === 'trends' && (
            <ReportsTrends
              filteredData={filteredData}
              transactionStats={transactionStats}
              budgetStats={budgetStats}
            />
          )}
        </div>

        <ExportPanel
          isOpen={showExportPanel}
          onClose={() => setShowExportPanel(false)}
          transactions={filteredData.transactions}
          budgets={budgets}
          summary={{
            income: filteredData.summary.income,
            expenses: filteredData.summary.expenses,
            balance: filteredData.summary.balance
          }}
          categoryBreakdown={filteredData.categoryBreakdown}
          dateRange={getDateRangeLabel()}
        />
      </div>
    </div>
  );
};

export default Reports;
