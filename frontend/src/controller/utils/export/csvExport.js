/**
 * CSV Export Utilities for Budget Tracker
 * Handles exporting transactions, budgets, and reports to CSV format
 */

/**
 * Convert array of objects to CSV string
 * @param {Array} data - Array of objects to convert
 * @param {Array} headers - Optional custom headers
 * @returns {string} CSV string
 */
export const arrayToCSV = (data, headers = null) => {
  if (!data || data.length === 0) return '';

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Create header row
  const headerRow = csvHeaders.map(header => `"${header}"`).join(',');
  
  // Create data rows
  const dataRows = data.map(row => {
    return csvHeaders.map(header => {
      const value = row[header] || '';
      // Escape quotes and wrap in quotes
      const escapedValue = String(value).replace(/"/g, '""');
      return `"${escapedValue}"`;
    }).join(',');
  });
  
  return [headerRow, ...dataRows].join('\n');
};

/**
 * Download CSV file
 * @param {string} csvContent - CSV content string
 * @param {string} filename - Name of the file to download
 */
export const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Export transactions to CSV
 * @param {Array} transactions - Array of transaction objects
 * @param {string} filename - Optional filename
 */
export const exportTransactionsCSV = (transactions, filename = null) => {
  if (!transactions || transactions.length === 0) {
    throw new Error('No transactions to export');
  }

  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Prepare comprehensive transaction data for CSV
  const csvData = sortedTransactions.map((transaction, index) => ({
    'Transaction ID': transaction.id,
    'Date': new Date(transaction.date).toLocaleDateString(),
    'Day of Week': new Date(transaction.date).toLocaleDateString('en-US', { weekday: 'long' }),
    'Type': transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1),
    'Category': transaction.category,
    'Description': transaction.description,
    'Amount': transaction.amount,
    'Formatted Amount': `${transaction.amount.toFixed(2)}`,
    'Month': new Date(transaction.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
    'Year': new Date(transaction.date).getFullYear(),
    'Created At': new Date(transaction.createdAt).toLocaleString(),
    'Updated At': new Date(transaction.updatedAt).toLocaleString(),
    'Record Number': index + 1
  }));

  const csvContent = arrayToCSV(csvData);
  const exportFilename = filename || `all_transactions_${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCSV(csvContent, exportFilename);
  return csvContent;
};

/**
 * Export budget analysis to CSV
 * @param {Array} budgets - Array of budget objects
 * @param {string} filename - Optional filename
 */
export const exportBudgetsCSV = (budgets, filename = null) => {
  if (!budgets || budgets.length === 0) {
    throw new Error('No budgets to export');
  }

  // Sort budgets by utilization percentage (highest first)
  const sortedBudgets = [...budgets].sort((a, b) => (b.utilizationPercentage || 0) - (a.utilizationPercentage || 0));

  // Prepare comprehensive budget analysis data for CSV
  const csvData = sortedBudgets.map((budget, index) => {
    const spent = budget.progress?.spent || 0;
    const remaining = (budget.budgetAmount || 0) - spent;
    const utilization = budget.utilizationPercentage || 0;
    const isExceeded = utilization > 100;
    const isNearLimit = utilization >= 80 && utilization <= 100;
    const isHealthy = utilization < 80;
    
    return {
      'Budget ID': budget.id,
      'Category': budget.category,
      'Budget Amount': budget.budgetAmount,
      'Amount Spent': spent,
      'Amount Remaining': remaining,
      'Utilization Percentage': utilization,
      'Performance Status': isExceeded ? 'Exceeded' : isNearLimit ? 'Near Limit' : 'Healthy',
      'Over Budget Amount': isExceeded ? (spent - budget.budgetAmount).toFixed(2) : 0,
      'Period Type': budget.period,
      'Active Status': budget.isActive ? 'Active' : 'Inactive',
      'Start Date': new Date(budget.startDate).toLocaleDateString(),
      'End Date': new Date(budget.endDate).toLocaleDateString(),
      'Days in Period': Math.ceil((new Date(budget.endDate) - new Date(budget.startDate)) / (1000 * 60 * 60 * 24)),
      'Days Remaining': Math.max(0, Math.ceil((new Date(budget.endDate) - new Date()) / (1000 * 60 * 60 * 24))),
      'Daily Budget': (budget.budgetAmount / Math.ceil((new Date(budget.endDate) - new Date(budget.startDate)) / (1000 * 60 * 60 * 24))).toFixed(2),
      'Daily Spending Average': spent > 0 ? (spent / Math.max(1, Math.ceil((new Date() - new Date(budget.startDate)) / (1000 * 60 * 60 * 24)))).toFixed(2) : 0,
      'Description': budget.description || '',
      'Created At': new Date(budget.createdAt).toLocaleString(),
      'Updated At': new Date(budget.updatedAt).toLocaleString(),
      'Priority Rank': index + 1
    };
  });

  const csvContent = arrayToCSV(csvData);
  const exportFilename = filename || `budget_analysis_${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCSV(csvContent, exportFilename);
  return csvContent;
};

/**
 * Export comprehensive financial summary to CSV
 * @param {Object} summary - Financial summary data
 * @param {Array} categoryBreakdown - Category breakdown data
 * @param {Array} transactions - Transaction data for additional insights
 * @param {Array} budgets - Budget data for additional insights
 * @param {string} filename - Optional filename
 */
export const exportFinancialSummaryCSV = (summary, categoryBreakdown, transactions = [], budgets = [], filename = null) => {
  // Enhanced financial metrics
  const totalIncome = summary.income || summary.totalIncome || 0;
  const totalExpenses = summary.expenses || summary.totalExpenses || 0;
  const netBalance = summary.balance || summary.currentBalance || (totalIncome - totalExpenses);
  const savingsRate = totalIncome > 0 ? ((netBalance / totalIncome) * 100) : 0;
  
  // Calculate additional insights
  const transactionCount = transactions.length;
  const incomeTransactions = transactions.filter(t => t.type === 'income').length;
  const expenseTransactions = transactions.filter(t => t.type === 'expense').length;
  const avgTransactionAmount = transactionCount > 0 ? (totalIncome + totalExpenses) / transactionCount : 0;
  const avgIncomeAmount = incomeTransactions > 0 ? totalIncome / incomeTransactions : 0;
  const avgExpenseAmount = expenseTransactions > 0 ? totalExpenses / expenseTransactions : 0;
  
  // Budget insights
  const activeBudgets = budgets.filter(b => b.isActive).length;
  const totalBudgetAmount = budgets.reduce((sum, b) => sum + (b.budgetAmount || 0), 0);
  const totalBudgetSpent = budgets.reduce((sum, b) => sum + (b.progress?.spent || 0), 0);
  const budgetUtilization = totalBudgetAmount > 0 ? (totalBudgetSpent / totalBudgetAmount * 100) : 0;
  
  // Financial health metrics
  const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome * 100) : 0;
  const healthScore = Math.max(0, 100 - expenseRatio + (savingsRate * 0.5));
  
  // Summary data with comprehensive metrics
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

  // Enhanced category breakdown data
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

  // Create multi-sheet-like structure in CSV
  const combinedData = [
    // Header
    { 'Section': 'COMPREHENSIVE FINANCIAL SUMMARY' },
    { 'Section': `Report Generated: ${new Date().toLocaleString()}` },
    { 'Section': `Period: ${summary.dateRange || 'All Time'}` },
    { 'Section': '' },
    
    // Financial Metrics
    { 'Section': 'FINANCIAL METRICS' },
    ...summaryData,
    { 'Section': '' },
    
    // Category Analysis
    { 'Section': 'SPENDING CATEGORY ANALYSIS' },
    ...categoryData
  ];

  const csvContent = arrayToCSV(combinedData);
  const exportFilename = filename || `financial_overview_${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCSV(csvContent, exportFilename);
  return csvContent;
};

/**
 * Export complete financial report to CSV
 * @param {Array} transactions - Transaction data
 * @param {Array} budgets - Budget data
 * @param {Object} summary - Financial summary
 * @param {Array} categoryBreakdown - Category breakdown
 * @param {string} filename - Optional filename
 */
export const exportCompleteReportCSV = (transactions, budgets, summary, categoryBreakdown, filename = null) => {
  if ((!transactions || transactions.length === 0) && (!budgets || budgets.length === 0)) {
    throw new Error('No data to export');
  }

  // Generate monthly analytics from transactions
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
  
  // Calculate additional monthly metrics
  const monthlyData = Array.from(monthlyMap.values())
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(month => {
      month.net = month.income - month.expenses;
      month.savingsRate = month.income > 0 ? ((month.net / month.income) * 100) : 0;
      month.avgIncomePerTransaction = month.incomeTransactions > 0 ? (month.income / month.incomeTransactions) : 0;
      month.avgExpensePerTransaction = month.expenseTransactions > 0 ? (month.expenses / month.expenseTransactions) : 0;
      return month;
    });

  // Prepare comprehensive monthly data for CSV
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
  const exportFilename = filename || `complete_report_${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCSV(csvContent, exportFilename);
  return csvContent;
};

/**
 * Export monthly analytics to CSV (legacy function)
 * @param {Array} monthlyData - Monthly analytics data
 * @param {string} filename - Optional filename
 */
export const exportMonthlyAnalyticsCSV = (monthlyData, filename = null) => {
  if (!monthlyData || monthlyData.length === 0) {
    throw new Error('No monthly data to export');
  }

  // Prepare monthly data for CSV
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
  const exportFilename = filename || `monthly_analytics_${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCSV(csvContent, exportFilename);
  return csvContent;
};

/**
 * Format currency for CSV export
 * @param {number} amount - Amount to format
 * @returns {number} Formatted amount (no currency symbol for CSV)
 */
export const formatCurrencyForCSV = (amount) => {
  return typeof amount === 'number' ? amount : 0;
};

/**
 * Validate export data
 * @param {Array} data - Data to validate
 * @param {string} type - Type of data (transactions, budgets, etc.)
 * @returns {boolean} True if valid
 */
export const validateExportData = (data, type) => {
  if (!data || !Array.isArray(data)) {
    throw new Error(`Invalid ${type} data: must be an array`);
  }
  
  if (data.length === 0) {
    throw new Error(`No ${type} data to export`);
  }
  
  return true;
};

export default {
  arrayToCSV,
  downloadCSV,
  exportTransactionsCSV,
  exportBudgetsCSV,
  exportFinancialSummaryCSV,
  exportCompleteReportCSV,
  exportMonthlyAnalyticsCSV,
  formatCurrencyForCSV,
  validateExportData
};