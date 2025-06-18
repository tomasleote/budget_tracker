import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus,
  faEdit,
  faTrash,
  faEye,
  faSpinner,
  faCheckCircle,
  faExclamationTriangle,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import Button from '../ui/Button';
import { TransactionFormModal } from '../forms';
import { TransactionDetail } from '../transactions';
import { useTransactions } from '../../../controller/hooks/useTransactions';

const TransactionCRUDManager = ({ 
  onTransactionChange = () => {},
  showNotifications = true,
  className = ''
}) => {
  // Transaction operations hook
  const {
    createTransaction,
    updateTransaction,
    deleteTransaction,
    isCreatingTransaction,
    isUpdatingTransaction,
    isDeletingTransaction,
    hasCreateError,
    hasUpdateError,
    hasDeleteError,
    getError
  } = useTransactions();

  // UI state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDetailView, setShowDetailView] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [notification, setNotification] = useState(null);

  // Show notification helper
  const showNotification = (type, message, duration = 3000) => {
    if (!showNotifications) return;
    
    setNotification({ type, message });
    setTimeout(() => setNotification(null), duration);
  };

  // Create transaction handler
  const handleCreateTransaction = async (transactionData) => {
    try {
      const result = await createTransaction(transactionData);
      
      if (result) {
        showNotification('success', 'Transaction created successfully!');
        setShowCreateForm(false);
        onTransactionChange('created', result);
        return result;
      }
    } catch (error) {
      console.error('Create transaction error:', error);
      showNotification('error', error.message || 'Failed to create transaction');
    }
  };

  // Update transaction handler
  const handleUpdateTransaction = async (transactionId, updateData) => {
    try {
      const result = await updateTransaction(transactionId, updateData);
      
      if (result) {
        showNotification('success', 'Transaction updated successfully!');
        setShowEditForm(false);
        setSelectedTransaction(result);
        onTransactionChange('updated', result);
        return result;
      }
    } catch (error) {
      console.error('Update transaction error:', error);
      showNotification('error', error.message || 'Failed to update transaction');
    }
  };

  // Delete transaction handler
  const handleDeleteTransaction = async (transactionId) => {
    try {
      // Show confirmation dialog
      const confirmed = window.confirm(
        'Are you sure you want to delete this transaction? This action cannot be undone.'
      );
      
      if (!confirmed) return false;

      const result = await deleteTransaction(transactionId);
      
      if (result) {
        showNotification('success', 'Transaction deleted successfully!');
        setShowDetailView(false);
        setSelectedTransaction(null);
        onTransactionChange('deleted', { id: transactionId });
        return true;
      }
    } catch (error) {
      console.error('Delete transaction error:', error);
      showNotification('error', error.message || 'Failed to delete transaction');
      return false;
    }
  };

  // View transaction handler
  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailView(true);
  };

  // Edit transaction handler
  const handleEditTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowEditForm(true);
  };

  // Close handlers
  const handleCloseCreate = () => {
    setShowCreateForm(false);
  };

  const handleCloseEdit = () => {
    setShowEditForm(false);
    setSelectedTransaction(null);
  };

  const handleCloseDetail = () => {
    setShowDetailView(false);
    setSelectedTransaction(null);
  };

  // Get current operation status
  const isAnyOperationLoading = isCreatingTransaction || isUpdatingTransaction || isDeletingTransaction;
  const hasAnyError = hasCreateError || hasUpdateError || hasDeleteError;

  return (
    <div className={className}>
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm w-full`}>
          <div className={`p-4 rounded-lg shadow-lg border ${
            notification.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800'
              : notification.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-center">
              <FontAwesomeIcon 
                icon={
                  notification.type === 'success' ? faCheckCircle :
                  notification.type === 'error' ? faExclamationTriangle :
                  faSpinner
                } 
                className={`mr-2 ${
                  notification.type === 'success' ? 'text-green-600' :
                  notification.type === 'error' ? 'text-red-600' :
                  'text-blue-600'
                }`}
              />
              <span className="flex-1 text-sm font-medium">
                {notification.message}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNotification(null)}
                className="ml-2 p-0 h-4 w-4"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xs" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center space-x-3">
        <Button
          variant="primary"
          onClick={() => setShowCreateForm(true)}
          disabled={isAnyOperationLoading}
        >
          {isCreatingTransaction ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add Transaction
            </>
          )}
        </Button>

        {/* Operation Status Indicator */}
        {isAnyOperationLoading && (
          <div className="flex items-center space-x-2 text-blue-600">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
            <span className="text-sm">
              {isCreatingTransaction && 'Creating transaction...'}
              {isUpdatingTransaction && 'Updating transaction...'}
              {isDeletingTransaction && 'Deleting transaction...'}
            </span>
          </div>
        )}

        {/* Error Status Indicator */}
        {hasAnyError && (
          <div className="flex items-center space-x-2 text-red-600">
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <span className="text-sm">
              {hasCreateError && getError('create')}
              {hasUpdateError && getError('update')}
              {hasDeleteError && getError('delete')}
            </span>
          </div>
        )}
      </div>

      {/* Create Transaction Modal */}
      <TransactionFormModal
        isOpen={showCreateForm}
        onClose={handleCloseCreate}
        onTransactionSaved={handleCreateTransaction}
        transaction={null}
      />

      {/* Edit Transaction Modal */}
      <TransactionFormModal
        isOpen={showEditForm}
        onClose={handleCloseEdit}
        onTransactionSaved={(result) => handleUpdateTransaction(selectedTransaction?.id, result)}
        transaction={selectedTransaction}
      />

      {/* Transaction Detail Modal */}
      {showDetailView && selectedTransaction && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleCloseDetail} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <TransactionDetail
                transaction={selectedTransaction}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
                onClose={handleCloseDetail}
                isDeleting={isDeletingTransaction}
                className="border-0 shadow-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Public API for parent components */}
      <div style={{ display: 'none' }}>
        {/* These functions are accessible via ref if needed */}
        <div ref={(el) => {
          if (el) {
            el.createTransaction = () => setShowCreateForm(true);
            el.editTransaction = handleEditTransaction;
            el.viewTransaction = handleViewTransaction;
            el.deleteTransaction = handleDeleteTransaction;
          }
        }} />
      </div>
    </div>
  );
};

export default TransactionCRUDManager;