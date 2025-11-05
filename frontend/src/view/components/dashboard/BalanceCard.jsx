import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faWallet, 
  faArrowUp, 
  faArrowDown, 
  faChartLine,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import Card from '../ui/Card';

const BalanceCard = ({ 
  summary = {
    currentBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    formattedBalance: '$0.00',
    formattedIncome: '$0.00',
    formattedExpenses: '$0.00',
    isPositiveBalance: true,
    savingsRate: 0
  },
  isLoading = false,
  className = '',
  timePeriodLabel = null // FIX BUG #2: Accept month name to display
}) => {
  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Use formatted values from summary or format manually as fallback
  const displayBalance = summary.formattedBalance || formatCurrency(summary.currentBalance);
  const displayIncome = summary.formattedIncome || formatCurrency(summary.totalIncome);
  const displayExpenses = summary.formattedExpenses || formatCurrency(summary.totalExpenses);

  if (isLoading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-10 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  const balanceColor = summary.isPositiveBalance 
    ? 'text-green-600' 
    : 'text-red-600';

  const balanceIcon = summary.isPositiveBalance 
    ? faChartLine 
    : faInfoCircle;

  const savingsRateColor = summary.savingsRate >= 20 
    ? 'text-green-600' 
    : summary.savingsRate >= 10 
    ? 'text-yellow-600' 
    : 'text-red-600';

  return (
    <Card 
      title="Current Balance" 
      className={className}
      headerAction={
        <div className="flex items-center space-x-2">
          {timePeriodLabel && (
            <span className="text-xs text-gray-500">{timePeriodLabel}</span>
          )}
          <FontAwesomeIcon 
            icon={faWallet} 
            className="text-gray-400" 
          />
        </div>
      }
    >
      <div className="space-y-6">
        {/* Main Balance Display */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <FontAwesomeIcon 
              icon={balanceIcon} 
              className={`text-lg ${balanceColor} mr-2`} 
            />
            <span className={`text-3xl font-bold ${balanceColor}`}>
              {displayBalance}
            </span>
          </div>
          
          {/* Savings Rate */}
          <div className="flex items-center justify-center">
            <span className="text-sm text-gray-500 mr-2">Savings Rate:</span>
            <span className={`text-sm font-semibold ${savingsRateColor}`}>
              {(summary.savingsRate || 0).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Income and Expenses Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Income */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center">
                  <FontAwesomeIcon 
                    icon={faArrowUp} 
                    className="text-green-600 text-sm mr-2" 
                  />
                  <span className="text-sm font-medium text-green-800">
                    Income
                  </span>
                </div>
                <p className="text-lg font-semibold text-green-700 mt-1">
                  {displayIncome}
                </p>
              </div>
            </div>
          </div>

          {/* Expenses */}
          <div className="bg-red-50 rounded-lg p-4 border border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center">
                  <FontAwesomeIcon 
                    icon={faArrowDown} 
                    className="text-red-600 text-sm mr-2" 
                  />
                  <span className="text-sm font-medium text-red-800">
                    Expenses
                  </span>
                </div>
                <p className="text-lg font-semibold text-red-700 mt-1">
                  {displayExpenses}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Insight */}
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="flex items-start">
            <FontAwesomeIcon 
              icon={faInfoCircle} 
              className="text-blue-500 text-sm mr-2 mt-0.5" 
            />
            <div className="text-sm text-gray-600">
              {summary.isPositiveBalance ? (
                <span>
                  You're saving <strong className="text-green-600">
                    {displayBalance}
                  </strong> this period. 
                  {summary.savingsRate >= 20 && " Excellent work!"}
                  {summary.savingsRate < 20 && summary.savingsRate >= 10 && " Good progress!"}
                  {summary.savingsRate < 10 && " Consider reducing expenses."}
                </span>
              ) : (
                <span>
                  You're spending <strong className="text-red-600">
                    {displayBalance.replace('-', '')}
                  </strong> more than you earn. Consider reviewing your budget.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BalanceCard;
