import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartPie, 
  faInfoCircle, 
  faChartBar,
  faList,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import Card from '../ui/Card';

const SpendingPieChart = ({ 
  categoryBreakdown = [],
  summary = { totalExpenses: 0 },
  isLoading = false,
  className = '',
  showLegend = true,
  height = 300
}) => {
  // Chart type state
  const [chartType, setChartType] = useState('pie'); // 'pie', 'bar', 'list'
  
  // Chart type options
  const chartTypes = [
    { key: 'pie', label: 'Pie Chart', icon: faChartPie },
    { key: 'bar', label: 'Bar Chart', icon: faChartBar },
    { key: 'list', label: 'List View', icon: faList }
  ];
  
  // Get current time period info
  const getCurrentTimePeriod = () => {
    const now = new Date();
    const currentMonth = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return `Current Month: ${currentMonth}`;
  };
  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Color palette for categories
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
  ];

  // Prepare chart data
  const chartData = categoryBreakdown.slice(0, 8).map((category, index) => ({
    name: category.categoryName || category.category || 'Unknown',
    value: category.amount || 0,
    formattedValue: formatCurrency(category.amount || 0),
    percentage: summary.totalExpenses > 0 ? (category.amount / summary.totalExpenses * 100) : 0,
    color: colors[index % colors.length]
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-gray-900">{data.payload.name}</p>
          <p className="text-blue-600">{data.payload.formattedValue}</p>
          <p className="text-gray-600 text-sm">{data.payload.percentage.toFixed(1)}% of total</p>
        </div>
      );
    }
    return null;
  };

  // Custom label function
  const renderLabel = (entry) => {
    return entry.percentage > 5 ? `${entry.percentage.toFixed(0)}%` : '';
  };

  if (isLoading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="flex justify-center">
            <div className="w-64 h-64 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </Card>
    );
  }

  // Show empty state if no spending data
  if (!categoryBreakdown || categoryBreakdown.length === 0) {
    return (
      <Card 
        title="Spending Distribution" 
        className={className}
        headerAction={
          <FontAwesomeIcon 
            icon={faChartPie} 
            className="text-gray-400" 
          />
        }
      >
        <div className="text-center py-8">
          <FontAwesomeIcon 
            icon={faInfoCircle} 
            className="text-gray-400 text-3xl mb-4" 
          />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Spending Data</h3>
          <p className="text-gray-500 mb-4">Add some transactions to see your spending distribution</p>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title="Spending Distribution" 
      className={className}
      headerAction={
        <div className="flex items-center space-x-4">
          {/* Time Period Indicator */}
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3" />
            <span>{getCurrentTimePeriod()}</span>
          </div>
          
          {/* Chart Type Selector */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            {chartTypes.map((type) => (
              <button
                key={type.key}
                onClick={() => setChartType(type.key)}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  chartType === type.key 
                    ? 'bg-white shadow text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title={type.label}
              >
                <FontAwesomeIcon icon={type.icon} className="w-3 h-3" />
              </button>
            ))}
          </div>
          
          {/* Total Amount */}
          <div className="text-sm text-gray-500">
            {formatCurrency(summary.totalExpenses)} total
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Chart Container */}
        <div style={{ height }}>
          {chartType === 'pie' && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="45%"
                  labelLine={false}
                  label={renderLabel}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                {showLegend && (
                  <Legend 
                    verticalAlign="bottom" 
                    height={70}
                    wrapperStyle={{ 
                      paddingTop: '10px',
                      fontSize: '11px',
                      lineHeight: '14px'
                    }}
                    iconType="circle"
                    formatter={(value, entry) => (
                      <span style={{ 
                        color: entry.color, 
                        fontSize: '11px',
                        lineHeight: '14px'
                      }}>
                        {value}
                      </span>
                    )}
                  />
                )}
              </PieChart>
            </ResponsiveContainer>
          )}
          
          {chartType === 'bar' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  interval={0}
                  fontSize={12}
                />
                <YAxis 
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          
          {chartType === 'list' && (
            <div className="space-y-3 h-full overflow-y-auto">
              {chartData.map((category, index) => (
                <div key={category.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <div>
                      <div className="font-medium text-gray-900">{category.name}</div>
                      <div className="text-sm text-gray-500">{category.percentage.toFixed(1)}% of total</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{category.formattedValue}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="border-t pt-6 mt-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {categoryBreakdown.length}
              </div>
              <div className="text-xs text-gray-500">Categories</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {categoryBreakdown.reduce((sum, cat) => sum + (cat.transactionCount || 0), 0)}
              </div>
              <div className="text-xs text-gray-500">Transactions</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrency(summary.totalExpenses)}
              </div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>
        </div>

        {/* Show more link if there are more categories */}
        {categoryBreakdown.length > 8 && (
          <div className="text-center">
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
              View All {categoryBreakdown.length} Categories
            </button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SpendingPieChart;