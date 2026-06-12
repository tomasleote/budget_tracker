import React from 'react';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

const MonthlyTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

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
};

export default MonthlyTooltip;
