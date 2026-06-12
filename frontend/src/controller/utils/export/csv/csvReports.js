/**
 * Multi-entity CSV report exporters: financial summary and complete report
 */

import { arrayToCSV, downloadCSV } from './csvCore';

/**
 * @param {Object} summary
 * @param {Array} categoryBreakdown
 * @param {Array} transactions
 * @param {Array} budgets
 * @param {string|null} filename
 * @returns {string} CSV content
 */
export const exportFinancialSummaryCSV = (summary, categoryBreakdown, transactions = [], budgets = [], filename = null) => {
  const totalIncome = summary.income || summary.totalIncome || 0;
  const totalExpenses = summary.expenses || summary.totalExpenses || 0;
  const netBalance = summary.balance || summary.currentBalance || (totalIncome - totalExpenses);
  const savingsRate = totalIncome > 0 ? ((netBalance / totalIncome) * 100) : 0;

  const incomeTransactions = transactions.filter(t => t.type === 'income').length;
  const expenseTransactions = transactions.filter(t => t.type === 'expense').length;
  const transactionCount = transactions.length;
  const avgIncomeAmount = incomeTransactions > 0 ? totalIncome / incomeTransactions : 0;
  const avgExpenseAmount = expenseTransactions > 0 ? totalExpenses / expenseTransactions : 0;

  const activeBudgets = budgets.filter(b => b.isActive).length;
  const totalBudgetAmount = budgets.reduce((sum, b) => sum + (b.budgetAmount || 0), 0);
  const totalBudgetSpent = budgets.reduce((sum, b) => sum + (b.progress?.spent || 0), 0);
  const budgetUtilization = totalBudgetAmount > 0 ? (totalBudgetSpent / totalBudgetAmount * 100) : 0;

  const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome * 100) : 0;
  const healthScore = Math.max(0, 100 - expenseRatio + (savingsRate * 0.5));

  const summaryData = [
    { 'Metric Type': 'Income', 'Metric': 'Total Income', 'Value': totalIncome, 'Formatted': `${totalIncome.toFixed(2)}` },
    { 'Metric Type': 'Income', 'Metric': 'Income Transactions', 'Value': incomeTransactions, 'Formatted': incomeTransactions },
    { 'Metric Type': 'Income', 'Metric': 'Average Income per Transaction', 'Value': avgIncomeAmount, 'Formatted': `${avgIncomeAmount.toFixed(2)}` },
    { 'Metric Type': 'Expenses', 'Metric': 'Total Expenses', 'Value': totalExpenses, 'Formatted': `${totalExpenses.toFixed(2)}` },
    { 'Metric Type': 'Expenses', 'Metric': 'Expense Transactions', 'Value': expenseTransactions, 'Formatted': expenseTransactions },
    { 'Metric Type': 'Expenses', 'Metric': 'Average Expense per Transaction', 'Value': avgExpenseAmount, 'Formatted': `${avgExpenseAmount.toFixed(2)}` },
    { 'Metric Type': 'Balance', 'Metric': 'Net Balance', 'Value': netBalance, 'Formatted': `${netBalance.toFixed(2)}` },
    { 'Metric Type': 'Ratios', 'Metric': 'Savings Rate %', 'Value': savingsRate, 'Formatted': `${savingsRate.toFixed(1)}%` },
    { 'Metric Type': 'Ratios', 'Metric': 'Expense Ratio %', 'Value': expenseRatio, 'Formatted': `${expenseRatio.toFixed(1)}%` },
    { 'Metric Type': 'Budgets', 'Metric': 'Active Budgets', 'Value': activeBudgets, 'Formatted': activeBudgets },
    { 'Metric Type': 'Budgets', 'Metric': 'Total Budget Amount', 'Value': totalBudgetAmount, 'Formatted': `${totalBudgetAmount.toFixed(2)}` },
    { 'Metric Type': 'Budgets', 'Metric': 'Budget Utilization %', 'Value': budgetUtilization, 'Formatted': `${budgetUtilization.toFixed(1)}%` },
    { 'Metric Type': 'Health', 'Metric': 'Financial Health Score', 'Value': healthScore, 'Formatted': `${healthScore.toFixed(1)}/100` }
  ];

  const categoryData = (categoryBreakdown || []).map((category, index) => {
    const amount = category.amount || 0;
    const percentage = totalExpenses > 0 ? (amount / totalExpenses * 100) : 0;
    const avgPerTransaction = category.count > 0 ? amount / category.count : 0;
    return {
      'Category Rank': index + 1,
      'Category Name': category.category || category.categoryName,
      'Total Amount': amount,
      'Formatted Amount': `${amount.toFixed(2)}`,
      'Percentage of Expenses': percentage,
      'Formatted Percentage': `${percentage.toFixed(1)}%`,
      'Transaction Count': category.count || 0,
      'Average per Transaction': avgPerTransaction,
      'Formatted Average': `${avgPerTransaction.toFixed(2)}`,
      'Budget Status': budgets.find(b => b.category === category.category) ? 'Budgeted' : 'Not Budgeted'
    };
  });

  const combinedData = [
    { 'Section': 'COMPREHENSIVE FINANCIAL SUMMARY' },
    { 'Section': `Report Generated: ${new Date().toLocaleString()}` },
    { 'Section': `Period: ${summary.dateRange || 'All Time'}` },
    { 'Section': '' },
    { 'Section': 'FINANCIAL METRICS' },
    ...summaryData,
    { 'Section': '' },
    { 'Section': 'SPENDING CATEGORY ANALYSIS' },
    ...categoryData
  ];

  const csvContent = arrayToCSV(combinedData);
  downloadCSV(csvContent, filename || `financial_overview_${new Date().toISOString().split('T')[0]}.csv`);
  return csvContent;
};

/**
 * @param {Array} transactions
 * @param {Array} budgets
 * @param {Object} summary
 * @param {Array} categoryBreakdown
 * @param {string|null} filename
 * @returns {string} CSV content
 */
export const exportCompleteReportCSV = (transactions, budgets, summary, categoryBreakdown, filename = null) => {
  if ((!transactions || transactions.length === 0) && (!budgets || budgets.length === 0)) {
    throw new Error('No data to export');
  }

  const monthlyMap = new Map();

  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, {
        month: monthKey,
        formattedDate: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
        income: 0,
        expenses: 0,
        net: 0,
        transactions: 0,
        incomeTransactions: 0,
        expenseTransactions: 0
      });
    }

    const monthData = monthlyMap.get(monthKey);
    monthData.transactions++;

    if (transaction.type === 'income') {
      monthData.income += transaction.amount;
      monthData.incomeTransactions++;
    } else {
      monthData.expenses += transaction.amount;
      monthData.expenseTransactions++;
    }
  });

  const monthlyData = Array.from(monthlyMap.values())
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(month => {
      month.net = month.income - month.expenses;
      month.savingsRate = month.income > 0 ? ((month.net / month.income) * 100) : 0;
      month.avgIncomePerTransaction = month.incomeTransactions > 0 ? (month.income / month.incomeTransactions) : 0;
      month.avgExpensePerTransaction = month.expenseTransactions > 0 ? (month.expenses / month.expenseTransactions) : 0;
      return month;
    });

  const csvData = monthlyData.map((month, index) => ({
    'Period Rank': index + 1,
    'Month': month.formattedDate,
    'Month Code': month.month,
    'Total Income': month.income,
    'Total Expenses': month.expenses,
    'Net Amount': month.net,
    'Savings Rate %': month.savingsRate.toFixed(1),
    'Total Transactions': month.transactions,
    'Income Transactions': month.incomeTransactions,
    'Expense Transactions': month.expenseTransactions,
    'Avg Income per Transaction': month.avgIncomePerTransaction.toFixed(2),
    'Avg Expense per Transaction': month.avgExpensePerTransaction.toFixed(2),
    'Financial Health': month.savingsRate > 20 ? 'Excellent' : month.savingsRate > 10 ? 'Good' : month.savingsRate > 0 ? 'Fair' : 'Poor'
  }));

  const csvContent = arrayToCSV(csvData);
  downloadCSV(csvContent, filename || `complete_report_${new Date().toISOString().split('T')[0]}.csv`);
  return csvContent;
};
