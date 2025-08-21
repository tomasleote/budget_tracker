import React, { useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner,
  faCheckCircle,
  faExclamationTriangle,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import TransactionList from './TransactionList';
import TransactionCRUDManager from './TransactionCRUDManager';
import Card from '../ui/Card';
import { useTransactions } from '../../../controller/hooks/useTransactions';

const EnhancedTransactionList = ({ 
  maxItems = null,
  showCRUDControls = true,
  showFilters = true,
  showSearch = true,
  onTransactionChange = () => {},
  className = ''
}) => {
  const {
    transactions,
    isLoadingTransactions,
    refreshTransactions,
    hasLoadError,
    getError
  } = useTransactions();

  // Local state for UI feedback
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastOperation, setLastOperation] = useState(null);

  // Handle transaction changes with optimistic updates
  const handleTransactionChange = useCallback(async (operation, data) => {
    setLastOperation({ operation, data, timestamp: Date.now() });
    
    // Trigger any external handlers
    onTransactionChange(operation, data);
    
    // Optional: Refresh data to ensure consistency
    // This could be removed for better performance with proper optimistic updates
    if (operation === 'created' || operation === 'updated' || operation === 'deleted') {
      setIsRefreshing(true);
      try {
        await refreshTransactions();
      } catch (error) {
        console.error('Failed to refresh transactions:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
  }, [onTransactionChange, refreshTransactions]);

  // Get status message
  const getStatusMessage = () => {
    if (isLoadingTransactions) return 'Loading transactions...';
    if (isRefreshing) return 'Refreshing data...';
    if (hasLoadError) return `Error: ${getError('load')}`;
    
    if (lastOperation) {
      const { operation, timestamp } = lastOperation;
      const isRecent = Date.now() - timestamp < 5000; // Show for 5 seconds
      
      if (isRecent) {
        switch (operation) {
          case 'created':
            return 'Transaction created successfully';
          case 'updated':
            return 'Transaction updated successfully';
          case 'deleted':
            return 'Transaction deleted successfully';
          default:
            return null;
        }
      }
    }
    
    return null;
  };

  const statusMessage = getStatusMessage();
  const isLoading = isLoadingTransactions || isRefreshing;
  const hasError = hasLoadError;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Status Bar */}
      {(statusMessage || isLoading || hasError) && (
        <Card className="border-l-4 border-l-blue-500">
          <div className="flex items-center space-x-3">
            {isLoading && (
              <>
                <FontAwesomeIcon icon={faSpinner} className="text-blue-600 animate-spin" />
                <span className="text-blue-800 font-medium">{statusMessage}</span>
              </>
            )}
            
            {hasError && (
              <>
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600" />
                <span className="text-red-800 font-medium">{statusMessage}</span>
              </>
            )}
            
            {!isLoading && !hasError && statusMessage && (
              <>
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                <span className="text-green-800 font-medium">{statusMessage}</span>
              </>
            )}
          </div>
        </Card>
      )}

      {/* CRUD Controls */}
      {showCRUDControls && (
        <TransactionCRUDManager
          onTransactionChange={handleTransactionChange}
          showNotifications={false} // We handle notifications at this level
        />
      )}

      {/* Transaction List */}
      <TransactionList
        maxItems={maxItems}
        showFilters={showFilters}
        showSearch={showSearch}
        showActions={true}
        onTransactionSelect={(transaction) => {
          // Handle view transaction
          handleTransactionChange('viewed', transaction);
        }}
        onTransactionEdit={(transaction) => {
          // Handle edit transaction
          handleTransactionChange('edit_requested', transaction);
        }}
        onTransactionDelete={async (transactionId) => {
          // Handle delete transaction
          try {
            // This will be handled by the TransactionCRUDManager
            await handleTransactionChange('delete_requested', { id: transactionId });
          } catch (error) {
            console.error('Delete failed:', error);
          }
        }}
        onAddTransaction={() => {
          // Handle add transaction
          handleTransactionChange('add_requested', null);
        }}
      />

      {/* Summary Stats */}
      {transactions.length > 0 && (
        <Card className="bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {transactions.length}
              </div>
              <div className="text-sm text-gray-600">Total Transactions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {transactions.filter(t => t.type === 'income').length}
              </div>
              <div className="text-sm text-gray-600">Income Transactions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {transactions.filter(t => t.type === 'expense').length}
              </div>
              <div className="text-sm text-gray-600">Expense Transactions</div>
            </div>
          </div>
        </Card>
      )}

      {/* No Data State */}
      {!isLoading && !hasError && transactions.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <FontAwesomeIcon 
              icon={faInfoCircle} 
              className="text-gray-400 text-4xl mb-4" 
            />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Transactions Yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start by adding your first transaction to track your finances.
            </p>
            {showCRUDControls && (
              <TransactionCRUDManager
                onTransactionChange={handleTransactionChange}
                showNotifications={false}
                className="inline-block"
              />
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default EnhancedTransactionList;