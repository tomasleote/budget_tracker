/**
 * HTML document generator for PDF reports
 */

import { formatCurrency } from '../../formatters';
import { generatePieChartSVG, generateBudgetBarChartSVG } from './pdfCharts';
import { PDF_STYLES } from './pdfStyles';

const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

const buildCategorySection = (categoryBreakdown, summary, categoryChart) => {
  const rows = categoryBreakdown.slice(0, 10).map(cat => `
    <tr>
      <td>${cat.category || cat.categoryName || 'Unknown'}</td>
      <td class="text-right">${formatCurrency(cat.amount || 0)}</td>
      <td class="text-right">${cat.count || 0}</td>
      <td class="text-right">${((cat.amount || 0) / (summary.totalExpenses || 1) * 100).toFixed(1)}%</td>
    </tr>`).join('');
  return `<div class="section"><h2>Spending by Category</h2>${categoryChart}
    <table><thead><tr><th>Category</th><th class="text-right">Amount</th><th class="text-right">Transactions</th><th class="text-right">Percentage</th></tr></thead>
    <tbody>${rows}</tbody></table></div>`;
};

const buildBudgetSection = (budgets, budgetChart) => {
  const rows = budgets.slice(0, 10).map(b => `
    <tr>
      <td>${b.category}</td>
      <td class="text-right">${formatCurrency(b.budgetAmount || 0)}</td>
      <td class="text-right">${formatCurrency(b.progress?.spent || 0)}</td>
      <td class="text-right">${formatCurrency((b.budgetAmount || 0) - (b.progress?.spent || 0))}</td>
      <td class="text-right">${(b.utilizationPercentage || 0).toFixed(1)}%</td>
    </tr>`).join('');
  return `<div class="section"><h2>Budget Performance</h2>${budgetChart}
    <table><thead><tr><th>Category</th><th class="text-right">Budgeted</th><th class="text-right">Spent</th><th class="text-right">Remaining</th><th class="text-right">Utilization</th></tr></thead>
    <tbody>${rows}</tbody></table></div>`;
};

const buildMonthlySection = (monthlyBreakdown) => {
  const rows = monthlyBreakdown.map(m => `
    <tr>
      <td>${m.month}</td>
      <td class="text-right positive">${formatCurrency(m.income || 0)}</td>
      <td class="text-right negative">${formatCurrency(m.expenses || 0)}</td>
      <td class="text-right ${(m.income - m.expenses) >= 0 ? 'positive' : 'negative'}">${formatCurrency((m.income || 0) - (m.expenses || 0))}</td>
      <td class="text-right">${m.count || 0}</td>
    </tr>`).join('');
  return `<div class="section"><h2>Monthly Summary</h2>
    <table><thead><tr><th>Month</th><th class="text-right">Income</th><th class="text-right">Expenses</th><th class="text-right">Net</th><th class="text-right">Transactions</th></tr></thead>
    <tbody>${rows}</tbody></table></div>`;
};

const buildTransactionSection = (transactions) => {
  const rows = transactions.map(t => `
    <tr>
      <td>${formatDate(t.date)}</td>
      <td style="text-transform: capitalize;">${t.type}</td>
      <td>${t.category}</td>
      <td>${t.description}</td>
      <td class="text-right ${t.type === 'income' ? 'positive' : 'negative'}">${formatCurrency(t.amount || 0)}</td>
    </tr>`).join('');
  const note = transactions.length > 50
    ? `<p style="text-align: center; color: #666; font-style: italic; margin-top: 10px;">Total of ${transactions.length} transactions shown</p>`
    : '';
  return `<div class="section"><h2>All Transactions</h2>
    <table><thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Description</th><th class="text-right">Amount</th></tr></thead>
    <tbody>${rows}</tbody></table>${note}</div>`;
};

/**
 * @param {Object} data
 * @param {string} title
 * @param {Object} options
 * @returns {string} Complete HTML document string
 */
export const generatePDFHTML = (data, title, options = {}) => {
  const {
    transactions = [],
    budgets = [],
    summary = {},
    categoryBreakdown = [],
    monthlyBreakdown = [],
    dateRange = 'All Time',
    generatedAt = new Date().toISOString()
  } = data;

  const {
    includeCategories = true,
    includeSummary = true,
    includeTransactions = false
  } = options;

  const totalExpenses = summary.totalExpenses || summary.expenses || 0;
  const categoryChart = (includeCategories && categoryBreakdown.length > 0 && totalExpenses > 0)
    ? generatePieChartSVG(categoryBreakdown, totalExpenses)
    : '';
  const budgetChart = (budgets.length > 0 && title.includes('Budget'))
    ? generateBudgetBarChartSVG(budgets)
    : '';

  const summarySection = includeSummary ? `
    <div class="section"><h2>Financial Summary</h2>
      <div class="summary-grid">
        <div class="summary-card"><div class="label">Total Income</div><div class="value positive">${formatCurrency(summary.totalIncome || 0)}</div></div>
        <div class="summary-card"><div class="label">Total Expenses</div><div class="value negative">${formatCurrency(summary.totalExpenses || 0)}</div></div>
        <div class="summary-card"><div class="label">Net Balance</div><div class="value ${(summary.currentBalance || 0) >= 0 ? 'positive' : 'negative'}">${formatCurrency(summary.currentBalance || 0)}</div></div>
        <div class="summary-card"><div class="label">Savings Rate</div><div class="value">${(summary.savingsRate || 0).toFixed(1)}%</div></div>
      </div>
    </div>` : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>${PDF_STYLES}</style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <div class="subtitle">Period: ${dateRange}</div>
    <div class="subtitle">Generated: ${new Date(generatedAt).toLocaleString()}</div>
  </div>
  ${summarySection}
  ${monthlyBreakdown.length > 0 ? buildMonthlySection(monthlyBreakdown) : ''}
  ${includeCategories && categoryBreakdown.length > 0 ? buildCategorySection(categoryBreakdown, summary, categoryChart) : ''}
  ${budgets.length > 0 && title.includes('Budget') ? buildBudgetSection(budgets, budgetChart) : ''}
  ${includeTransactions && transactions.length > 0 ? buildTransactionSection(transactions) : ''}
  <div class="footer">
    <p>Budget Tracker Financial Report - Generated on ${new Date().toLocaleDateString()}</p>
    <p>This report contains ${transactions.length} transactions and ${budgets.length} budgets</p>
  </div>
</body>
</html>`;
};
