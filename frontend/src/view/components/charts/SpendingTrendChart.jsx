import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faArrowTrendUp, faArrowTrendDown } from '@fortawesome/free-solid-svg-icons';
import Card from '../ui/Card';
import buildSpendingChartData, { buildTrendStats } from './spending-trend/chartDataBuilder';
import SpendingChart from './spending-trend/SpendingChart';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

const SpendingTrendChart = ({
  transactions = [],
  dateRange = 30,
  isLoading = false,
  className = '',
  chartType = 'line',
  height = 300,
  customStartDate = null,
  customEndDate = null,
  timePeriodLabel = null
}) => {
  const chartData = useMemo(
    () => buildSpendingChartData(transactions, dateRange, customStartDate, customEndDate),
    [transactions, dateRange, customStartDate, customEndDate]
  );

  const trendStats = useMemo(() => buildTrendStats(chartData), [chartData]);

  const getTimePeriodDisplay = () => {
    if (timePeriodLabel) return timePeriodLabel;
    if (customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      return start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return `Last ${dateRange} Days`;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FontAwesomeIcon icon={faChartLine} className="text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Spending Trends</h3>
              <p className="text-sm text-gray-500">Loading chart data...</p>
            </div>
          </div>
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <Card className={className}>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FontAwesomeIcon icon={faChartLine} className="text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Spending Trends</h3>
              <p className="text-sm text-gray-500">Track your spending patterns over time</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <FontAwesomeIcon icon={faChartLine} className="text-4xl mb-3 text-gray-400" />
              <p>No transaction data available</p>
              <p className="text-sm">Add some transactions to see spending trends</p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <FontAwesomeIcon icon={faChartLine} className="text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Spending Trends</h3>
              <p className="text-sm text-gray-500">{getTimePeriodDisplay()}</p>
            </div>
          </div>

          {trendStats && (
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon
                icon={trendStats.trendDirection === 'up' ? faArrowTrendUp : faArrowTrendDown}
                className={trendStats.trendDirection === 'up' ? 'text-red-500' : 'text-green-500'}
              />
              <span className={`text-sm font-medium ${
                trendStats.trendDirection === 'up' ? 'text-red-600' : 'text-green-600'
              }`}>
                {trendStats.trendPercentage.toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        <SpendingChart chartData={chartData} chartType={chartType} height={height} />

        {trendStats && (
          <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(trendStats.totalExpenses)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Daily Average</p>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(trendStats.averageDaily)}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SpendingTrendChart;
