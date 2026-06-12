import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';

const AlertSummary = ({ alertsBySeverity, totalCount, selectedSeverity, onSelectSeverity }) => {
  const filters = [
    { value: 'all', label: 'All', count: totalCount },
    { value: 'high', label: 'Critical', count: alertsBySeverity.high.length },
    { value: 'medium', label: 'Warning', count: alertsBySeverity.medium.length },
    { value: 'low', label: 'Info', count: alertsBySeverity.low.length }
  ];

  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="text-lg font-bold text-red-600">{alertsBySeverity.high.length}</div>
          <div className="text-xs text-red-600">Critical</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="text-lg font-bold text-yellow-600">{alertsBySeverity.medium.length}</div>
          <div className="text-xs text-yellow-600">Warning</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-lg font-bold text-blue-600">{alertsBySeverity.low.length}</div>
          <div className="text-xs text-blue-600">Info</div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <FontAwesomeIcon icon={faFilter} className="text-gray-400 w-4 h-4" />
        <span className="text-sm text-gray-600">Filter by severity:</span>
        <div className="flex space-x-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => onSelectSeverity(filter.value)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedSeverity === filter.value
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default AlertSummary;
