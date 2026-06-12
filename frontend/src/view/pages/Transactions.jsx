import React, { useState, useMemo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExchangeAlt, faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Button from '../components/ui/Button';

import { useTransactions } from '../../controller/hooks/useTransactions';
import { useCategories } from '../../controller/hooks/useCategories';

import TransactionSummaryCards from './transactions/TransactionSummaryCards';
import TransactionContent from './transactions/TransactionContent';
import TransactionModals from './transactions/TransactionModals';

const Transactions = () => {
  const [viewMode, setViewMode] = useState('list');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [selectedTransactionForDetail, setSelectedTransactionForDetail] = useState(null);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [localFilters, setLocalFilters] = useState({
    type: 'all',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  const {
    transactions,
    summary,
    isLoading,
    isCreatingTransaction,
    isUpdatingTransaction,
    isDeletingTransaction,
    loadTransactions,
    deleteTransaction,
    getTransactionStats
  } = useTransactions();

  const { categories } = useCategories();

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const stats = getTransactionStats();

  const actualFilteredTransactions = useMemo(() => {
    let result = transactions;

    if (localFilters.type && localFilters.type !== 'all') {
      result = result.filter(t => t.type === localFilters.type);
    }

    if (localFilters.dateFrom || localFilters.dateTo) {
      const fromDate = localFilters.dateFrom ? new Date(`${localFilters.dateFrom}T00:00:00`) : null;
      const toDate = localFilters.dateTo ? new Date(`${localFilters.dateTo}T23:59:59.999`) : null;
      result = result.filter(t => {
        const transactionDate = new Date(t.date);
        if (fromDate && transactionDate < fromDate) return false;
        if (toDate && transactionDate > toDate) return false;
        return true;
      });
    }

    if (localFilters.search) {
      const searchTerm = localFilters.search.toLowerCase();
      result = result.filter(t =>
        (t.description || '').toLowerCase().includes(searchTerm) ||
        (t.category || '').toLowerCase().includes(searchTerm) ||
        String(t.amount || '').includes(searchTerm)
      );
    }

    return result;
  }, [transactions, localFilters]);

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

  const handleDeleteTransaction = (transactionId) => {
    const transaction = actualFilteredTransactions.find(t => t.id === transactionId);
    setTransactionToDelete(transaction);
    setShowConfirmModal(true);
  };

  const handleBulkDelete = (transactionIds) => {
    const count = actualFilteredTransactions.filter(t => transactionIds.includes(t.id)).length;
    setTransactionToDelete({ isBulk: true, count, ids: transactionIds });
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (transactionToDelete) {
      if (transactionToDelete.isBulk) {
        for (const id of transactionToDelete.ids) {
          await deleteTransaction(id);
        }
      } else {
        await deleteTransaction(transactionToDelete.id);
      }
      setShowConfirmModal(false);
      setTransactionToDelete(null);
    }
  };

  const handleEditFromDetail = (transaction) => {
    setShowDetailModal(false);
    setSelectedTransactionForDetail(null);
    setEditingTransaction(transaction);
    setShowTransactionModal(true);
  };

  const handleDeleteFromDetail = (transactionId) => {
    const transaction = actualFilteredTransactions.find(t => t.id === transactionId) || selectedTransactionForDetail;
    setTransactionToDelete(transaction);
    setShowDetailModal(false);
    setSelectedTransactionForDetail(null);
    setShowConfirmModal(true);
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-theme-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <div className="flex items-center space-x-3 mb-2">
                <FontAwesomeIcon icon={faExchangeAlt} className="text-xl text-theme-accent" />
                <h1 className="text-2xl lg:text-3xl font-bold text-theme-primary">Transactions</h1>
              </div>
              <p className="text-sm lg:text-base text-theme-secondary">
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

        <TransactionSummaryCards stats={stats} summary={summary} />

        <TransactionContent
          localFilters={localFilters}
          onFiltersChange={setLocalFilters}
          categories={categories}
          filteredTransactions={actualFilteredTransactions}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isLoading={isLoading}
          isUpdatingTransaction={isUpdatingTransaction}
          isDeletingTransaction={isDeletingTransaction}
          onViewTransaction={handleViewTransaction}
          onEditTransaction={handleEditTransaction}
          onDeleteTransaction={handleDeleteTransaction}
          onBulkDelete={handleBulkDelete}
        />

        <TransactionModals
          showTransactionModal={showTransactionModal}
          editingTransaction={editingTransaction}
          onModalClose={() => { setShowTransactionModal(false); setEditingTransaction(null); }}
          onTransactionSaved={() => { setShowTransactionModal(false); setEditingTransaction(null); }}
          showDetailModal={showDetailModal}
          selectedTransactionForDetail={selectedTransactionForDetail}
          onDetailModalClose={() => { setShowDetailModal(false); setSelectedTransactionForDetail(null); }}
          onEditFromDetail={handleEditFromDetail}
          onDeleteFromDetail={handleDeleteFromDetail}
          showConfirmModal={showConfirmModal}
          transactionToDelete={transactionToDelete}
          onCancelDelete={() => { setShowConfirmModal(false); setTransactionToDelete(null); }}
          onConfirmDelete={handleConfirmDelete}
          isDeletingTransaction={isDeletingTransaction}
        />
      </div>
    </div>
  );
};

export default Transactions;
