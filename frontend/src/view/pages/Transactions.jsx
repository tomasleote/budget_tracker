import React, { useState, useMemo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faExchangeAlt,
  faPlus,
  faFilter,
  faDownload,
  faSearch,
  faCalendarAlt,
  faChartLine,
  faList,
  faTh,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ConfirmationModal from '../components/ui/ConfirmationModal';

// Transaction components
import {
  TransactionList,
  TransactionGrid,
  TransactionFilterToolbar,
  TransactionDetailModal,
  AdvancedTransactionFilters
} from '../components/transactions';

// Import modal from forms
import { TransactionFormModal } from '../components/forms';

// Hooks
import { useTransactions } from '../../controller/hooks/useTransactions';
import { useCategories } from '../../controller/hooks/useCategories';

const Transactions = () => {
  // State management
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [showFilters, setShowFilters] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [selectedTransactionForDetail, setSelectedTransactionForDetail] = useState(null);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    type: 'all',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  // Hooks
  const {
    transactions,
    filteredTransactions,
    summary,
    categoryBreakdown,
    isLoading,
    isCreatingTransaction,
    isUpdatingTransaction,
    isDeletingTransaction,
    hasError,
    filters,
    loadTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    setFilter,
    setFilters,
    resetFilters,
    searchTransactions,
    filterByCategory,
    filterByType,
    filterByDateRange,
    sortTransactions,
    getTransactionStats,
    clearAllData // Debug function
  } = useTransactions();

  const { categories } = useCategories();

  // Load transactions on mount
  useEffect(() => {
    console.log('🔄 Transactions page: Loading transactions...');
    loadTransactions();
  }, [loadTransactions]);

  // Transaction stats
  const stats = getTransactionStats();

  // Filtered transactions based on local filters
  const actualFilteredTransactions = useMemo(() => {
    let result = transactions;
    console.log('Filtering transactions:', { 
      totalTransactions: transactions.length, 
      filters: localFilters 
    });

    // Filter by type
    if (localFilters.type && localFilters.type !== 'all') {
      result = result.filter(t => t.type === localFilters.type);
      console.log('After type filter:', result.length);
    }

    // Filter by date range
    if (localFilters.dateFrom || localFilters.dateTo) {
      result = result.filter(t => {
        const transactionDate = new Date(t.date);
        const fromDate = localFilters.dateFrom ? new Date(localFilters.dateFrom) : null;
        const toDate = localFilters.dateTo ? new Date(localFilters.dateTo) : null;
        
        if (fromDate && transactionDate < fromDate) return false;
        if (toDate && transactionDate > toDate) return false;
        return true;
      });
      console.log('After date filter:', result.length);
    }

    // Filter by search
    if (localFilters.search) {
      const searchTerm = localFilters.search.toLowerCase();
      result = result.filter(t => 
        (t.description || '').toLowerCase().includes(searchTerm) ||
        (t.category || '').toLowerCase().includes(searchTerm) ||
        String(t.amount || '').includes(searchTerm)
      );
      console.log('After search filter:', result.length);
    }

    console.log('Final filtered transactions:', result.length);
    return result;
  }, [transactions, localFilters]);

  // Handle transaction operations
  const handleCreateTransaction = () => {
    setEditingTransaction(null);
    setShowTransactionModal(true);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionModal(true);
  };

  const handleViewTransaction = (transaction) => {
    setSelectedTransactionForDetail(transaction);
    setShowDetailModal(true);
  };

  const handleDeleteTransaction = async (transactionId) => {
    // Find the transaction to show in confirmation
    const transaction = actualFilteredTransactions.find(t => t.id === transactionId);
    setTransactionToDelete(transaction);
    setShowConfirmModal(true);
  };

  const handleBulkDelete = async (transactionIds) => {
    // Find the transactions to show in confirmation
    const transactions = actualFilteredTransactions.filter(t => transactionIds.includes(t.id));
    setTransactionToDelete({ isBulk: true, count: transactions.length, ids: transactionIds });
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (transactionToDelete) {
      if (transactionToDelete.isBulk) {
        // Handle bulk delete
        for (const transactionId of transactionToDelete.ids) {
          await deleteTransaction(transactionId);
        }
      } else {
        // Handle single delete
        await deleteTransaction(transactionToDelete.id);
      }
      setShowConfirmModal(false);
      setTransactionToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setTransactionToDelete(null);
  };

  const handleTransactionSaved = (transaction) => {
    setShowTransactionModal(false);
    setEditingTransaction(null);
  };

  const handleModalClose = () => {
    setShowTransactionModal(false);
    setEditingTransaction(null);
  };

  const handleDetailModalClose = () => {
    setShowDetailModal(false);
    setSelectedTransactionForDetail(null);
  };

  const handleEditFromDetail = (transaction) => {
    // Close detail modal and open edit modal
    setShowDetailModal(false);
    setSelectedTransactionForDetail(null);
    setEditingTransaction(transaction);
    setShowTransactionModal(true);
  };

  const handleDeleteFromDetail = async (transactionId) => {
    // Find the transaction to show in confirmation
    const transaction = actualFilteredTransactions.find(t => t.id === transactionId) || selectedTransactionForDetail;
    setTransactionToDelete(transaction);
    setShowDetailModal(false); // Close detail modal
    setSelectedTransactionForDetail(null);
    setShowConfirmModal(true); // Show confirmation modal
  };

  // Handle export
  const handleExportTransactions = () => {
    // TODO: Implement export functionality in future phase
    console.log('Export transactions:', filteredTransactions);
    alert('Export functionality will be implemented in Phase 6!');
  };

  // Quick filter actions
  const quickFilters = [
    {
      label: 'This Month',
      action: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        filterByDateRange(start, end);
      }
    },
    {
      label: 'Last 7 Days',
      action: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 7);
        filterByDateRange(start, end);
      }
    },
    {
      label: 'Expenses Only',
      action: () => filterByType('expense')
    },
    {
      label: 'Income Only',
      action: () => filterByType('income')
    },
    {
      label: 'Clear Filters',
      action: () => resetFilters()
    }
  ];

  return (
    <div className="min-h-screen transition-colors duration-300" style={{
      backgroundColor: 'var(--bg-primary)'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Page Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <div className="flex items-center space-x-3 mb-2">
                <FontAwesomeIcon icon={faExchangeAlt} className="text-xl" style={{
                  color: 'var(--accent-primary)'
                }} />
                <h1 className="text-2xl lg:text-3xl font-bold" style={{
                  color: 'var(--text-primary)'
                }}>
                  Transactions
                </h1>
              </div>
              <p className="text-sm lg:text-base" style={{
                color: 'var(--text-secondary)'
              }}>
                Manage and track all your financial transactions
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
              <Button
                variant="primary"
                onClick={handleCreateTransaction}
                icon={faPlus}
                disabled={isCreatingTransaction}
              >
                {isCreatingTransaction ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                    Adding...
                  </>
                ) : (
                  'Add Transaction'
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Transaction Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 lg:mb-8">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{
                backgroundColor: 'var(--info-bg)'
              }}>
                <FontAwesomeIcon icon={faExchangeAlt} className="w-5 h-5" style={{
                  color: 'var(--info)'
                }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{
                  color: 'var(--text-secondary)'
                }}>Total Transactions</p>
                <p className="text-2xl font-bold" style={{
                  color: 'var(--text-primary)'
                }}>{stats.totalTransactions}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{
                backgroundColor: 'var(--success-bg)'
              }}>
                <FontAwesomeIcon icon={faChartLine} className="w-5 h-5" style={{
                  color: 'var(--success)'
                }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{
                  color: 'var(--text-secondary)'
                }}>Total Income</p>
                <p className="text-2xl font-bold" style={{
                  color: 'var(--success)'
                }}>{summary.formattedIncome}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{
                backgroundColor: 'var(--error-bg)'
              }}>
                <FontAwesomeIcon icon={faChartLine} className="w-5 h-5" style={{
                  color: 'var(--error)'
                }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{
                  color: 'var(--text-secondary)'
                }}>Total Expenses</p>
                <p className="text-2xl font-bold" style={{
                  color: 'var(--error)'
                }}>{summary.formattedExpenses}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{
                backgroundColor: summary.isPositiveBalance ? 'var(--success-bg)' : 'var(--error-bg)'
              }}>
                <FontAwesomeIcon 
                  icon={summary.balanceIcon} 
                  className="w-5 h-5" 
                  style={{
                    color: summary.isPositiveBalance ? 'var(--success)' : 'var(--error)'
                  }}
                />
              </div>
              <div>
                <p className="text-sm font-medium" style={{
                  color: 'var(--text-secondary)'
                }}>Net Balance</p>
                <p className="text-2xl font-bold" style={{
                  color: summary.isPositiveBalance ? 'var(--success)' : 'var(--error)'
                }}>
                  {summary.formattedBalance}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Transaction Content */}
        <div className="space-y-6">
          {/* Filter Toolbar */}
          <TransactionFilterToolbar
            filters={localFilters}
            onFiltersChange={setLocalFilters}
            onResetFilters={() => setLocalFilters({ type: 'all', dateFrom: '', dateTo: '', search: '' })}
            categories={categories}
            totalTransactions={actualFilteredTransactions.length}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            showSearch={false}
            hasAdvancedFilters={localFilters.type !== 'all' || localFilters.dateFrom || localFilters.dateTo || localFilters.search || (localFilters.category && localFilters.category !== 'all')}
          />

          {/* Transaction Display */}
          {isLoading ? (
            <Card>
              <div className="p-6">
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ) : viewMode === 'list' ? (
            <TransactionList
              transactions={actualFilteredTransactions}
              onTransactionSelect={handleViewTransaction}
              onTransactionEdit={handleEditTransaction}
              onTransactionDelete={handleDeleteTransaction}
              onBulkDelete={handleBulkDelete}
              isLoading={isLoading}
              isUpdating={isUpdatingTransaction}
              isDeleting={isDeletingTransaction}
              parentFilters={localFilters}
              onFiltersChange={(tableFilters) => {
                // Merge table filters with local filters
                setLocalFilters(prev => ({ ...prev, ...tableFilters }));
              }}
            />
          ) : (
            <TransactionGrid
              transactions={actualFilteredTransactions}
              onTransactionSelect={handleViewTransaction}
              onTransactionEdit={handleEditTransaction}
              onTransactionDelete={handleDeleteTransaction}
              isLoading={isLoading}
              isUpdating={isUpdatingTransaction}
              isDeleting={isDeletingTransaction}
              parentFilters={localFilters}
              onFiltersChange={(tableFilters) => {
                // Merge table filters with local filters
                setLocalFilters(prev => ({ ...prev, ...tableFilters }));
              }}
            />
          )}
        </div>

        {/* Transaction Form Modal */}
        <TransactionFormModal
          isOpen={showTransactionModal}
          onClose={handleModalClose}
          transaction={editingTransaction}
          onTransactionSaved={handleTransactionSaved}
        />

        {/* Transaction Detail Modal */}
        <TransactionDetailModal
          isOpen={showDetailModal}
          onClose={handleDetailModalClose}
          transaction={selectedTransactionForDetail}
          onEdit={handleEditFromDetail}
          onDelete={handleDeleteFromDetail}
          isDeleting={isDeletingTransaction}
        />

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={showConfirmModal}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title={transactionToDelete?.isBulk ? "Delete Transactions" : "Delete Transaction"}
          message={
            transactionToDelete?.isBulk 
              ? `Are you sure you want to delete ${transactionToDelete.count} selected transaction(s)? This action cannot be undone.`
              : transactionToDelete 
                ? `Are you sure you want to delete "${transactionToDelete.description}"? This action cannot be undone.` 
                : 'Are you sure you want to delete this transaction?'
          }
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          isLoading={isDeletingTransaction}
        />

      </div>
    </div>
  );
};

export default Transactions;