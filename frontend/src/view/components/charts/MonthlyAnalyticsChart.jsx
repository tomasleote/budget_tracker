import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartArea, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import Card from '../ui/Card';

const MonthlyAnalyticsChart = ({ 
  transactions = [],
  budgets = [],
  monthsToShow = 6,
  onMonthsChange = () => {},
  isLoading = false,
  className = '',
  height = 400
}) => {
  // Month options
  const monthOptions = [
    { value: 3, label: '3 months' },
    { value: 6, label: '6 months' },
    { value: 12, label: '12 months' }
  ];
  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Helper function to get month name
  const getMonthName = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short',
      year: '2-digit' 
    });
  };

  // Process data for monthly analytics
  const chartData = React.useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const monthlyData = {};
    const endDate = new Date();
    
    // Initialize months
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date(endDate.getFullYear(), endDate.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = {
        month: getMonthName(date),
        monthKey,
        income: 0,
        expenses: 0,
        net: 0,
        budgeted: 0,
        transactions: 0,
        savingsRate: 0
      };
    }

    // Aggregate transaction data by month
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].transactions++;
        
        if (transaction.type === 'income') {
          monthlyData[monthKey].income += transaction.amount || 0;
        } else if (transaction.type === 'expense') {
          monthlyData[monthKey].expenses += transaction.amount || 0;
        }
      }
    });

    // Aggregate budget data by month
    budgets.forEach(budget => {
      if (budget.period === 'monthly' && budget.budgetAmount) {
        // For simplicity, apply budget to all months (in real app, you'd check date ranges)
        Object.keys(monthlyData).forEach(monthKey => {
          monthlyData[monthKey].budgeted += budget.budgetAmount;
        });
      }
    });

    // Calculate derived metrics
    Object.values(monthlyData).forEach(month => {
      month.net = month.income - month.expenses;
      month.savingsRate = month.income > 0 ? ((month.income - month.expenses) / month.income * 100) : 0;
      month.budgetVariance = month.budgeted > 0 ? month.expenses - month.budgeted : 0;
    });

    return Object.values(monthlyData).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  }, [transactions, budgets, monthsToShow]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <p className="font-semibold text-gray-900 mb-3">{data.month}</p>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Income:</span>
              <span className="text-sm font-medium text-green-600">{formatCurrency(data.income)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Expenses:</span>
              <span className="text-sm font-medium text-red-600">{formatCurrency(data.expenses)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Net:</span>
              <span className={`text-sm font-medium ${data.net >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(data.net)}
              </span>
            </div>
            {data.budgeted > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Budgeted:</span>
                <span className="text-sm font-medium text-purple-600">{formatCurrency(data.budgeted)}</span>
              </div>
            )}
            <div className="border-t pt-1 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Savings Rate:</span>
                <span className="text-sm font-medium">{data.savingsRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Transactions:</span>
                <span className="text-sm font-medium">{data.transactions}</span>
              </div>
            </div>
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
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card 
        title="Monthly Analytics" 
        className={className}
        headerAction={
          <FontAwesomeIcon 
            icon={faChartArea} 
            className="text-gray-400" 
          />
        }
      >
        <div className="text-center py-8">
          <FontAwesomeIcon 
            icon={faCalendarAlt} 
            className="text-gray-400 text-3xl mb-4" 
          />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Monthly Data</h3>
          <p className="text-gray-500 mb-4">Add transactions to see monthly analytics</p>
        </div>
      </Card>
    );
  }

  // Calculate totals for summary
  const totals = chartData.reduce(
    (acc, month) => ({
      income: acc.income + month.income,
      expenses: acc.expenses + month.expenses,
      net: acc.net + month.net,
      transactions: acc.transactions + month.transactions
    }),
    { income: 0, expenses: 0, net: 0, transactions: 0 }
  );

  const avgSavingsRate = chartData.reduce((sum, month) => sum + month.savingsRate, 0) / chartData.length;

  return (
    <Card 
      title="Monthly Analytics" 
      className={className}
      headerAction={
        <div className="flex items-center space-x-4">
          {/* Month Selector */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            {monthOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onMonthsChange(option.value)}
                className={`px-3 py-1 rounded text-xs transition-colors ${
                  monthsToShow === option.value 
                    ? 'bg-white shadow text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          <FontAwesomeIcon 
            icon={faChartArea} 
            className="text-gray-400" 
          />
        </div>
      }
    >
      <div className="space-y-4">
        {/* Chart */}
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${Math.abs(value) > 1000 ? (value/1000).toFixed(0) + 'K' : value}`}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Income bars */}
              <Bar 
                yAxisId="left"
                dataKey="income" 
                fill="#4ECDC4" 
                name="Income"
                radius={[2, 2, 0, 0]}
              />
              
              {/* Expense bars */}
              <Bar 
                yAxisId="left"
                dataKey="expenses" 
                fill="#FF6B6B" 
                name="Expenses"
                radius={[2, 2, 0, 0]}
              />
              
              {/* Budget line (if available) */}
              {chartData.some(d => d.budgeted > 0) && (
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="budgeted" 
                  stroke="#BB8FCE" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#BB8FCE', strokeWidth: 2, r: 4 }}
                  name="Budget"
                />
              )}
              
              {/* Savings rate line */}
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="savingsRate" 
                stroke="#45B7D1" 
                strokeWidth={3}
                dot={{ fill: '#45B7D1', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7 }}
                name="Savings Rate (%)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Statistics */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-green-600">
                {formatCurrency(totals.income)}
              </div>
              <div className="text-xs text-gray-500">Total Income</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-red-600">
                {formatCurrency(totals.expenses)}
              </div>
              <div className="text-xs text-gray-500">Total Expenses</div>
            </div>
            <div>
              <div className={`text-lg font-semibold ${totals.net >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(totals.net)}
              </div>
              <div className="text-xs text-gray-500">Net Amount</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-purple-600">
                {avgSavingsRate.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">Avg Savings Rate</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {totals.transactions}
              </div>
              <div className="text-xs text-gray-500">Total Transactions</div>
            </div>
          </div>
        </div>

        {/* Financial Health Indicators */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Monthly Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className={`text-xl font-bold ${
                avgSavingsRate >= 20 ? 'text-green-600' : 
                avgSavingsRate >= 10 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {avgSavingsRate >= 20 ? '🎯' : avgSavingsRate >= 10 ? '⚠️' : '🚨'}
              </div>
              <div className="text-gray-600">
                {avgSavingsRate >= 20 ? 'Excellent' : 
                 avgSavingsRate >= 10 ? 'Good' : 'Needs Improvement'} Savings Rate
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">
                {chartData.filter(m => m.net > 0).length}/{chartData.length}
              </div>
              <div className="text-gray-600">Profitable Months</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">
                {(totals.transactions / chartData.length).toFixed(0)}
              </div>
              <div className="text-gray-600">Avg Transactions/Month</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MonthlyAnalyticsChart;