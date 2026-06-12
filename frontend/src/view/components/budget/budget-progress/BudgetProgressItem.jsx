import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExclamationTriangle,
  faArrowTrendUp,
  faArrowTrendDown,
  faCalendarAlt,
  faTag
} from '@fortawesome/free-solid-svg-icons';
import ProgressBar from '../../ui/ProgressBar';
import { formatCurrency, formatPercentage } from '../../../../controller/utils/formatters';
import { getBudgetStatusInfo, getStatusColors } from './budgetProgressHelpers';

const BudgetProgressItem = ({ budget, onBudgetClick }) => {
  const statusInfo = getBudgetStatusInfo(budget);
  const colors = getStatusColors(statusInfo.status);
  const percentage = budget.progressPercentage || 0;
  const spent = budget.progress?.spent || 0;
  const remaining = budget.progress?.remaining ?? budget.budgetAmount;
  const budgetAmount = budget.budgetAmount || 0;

  return (
    <div
      onClick={() => onBudgetClick(budget)}
      className="p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md"
      style={{ backgroundColor: colors.bg, borderColor: colors.border }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faTag} className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
              {budget.categoryName || budget.category}
            </span>
          </div>
          <FontAwesomeIcon icon={statusInfo.icon} className="w-4 h-4" style={{ color: colors.icon }} />
        </div>
        <div className="text-right">
          <div className="font-bold" style={{ color: 'var(--text-primary)' }}>
            {formatCurrency(budgetAmount)}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {budget.formattedPeriod || budget.period || 'monthly'}
          </div>
        </div>
      </div>

      <div className="mb-3">
        <ProgressBar
          value={percentage}
          max={100}
          color={statusInfo.progressColor}
          size="md"
          animated={true}
          showPercentage={true}
          label={`${formatCurrency(spent)} spent of ${formatCurrency(budgetAmount)}`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <FontAwesomeIcon icon={faArrowTrendUp} className="w-3 h-3" style={{ color: 'var(--error)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Spent</span>
          </div>
          <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {formatCurrency(spent)}
          </div>
        </div>
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <FontAwesomeIcon
              icon={remaining >= 0 ? faArrowTrendDown : faExclamationTriangle}
              className="w-3 h-3"
              style={{ color: remaining >= 0 ? 'var(--success)' : 'var(--error)' }}
            />
            <span style={{ color: 'var(--text-secondary)' }}>
              {remaining >= 0 ? 'Remaining' : 'Over Budget'}
            </span>
          </div>
          <div className="font-semibold" style={{ color: remaining >= 0 ? 'var(--success)' : 'var(--error)' }}>
            {formatCurrency(Math.abs(remaining))}
          </div>
        </div>
      </div>

      {statusInfo.status === 'exceeded' && (
        <div className="mt-3 p-2 rounded text-xs" style={{ backgroundColor: colors.statusBg, color: colors.statusText }}>
          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
          Budget exceeded by {formatCurrency(Math.abs(remaining))}
        </div>
      )}

      {statusInfo.status === 'warning' && (
        <div className="mt-3 p-2 rounded text-xs" style={{ backgroundColor: colors.statusBg, color: colors.statusText }}>
          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
          {formatPercentage(percentage)} of budget used
        </div>
      )}

      {budget.startDate && budget.endDate && (
        <div className="mt-3 flex items-center space-x-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3" />
          <span>
            {new Date(budget.startDate).toLocaleDateString()} - {new Date(budget.endDate).toLocaleDateString()}
          </span>
        </div>
      )}
    </div>
  );
};

export default BudgetProgressItem;
