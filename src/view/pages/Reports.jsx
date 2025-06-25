import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartBar,
  faDownload,
  faCalendarAlt,
  faFilter,
  faArrowTrendUp,
  faArrowTrendDown,
  faDollarSign,
  faWallet,
  faExchangeAlt,
  faSpinner,
  faPieChart,
  faChartLine,
  faTable,
  faFileExport,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import { ExportPanel } from '../components/ui';

// Enhanced chart components
import { 
  SpendingPieChart,
  SpendingTrendChart,
  BudgetComparisonChart,
  MonthlyAnalyticsChart
} from '../components/charts';

// Dashboard components for legacy support
import { SpendingChart } from '../components/dashboard';

// Hooks
import { useTransactions } from '../../controller/hooks/useTransactions';
import { useBudgets } from '../../controller/hooks/useBudgets';
import { useDashboard } from '../../controller/hooks/useDashboard';
import { formatCurrency, formatDate, formatPercentage } from '../../controller/utils/formatters';

const Reports = () => {
  // State management
  const [dateRange, setDateRange] = useState('thisMonth');
  const [reportType, setReportType] = useState('overview'); // 'overview', 'spending', 'budget', 'trends'
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);

  // Hooks
  const { 
    transactions, 
    summary, 
    categoryBreakdown,
    getTransactionsByDateRange,
    getCurrentMonthTransactions,
    getTransactionStats,
    isLoading: isLoadingTransactions 
  } = useTransactions();

  const { 
    budgets, 
    analytics, 
    getBudgetStatistics,
    isLoading: isLoadingBudgets 
  } = useBudgets();

  const { 
    financialHealth,
    isLoading: isLoadingDashboard 
  } = useDashboard();

  // Date range options
  const dateRanges = [
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'last3Months', label: 'Last 3 Months' },
    { value: 'last6Months', label: 'Last 6 Months' },
    { value: 'thisYear', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  // Report types
  const reportTypes = [
    { value: 'overview', label: 'Financial Overview', icon: faChartBar },
    { value: 'spending', label: 'Spending Analysis', icon: faPieChart },
    { value: 'budget', label: 'Budget Performance', icon: faWallet },
    { value: 'trends', label: 'Trends & Insights', icon: faChartLine }
  ];

  // Calculate filtered data based on date range
  const filteredData = useMemo(() => {
    const now = new Date();
    let startDate, endDate;

    switch (dateRange) {
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'last3Months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        endDate = now;
        break;
      case 'last6Months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        endDate = now;
        break;
      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = now;
        break;
      default:
        return { transactions, summary, categoryBreakdown };
    }

    const filteredTransactions = getTransactionsByDateRange(startDate, endDate);
    
    // Calculate filtered summary
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const filteredSummary = {
      income,
      expenses,
      balance: income - expenses,
      formattedIncome: formatCurrency(income),
      formattedExpenses: formatCurrency(expenses),
      formattedBalance: formatCurrency(income - expenses),
      isPositiveBalance: (income - expenses) >= 0
    };

    // Calculate filtered category breakdown
    const filteredCategoryBreakdown = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, transaction) => {
        const category = transaction.category || 'Other';
        const existing = acc.find(item => item.category === category);
        if (existing) {
          existing.amount += transaction.amount;
          existing.count += 1;
        } else {
          acc.push({
            category,
            amount: transaction.amount,
            count: 1,
            formattedAmount: formatCurrency(transaction.amount)
          });
        }
        return acc;
      }, [])
      .sort((a, b) => b.amount - a.amount);

    return { 
      transactions: filteredTransactions, 
      summary: filteredSummary, 
      categoryBreakdown: filteredCategoryBreakdown 
    };
  }, [dateRange, transactions, getTransactionsByDateRange]);

  // Get budget statistics
  const budgetStats = getBudgetStatistics();
  const transactionStats = getTransactionStats();

  // Loading state
  const isLoading = isLoadingTransactions || isLoadingBudgets || isLoadingDashboard;

  // Handle export
  const handleExportReport = () => {
    setShowExportPanel(true);
  };

  // Handle close export panel
  const handleCloseExportPanel = () => {
    setShowExportPanel(false);
  };

  // Get date range label for export
  const getDateRangeLabel = () => {
    const selectedRange = dateRanges.find(range => range.value === dateRange);
    return selectedRange ? selectedRange.label : 'Custom Range';
  };



  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 rounded w-64" style={{ backgroundColor: 'var(--bg-tertiary)' }}></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}>
                  <div className="h-4 rounded mb-2" style={{ backgroundColor: 'var(--bg-tertiary)' }}></div>
                  <div className="h-8 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}></div>
                </div>
              ))}
            </div>
            <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}>
              <div className="h-64 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Page Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <div className="flex items-center space-x-3 mb-2">
                <FontAwesomeIcon icon={faChartBar} className="text-xl" style={{ color: 'var(--accent-primary)' }} />
                <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Financial Reports
                </h1>
              </div>
              <p className="text-sm lg:text-base" style={{ color: 'var(--text-secondary)' }}>
                Comprehensive insights into your financial performance
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
              <Button
                variant="primary"
                onClick={handleExportReport}
                icon={faDownload}
              >
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <Card className="mb-6 lg:mb-8">
          <div className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Date Range Selector */}
              <div className="flex items-center space-x-4">
                <FontAwesomeIcon icon={faCalendarAlt} style={{ color: 'var(--text-secondary)' }} />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-4 py-2 rounded-lg focus:ring-2 transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-primary)',
                    borderWidth: '1px',
                    color: 'var(--text-primary)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--border-focus)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-primary)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {dateRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Report Type Selector */}
              <div className="flex items-center space-x-1 rounded-lg p-1" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                {reportTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setReportType(type.value)}
                    className={`px-4 py-2 rounded flex items-center space-x-2 transition-colors`}
                    style={{
                      backgroundColor: reportType === type.value ? 'var(--bg-card)' : 'transparent',
                      color: reportType === type.value ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      boxShadow: reportType === type.value ? 'var(--shadow-sm)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (reportType !== type.value) {
                        e.target.style.color = 'var(--text-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (reportType !== type.value) {
                        e.target.style.color = 'var(--text-secondary)';
                      }
                    }}
                  >
                    <FontAwesomeIcon icon={type.icon} className="w-4 h-4" />
                    <span className="font-medium hidden sm:inline">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Report Content */}
        <div className="space-y-6">
          {/* Overview Report */}
          {reportType === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--success-bg)' }}>
                      <FontAwesomeIcon icon={faArrowTrendUp} className="w-6 h-6" style={{ color: 'var(--success)' }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Total Income</p>
                      <p className="text-2xl font-bold" style={{ color: 'var(--success)' }}>{filteredData.summary.formattedIncome}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--error-bg)' }}>
                      <FontAwesomeIcon icon={faArrowTrendDown} className="w-6 h-6" style={{ color: 'var(--error)' }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Total Expenses</p>
                      <p className="text-2xl font-bold" style={{ color: 'var(--error)' }}>{filteredData.summary.formattedExpenses}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-lg" style={{ 
                      backgroundColor: filteredData.summary.isPositiveBalance ? 'var(--info-bg)' : 'var(--error-bg)' 
                    }}>
                      <FontAwesomeIcon 
                        icon={faDollarSign} 
                        className="w-6 h-6" 
                        style={{ 
                          color: filteredData.summary.isPositiveBalance ? 'var(--info)' : 'var(--error)' 
                        }} 
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Net Balance</p>
                      <p className="text-2xl font-bold" style={{
                        color: filteredData.summary.isPositiveBalance ? 'var(--info)' : 'var(--error)'
                      }}>
                        {filteredData.summary.formattedBalance}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--accent-primary)', opacity: 0.1 }}>
                      <FontAwesomeIcon icon={faExchangeAlt} className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Transactions</p>
                      <p className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>{filteredData.transactions.length}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Financial Health Score */}
              {financialHealth && (
                <Card title="Financial Health Score">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Overall Score</h3>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Based on spending patterns and budget adherence</p>
                      </div>
                      <div className="text-right">
                      <div className="text-3xl font-bold" style={{ color: 'var(--accent-primary)' }}>{financialHealth.score}/100</div>
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Grade: {financialHealth.grade}</div>
                      </div>
                    </div>
                    <ProgressBar
                      value={financialHealth.score}
                      max={100}
                      color="dynamic"
                      size="lg"
                      animated={true}
                    />
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Spending Analysis Report */}
          {reportType === 'spending' && (
            <div className="space-y-6">
              {/* Enhanced Analytics Charts Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Category Breakdown Pie Chart */}
                <SpendingPieChart 
                  categoryBreakdown={filteredData.categoryBreakdown}
                  summary={filteredData.summary}
                  isLoading={false}
                  height={350}
                  showLegend={true}
                />
                
                {/* Spending Trends Chart */}
                <SpendingTrendChart 
                  transactions={filteredData.transactions}
                  dateRange={30}
                  isLoading={false}
                  chartType="area"
                  height={350}
                />
              </div>
              
              {/* Monthly Analytics - Full Width */}
              <MonthlyAnalyticsChart 
                transactions={filteredData.transactions}
                budgets={budgets}
                monthsToShow={6}
                isLoading={false}
                height={400}
              />

              {/* Top Categories Table */}
              <Card title="Top Spending Categories">
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                          <th className="text-left py-3 px-4" style={{ color: 'var(--text-primary)' }}>Category</th>
                          <th className="text-right py-3 px-4" style={{ color: 'var(--text-primary)' }}>Amount</th>
                          <th className="text-right py-3 px-4" style={{ color: 'var(--text-primary)' }}>Transactions</th>
                          <th className="text-right py-3 px-4" style={{ color: 'var(--text-primary)' }}>Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.categoryBreakdown.slice(0, 10).map((category, index) => {
                          const percentage = filteredData.summary.expenses > 0 
                            ? (category.amount / filteredData.summary.expenses * 100) 
                            : 0;
                          
                          return (
                            <tr key={category.category} style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                              <td className="py-3 px-4 font-medium">{category.category}</td>
                              <td className="py-3 px-4 text-right">{formatCurrency(category.amount)}</td>
                              <td className="py-3 px-4 text-right">{category.count}</td>
                              <td className="py-3 px-4 text-right">{formatPercentage(percentage)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Budget Performance Report */}
          {reportType === 'budget' && (
            <div className="space-y-6">
              {/* Budget Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2" style={{ color: 'var(--accent-primary)' }}>{budgetStats.totalBudgets}</div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Budgets</div>
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2" style={{ color: 'var(--success)' }}>{budgetStats.healthyBudgets}</div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Healthy Budgets</div>
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2" style={{ color: 'var(--error)' }}>{budgetStats.exceededBudgets}</div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Exceeded Budgets</div>
                  </div>
                </Card>
              </div>

              {/* Enhanced Budget Performance Charts */}
              {budgets.length > 0 && (
                <div className="space-y-6">
                  {/* Budget Comparison Chart */}
                  <BudgetComparisonChart 
                    budgets={budgets}
                    isLoading={false}
                    height={400}
                  />
                  
                  {/* Traditional Budget Progress */}
                  <Card title="Budget Performance Details">
                    <div className="p-6 space-y-4">
                      {budgets.slice(0, 8).map((budget) => {
                        const percentage = budget.utilizationPercentage || 0;
                        return (
                          <div key={budget.id} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{budget.category}</span>
                              <span className="text-gray-600">
                                {formatCurrency(budget.progress?.spent || 0)} / {formatCurrency(budget.budgetAmount)}
                              </span>
                            </div>
                            <ProgressBar
                              value={percentage}
                              max={100}
                              color="dynamic"
                              size="md"
                              showPercentage={true}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Trends & Insights Report */}
          {reportType === 'trends' && (
            <div className="space-y-6">
              {/* Trends Summary */}
              <Card title="Financial Trends & Insights">
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Spending Insights</h4>
                      <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <li>• Average transaction: {formatCurrency(transactionStats.averageExpense || 0)}</li>
                        <li>• Most active category: {filteredData.categoryBreakdown[0]?.category || 'None'}</li>
                        <li>• Transaction frequency: {formatPercentage(transactionStats.transactionFrequency || 0)} per day</li>
                        <li>• Savings rate: {formatPercentage(filteredData.summary.income > 0 ? ((filteredData.summary.income - filteredData.summary.expenses) / filteredData.summary.income * 100) : 0)}</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Recommendations</h4>
                      <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {filteredData.summary.expenses > filteredData.summary.income && (
                          <li>• ⚠️ Expenses exceed income - review spending</li>
                        )}
                        {budgetStats.exceededBudgets > 0 && (
                          <li>• ⚠️ {budgetStats.exceededBudgets} budget(s) exceeded</li>
                        )}
                        {filteredData.categoryBreakdown.length > 0 && (
                          <li>• 💡 Consider budgeting for {filteredData.categoryBreakdown[0]?.category}</li>
                        )}
                        <li>• 📊 Track spending patterns for better insights</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Transaction Frequency */}
              <Card title="Transaction Activity">
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{transactionStats.incomeTransactions}</div>
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Income Transactions</div>
                    </div>
                    <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{transactionStats.expenseTransactions}</div>
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Expense Transactions</div>
                    </div>
                    <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(transactionStats.averageIncome || 0)}</div>
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Avg Income</div>
                    </div>
                    <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(transactionStats.averageExpense || 0)}</div>
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Avg Expense</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Export Panel */}
        <ExportPanel
          isOpen={showExportPanel}
          onClose={handleCloseExportPanel}
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