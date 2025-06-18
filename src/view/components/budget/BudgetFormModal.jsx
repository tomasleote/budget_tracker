import React from 'react';
import Modal from '../ui/Modal';
import BudgetForm from './BudgetForm';
import Button from '../ui/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faWallet, faEdit } from '@fortawesome/free-solid-svg-icons';

const BudgetFormModal = ({ 
  isOpen = false,
  onClose = () => {},
  budget = null,
  onBudgetSaved = () => {}
}) => {
  const isEditing = Boolean(budget);

  const handleSave = (savedBudget) => {
    onBudgetSaved(savedBudget);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center space-x-2">
          <FontAwesomeIcon 
            icon={isEditing ? faEdit : faWallet} 
            className={isEditing ? "text-blue-600" : "text-green-600"} 
          />
          <span>{isEditing ? 'Edit Budget' : 'Create New Budget'}</span>
        </div>
      }
      size="lg"
      closeOnOverlayClick={false}
      showCloseButton={true}
      className="budget-form-modal"
    >
      <BudgetForm
        budget={budget}
        isOpen={true}
        onSave={handleSave}
        onCancel={handleCancel}
        className="border-0 shadow-none p-0"
      />
    </Modal>
  );
};

export default BudgetFormModal;