import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faBullseye, faExclamationTriangle, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import Card from '../ui/Card';

const BudgetComparisonChart = ({ 
  budgets = [],
  isLoading = false,
  className = '',
  height = 350
}) => {
  // Get current time period info
  const getCurrentTimePeriod = () => {
    const now = new Date();
    const currentMonth = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return `Current Month: ${currentMonth}`;
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Prepare chart data
  const chartData = budgets.slice(0, 8).map((budget) => {
    const spent = budget.progress?.spent || 0;
    const budgetAmount = budget.budgetAmount || 0;
    const remaining = Math.max(0, budgetAmount - spent);
    const percentage = budgetAmount > 0 ? (spent / budgetAmount * 100) : 0;
    
    return {
      category: budget.category || 'Unknown',
      budgeted: budgetAmount,
      spent: spent,
      remaining: remaining,
      percentage: percentage,
      status: percentage > 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'good',
      formattedBudgeted: formatCurrency(budgetAmount),
      formattedSpent: formatCurrency(spent),
      formattedRemaining: formatCurrency(remaining)
    };
  });

  // Get color based on status
  const getBarColor = (status) => {
    switch (status) {
      case 'exceeded': return '#FF4D4F';
      case 'warning': return '#FA8C16';
      case 'good': return '#52C41A';
      default: return '#D9D9D9';
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <p className="font-semibold text-gray-900 mb-2">{data.category}</p>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Budgeted:</span>
              <span className="text-sm font-medium">{data.formattedBudgeted}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Spent:</span>
              <span className="text-sm font-medium">{data.formattedSpent}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Remaining:</span>
              <span className={`text-sm font-medium ${data.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.formattedRemaining}
              </span>
            </div>
            <div className="border-t pt-1 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Progress:</span>
                <span className={`text-sm font-medium ${
                  data.status === 'exceeded' ? 'text-red-600' : 
                  data.status === 'warning' ? 'text-orange-600' : 'text-green-600'
                }`}>
                  {data.percentage.toFixed(1)}%
                </span>
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
          <div className="h-80 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card 
        title="Budget vs Actual" 
        className={className}
        headerAction={
          <FontAwesomeIcon 
            icon={faChartBar} 
            className="text-gray-400" 
          />
        }
      >
        <div className="text-center py-8">
          <FontAwesomeIcon 
            icon={faBullseye} 
            className="text-gray-400 text-3xl mb-4" 
          />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Budget Data</h3>
          <p className="text-gray-500 mb-4">Create budgets to see budget vs actual spending comparison</p>
          <button 
            onClick={() => window.location.href = '/budget'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Create Budget
          </button>
        </div>
      </Card>
    );
  }

  // Calculate summary stats
  const totalBudgeted = chartData.reduce((sum, item) => sum + item.budgeted, 0);
  const totalSpent = chartData.reduce((sum, item) => sum + item.spent, 0);
  const exceededCount = chartData.filter(item => item.status === 'exceeded').length;
  const warningCount = chartData.filter(item => item.status === 'warning').length;

  return (
    <Card 
      title="Budget vs Actual" 
      className={className}
      headerAction={
        <div className="flex items-center space-x-4">
          {/* Time Period Indicator */}
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3" />
            <span>{getCurrentTimePeriod()}</span>
          </div>
          
          {/* Status indicators */}
          {exceededCount > 0 && (
            <div className="flex items-center space-x-1">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 w-4 h-4" />
              <span className="text-sm text-red-500">{exceededCount} exceeded</span>
            </div>
          )}
          {warningCount > 0 && (
            <div className="flex items-center space-x-1">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-orange-500 w-4 h-4" />
              <span className="text-sm text-orange-500">{warningCount} near limit</span>
            </div>
          )}
          <FontAwesomeIcon 
            icon={faChartBar} 
            className="text-gray-400" 
          />
        </div>
      }
    >
      <div className="space-y-4">
        {/* Chart */}
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="category" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Budgeted amount bars (background) */}
              <Bar 
                dataKey="budgeted" 
                fill="#E5E7EB" 
                name="Budgeted"
                radius={[4, 4, 0, 0]}
              />
              
              {/* Spent amount bars (foreground with status colors) */}
              <Bar 
                dataKey="spent" 
                name="Spent"
                radius={[4, 4, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-300 rounded"></div>
            <span className="text-gray-600">Budgeted</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-600">On Track</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span className="text-gray-600">Near Limit</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-gray-600">Exceeded</span>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrency(totalBudgeted)}
              </div>
              <div className="text-xs text-gray-500">Total Budgeted</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrency(totalSpent)}
              </div>
              <div className="text-xs text-gray-500">Total Spent</div>
            </div>
            <div>
              <div className={`text-lg font-semibold ${
                totalSpent <= totalBudgeted ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(totalBudgeted - totalSpent)}
              </div>
              <div className="text-xs text-gray-500">
                {totalSpent <= totalBudgeted ? 'Remaining' : 'Over Budget'}
              </div>
            </div>
          </div>
        </div>

        {/* Budget Performance Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-green-600">
                {chartData.filter(item => item.status === 'good').length}
              </div>
              <div className="text-xs text-gray-500">On Track</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-orange-600">
                {warningCount}
              </div>
              <div className="text-xs text-gray-500">Near Limit</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-red-600">
                {exceededCount}
              </div>
              <div className="text-xs text-gray-500">Exceeded</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BudgetComparisonChart;