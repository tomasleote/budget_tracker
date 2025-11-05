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
  height = 300,
  // FIX BUG #2: Accept custom date range for last full month
  customStartDate = null,
  customEndDate = null,
  timePeriodLabel = null
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
    console.log('🔍 DEBUG - SpendingTrendChart processing:', {
      transactionCount: transactions?.length || 0,
      dateRange,
      customStartDate,
      customEndDate,
      sampleTransaction: transactions?.[0]
    });
    
    if (!transactions || transactions.length === 0) {
      console.log('  - No transactions provided to chart');
      return [];
    }

    // FIX BUG #2: Use custom dates if provided, otherwise use dateRange
    let startDate, endDate;
    
    if (customStartDate && customEndDate) {
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
      console.log('  - Using CUSTOM date range (last full month):', {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });
    } else {
      // Fallback to dateRange logic
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(endDate.getDate() - dateRange);
      console.log('  - Using dateRange logic (last', dateRange, 'days):', {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });
    }
    
    // Filter transactions to date range - STRICT filtering by date
    const filteredTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const isInRange = transactionDate >= startDate && transactionDate <= endDate;
      return isInRange;
    });

    console.log('  - Transactions in last', dateRange, 'days:', filteredTransactions.length);

    // Create daily spending data
    const dailyData = {};
    
    // Initialize all days in range with 0
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dailyData[dateStr] = {
        date: dateStr,
        income: 0,
        expenses: 0,
        net: 0
      };
    }
    
    // Aggregate transactions by day
    filteredTransactions.forEach(transaction => {
      const dateStr = new Date(transaction.date).toISOString().split('T')[0];
      if (dailyData[dateStr]) {
        const amount = parseFloat(transaction.amount) || 0;
        if (transaction.type === 'income') {
          dailyData[dateStr].income += amount;
        } else if (transaction.type === 'expense') {
          dailyData[dateStr].expenses += amount;
        }
      }
    });

    // Calculate net and format for chart
    const result = Object.values(dailyData)
      .map(day => ({
        ...day,
        net: day.income - day.expenses,
        displayDate: formatDate(day.date)
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    console.log('  - Chart data result:', {
      dataPoints: result.length,
      hasData: result.some(d => d.income > 0 || d.expenses > 0),
      sampleDataPoint: result[0]
    });

    return result;
  }, [transactions, dateRange, customStartDate, customEndDate]);

  // Calculate trend statistics
  const trendStats = useMemo(() => {
    if (chartData.length < 2) return null;
    
    const totalExpenses = chartData.reduce((sum, day) => sum + day.expenses, 0);
    const averageDaily = totalExpenses / chartData.length;
    
    // Calculate trend (comparing first half vs second half)
    const midpoint = Math.floor(chartData.length / 2);
    const firstHalf = chartData.slice(0, midpoint);
    const secondHalf = chartData.slice(midpoint);
    
    const firstHalfAvg = firstHalf.reduce((sum, day) => sum + day.expenses, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, day) => sum + day.expenses, 0) / secondHalf.length;
    
    const trendDirection = secondHalfAvg > firstHalfAvg ? 'up' : 'down';
    const trendPercentage = firstHalfAvg > 0 ? Math.abs((secondHalfAvg - firstHalfAvg) / firstHalfAvg * 100) : 0;
    
    return {
      totalExpenses,
      averageDaily,
      trendDirection,
      trendPercentage
    };
  }, [chartData]);

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

  // FIX BUG #2: Get display label for time period
  const getTimePeriodDisplay = () => {
    if (timePeriodLabel) {
      return timePeriodLabel;
    }
    if (customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      return start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return `Last ${dateRange} Days`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <FontAwesomeIcon icon={faChartLine} className="text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Spending Trends</h3>
              <p className="text-sm text-gray-500">{getTimePeriodDisplay()}</p>
            </div>
          </div>
          
          {/* Trend Indicator */}
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
        
        {/* Chart */}
        <div style={{ width: '100%', height: height }}>
          <ResponsiveContainer>
            {chartType === 'area' ? (
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="displayDate" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={formatCurrency}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  fill="#fef2f2"
                  strokeWidth={2}
                  name="Expenses"
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  fill="#f0fdf4"
                  strokeWidth={2}
                  name="Income"
                />
              </AreaChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="displayDate" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={formatCurrency}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
                  name="Expenses"
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                  name="Income"
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
        
        {/* Summary Stats */}
        {trendStats && (
          <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(trendStats.totalExpenses)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Daily Average</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(trendStats.averageDaily)}
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SpendingTrendChart;
