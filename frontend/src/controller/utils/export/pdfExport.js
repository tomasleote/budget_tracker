/**
 * PDF Export utilities for the Budget Tracker application
 * Provides functions to export various financial reports as formatted PDFs
 */

import { generatePDFHTML } from './pdf/pdfSections';

export { generatePDFHTML };

/**
 * @param {Object} data
 * @param {string} title
 * @param {Object} options
 */
export const exportToPDF = (data, title = 'Financial Report', options = {}) => {
  const htmlContent = generatePDFHTML(data, title, options);

  const printWindow = window.open('', '_blank');
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
    setTimeout(() => { printWindow.close(); }, 1000);
  }, 500);
};

/**
 * @param {Array} transactions
 * @param {Object} summary
 * @param {string} dateRange
 */
export const exportTransactionsPDF = (transactions, summary, dateRange = 'All Time') => {
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

  const categoryBreakdown = {};
  expenseTransactions.forEach(t => {
    const category = t.category || 'Other';
    if (!categoryBreakdown[category]) categoryBreakdown[category] = { amount: 0, count: 0 };
    categoryBreakdown[category].amount += t.amount;
    categoryBreakdown[category].count++;
  });

  const topCategories = Object.entries(categoryBreakdown)
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);

  exportToPDF(
    {
      transactions: sortedTransactions,
      summary: {
        totalIncome,
        totalExpenses,
        currentBalance: totalIncome - totalExpenses,
        savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0
      },
      categoryBreakdown: topCategories,
      budgets: [],
      dateRange,
      generatedAt: new Date().toISOString()
    },
    'Comprehensive Transaction Report',
    { includeCategories: true, includeSummary: true, includeTransactions: true }
  );
};

/**
 * @param {Array} budgets
 * @param {Object} summary
 * @param {string} dateRange
 */
export const exportBudgetsPDF = (budgets, summary, dateRange = 'Current Period') => {
  const sortedBudgets = [...budgets].sort((a, b) => (b.utilizationPercentage || 0) - (a.utilizationPercentage || 0));

  exportToPDF(
    {
      budgets: sortedBudgets,
      summary,
      categoryBreakdown: [],
      dateRange,
      generatedAt: new Date().toISOString()
    },
    'Budget Performance Analysis',
    { includeCategories: false, includeSummary: true, includeTransactions: false }
  );
};

/**
 * @param {Object} data
 * @param {string} title
 * @param {Object} options
 * @returns {string} HTML content for preview
 */
export const generatePDFPreview = (data, title, options = {}) => {
  return generatePDFHTML(data, title, options);
};

export default {
  generatePDFHTML,
  exportToPDF,
  exportTransactionsPDF,
  exportBudgetsPDF,
  generatePDFPreview
};
