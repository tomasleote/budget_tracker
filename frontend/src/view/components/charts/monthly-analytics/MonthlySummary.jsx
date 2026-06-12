import React from 'react';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

const MonthlySummary = ({ totals, avgSavingsRate, chartData }) => (
  <>
    <div className="border-t pt-4">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-center">
        <div>
          <div className="text-lg font-semibold text-green-600">{formatCurrency(totals.income)}</div>
          <div className="text-xs text-gray-500">Total Income</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-red-600">{formatCurrency(totals.expenses)}</div>
          <div className="text-xs text-gray-500">Total Expenses</div>
        </div>
        <div>
          <div className={`text-lg font-semibold ${totals.net >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatCurrency(totals.net)}
          </div>
          <div className="text-xs text-gray-500">Net Amount</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-purple-600">{avgSavingsRate.toFixed(1)}%</div>
          <div className="text-xs text-gray-500">Avg Savings Rate</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-gray-900">{totals.transactions}</div>
          <div className="text-xs text-gray-500">Total Transactions</div>
        </div>
      </div>
    </div>

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
  </>
);

export default MonthlySummary;
