import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';

const ConfirmationModal = ({ 
  isOpen = false,
  onClose = () => {},
  onConfirm = () => {},
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger', 'warning', 'info'
  isLoading = false
}) => {
  const variants = {
    danger: {
      icon: faTrash,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
      confirmButton: 'danger'
    },
    warning: {
      icon: faExclamationTriangle,
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
      confirmButton: 'primary'
    },
    info: {
      icon: faExclamationTriangle,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      confirmButton: 'primary'
    }
  };

  const config = variants[variant] || variants.danger;

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="sm"
      closeOnOverlayClick={!isLoading}
      showCloseButton={false}
    >
      <div className="text-center">
        {/* Icon */}
        <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${config.iconBg} mb-4`}>
          <FontAwesomeIcon 
            icon={config.icon} 
            className={`h-6 w-6 ${config.iconColor}`}
          />
        </div>

        {/* Title */}
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-sm text-gray-500 mb-6">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1"
          >
            <FontAwesomeIcon icon={faTimes} className="mr-2" />
            {cancelText}
          </Button>
          <Button
            variant={config.confirmButton}
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faTrash} className="mr-2 animate-pulse" />
                Deleting...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={config.icon} className="mr-2" />
                {confirmText}
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;