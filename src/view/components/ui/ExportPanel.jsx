import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileExport,
  faFileCsv,
  faFilePdf,
  faDownload,
  faSpinner,
  faCalendarAlt,
  faCheck,
  faFilter,
  faCog,
  faTimes,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import Button from './Button';
import Card from './Card';
import Modal from './Modal';

// Export utilities
import {
  exportTransactionsCSV,
  exportBudgetsCSV
} from '../../../controller/utils/export/csvExport';

import {
  exportTransactionsPDF,
  exportBudgetsPDF,
  generatePDFPreview
} from '../../../controller/utils/export/pdfExport';

const ExportPanel = ({
  transactions = [],
  budgets = [],
  summary = {},
  categoryBreakdown = [],
  dateRange = 'All Time',
  onClose,
  isOpen = false
}) => {
  const [exportType, setExportType] = useState('transactions');
  const [format, setFormat] = useState('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [exportOptions, setExportOptions] = useState({});

  // Export type options
  const exportTypes = [
    {
      value: 'transactions',
      label: 'Transaction Data',
      description: 'All transaction records with dates, categories, amounts, and metadata',
      icon: faFileExport,
      count: transactions.length
    },
    {
      value: 'budgets',
      label: 'Budget Analysis',
      description: 'Budget performance, utilization rates, and spending analysis',
      icon: faFileExport,
      count: budgets.length
    }
  ];

  // Format options
  const formatOptions = [
    {
      value: 'csv',
      label: 'CSV Spreadsheet',
      description: 'Excel-compatible format',
      icon: faFileCsv,
      extension: '.csv'
    },
    {
      value: 'pdf',
      label: 'PDF Report',
      description: 'Formatted printable document',
      icon: faFilePdf,
      extension: '.pdf'
    }
  ];

  // Generate filename
  const generateFilename = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const typeMap = {
      transactions: 'all_transactions',
      budgets: 'budget_analysis'
    };
    
    return `${typeMap[exportType]}_${timestamp}.${format === 'csv' ? 'csv' : 'pdf'}`;
  };

  // Handle export
  const handleExport = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    setExportSuccess(false);

    try {
      const filename = generateFilename();
      
      if (format === 'csv') {
        await handleCSVExport(filename);
      } else {
        await handlePDFExport(filename);
      }
      
      setExportSuccess(true);
      
      // Auto-close after success
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

  // Handle CSV export
  const handleCSVExport = async (filename) => {
    switch (exportType) {
      case 'transactions':
        if (transactions.length === 0) {
          throw new Error('No transactions to export');
        }
        // Export all transactions with comprehensive details
        exportTransactionsCSV(transactions, filename);
        break;
        
      case 'budgets':
        if (budgets.length === 0) {
          throw new Error('No budgets to export');
        }
        // Export budget analysis with performance metrics
        exportBudgetsCSV(budgets, filename);
        break;
        
      default:
        throw new Error('Invalid export type');
    }
  };

  // Handle PDF export
  const handlePDFExport = async (filename) => {
    const reportData = {
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
    };

    switch (exportType) {
      case 'transactions':
        // Export comprehensive transaction report
        exportTransactionsPDF(transactions, reportData.summary, dateRange);
        break;
        
      case 'budgets':
        // Export budget analysis
        exportBudgetsPDF(budgets, reportData.summary, dateRange);
        break;
        
      default:
        throw new Error('Invalid export type');
    }
  };



  // Handle preview
  const handlePreview = () => {
    if (format === 'pdf') {
      const reportData = {
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
      };
      
      const title = exportTypes.find(t => t.value === exportType)?.label || 'Financial Report';
      
      // Determine options based on export type
      let previewOptions = {};
      if (exportType === 'transactions') {
        previewOptions = {
          includeCategories: true,
          includeSummary: true,
          includeTransactions: true
        };
      } else if (exportType === 'budgets') {
        previewOptions = {
          includeCategories: false,
          includeSummary: true,
          includeTransactions: false
        };
      }
      
      const htmlContent = generatePDFPreview(reportData, title, previewOptions);
      
      // Open preview in new window
      const previewWindow = window.open('', '_blank');
      previewWindow.document.write(htmlContent);
      previewWindow.document.close();
    } else {
      alert('Preview is only available for PDF exports');
    }
  };

  // Validate export
  const canExport = () => {
    switch (exportType) {
      case 'transactions':
        return transactions.length > 0;
      case 'budgets':
        return budgets.length > 0;
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Financial Data"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Export Type Selection */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Data to Export</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exportTypes.map((type) => (
              <div
                key={type.value}
                onClick={() => setExportType(type.value)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  exportType === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <FontAwesomeIcon icon={type.icon} className="text-blue-600" />
                    <span className="font-medium text-gray-900">{type.label}</span>
                  </div>
                  <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {type.count} items
                  </span>
                </div>
                <p className="text-sm text-gray-600">{type.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Format Selection */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Format</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formatOptions.map((formatOption) => (
              <div
                key={formatOption.value}
                onClick={() => setFormat(formatOption.value)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  format === formatOption.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <FontAwesomeIcon icon={formatOption.icon} className="text-blue-600" />
                  <span className="font-medium text-gray-900">{formatOption.label}</span>
                </div>
                <p className="text-sm text-gray-600">{formatOption.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Export Options - Removed since they weren't working */}

        {/* Export Info */}
        <Card className="bg-blue-50 border-blue-200">
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-600" />
              <span className="font-medium text-blue-900">Export Summary</span>
            </div>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Data Period:</strong> {dateRange}</p>
              <p><strong>Export Type:</strong> {exportTypes.find(t => t.value === exportType)?.label}</p>
              <p><strong>Format:</strong> {formatOptions.find(f => f.value === format)?.label}</p>
              <p><strong>Filename:</strong> {generateFilename()}</p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="flex space-x-3">
            {format === 'pdf' && (
              <Button
                variant="outline"
                onClick={handlePreview}
                icon={faEye}
                disabled={!canExport()}
              >
                Preview
              </Button>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isExporting}
            >
              Cancel
            </Button>
            
            <Button
              variant="primary"
              onClick={handleExport}
              disabled={!canExport() || isExporting}
              icon={isExporting ? faSpinner : (exportSuccess ? faCheck : faDownload)}
              className={exportSuccess ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {isExporting ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                  Exporting...
                </>
              ) : exportSuccess ? (
                'Export Complete!'
              ) : (
                'Export Data'
              )}
            </Button>
          </div>
        </div>

        {/* Validation Messages */}
        {!canExport() && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faFilter} className="text-yellow-600" />
              <span className="text-sm text-yellow-700">
                No data available for the selected export type. Please select a different type or add data.
              </span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ExportPanel;