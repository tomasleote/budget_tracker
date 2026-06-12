import React from 'react';
import Card from '../../components/ui/Card';
import { formatCurrency, formatPercentage } from '../../../controller/utils/formatters';

const ReportsTrends = ({ filteredData, transactionStats, budgetStats }) => (
  <div className="space-y-6">
    <Card title="Financial Trends & Insights">
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Spending Insights</h4>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <li>• Average transaction: {formatCurrency(transactionStats.averageExpense || 0)}</li>
              <li>• Most active category: {filteredData.categoryBreakdown[0]?.category || 'None'}</li>
              <li>• Transaction frequency: {formatPercentage(transactionStats.transactionFrequency || 0)} per day</li>
              <li>• Savings rate: {formatPercentage(filteredData.summary.income > 0
                ? ((filteredData.summary.income - filteredData.summary.expenses) / filteredData.summary.income * 100)
                : 0)}
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Recommendations</h4>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {filteredData.summary.expenses > filteredData.summary.income && (
                <li>• ⚠️ Expenses exceed income - review spending</li>
              )}
              {budgetStats.exceededBudgets > 0 && (
                <li>• ⚠️ {budgetStats.exceededBudgets} budget(s) exceeded</li>
              )}
              {filteredData.categoryBreakdown.length > 0 && (
                <li>• 💡 Consider budgeting for {filteredData.categoryBreakdown[0]?.category}</li>
              )}
              <li>• 📊 Track spending patterns for better insights</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>

    <Card title="Transaction Activity">
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Income Transactions', value: transactionStats.incomeTransactions },
            { label: 'Expense Transactions', value: transactionStats.expenseTransactions },
            { label: 'Avg Income', value: formatCurrency(transactionStats.averageIncome || 0) },
            { label: 'Avg Expense', value: formatCurrency(transactionStats.averageExpense || 0) }
          ].map(({ label, value }) => (
            <div key={label} className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  </div>
);

export default ReportsTrends;
