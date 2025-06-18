import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt,
  faTag,
  faArrowUp,
  faArrowDown,
  faEdit,
  faTrash,
  faEye,
  faUtensils,
  faCar,
  faShoppingBag,
  faHome,
  faFilm,
  faHospital,
  faGraduationCap,
  faQuestionCircle,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import Button from '../ui/Button';
import { formatCurrency, formatDate, formatRelativeTime } from '../../../controller/utils/formatters';

const TransactionCard = ({ 
  transaction,
  onView = () => {},
  onEdit = () => {},
  onDelete = () => {},
  showActions = true,
  isDeleting = false,
  className = ''
}) => {
  // Get category icon
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'food & dining': faUtensils,
      'food': faUtensils,
      'dining': faUtensils,
      'restaurants': faUtensils,
      'transportation': faCar,
      'car': faCar,
      'gas': faCar,
      'shopping': faShoppingBag,
      'store': faShoppingBag,
      'clothes': faShoppingBag,
      'home': faHome,
      'house': faHome,
      'entertainment': faFilm,
      'movies': faFilm,
      'games': faFilm,
      'healthcare': faHospital,
      'medical': faHospital,
      'doctor': faHospital,
      'education': faGraduationCap,
      'school': faGraduationCap,
      'books': faGraduationCap
    };

    const category = (categoryName || '').toLowerCase();
    return Object.keys(iconMap).find(key => category.includes(key)) 
      ? iconMap[Object.keys(iconMap).find(key => category.includes(key))]
      : faQuestionCircle;
  };

  // Handle delete with confirmation
  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      onDelete(transaction.id);
    }
  };

  if (!transaction) {
    return null;
  }

  const isIncome = transaction.type === 'income';
  const categoryIcon = getCategoryIcon(transaction.category);
  const amount = Math.abs(transaction.amount || 0);

  return (
    <div 
      className={`bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {/* Category Icon */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isIncome 
              ? 'bg-green-100 text-green-600' 
              : 'bg-red-100 text-red-600'
          }`}>
            <FontAwesomeIcon 
              icon={categoryIcon} 
              className="text-sm" 
            />
          </div>
          
          {/* Transaction Type Indicator */}
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            isIncome 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            <FontAwesomeIcon 
              icon={isIncome ? faArrowUp : faArrowDown} 
              className="text-xs" 
            />
          </div>
        </div>

        {/* Amount */}
        <div className="text-right">
          <div className={`text-lg font-semibold ${
            isIncome ? 'text-green-600' : 'text-red-600'
          }`}>
            {isIncome ? '+' : '-'}{formatCurrency(amount)}
          </div>
          <div className="text-xs text-gray-500">
            {isIncome ? 'Income' : 'Expense'}
          </div>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="space-y-2">
        {/* Description */}
        <div>
          <h4 className="font-medium text-gray-900 truncate">
            {transaction.description || 'No description'}
          </h4>
        </div>

        {/* Category and Date */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <FontAwesomeIcon icon={faTag} className="w-3 h-3" />
            <span className="truncate">{transaction.category}</span>
          </div>
          <div className="flex items-center space-x-1">
            <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3" />
            <span>{formatRelativeTime(transaction.date)}</span>
          </div>
        </div>

        {/* Full Date (smaller text) */}
        <div className="text-xs text-gray-400">
          {formatDate(transaction.date)}
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-end space-x-2 mt-4 pt-3 border-t border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onView(transaction);
            }}
            className="text-gray-400 hover:text-blue-600"
          >
            <FontAwesomeIcon icon={faEye} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(transaction);
            }}
            className="text-gray-400 hover:text-yellow-600"
          >
            <FontAwesomeIcon icon={faEdit} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-600"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
            ) : (
              <FontAwesomeIcon icon={faTrash} />
            )}
          </Button>
        </div>
      )}

      {/* Status Indicators */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
        {/* Transaction ID (for debugging/reference) */}
        <div className="text-xs text-gray-400 font-mono">
          ID: {transaction.id.slice(-8)}
        </div>
        
        {/* Recent indicator */}
        {(() => {
          const daysDiff = Math.floor((new Date() - new Date(transaction.date)) / (1000 * 60 * 60 * 24));
          if (daysDiff === 0) {
            return (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Today
              </span>
            );
          } else if (daysDiff === 1) {
            return (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Yesterday
              </span>
            );
          } else if (daysDiff <= 7) {
            return (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                This week
              </span>
            );
          }
          return null;
        })()}
      </div>
    </div>
  );
};

export default TransactionCard;