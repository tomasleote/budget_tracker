import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartPie,
  faInfoCircle,
  faArrowUp,
  faArrowDown
} from '@fortawesome/free-solid-svg-icons';
import Card from '../ui/Card';

// Import the new Recharts pie chart
import { SpendingPieChart } from '../charts';

const SpendingChart = ({ 
  categoryBreakdown = [],
  summary = { totalExpenses: 0 },
  isLoading = false,
  className = '',
  useRecharts = true // New prop to toggle between old and new chart
}) => {
  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Calculate percentage for each category
  const getCategoryPercentage = (amount) => {
    if (!summary.totalExpenses || summary.totalExpenses === 0) return 0;
    return (amount / summary.totalExpenses * 100);
  };

  // Color palette for categories
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
  ];

  if (isLoading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="flex justify-center">
            <div className="w-48 h-48 bg-gray-200 rounded-full"></div>
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  // Show empty state if no spending data
  if (!categoryBreakdown || categoryBreakdown.length === 0) {
    return (
      <Card 
        title="Spending by Category" 
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
          <p className="text-gray-500 mb-4">Add some transactions to see your spending breakdown</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Add Transaction
          </button>
        </div>
      </Card>
    );
  }

  // Create chart data
  const topCategories = categoryBreakdown.slice(0, 5);

  // Use new Recharts component by default
  if (useRecharts) {
    return (
      <SpendingPieChart 
        categoryBreakdown={categoryBreakdown}
        summary={summary}
        isLoading={isLoading}
        className={className}
        height={350}
      />
    );
  }

  // Fallback to original implementation
  return (
    <Card 
      title="Spending by Category" 
      className={className}
      headerAction={
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {formatCurrency(summary.totalExpenses)} total
          </span>
          <FontAwesomeIcon 
            icon={faChartPie} 
            className="text-gray-400" 
          />
        </div>
      }
    >
      <div className="space-y-6">
        {/* Simple Visual Chart - Horizontal Bars */}
        <div className="space-y-3">
          {topCategories.map((category, index) => {
            const amount = category.amount || 0;
            const formattedAmount = category.formattedAmount || formatCurrency(amount);
            const percentage = getCategoryPercentage(amount);
            const color = colors[index % colors.length];
            
            return (
              <div key={category.category || index} className="space-y-2">
                {/* Category Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="text-sm font-medium text-gray-900">
                      {category.categoryName || category.category || 'Unknown'}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {formattedAmount}
                    </div>
                    <div className="text-xs text-gray-500">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: color 
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {topCategories.length}
              </div>
              <div className="text-xs text-gray-500">Categories</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {topCategories.reduce((sum, cat) => sum + (cat.count || 0), 0)}
              </div>
              <div className="text-xs text-gray-500">Transactions</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrency(
                  topCategories.reduce((sum, cat) => sum + (cat.amount || 0), 0)
                )}
              </div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>
        </div>

        {/* Show more link if there are more categories */}
        {categoryBreakdown.length > 5 && (
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

export default SpendingChart;
