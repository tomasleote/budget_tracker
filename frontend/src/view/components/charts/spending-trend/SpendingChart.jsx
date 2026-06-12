import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Area, AreaChart
} from 'recharts';
import SpendingTooltip from './SpendingTooltip';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

const AXIS_PROPS = {
  stroke: '#6b7280',
  fontSize: 12,
  tickLine: false
};

const SpendingChart = ({ chartData, chartType, height }) => (
  <div style={{ width: '100%', height }}>
    <ResponsiveContainer>
      {chartType === 'area' ? (
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="displayDate" {...AXIS_PROPS} />
          <YAxis {...AXIS_PROPS} tickFormatter={formatCurrency} />
          <Tooltip content={<SpendingTooltip />} />
          <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="#fef2f2" strokeWidth={2} name="Expenses" />
          <Area type="monotone" dataKey="income" stroke="#10b981" fill="#f0fdf4" strokeWidth={2} name="Income" />
        </AreaChart>
      ) : (
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="displayDate" {...AXIS_PROPS} />
          <YAxis {...AXIS_PROPS} tickFormatter={formatCurrency} />
          <Tooltip content={<SpendingTooltip />} />
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
);

export default SpendingChart;
