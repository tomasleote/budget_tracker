import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faTrash,
  faEye,
  faDollarSign,
  faCalendarAlt,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import Button from '../../ui/Button';
import ProgressBar from '../../ui/ProgressBar';
import { formatCurrency, formatPercentage, formatDate } from '../../../../controller/utils/formatters';
import { getBudgetStatusInfo } from './budgetStatusInfo';

const BudgetListItem = ({ budget, showActions, onViewBudget, onEditBudget, onDeleteClick }) => {
  const statusInfo = getBudgetStatusInfo(budget);
  const percentage = budget.utilizationPercentage || 0;
  const spent = budget.progress?.spent || 0;
  const remaining = budget.progress?.remaining || budget.budgetAmount;
  const budgetAmount = budget.budgetAmount || 0;

  return (
    <div
      className="p-4 rounded-lg transition-shadow"
      style={{
        border: '1px solid var(--border-primary)',
        backgroundColor: 'var(--bg-card)'
      }}
      onMouseEnter={(e) => { e.target.style.boxShadow = 'var(--shadow-md)'; }}
      onMouseLeave={(e) => { e.target.style.boxShadow = 'var(--shadow-sm)'; }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="p-2 rounded-lg" style={{ backgroundColor: statusInfo.bgColor }}>
            <FontAwesomeIcon
              icon={statusInfo.icon}
              className="w-4 h-4"
              style={{ color: statusInfo.textColor }}
            />
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {budget.category}
              </h3>
              <span className="px-2 py-1 text-xs rounded-full" style={{
                backgroundColor: statusInfo.bgColor,
                color: statusInfo.textColor
              }}>
                {statusInfo.text}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <div className="flex items-center space-x-1">
                <FontAwesomeIcon icon={faDollarSign} className="w-3 h-3" />
                <span>{formatCurrency(budgetAmount)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3" />
                <span>{budget.period}</span>
              </div>
              {budget.startDate && (
                <div className="flex items-center space-x-1">
                  <span>Starts: {formatDate(budget.startDate)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {showActions && (
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onViewBudget(budget); }} icon={faEye}>
              View
            </Button>
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEditBudget(budget); }} icon={faEdit}>
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onDeleteClick(budget); }}
              icon={faTrash}
              style={{ color: 'var(--error)' }}
              onMouseEnter={(e) => { e.target.style.color = 'var(--error)'; e.target.style.backgroundColor = 'var(--error-bg)'; }}
              onMouseLeave={(e) => { e.target.style.color = 'var(--error)'; e.target.style.backgroundColor = 'transparent'; }}
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Budget Progress</span>
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{formatPercentage(percentage)}</span>
        </div>
        <ProgressBar value={percentage} max={100} color="dynamic" size="md" animated={true} />
        <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
          <span>{formatCurrency(spent)} spent</span>
          <span>{formatCurrency(budgetAmount)} budget</span>
        </div>
      </div>

      {/* Detail grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        <div>
          <div className="mb-1" style={{ color: 'var(--text-secondary)' }}>Spent</div>
          <div className="font-semibold" style={{ color: 'var(--error)' }}>{formatCurrency(spent)}</div>
        </div>
        <div>
          <div className="mb-1" style={{ color: 'var(--text-secondary)' }}>
            {remaining >= 0 ? 'Remaining' : 'Over Budget'}
          </div>
          <div className="font-semibold" style={{ color: remaining >= 0 ? 'var(--success)' : 'var(--error)' }}>
            {formatCurrency(Math.abs(remaining))}
          </div>
        </div>
        <div>
          <div className="mb-1" style={{ color: 'var(--text-secondary)' }}>Alert Threshold</div>
          <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {budget.alertThreshold || 80}%
          </div>
        </div>
      </div>

      {/* Description */}
      {budget.description && (
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
          <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Description</div>
          <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{budget.description}</div>
        </div>
      )}

      {/* Status alert banners */}
      {statusInfo.status === 'exceeded' && (
        <div className="mt-4 p-3 rounded-lg" style={{
          backgroundColor: statusInfo.bgColor,
          border: `1px solid ${statusInfo.borderColor}`
        }}>
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4" style={{ color: statusInfo.textColor }} />
            <span className="text-sm font-medium" style={{ color: statusInfo.textColor }}>
              Budget exceeded by {formatCurrency(Math.abs(remaining))}
            </span>
          </div>
        </div>
      )}

      {statusInfo.status === 'warning' && (
        <div className="mt-4 p-3 rounded-lg" style={{
          backgroundColor: statusInfo.bgColor,
          border: `1px solid ${statusInfo.borderColor}`
        }}>
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4" style={{ color: statusInfo.textColor }} />
            <span className="text-sm font-medium" style={{ color: statusInfo.textColor }}>
              {formatPercentage(percentage)} of budget used - approaching limit
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetListItem;
