import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport } from '@fortawesome/free-solid-svg-icons';

const ExportTypeSelector = ({ exportTypes, exportType, transactions, budgets, onSelect }) => (
  <div>
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Data to Export</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {exportTypes.map((type) => {
        const count = type.value === 'transactions' ? transactions.length : budgets.length;
        return (
          <div
            key={type.value}
            onClick={() => onSelect(type.value)}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              exportType === type.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <FontAwesomeIcon icon={faFileExport} className="text-blue-600" />
                <span className="font-medium text-gray-900">{type.label}</span>
              </div>
              <span className="text-sm bg-gray-100 px-2 py-1 rounded">{count} items</span>
            </div>
            <p className="text-sm text-gray-600">{type.description}</p>
          </div>
        );
      })}
    </div>
  </div>
);

export default ExportTypeSelector;
