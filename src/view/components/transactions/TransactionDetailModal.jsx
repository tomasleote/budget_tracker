import React from 'react';
import Modal from '../ui/Modal';
import TransactionDetail from './TransactionDetail';

const TransactionDetailModal = ({ 
  isOpen = false,
  onClose = () => {},
  transaction = null,
  onEdit = () => {},
  onDelete = () => {},
  isDeleting = false
}) => {
  const handleEdit = (transaction) => {
    onEdit(transaction);
    onClose(); // Close the detail modal when opening edit modal
  };

  const handleDelete = (transactionId) => {
    onDelete(transactionId);
    onClose(); // Close the detail modal after deletion
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="" // TransactionDetail component handles its own title
      size="lg"
      closeOnOverlayClick={true}
      showCloseButton={false} // TransactionDetail component has its own close button
    >
      <TransactionDetail
        transaction={transaction}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onClose={onClose}
        isDeleting={isDeleting}
        className="border-0 shadow-none" // Remove card styling when inside modal
      />
    </Modal>
  );
};

export default TransactionDetailModal;