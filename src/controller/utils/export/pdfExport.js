/**
 * PDF Export utilities for the Budget Tracker application
 * Provides functions to export various financial reports as formatted PDFs
 */

import { formatCurrency } from '../formatters';

/**
 * Format date for display
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date
 */
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

/**
 * Generate simple SVG pie chart for category breakdown
 * @param {Array} categoryData - Category breakdown data
 * @param {number} totalAmount - Total amount for percentage calculation
 * @returns {string} SVG chart HTML
 */
const generatePieChartSVG = (categoryData, totalAmount) => {
  if (!categoryData || categoryData.length === 0) return '';
  
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280', '#059669', '#DC2626', '#7C3AED'];
  const size = 200;
  const radius = 80;
  const centerX = size / 2;
  const centerY = size / 2;
  
  let currentAngle = 0;
  const paths = [];
  const legends = [];
  
  categoryData.slice(0, 8).forEach((category, index) => {
    const percentage = (category.amount / totalAmount) * 100;
    const angle = (percentage / 100) * 2 * Math.PI;
    
    if (percentage < 1) return; // Skip very small slices
    
    const startX = centerX + radius * Math.cos(currentAngle);
    const startY = centerY + radius * Math.sin(currentAngle);
    const endX = centerX + radius * Math.cos(currentAngle + angle);
    const endY = centerY + radius * Math.sin(currentAngle + angle);
    
    const largeArcFlag = angle > Math.PI ? 1 : 0;
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${startX} ${startY}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      'Z'
    ].join(' ');
    
    const color = colors[index % colors.length];
    paths.push(`<path d="${pathData}" fill="${color}" stroke="white" stroke-width="1"/>`);
    
    legends.push(`
      <div style="display: flex; align-items: center; margin-bottom: 4px;">
        <div style="width: 12px; height: 12px; background: ${color}; margin-right: 6px; border-radius: 2px;"></div>
        <span style="font-size: 11px; color: #374151;">${category.category}: ${percentage.toFixed(1)}%</span>
      </div>
    `);
    
    currentAngle += angle;
  });
  
  return `
    <div style="display: flex; align-items: center; gap: 20px; margin: 20px 0;">
      <svg width="${size}" height="${size}" style="flex-shrink: 0;">
        ${paths.join('')}
      </svg>
      <div style="flex: 1;">
        <h4 style="margin: 0 0 10px 0; font-size: 12px; font-weight: 600; color: #1f2937;">Category Breakdown</h4>
        ${legends.join('')}
      </div>
    </div>
  `;
};

/**
 * Generate simple SVG bar chart for budget performance
 * @param {Array} budgetData - Budget data with utilization percentages
 * @returns {string} SVG chart HTML
 */
const generateBudgetBarChartSVG = (budgetData) => {
  if (!budgetData || budgetData.length === 0) return '';
  
  const chartHeight = 200;
  const chartWidth = 400;
  const barHeight = 16;
  const spacing = 4;
  const maxBars = 8;
  
  const visibleBudgets = budgetData.slice(0, maxBars);
  const totalHeight = visibleBudgets.length * (barHeight + spacing) - spacing;
  
  const bars = visibleBudgets.map((budget, index) => {
    const utilization = Math.min(budget.utilizationPercentage || 0, 150); // Cap at 150% for display
    const barWidth = (utilization / 150) * (chartWidth - 100); // Leave space for labels
    const y = index * (barHeight + spacing);
    
    // Color based on utilization
    let color = '#10B981'; // Green for healthy
    if (utilization > 100) color = '#EF4444'; // Red for exceeded
    else if (utilization >= 80) color = '#F59E0B'; // Yellow for near limit
    
    return `
      <g>
        <rect x="0" y="${y}" width="${barWidth}" height="${barHeight}" fill="${color}" rx="2"/>
        <text x="${barWidth + 5}" y="${y + barHeight/2 + 3}" font-size="10" fill="#374151">${utilization.toFixed(0)}%</text>
        <text x="-5" y="${y + barHeight/2 + 3}" font-size="9" fill="#6B7280" text-anchor="end">${budget.category}</text>
      </g>
    `;
  });
  
  return `
    <div style="margin: 20px 0;">
      <h4 style="margin: 0 0 10px 0; font-size: 12px; font-weight: 600; color: #1f2937;">Budget Utilization</h4>
      <svg width="${chartWidth}" height="${totalHeight + 20}" style="overflow: visible;">
        <g transform="translate(80, 10)">
          ${bars.join('')}
        </g>
      </svg>
      <div style="font-size: 9px; color: #6B7280; margin-top: 5px;">
        <span style="color: #10B981;">■</span> Healthy (&lt;80%) &nbsp;
        <span style="color: #F59E0B;">■</span> Near Limit (80-100%) &nbsp;
        <span style="color: #EF4444;">■</span> Exceeded (&gt;100%)
      </div>
    </div>
  `;
};

/**
 * Generate comprehensive PDF HTML content with embedded charts
 * @param {Object} data - Complete data object containing transactions, budgets, summary, etc.
 * @param {string} title - Report title
 * @param {Object} options - Display options (includeCategories, includeSummary, includeTransactions)
 * @returns {string} Complete HTML document
 */
const generatePDFHTML = (data, title, options = {}) => {
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

  // Generate charts based on data type
  let categoryChart = '';
  let budgetChart = '';
  
  // Add pie chart for category breakdown if we have spending data
  if (includeCategories && categoryBreakdown.length > 0) {
    const totalExpenses = summary.totalExpenses || summary.expenses || 0;
    if (totalExpenses > 0) {
      categoryChart = generatePieChartSVG(categoryBreakdown, totalExpenses);
    }
  }
  
  // Add bar chart for budget analysis if we have budget data
  if (budgets.length > 0 && title.includes('Budget')) {
    budgetChart = generateBudgetBarChartSVG(budgets);
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          margin: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #2563eb;
          margin: 0;
          font-size: 28px;
        }
        .header .subtitle {
          color: #666;
          margin: 5px 0;
          font-size: 14px;
        }
        .section {
          margin: 30px 0;
          page-break-inside: avoid;
        }
        .section h2 {
          color: #1f2937;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 5px;
          margin-bottom: 15px;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin: 20px 0;
        }
        .summary-card {
          background: #f9fafb;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #2563eb;
        }
        .summary-card .label {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          margin-bottom: 5px;
        }
        .summary-card .value {
          font-size: 24px;
          font-weight: bold;
          color: #1f2937;
        }
        .summary-card .value.positive {
          color: #059669;
        }
        .summary-card .value.negative {
          color: #dc2626;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 12px;
        }
        th, td {
          padding: 8px 12px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        th {
          background: #f3f4f6;
          font-weight: 600;
          color: #374151;
        }
        tr:nth-child(even) {
          background: #f9fafb;
        }
        .text-right {
          text-align: right;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          font-size: 12px;
          color: #6b7280;
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
          .section { page-break-inside: avoid; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
        <div class="subtitle">Period: ${dateRange}</div>
        <div class="subtitle">Generated: ${new Date(generatedAt).toLocaleString()}</div>
      </div>

      ${includeSummary ? `
      <div class="section">
        <h2>Financial Summary</h2>
        <div class="summary-grid">
          <div class="summary-card">
            <div class="label">Total Income</div>
            <div class="value positive">${formatCurrency(summary.totalIncome || 0)}</div>
          </div>
          <div class="summary-card">
            <div class="label">Total Expenses</div>
            <div class="value negative">${formatCurrency(summary.totalExpenses || 0)}</div>
          </div>
          <div class="summary-card">
            <div class="label">Net Balance</div>
            <div class="value ${(summary.currentBalance || 0) >= 0 ? 'positive' : 'negative'}">${formatCurrency(summary.currentBalance || 0)}</div>
          </div>
          <div class="summary-card">
            <div class="label">Savings Rate</div>
            <div class="value">${(summary.savingsRate || 0).toFixed(1)}%</div>
          </div>
        </div>
      </div>
      ` : ''}

      ${monthlyBreakdown && monthlyBreakdown.length > 0 ? `
      <div class="section">
        <h2>Monthly Summary</h2>
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th class="text-right">Income</th>
              <th class="text-right">Expenses</th>
              <th class="text-right">Net</th>
              <th class="text-right">Transactions</th>
            </tr>
          </thead>
          <tbody>
            ${monthlyBreakdown.map(monthData => `
              <tr>
                <td>${monthData.month}</td>
                <td class="text-right positive">${formatCurrency(monthData.income || 0)}</td>
                <td class="text-right negative">${formatCurrency(monthData.expenses || 0)}</td>
                <td class="text-right ${(monthData.income - monthData.expenses) >= 0 ? 'positive' : 'negative'}">${formatCurrency((monthData.income || 0) - (monthData.expenses || 0))}</td>
                <td class="text-right">${monthData.count || 0}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      ${categoryChart ? `
      <div class="section">
        <h2>Spending by Category</h2>
        ${categoryChart}
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th class="text-right">Amount</th>
              <th class="text-right">Transactions</th>
              <th class="text-right">Percentage</th>
            </tr>
          </thead>
          <tbody>
            ${categoryBreakdown.slice(0, 10).map(category => `
              <tr>
                <td>${category.category || category.categoryName || 'Unknown'}</td>
                <td class="text-right">${formatCurrency(category.amount || 0)}</td>
                <td class="text-right">${category.count || 0}</td>
                <td class="text-right">${((category.amount || 0) / (summary.totalExpenses || 1) * 100).toFixed(1)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : includeCategories && categoryBreakdown.length > 0 ? `
      <div class="section">
        <h2>Spending by Category</h2>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th class="text-right">Amount</th>
              <th class="text-right">Transactions</th>
              <th class="text-right">Percentage</th>
            </tr>
          </thead>
          <tbody>
            ${categoryBreakdown.slice(0, 10).map(category => `
              <tr>
                <td>${category.category || category.categoryName || 'Unknown'}</td>
                <td class="text-right">${formatCurrency(category.amount || 0)}</td>
                <td class="text-right">${category.count || 0}</td>
                <td class="text-right">${((category.amount || 0) / (summary.totalExpenses || 1) * 100).toFixed(1)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      ${budgetChart ? `
      <div class="section">
        <h2>Budget Performance</h2>
        ${budgetChart}
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th class="text-right">Budgeted</th>
              <th class="text-right">Spent</th>
              <th class="text-right">Remaining</th>
              <th class="text-right">Utilization</th>
            </tr>
          </thead>
          <tbody>
            ${budgets.slice(0, 10).map(budget => `
              <tr>
                <td>${budget.category}</td>
                <td class="text-right">${formatCurrency(budget.budgetAmount || 0)}</td>
                <td class="text-right">${formatCurrency(budget.progress?.spent || 0)}</td>
                <td class="text-right">${formatCurrency((budget.budgetAmount || 0) - (budget.progress?.spent || 0))}</td>
                <td class="text-right">${(budget.utilizationPercentage || 0).toFixed(1)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : budgets.length > 0 && title.includes('Budget') ? `
      <div class="section">
        <h2>Budget Performance</h2>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th class="text-right">Budgeted</th>
              <th class="text-right">Spent</th>
              <th class="text-right">Remaining</th>
              <th class="text-right">Utilization</th>
            </tr>
          </thead>
          <tbody>
            ${budgets.slice(0, 10).map(budget => `
              <tr>
                <td>${budget.category}</td>
                <td class="text-right">${formatCurrency(budget.budgetAmount || 0)}</td>
                <td class="text-right">${formatCurrency(budget.progress?.spent || 0)}</td>
                <td class="text-right">${formatCurrency((budget.budgetAmount || 0) - (budget.progress?.spent || 0))}</td>
                <td class="text-right">${(budget.utilizationPercentage || 0).toFixed(1)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      ${includeTransactions && transactions.length > 0 ? `
      <div class="section">
        <h2>All Transactions</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Description</th>
              <th class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.map(transaction => `
              <tr>
                <td>${formatDate(transaction.date)}</td>
                <td style="text-transform: capitalize;">${transaction.type}</td>
                <td>${transaction.category}</td>
                <td>${transaction.description}</td>
                <td class="text-right ${transaction.type === 'income' ? 'positive' : 'negative'}">${formatCurrency(transaction.amount || 0)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ${transactions.length > 50 ? `<p style="text-align: center; color: #666; font-style: italic; margin-top: 10px;">Total of ${transactions.length} transactions shown</p>` : ''}
      </div>
      ` : ''}

      <div class="footer">
        <p>Budget Tracker Financial Report - Generated on ${new Date().toLocaleDateString()}</p>
        <p>This report contains ${transactions.length} transactions and ${budgets.length} budgets</p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Export data to PDF using browser print functionality
 * @param {Object} data - Data to export
 * @param {string} title - Title of the report
 * @param {Object} options - Export options
 */
export const exportToPDF = (data, title = 'Financial Report', options = {}) => {
  const htmlContent = generatePDFHTML(data, title, options);
  
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for content to load, then print
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
    
    // Close the window after printing (optional)
    setTimeout(() => {
      printWindow.close();
    }, 1000);
  }, 500);
};

/**
 * Export comprehensive transactions report to PDF
 * @param {Array} transactions - Transaction data
 * @param {Object} summary - Financial summary
 * @param {string} dateRange - Date range description
 */
export const exportTransactionsPDF = (transactions, summary, dateRange = 'All Time') => {
  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Calculate transaction insights
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  // Category breakdown for expenses
  const categoryBreakdown = {};
  expenseTransactions.forEach(t => {
    const category = t.category || 'Other';
    if (!categoryBreakdown[category]) {
      categoryBreakdown[category] = { amount: 0, count: 0 };
    }
    categoryBreakdown[category].amount += t.amount;
    categoryBreakdown[category].count++;
  });
  
  const topCategories = Object.entries(categoryBreakdown)
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);
  
  const data = {
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
  };
  
  exportToPDF(data, 'Comprehensive Transaction Report', {
    includeCategories: true,
    includeSummary: true,
    includeTransactions: true
  });
};

/**
 * Export budget analysis report to PDF
 * @param {Array} budgets - Budget data
 * @param {Object} summary - Financial summary
 * @param {string} dateRange - Date range description
 */
export const exportBudgetsPDF = (budgets, summary, dateRange = 'Current Period') => {
  // Sort budgets by utilization (highest first)
  const sortedBudgets = [...budgets].sort((a, b) => (b.utilizationPercentage || 0) - (a.utilizationPercentage || 0));
  
  const data = {
    budgets: sortedBudgets,
    summary,
    categoryBreakdown: [],
    dateRange,
    generatedAt: new Date().toISOString()
  };
  
  exportToPDF(data, 'Budget Performance Analysis', {
    includeCategories: false,
    includeSummary: true,
    includeTransactions: false
  });
};

/**
 * Generate PDF preview HTML (for preview before export)
 * @param {Object} data - Data for preview
 * @param {string} title - Report title
 * @param {Object} options - Export options
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