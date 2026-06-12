import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHashtag, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const SEPARATOR_OPTIONS = [
  { value: ',', label: 'Comma (1,234.56)', description: 'US/UK standard' },
  { value: '.', label: 'Period (1.234,56)', description: 'European standard' },
  { value: ' ', label: 'Space (1 234.56)', description: 'International standard' }
];

const NumberFormatSection = ({ decimalPlaces, thousandsSeparator, onDecimalChange, onSeparatorChange, preview }) => (
  <div className="card-theme border rounded-lg p-6">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Number Format
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Customize how numbers and currencies are displayed
        </p>
      </div>
      <FontAwesomeIcon icon={faHashtag} className="text-xl" style={{ color: 'var(--accent-tertiary)' }} />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          Decimal Places
        </label>
        <select
          value={decimalPlaces}
          onChange={(e) => onDecimalChange(parseInt(e.target.value))}
          className="input-theme w-full px-3 py-2 rounded-lg"
        >
          <option value={0}>0 (No decimals)</option>
          <option value={1}>1 (0.0)</option>
          <option value={2}>2 (0.00)</option>
          <option value={3}>3 (0.000)</option>
          <option value={4}>4 (0.0000)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          Thousands Separator
        </label>
        <select
          value={thousandsSeparator}
          onChange={(e) => onSeparatorChange(e.target.value)}
          className="input-theme w-full px-3 py-2 rounded-lg"
        >
          {SEPARATOR_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>

    <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--info-bg)', borderWidth: '1px', borderColor: 'var(--info-border)' }}>
      <div className="flex items-center space-x-2 mb-1">
        <FontAwesomeIcon icon={faExclamationTriangle} className="text-sm" style={{ color: 'var(--info)' }} />
        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Live Preview:</span>
      </div>
      <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
        {preview}
      </span>
    </div>
  </div>
);

export default NumberFormatSection;
