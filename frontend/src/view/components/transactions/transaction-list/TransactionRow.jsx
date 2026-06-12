import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTag,
  faCalendarAlt,
  faArrowUp,
  faArrowDown,
  faEye,
  faEdit,
  faTrash,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import Button from '../../ui/Button';
import { formatCurrency, formatDate } from '../../../../controller/utils/formatters';
import { getCategoryIcon } from './categoryIcon';

function TransactionRow({
  transaction,
  isSelected,
  showActions,
  isDeleting,
  index,
  isLast,
  onSelect,
  onView,
  onEdit,
  onDelete
}) {
  const isIncome = transaction.type === 'income';
  const categoryIcon = getCategoryIcon(transaction.category);

  return (
    <div
      className={`flex items-center space-x-3 p-4 transition-colors cursor-pointer ${
        !isLast ? 'border-b border-theme-secondary' : ''
      } ${isSelected ? '' : 'bg-theme-card hover-bg-theme'}`}
      style={isSelected ? { backgroundColor: 'var(--info-bg)' } : undefined}
    >
      {showActions && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => { e.stopPropagation(); onSelect(transaction.id); }}
          className="w-4 h-4 rounded"
          style={{ accentColor: 'var(--accent-primary)' }}
        />
      )}

      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
        isIncome ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
      }`}>
        <FontAwesomeIcon icon={categoryIcon} className="text-lg" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-theme-primary truncate">
              {transaction.description}
            </div>
            <div className="text-xs text-theme-secondary flex items-center space-x-2">
              <FontAwesomeIcon icon={faTag} className="w-3 h-3" />
              <span>{transaction.category}</span>
              <span>•</span>
              <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3" />
              <span>{formatDate(transaction.date)}</span>
            </div>
          </div>

          <div className="text-right ml-4 flex-shrink-0">
            <div className={`text-sm font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
              {isIncome ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
            </div>
            <div className="text-xs text-theme-secondary">
              <FontAwesomeIcon icon={isIncome ? faArrowUp : faArrowDown} className="mr-1" />
              {isIncome ? 'Income' : 'Expense'}
            </div>
          </div>
        </div>
      </div>

      {showActions && (
        <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onView(transaction); }}
            className="text-theme-secondary hover:text-theme-accent"
          >
            <FontAwesomeIcon icon={faEye} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(transaction); }}
            className="text-theme-secondary hover:text-yellow-600"
          >
            <FontAwesomeIcon icon={faEdit} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onDelete(transaction.id); }}
            className="text-theme-secondary hover:text-red-600"
            disabled={isDeleting}
          >
            {isDeleting
              ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              : <FontAwesomeIcon icon={faTrash} />
            }
          </Button>
        </div>
      )}
    </div>
  );
}

export default TransactionRow;
