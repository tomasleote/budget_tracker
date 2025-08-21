import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faArrowUp,
  faArrowDown,
  faWallet,
  faSpinner,
  faChartLine,
  faSync,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import TransactionFormModal from '../../forms/TransactionFormModal';
import BudgetFormModal from '../../budget/BudgetFormModal';

const QuickActionsWidget = ({ 
  actions = {},
  isLoading = false,
  className = ''
}) => {
  const [actionLoading, setActionLoading] = useState(null);
  
  // Modal states
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);

  // Handle quick action with loading state
  const handleQuickAction = async (actionType, actionFn) => {
    if (!actionFn) return;
    
    setActionLoading(actionType);
    try {
      await actionFn();
    } catch (error) {
      console.error(`Quick action ${actionType} failed:`, error);
    } finally {
      setActionLoading(null);
    }
  };
  
  // Handle modal actions
  const handleAddExpense = () => {
    setShowExpenseModal(true);
  };
  
  const handleAddIncome = () => {
    setShowIncomeModal(true);
  };
  
  const handleCreateBudget = () => {
    setShowBudgetModal(true);
  };
  
  const handleViewReports = () => {
    window.location.href = '/reports';
  };
  
  // Handle transaction saved
  const handleTransactionSaved = (transaction) => {
    console.log('Transaction saved from quick actions:', transaction);
    // Trigger refresh if available
    if (actions.refreshDashboard) {
      actions.refreshDashboard();
    }
  };
  
  // Handle budget saved
  const handleBudgetSaved = (budget) => {
    console.log('Budget saved from quick actions:', budget);
    // Trigger refresh if available
    if (actions.refreshDashboard) {
      actions.refreshDashboard();
    }
  };

  if (isLoading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const quickActions = [
    {
      id: 'add-expense',
      title: 'Add Expense',
      description: 'Record a new expense',
      icon: faArrowDown,
      color: 'red',
      variant: 'outline',
      action: handleAddExpense
    },
    {
      id: 'add-income',
      title: 'Add Income',
      description: 'Record new income',
      icon: faArrowUp,
      color: 'green',
      variant: 'outline',
      action: handleAddIncome
    },
    {
      id: 'create-budget',
      title: 'Create Budget',
      description: 'Set up a new budget',
      icon: faWallet,
      color: 'blue',
      variant: 'outline',
      action: handleCreateBudget
    }
  ];

  return (
    <Card 
      title="Quick Actions" 
      className={className}
      headerAction={
        <FontAwesomeIcon 
          icon={faPlus} 
          className="text-gray-400" 
        />
      }
    >
      <div className="space-y-3">
        {quickActions.map((action) => {
          const isActionLoading = actionLoading === action.id;
          
          return (
            <button
              key={action.id}
              onClick={action.action}
              disabled={isActionLoading || isLoading}
              className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-sm ${
                action.color === 'red' ? 'border-red-200 hover:border-red-300 hover:bg-red-50' :
                action.color === 'green' ? 'border-green-200 hover:border-green-300 hover:bg-green-50' :
                'border-blue-200 hover:border-blue-300 hover:bg-blue-50'
              } ${isActionLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
            >
              <div className="flex items-center space-x-3">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  action.color === 'red' ? 'bg-red-100' :
                  action.color === 'green' ? 'bg-green-100' :
                  'bg-blue-100'
                }`}>
                  <FontAwesomeIcon 
                    icon={isActionLoading ? faSpinner : action.icon}
                    className={`text-sm ${
                      action.color === 'red' ? 'text-red-600' :
                      action.color === 'green' ? 'text-green-600' :
                      'text-blue-600'
                    } ${isActionLoading ? 'animate-spin' : ''}`}
                  />
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {action.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    {action.description}
                  </div>
                </div>
                
                {/* Arrow */}
                <div className="text-gray-400">
                  <FontAwesomeIcon 
                    icon={faChevronRight} 
                    className="text-xs"
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Additional Quick Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={faSync}
            onClick={() => handleQuickAction('refresh', actions.refreshDashboard)}
            disabled={actionLoading === 'refresh'}
            className="text-xs"
          >
            {actionLoading === 'refresh' ? 'Refreshing...' : 'Refresh Data'}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            icon={faChartLine}
            onClick={handleViewReports}
            className="text-xs"
          >
            View Reports
          </Button>
        </div>
      </div>
      
      {/* Modals */}
      <TransactionFormModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        transaction={{ type: 'expense' }} // Pre-set to expense
        onTransactionSaved={handleTransactionSaved}
      />
      
      <TransactionFormModal
        isOpen={showIncomeModal}
        onClose={() => setShowIncomeModal(false)}
        transaction={{ type: 'income' }} // Pre-set to income
        onTransactionSaved={handleTransactionSaved}
      />
      
      <BudgetFormModal
        isOpen={showBudgetModal}
        onClose={() => setShowBudgetModal(false)}
        onBudgetSaved={handleBudgetSaved}
      />
    </Card>
  );
};

export default QuickActionsWidget;
