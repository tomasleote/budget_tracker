import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faArrowTrendUp, faArrowTrendDown } from '@fortawesome/free-solid-svg-icons';
import Card from '../ui/Card';

const SpendingTrendChart = ({ 
  transactions = [],
  dateRange = 30, // days
  isLoading = false,
  className = '',
  chartType = 'line', // 'line' or 'area'
  height = 300
}) => {
  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Helper function to format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Process transaction data for trend chart
  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    // Get date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - dateRange);

    // Create daily data points
    const dailyData = {};
    
    // Initialize all days with zero values
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      dailyData[dateKey] = {
        date: dateKey,
        income: 0,
        expenses: 0,
        net: 0,
        formattedDate: formatDate(d)
      };
    }

    // Aggregate transactions by day
    transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      })
      .forEach(transaction => {
        const dateKey = new Date(transaction.date).toISOString().split('T')[0];
        if (dailyData[dateKey]) {
          if (transaction.type === 'income') {
            dailyData[dateKey].income += transaction.amount || 0;
          } else if (transaction.type === 'expense') {
            dailyData[dateKey].expenses += transaction.amount || 0;
          }
          dailyData[dateKey].net = dailyData[dateKey].income - dailyData[dateKey].expenses;
        }
      });

    // Convert to array and sort by date
    return Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [transactions, dateRange]);

  // Calculate trend statistics
  const trendStats = useMemo(() => {
    if (chartData.length < 2) return { trend: 'stable', percentage: 0 };

    const recentData = chartData.slice(-7); // Last 7 days
    const previousData = chartData.slice(-14, -7); // Previous 7 days

    const recentAvg = recentData.reduce((sum, d) => sum + d.expenses, 0) / recentData.length;
    const previousAvg = previousData.reduce((sum, d) => sum + d.expenses, 0) / previousData.length;

    if (previousAvg === 0) return { trend: 'stable', percentage: 0 };

    const percentage = ((recentAvg - previousAvg) / previousAvg) * 100;
    const trend = percentage > 5 ? 'increasing' : percentage < -5 ? 'decreasing' : 'stable';

    return { trend, percentage: Math.abs(percentage) };
  }, [chartData]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-gray-900 mb-2">{data.formattedDate}</p>
          <div className="space-y-1">
            <p className="text-green-600 text-sm">
              Income: {formatCurrency(data.income)}
            </p>
            <p className="text-red-600 text-sm">
              Expenses: {formatCurrency(data.expenses)}
            </p>
            <p className={`text-sm font-medium ${data.net >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              Net: {formatCurrency(data.net)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card 
        title="Spending Trends" 
        className={className}
        headerAction={
          <FontAwesomeIcon 
            icon={faChartLine} 
            className="text-gray-400" 
          />
        }
      >
        <div className="text-center py-8">
          <FontAwesomeIcon 
            icon={faChartLine} 
            className="text-gray-400 text-3xl mb-4" 
          />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Trend Data</h3>
          <p className="text-gray-500 mb-4">Add transactions over time to see spending trends</p>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title="Spending Trends" 
      className={className}
      headerAction={
        <div className="flex items-center space-x-3">
          {/* Trend indicator */}
          <div className="flex items-center space-x-1">
            <FontAwesomeIcon 
              icon={trendStats.trend === 'increasing' ? faArrowTrendUp : 
                    trendStats.trend === 'decreasing' ? faArrowTrendDown : faChartLine}
              className={`w-4 h-4 ${
                trendStats.trend === 'increasing' ? 'text-red-500' : 
                trendStats.trend === 'decreasing' ? 'text-green-500' : 'text-gray-500'
              }`}
            />
            <span className={`text-sm ${
              trendStats.trend === 'increasing' ? 'text-red-500' : 
              trendStats.trend === 'decreasing' ? 'text-green-500' : 'text-gray-500'
            }`}>
              {trendStats.percentage > 0 ? `${trendStats.percentage.toFixed(1)}%` : 'Stable'}
            </span>
          </div>
          <FontAwesomeIcon 
            icon={faChartLine} 
            className="text-gray-400" 
          />
        </div>
      }
    >
      <div className="space-y-4">
        {/* Chart */}
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="formattedDate" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stackId="1"
                  stroke="#FF6B6B" 
                  fill="#FF6B6B" 
                  fillOpacity={0.6}
                  name="Expenses"
                />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stackId="2"
                  stroke="#4ECDC4" 
                  fill="#4ECDC4" 
                  fillOpacity={0.6}
                  name="Income"
                />
              </AreaChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="formattedDate" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#FF6B6B" 
                  strokeWidth={2}
                  dot={{ fill: '#FF6B6B', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Expenses"
                />
                <Line 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#4ECDC4" 
                  strokeWidth={2}
                  dot={{ fill: '#4ECDC4', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Income"
                />
                <Line 
                  type="monotone" 
                  dataKey="net" 
                  stroke="#45B7D1" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#45B7D1', strokeWidth: 2, r: 3 }}
                  name="Net"
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-green-600">
                {formatCurrency(
                  chartData.reduce((sum, d) => sum + d.income, 0)
                )}
              </div>
              <div className="text-xs text-gray-500">Total Income</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-red-600">
                {formatCurrency(
                  chartData.reduce((sum, d) => sum + d.expenses, 0)
                )}
              </div>
              <div className="text-xs text-gray-500">Total Expenses</div>
            </div>
            <div>
              <div className={`text-lg font-semibold ${
                chartData.reduce((sum, d) => sum + d.net, 0) >= 0 ? 'text-blue-600' : 'text-red-600'
              }`}>
                {formatCurrency(
                  chartData.reduce((sum, d) => sum + d.net, 0)
                )}
              </div>
              <div className="text-xs text-gray-500">Net Amount</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SpendingTrendChart;