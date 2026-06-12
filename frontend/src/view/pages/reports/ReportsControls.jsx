import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faChartBar,
  faPieChart,
  faWallet,
  faChartLine
} from '@fortawesome/free-solid-svg-icons';
import Card from '../../components/ui/Card';

const DATE_RANGES = [
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'last3Months', label: 'Last 3 Months' },
  { value: 'last6Months', label: 'Last 6 Months' },
  { value: 'thisYear', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' }
];

const REPORT_TYPES = [
  { value: 'overview', label: 'Financial Overview', icon: faChartBar },
  { value: 'spending', label: 'Spending Analysis', icon: faPieChart },
  { value: 'budget', label: 'Budget Performance', icon: faWallet },
  { value: 'trends', label: 'Trends & Insights', icon: faChartLine }
];

const ReportsControls = ({ dateRange, onDateRangeChange, reportType, onReportTypeChange }) => (
  <Card className="mb-6 lg:mb-8">
    <div className="p-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4">
          <FontAwesomeIcon icon={faCalendarAlt} className="text-theme-secondary" />
          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value)}
            className="input-theme border px-4 py-2 rounded-lg transition-colors"
          >
            {DATE_RANGES.map((range) => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-1 rounded-lg p-1" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
          {REPORT_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => onReportTypeChange(type.value)}
              className="px-4 py-2 rounded flex items-center space-x-2 transition-colors"
              style={{
                backgroundColor: reportType === type.value ? 'var(--bg-card)' : 'transparent',
                color: reportType === type.value ? 'var(--accent-primary)' : 'var(--text-secondary)',
                boxShadow: reportType === type.value ? 'var(--shadow-sm)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (reportType !== type.value) e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                if (reportType !== type.value) e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <FontAwesomeIcon icon={type.icon} className="w-4 h-4" />
              <span className="font-medium hidden sm:inline">{type.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  </Card>
);

export { DATE_RANGES };
export default ReportsControls;
