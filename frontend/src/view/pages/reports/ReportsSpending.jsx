import React from 'react';
import Card from '../../components/ui/Card';
import {
  SpendingPieChart,
  SpendingTrendChart,
  MonthlyAnalyticsChart
} from '../../components/charts';
import { formatCurrency, formatPercentage } from '../../../controller/utils/formatters';

const ReportsSpending = ({ filteredData, budgets }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <SpendingPieChart
        categoryBreakdown={filteredData.categoryBreakdown}
        summary={filteredData.summary}
        isLoading={false}
        height={350}
        showLegend={true}
      />
      <SpendingTrendChart
        transactions={filteredData.transactions}
        dateRange={30}
        isLoading={false}
        chartType="area"
        height={350}
      />
    </div>

    <MonthlyAnalyticsChart
      transactions={filteredData.transactions}
      budgets={budgets}
      monthsToShow={6}
      isLoading={false}
      height={400}
    />

    <Card title="Top Spending Categories">
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                <th className="text-left py-3 px-4" style={{ color: 'var(--text-primary)' }}>Category</th>
                <th className="text-right py-3 px-4" style={{ color: 'var(--text-primary)' }}>Amount</th>
                <th className="text-right py-3 px-4" style={{ color: 'var(--text-primary)' }}>Transactions</th>
                <th className="text-right py-3 px-4" style={{ color: 'var(--text-primary)' }}>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.categoryBreakdown.slice(0, 10).map((category) => {
                const percentage = filteredData.summary.expenses > 0
                  ? (category.amount / filteredData.summary.expenses * 100)
                  : 0;
                return (
                  <tr key={category.category} style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                    <td className="py-3 px-4 font-medium">{category.category}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(category.amount)}</td>
                    <td className="py-3 px-4 text-right">{category.count}</td>
                    <td className="py-3 px-4 text-right">{formatPercentage(percentage)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  </div>
);

export default ReportsSpending;
