import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileCsv, faFilePdf } from '@fortawesome/free-solid-svg-icons';

const FORMAT_OPTIONS = [
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

const FormatSelector = ({ format, onSelect }) => (
  <div>
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Format</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {FORMAT_OPTIONS.map((formatOption) => (
        <div
          key={formatOption.value}
          onClick={() => onSelect(formatOption.value)}
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
);

export { FORMAT_OPTIONS };
export default FormatSelector;
