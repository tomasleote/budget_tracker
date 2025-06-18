import React from 'react';
import Modal from '../ui/Modal';
import TransactionForm from './TransactionForm';
import Button from '../ui/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const TransactionFormModal = ({ 
  isOpen = false,
  onClose = () => {},
  transaction = null,
  onTransactionSaved = () => {}
}) => {
  const isEditing = Boolean(transaction);

  const handleSave = (savedTransaction) => {
    onTransactionSaved(savedTransaction);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const footer = (
    <>
      <Button
        variant="outline"
        onClick={handleCancel}
      >
        <FontAwesomeIcon icon={faTimes} className="mr-2" />
        Cancel
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Transaction' : 'Add New Transaction'}
      size="md"
      closeOnOverlayClick={false}
      showCloseButton={true}
    >
      <TransactionForm
        transaction={transaction}
        isOpen={true}
        onSave={handleSave}
        onCancel={handleCancel}
        className="border-0 shadow-none"
      />
    </Modal>
  );
};

export default TransactionFormModal;