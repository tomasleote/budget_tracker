import React from 'react';
import { TransactionDetailModal } from '../../components/transactions';
import { TransactionFormModal } from '../../components/forms';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

const TransactionModals = ({
  showTransactionModal,
  editingTransaction,
  onModalClose,
  onTransactionSaved,
  showDetailModal,
  selectedTransactionForDetail,
  onDetailModalClose,
  onEditFromDetail,
  onDeleteFromDetail,
  showConfirmModal,
  transactionToDelete,
  onCancelDelete,
  onConfirmDelete,
  isDeletingTransaction
}) => (
  <>
    <TransactionFormModal
      isOpen={showTransactionModal}
      onClose={onModalClose}
      transaction={editingTransaction}
      onTransactionSaved={onTransactionSaved}
    />

    <TransactionDetailModal
      isOpen={showDetailModal}
      onClose={onDetailModalClose}
      transaction={selectedTransactionForDetail}
      onEdit={onEditFromDetail}
      onDelete={onDeleteFromDetail}
      isDeleting={isDeletingTransaction}
    />

    <ConfirmationModal
      isOpen={showConfirmModal}
      onClose={onCancelDelete}
      onConfirm={onConfirmDelete}
      title={transactionToDelete?.isBulk ? 'Delete Transactions' : 'Delete Transaction'}
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
  </>
);

export default TransactionModals;
