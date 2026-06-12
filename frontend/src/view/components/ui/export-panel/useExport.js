import { useState } from 'react';
import {
  exportTransactionsCSV,
  exportBudgetsCSV
} from '../../../../controller/utils/export/csvExport';
import {
  exportTransactionsPDF,
  exportBudgetsPDF,
  generatePDFPreview
} from '../../../../controller/utils/export/pdfExport';

const EXPORT_TYPES = [
  {
    value: 'transactions',
    label: 'Transaction Data',
    description: 'All transaction records with dates, categories, amounts, and metadata'
  },
  {
    value: 'budgets',
    label: 'Budget Analysis',
    description: 'Budget performance, utilization rates, and spending analysis'
  }
];

const useExport = ({ transactions, budgets, summary, categoryBreakdown, dateRange, onClose }) => {
  const [exportType, setExportType] = useState('transactions');
  const [format, setFormat] = useState('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const generateFilename = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const typeMap = { transactions: 'all_transactions', budgets: 'budget_analysis' };
    return `${typeMap[exportType]}_${timestamp}.${format === 'csv' ? 'csv' : 'pdf'}`;
  };

  const canExport = () => {
    if (exportType === 'transactions') return transactions.length > 0;
    if (exportType === 'budgets') return budgets.length > 0;
    return false;
  };

  const buildReportData = () => ({
    transactions,
    budgets,
    summary: {
      totalIncome: summary.income || 0,
      totalExpenses: summary.expenses || 0,
      currentBalance: summary.balance || 0,
      savingsRate: summary.income > 0 ? ((summary.income - summary.expenses) / summary.income * 100) : 0
    },
    categoryBreakdown,
    dateRange,
    generatedAt: new Date().toISOString()
  });

  const handleCSVExport = (filename) => {
    if (exportType === 'transactions') {
      if (transactions.length === 0) throw new Error('No transactions to export');
      exportTransactionsCSV(transactions, filename);
    } else if (exportType === 'budgets') {
      if (budgets.length === 0) throw new Error('No budgets to export');
      exportBudgetsCSV(budgets, filename);
    } else {
      throw new Error('Invalid export type');
    }
  };

  const handlePDFExport = (filename) => {
    const reportData = buildReportData();
    if (exportType === 'transactions') {
      exportTransactionsPDF(transactions, reportData.summary, dateRange);
    } else if (exportType === 'budgets') {
      exportBudgetsPDF(budgets, reportData.summary, dateRange);
    } else {
      throw new Error('Invalid export type');
    }
  };

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportSuccess(false);
    try {
      const filename = generateFilename();
      if (format === 'csv') {
        handleCSVExport(filename);
      } else {
        handlePDFExport(filename);
      }
      setExportSuccess(true);
      setTimeout(() => {
        onClose();
        setExportSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePreview = () => {
    if (format === 'pdf') {
      const reportData = buildReportData();
      const title = EXPORT_TYPES.find(t => t.value === exportType)?.label || 'Financial Report';
      let previewOptions = {};
      if (exportType === 'transactions') {
        previewOptions = { includeCategories: true, includeSummary: true, includeTransactions: true };
      } else if (exportType === 'budgets') {
        previewOptions = { includeCategories: false, includeSummary: true, includeTransactions: false };
      }
      const htmlContent = generatePDFPreview(reportData, title, previewOptions);
      const previewWindow = window.open('', '_blank');
      previewWindow.document.write(htmlContent);
      previewWindow.document.close();
    } else {
      alert('Preview is only available for PDF exports');
    }
  };

  return {
    exportType, setExportType,
    format, setFormat,
    isExporting, exportSuccess,
    generateFilename, canExport,
    handleExport, handlePreview
  };
};

export { EXPORT_TYPES };
export default useExport;
