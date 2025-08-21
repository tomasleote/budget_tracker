import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHistory,
  faArrowUp,
  faArrowDown,
  faInfoCircle,
  faUtensils,
  faCar,
  faShoppingBag,
  faHome,
  faFilm,
  faHospital,
  faGraduationCap,
  faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';
import Card from '../ui/Card';

const RecentTransactions = ({ 
  recentActivity = [],
  isLoading = false,
  onViewAll = () => window.location.href = '/transactions',
  className = ''
}) => {
  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount) || 0);
  };

  // Helper function to format date
  const formatDate = (date) => {
    const transactionDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - transactionDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return transactionDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

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

  if (isLoading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  // Show empty state if no transactions
  if (!recentActivity || recentActivity.length === 0) {
    return (
      <Card 
        title="Recent Transactions" 
        className={className}
        headerAction={
          <FontAwesomeIcon 
            icon={faHistory} 
            className="text-gray-400" 
          />
        }
      >
        <div className="text-center py-8">
          <FontAwesomeIcon 
            icon={faInfoCircle} 
            className="text-gray-400 text-3xl mb-4" 
          />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions Yet</h3>
          <p className="text-gray-500 mb-4">Your recent transactions will appear here</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Add Transaction
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title="Recent Transactions" 
      className={className}
      headerAction={
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            Last {recentActivity.length} transactions
          </span>
          <FontAwesomeIcon 
            icon={faHistory} 
            className="text-gray-400" 
          />
        </div>
      }
    >
      <div className="space-y-4">
        {/* Transaction List */}
        <div className="space-y-3">
          {recentActivity.slice(0, 6).map((transaction, index) => {
            const isIncome = transaction.type === 'income';
            const amount = Math.abs(transaction.amount || 0);
            const formattedAmount = transaction.formattedAmount || 
              (isIncome ? '+' : '-') + formatCurrency(amount);
            const categoryIcon = getCategoryIcon(transaction.categoryName || transaction.category);
            
            return (
              <div 
                key={transaction.id || index} 
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {/* Transaction Icon */}
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

                {/* Transaction Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="truncate">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {transaction.description || 'No description'}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center space-x-2">
                        <span>{transaction.categoryName || transaction.category || 'Uncategorized'}</span>
                        <span>•</span>
                        <span>{formatDate(transaction.date)}</span>
                        {transaction.isToday && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Today
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Amount */}
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon 
                        icon={isIncome ? faArrowUp : faArrowDown} 
                        className={`text-xs ${
                          isIncome ? 'text-green-600' : 'text-red-600'
                        }`} 
                      />
                      <span className={`text-sm font-semibold ${
                        isIncome ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formattedAmount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Link */}
        <div className="text-center pt-4 border-t">
          <button 
            onClick={onViewAll}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            View All Transactions
          </button>
        </div>
      </div>
    </Card>
  );
};

export default RecentTransactions;
