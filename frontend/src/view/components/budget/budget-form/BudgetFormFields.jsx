import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDollarSign,
  faCalendarAlt,
  faTag
} from '@fortawesome/free-solid-svg-icons';
import Input from '../../ui/Input';

const PERIODS = [
  { value: 'weekly', label: 'Weekly', desc: '7 days' },
  { value: 'monthly', label: 'Monthly', desc: '1 month' },
  { value: 'quarterly', label: 'Quarterly', desc: '3 months' },
  { value: 'yearly', label: 'Yearly', desc: '12 months' }
];

export const CategoryField = ({ value, onChange, error, availableCategories }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Category <span className="text-red-500">*</span>
    </label>
    <div className="relative">
      <FontAwesomeIcon
        icon={faTag}
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
      />
      <select
        value={value}
        onChange={(e) => onChange('category', e.target.value)}
        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        required
      >
        <option value="">Select a category to budget</option>
        {availableCategories.map((category) => (
          <option key={category.name || category} value={category.name || category}>
            {category.name || category}
          </option>
        ))}
      </select>
    </div>
    {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
  </div>
);

export const PeriodField = ({ value, onChange, error }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-3">
      Budget Period <span className="text-red-500">*</span>
    </label>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {PERIODS.map((period) => (
        <button
          key={period.value}
          type="button"
          onClick={() => onChange('period', period.value)}
          className={`p-3 rounded-lg border-2 transition-colors ${
            value === period.value
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
          }`}
        >
          <div className="text-center">
            <div className="font-medium text-sm">{period.label}</div>
            <div className="text-xs text-gray-500">{period.desc}</div>
          </div>
        </button>
      ))}
    </div>
    {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
  </div>
);

export const DateRangeFields = ({ startDate, endDate, onStartChange, errorStart }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Input
      label="Start Date"
      type="date"
      value={startDate}
      onChange={(e) => onStartChange('startDate', e.target.value)}
      error={errorStart}
      required
      icon={faCalendarAlt}
      iconPosition="left"
    />
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
      <div className="relative">
        <FontAwesomeIcon
          icon={faCalendarAlt}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
        />
        <input
          type="date"
          value={endDate}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
          readOnly
        />
      </div>
      <p className="mt-1 text-xs text-gray-500">Auto-calculated based on period and start date</p>
    </div>
  </div>
);

export const AlertThresholdField = ({ value, onChange, error }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Alert Threshold</label>
    <div className="flex items-center space-x-3">
      <div className="flex-1">
        <Input
          type="number"
          placeholder="80"
          value={value}
          onChange={(e) => onChange('alertThreshold', e.target.value)}
          error={error}
          min="1"
          max="100"
        />
      </div>
      <span className="text-gray-500 text-sm">%</span>
    </div>
    <p className="mt-1 text-xs text-gray-500">
      Get notified when spending reaches this percentage of your budget
    </p>
    {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
  </div>
);

export const DescriptionField = ({ value, onChange, error }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
    <textarea
      placeholder="Add notes about this budget..."
      value={value}
      onChange={(e) => onChange('description', e.target.value)}
      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}
      rows="3"
      maxLength="200"
    />
    <div className="flex justify-between mt-1">
      <p className="text-xs text-gray-500">Optional notes about this budget</p>
      <p className="text-xs text-gray-500">{value.length}/200</p>
    </div>
    {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
  </div>
);

export const AmountField = ({ value, onChange, error }) => (
  <Input
    label="Budget Amount"
    type="text"
    placeholder="0.00"
    value={value}
    onChange={(e) => onChange('budgetAmount', e.target.value)}
    error={error}
    required
    icon={faDollarSign}
    iconPosition="left"
  />
);
