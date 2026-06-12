/**
 * Per-entity CSV exporters: transactions, budgets, monthly analytics
 */

import { arrayToCSV, downloadCSV } from './csvCore';

/**
 * @param {Array} transactions
 * @param {string|null} filename
 * @returns {string} CSV content
 */
export const exportTransactionsCSV = (transactions, filename = null) => {
  if (!transactions || transactions.length === 0) throw new Error('No transactions to export');

  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

  const csvData = sortedTransactions.map((t, index) => ({
    'Transaction ID': t.id,
    'Date': new Date(t.date).toLocaleDateString(),
    'Day of Week': new Date(t.date).toLocaleDateString('en-US', { weekday: 'long' }),
    'Type': t.type.charAt(0).toUpperCase() + t.type.slice(1),
    'Category': t.category,
    'Description': t.description,
    'Amount': t.amount,
    'Formatted Amount': `${t.amount.toFixed(2)}`,
    'Month': new Date(t.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
    'Year': new Date(t.date).getFullYear(),
    'Created At': new Date(t.createdAt).toLocaleString(),
    'Updated At': new Date(t.updatedAt).toLocaleString(),
    'Record Number': index + 1
  }));

  const csvContent = arrayToCSV(csvData);
  downloadCSV(csvContent, filename || `all_transactions_${new Date().toISOString().split('T')[0]}.csv`);
  return csvContent;
};

/**
 * @param {Array} budgets
 * @param {string|null} filename
 * @returns {string} CSV content
 */
export const exportBudgetsCSV = (budgets, filename = null) => {
  if (!budgets || budgets.length === 0) throw new Error('No budgets to export');

  const sortedBudgets = [...budgets].sort((a, b) => (b.utilizationPercentage || 0) - (a.utilizationPercentage || 0));

  const csvData = sortedBudgets.map((budget, index) => {
    const spent = budget.progress?.spent || 0;
    const remaining = (budget.budgetAmount || 0) - spent;
    const utilization = budget.utilizationPercentage || 0;
    const daysInPeriod = Math.ceil((new Date(budget.endDate) - new Date(budget.startDate)) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.max(1, Math.ceil((new Date() - new Date(budget.startDate)) / (1000 * 60 * 60 * 24)));

    return {
      'Budget ID': budget.id,
      'Category': budget.category,
      'Budget Amount': budget.budgetAmount,
      'Amount Spent': spent,
      'Amount Remaining': remaining,
      'Utilization Percentage': utilization,
      'Performance Status': utilization > 100 ? 'Exceeded' : utilization >= 80 ? 'Near Limit' : 'Healthy',
      'Over Budget Amount': utilization > 100 ? (spent - budget.budgetAmount).toFixed(2) : 0,
      'Period Type': budget.period,
      'Active Status': budget.isActive ? 'Active' : 'Inactive',
      'Start Date': new Date(budget.startDate).toLocaleDateString(),
      'End Date': new Date(budget.endDate).toLocaleDateString(),
      'Days in Period': daysInPeriod,
      'Days Remaining': Math.max(0, Math.ceil((new Date(budget.endDate) - new Date()) / (1000 * 60 * 60 * 24))),
      'Daily Budget': (budget.budgetAmount / daysInPeriod).toFixed(2),
      'Daily Spending Average': spent > 0 ? (spent / daysElapsed).toFixed(2) : 0,
      'Description': budget.description || '',
      'Created At': new Date(budget.createdAt).toLocaleString(),
      'Updated At': new Date(budget.updatedAt).toLocaleString(),
      'Priority Rank': index + 1
    };
  });

  const csvContent = arrayToCSV(csvData);
  downloadCSV(csvContent, filename || `budget_analysis_${new Date().toISOString().split('T')[0]}.csv`);
  return csvContent;
};

/**
 * @param {Array} monthlyData
 * @param {string|null} filename
 * @returns {string} CSV content
 */
export const exportMonthlyAnalyticsCSV = (monthlyData, filename = null) => {
  if (!monthlyData || monthlyData.length === 0) throw new Error('No monthly data to export');

  const csvData = monthlyData.map(month => ({
    'Month': month.month || month.formattedDate,
    'Income': month.income || 0,
    'Expenses': month.expenses || 0,
    'Net Amount': month.net || 0,
    'Savings Rate %': month.savingsRate || 0,
    'Transactions': month.transactions || 0,
    'Budget Total': month.budgeted || 0
  }));

  const csvContent = arrayToCSV(csvData);
  downloadCSV(csvContent, filename || `monthly_analytics_${new Date().toISOString().split('T')[0]}.csv`);
  return csvContent;
};
