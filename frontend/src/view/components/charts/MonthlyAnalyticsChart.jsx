import React, { useMemo } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartArea, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import Card from '../ui/Card';
import buildMonthlyChartData from './monthly-analytics/chartDataBuilder';
import MonthlyTooltip from './monthly-analytics/MonthlyTooltip';
import MonthlySummary from './monthly-analytics/MonthlySummary';

const MONTH_OPTIONS = [
  { value: 3, label: '3 months' },
  { value: 6, label: '6 months' },
  { value: 12, label: '12 months' }
];

const MonthlyAnalyticsChart = ({
  transactions = [],
  budgets = [],
  monthsToShow = 6,
  onMonthsChange = () => {},
  isLoading = false,
  className = '',
  height = 400
}) => {
  const chartData = useMemo(
    () => buildMonthlyChartData(transactions, budgets, monthsToShow),
    [transactions, budgets, monthsToShow]
  );

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
        headerAction={<FontAwesomeIcon icon={faChartArea} className="text-gray-400" />}
      >
        <div className="text-center py-8">
          <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 text-3xl mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Monthly Data</h3>
          <p className="text-gray-500 mb-4">Add transactions to see monthly analytics</p>
        </div>
      </Card>
    );
  }

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
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            {MONTH_OPTIONS.map((option) => (
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
          <FontAwesomeIcon icon={faChartArea} className="text-gray-400" />
        </div>
      }
    >
      <div className="space-y-4">
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
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
              <Tooltip content={<MonthlyTooltip />} />
              <Legend />
              <Bar yAxisId="left" dataKey="income" fill="#4ECDC4" name="Income" radius={[2, 2, 0, 0]} />
              <Bar yAxisId="left" dataKey="expenses" fill="#FF6B6B" name="Expenses" radius={[2, 2, 0, 0]} />
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

        <MonthlySummary totals={totals} avgSavingsRate={avgSavingsRate} chartData={chartData} />
      </div>
    </Card>
  );
};

export default MonthlyAnalyticsChart;