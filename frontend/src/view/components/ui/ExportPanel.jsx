import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faCheck,
  faFilter,
  faSpinner,
  faDownload,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import Button from './Button';
import Card from './Card';
import Modal from './Modal';
import useExport, { EXPORT_TYPES } from './export-panel/useExport';
import ExportTypeSelector from './export-panel/ExportTypeSelector';
import FormatSelector, { FORMAT_OPTIONS } from './export-panel/FormatSelector';

const ExportPanel = ({
  transactions = [],
  budgets = [],
  summary = {},
  categoryBreakdown = [],
  dateRange = 'All Time',
  onClose,
  isOpen = false
}) => {
  const {
    exportType, setExportType,
    format, setFormat,
    isExporting, exportSuccess,
    generateFilename, canExport,
    handleExport, handlePreview
  } = useExport({ transactions, budgets, summary, categoryBreakdown, dateRange, onClose });

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Financial Data" maxWidth="2xl">
      <div className="space-y-6">
        <ExportTypeSelector
          exportTypes={EXPORT_TYPES}
          exportType={exportType}
          transactions={transactions}
          budgets={budgets}
          onSelect={setExportType}
        />

        <FormatSelector format={format} onSelect={setFormat} />

        <Card className="bg-blue-50 border-blue-200">
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-600" />
              <span className="font-medium text-blue-900">Export Summary</span>
            </div>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Data Period:</strong> {dateRange}</p>
              <p><strong>Export Type:</strong> {EXPORT_TYPES.find(t => t.value === exportType)?.label}</p>
              <p><strong>Format:</strong> {FORMAT_OPTIONS.find(f => f.value === format)?.label}</p>
              <p><strong>Filename:</strong> {generateFilename()}</p>
            </div>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="flex space-x-3">
            {format === 'pdf' && (
              <Button variant="outline" onClick={handlePreview} icon={faEye} disabled={!canExport()}>
                Preview
              </Button>
            )}
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} disabled={isExporting}>
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