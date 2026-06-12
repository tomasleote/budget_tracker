import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt,
  faDollarSign,
  faTag,
  faFileText,
  faArrowUp,
  faArrowDown,
  faEdit,
  faTrash,
  faTimes,
  faHistory,
  faInfoCircle,
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
import Card from '../ui/Card';
import { formatCurrency, formatDate, formatRelativeTime } from '../../../controller/utils/formatters';

const TransactionDetail = ({ 
  transaction,
  onEdit = () => {},
  onDelete = () => {},
  onClose = () => {},
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
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
      onDelete(transaction.id);
    }
  };

  if (!transaction) {
    return (
      <Card className={className}>
        <div className="text-center py-8">
          <FontAwesomeIcon
            icon={faInfoCircle}
            className="text-theme-tertiary text-3xl mb-4"
          />
          <h3 className="text-lg font-medium text-theme-primary mb-2">
            No Transaction Selected
          </h3>
          <p className="text-theme-secondary">
            Select a transaction to view its details
          </p>
        </div>
      </Card>
    );
  }

  const isIncome = transaction.type === 'income';
  const categoryIcon = getCategoryIcon(transaction.category);
  const amount = Math.abs(transaction.amount || 0);

  return (
    <Card 
      className={className}
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isIncome 
                ? 'bg-green-100 text-green-600' 
                : 'bg-red-100 text-red-600'
            }`}>
              <FontAwesomeIcon 
                icon={categoryIcon} 
                className="text-lg" 
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-theme-primary">
                Transaction Details
              </h3>
              <p className="text-sm text-theme-secondary">
                {isIncome ? 'Income' : 'Expense'} • {formatRelativeTime(transaction.date)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-theme-secondary"
          >
            <FontAwesomeIcon icon={faTimes} />
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Amount Display */}
        <div className="text-center py-6 bg-theme-secondary rounded-lg">
          <div className={`text-3xl font-bold mb-2 ${
            isIncome ? 'text-green-600' : 'text-red-600'
          }`}>
            {isIncome ? '+' : '-'}{formatCurrency(amount)}
          </div>
          <div className="flex items-center justify-center space-x-2 text-theme-secondary">
            <FontAwesomeIcon 
              icon={isIncome ? faArrowUp : faArrowDown} 
              className={isIncome ? 'text-green-600' : 'text-red-600'} 
            />
            <span className="text-sm font-medium">
              {isIncome ? 'Income' : 'Expense'} Transaction
            </span>
          </div>
        </div>

        {/* Transaction Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm font-medium text-theme-primary">
              <FontAwesomeIcon icon={faFileText} className="text-theme-secondary" />
              <span>Description</span>
            </div>
            <div className="text-theme-primary bg-theme-primary border border-theme-primary rounded-lg p-3">
              {transaction.description || 'No description provided'}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm font-medium text-theme-primary">
              <FontAwesomeIcon icon={faTag} className="text-theme-secondary" />
              <span>Category</span>
            </div>
            <div className="flex items-center space-x-3 bg-theme-primary border border-theme-primary rounded-lg p-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isIncome 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-red-100 text-red-600'
              }`}>
                <FontAwesomeIcon 
                  icon={categoryIcon} 
                  className="text-sm" 
                />
              </div>
              <span className="text-theme-primary">{transaction.category}</span>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm font-medium text-theme-primary">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-theme-secondary" />
              <span>Date</span>
            </div>
            <div className="text-theme-primary bg-theme-primary border border-theme-primary rounded-lg p-3">
              {formatDate(transaction.date)}
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm font-medium text-theme-primary">
              <FontAwesomeIcon icon={faDollarSign} className="text-theme-secondary" />
              <span>Amount</span>
            </div>
            <div className="bg-theme-primary border border-theme-primary rounded-lg p-3">
              <div className={`text-lg font-semibold ${
                isIncome ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(amount)}
              </div>
              <div className="text-xs text-theme-secondary mt-1">
                {isIncome ? 'Money received' : 'Money spent'}
              </div>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="border-t border-theme-primary pt-6">
          <div className="flex items-center space-x-2 text-sm font-medium text-theme-primary mb-4">
            <FontAwesomeIcon icon={faHistory} className="text-theme-secondary" />
            <span>Transaction History</span>
          </div>
          <div className="space-y-3">
            {/* Created */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-theme-secondary">Created:</span>
              <span className="text-theme-primary">
                {transaction.createdAt ? formatDate(transaction.createdAt) : 'Unknown'}
              </span>
            </div>
            
            {/* Last Updated */}
            {transaction.updatedAt && transaction.updatedAt !== transaction.createdAt && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-theme-secondary">Last updated:</span>
                <span className="text-theme-primary">
                  {formatDate(transaction.updatedAt)}
                </span>
              </div>
            )}
            
            {/* Transaction ID */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-theme-secondary">Transaction ID:</span>
              <span className="text-gray-900 font-mono text-xs">
                {transaction.id}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-theme-primary">
          <Button
            variant="outline"
            onClick={() => onEdit(transaction)}
            className=""
          >
            <FontAwesomeIcon icon={faEdit} className="mr-2" />
            Edit Transaction
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faTrash} className="mr-2" />
                Delete Transaction
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default TransactionDetail;