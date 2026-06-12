import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrashAlt,
  faUndo,
  faExclamationTriangle,
  faCheck,
  faDatabase
} from '@fortawesome/free-solid-svg-icons';
import Button from '../ui/Button';
import { useUser } from '../../../controller/hooks/useUser';
import storageService from '../../../model/services/StorageService';
import ConfirmModal from './data-management/ConfirmModal';

/**
 * DataManagement Component
 *
 * Provides safe data management operations:
 * - Delete All Data with confirmation
 * - Reset to defaults option
 * - Type-to-confirm safety for destructive operations
 *
 * Note: Data export functionality is available on the Reports page
 *
 * Phase 2 Implementation: Data Safety
 */
const DataManagement = () => {
  const { resetPreferences } = useUser();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const CONFIRM_DELETE_TEXT = 'DELETE ALL DATA';
  const CONFIRM_RESET_TEXT = 'RESET TO DEFAULTS';

  const canDelete = confirmText === CONFIRM_DELETE_TEXT;
  const canReset = confirmText === CONFIRM_RESET_TEXT;

  const handleDeleteAllData = async () => {
    setIsDeleting(true);
    try {
      await storageService.clearAllData();
      setSuccessMessage('All data has been permanently deleted. Reloading…');
      setShowSuccess(true);
      setShowDeleteModal(false);
      setConfirmText('');
      setTimeout(() => window.location.reload(), 1200);
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetToDefaults = async () => {
    setIsResetting(true);
    try {
      await resetPreferences();
      setSuccessMessage('All settings have been reset to defaults');
      setShowSuccess(true);
      setShowResetModal(false);
      setConfirmText('');
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Reset error:', error);
    } finally {
      setIsResetting(false);
    }
  };

  const closeModals = () => {
    setShowDeleteModal(false);
    setShowResetModal(false);
    setConfirmText('');
  };
  
  return (
    <div className="space-y-6">
      <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)', borderWidth: '1px', borderColor: 'var(--border-primary)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Reset Settings
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Restore all settings to their default values
            </p>
          </div>
          <FontAwesomeIcon icon={faUndo} className="text-xl" style={{ color: 'var(--warning)' }} />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--warning-bg)', borderWidth: '1px', borderColor: 'var(--warning-border)' }}>
          <div>
            <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Reset All Settings
            </h4>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Theme, currency, number format, and dashboard preferences will be reset to defaults.
              Your financial data (transactions and budgets) will not be affected.
            </p>
          </div>
          <Button variant="outline" onClick={() => setShowResetModal(true)} className="ml-4">
            Reset Settings
          </Button>
        </div>
      </div>

      <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)', borderWidth: '1px', borderColor: 'var(--error-border)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--error)' }}>
              Danger Zone
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Irreversible actions that permanently delete your data
            </p>
          </div>
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-xl" style={{ color: 'var(--error)' }} />
        </div>

        <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--error-bg)', borderWidth: '1px', borderColor: 'var(--error-border)' }}>
          <div className="flex items-start space-x-3">
            <FontAwesomeIcon icon={faTrashAlt} className="mt-1" style={{ color: 'var(--error)' }} />
            <div className="flex-1">
              <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Delete All Data
              </h4>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                This will permanently delete ALL your data including:
              </p>
              <ul className="text-sm space-y-1 mb-4" style={{ color: 'var(--text-secondary)' }}>
                <li>• All transactions</li>
                <li>• All budgets</li>
                <li>• All custom categories</li>
                <li>• All settings and preferences</li>
                <li>• All dashboard customizations</li>
              </ul>
              <div className="flex items-center space-x-3">
                <Button variant="danger" onClick={() => setShowDeleteModal(true)} icon={faTrashAlt}>
                  Delete All Data
                </Button>
                <span className="text-xs" style={{ color: 'var(--error)' }}>
                  This action cannot be undone
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--success-bg)', borderWidth: '1px', borderColor: 'var(--success-border)' }}>
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faCheck} style={{ color: 'var(--success)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {successMessage}
            </span>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={closeModals}
        title="Delete All Data"
        warningIcon={faExclamationTriangle}
        warningBg="var(--error-bg)"
        warningBorder="var(--error-border)"
        warningIconColor="var(--error)"
        focusBorderColor="var(--error)"
        focusBoxShadow="0 0 0 3px rgba(239, 68, 68, 0.1)"
        warningHeading="This action is irreversible!"
        warningBody="All your financial data will be permanently deleted and cannot be recovered. Make sure you have exported your data if you want to keep a backup."
        requiredText={CONFIRM_DELETE_TEXT}
        confirmLabelColor="var(--error)"
        confirmText={confirmText}
        onConfirmTextChange={setConfirmText}
        isLoading={isDeleting}
        canConfirm={canDelete}
        onConfirm={handleDeleteAllData}
        confirmButtonVariant="danger"
        confirmButtonIcon={faTrashAlt}
        confirmingLabel="Deleting..."
        confirmButtonLabel="Delete All Data"
      />

      <ConfirmModal
        isOpen={showResetModal}
        onClose={closeModals}
        title="Reset All Settings"
        warningIcon={faUndo}
        warningBg="var(--warning-bg)"
        warningBorder="var(--warning-border)"
        warningIconColor="var(--warning)"
        focusBorderColor="var(--warning)"
        focusBoxShadow="0 0 0 3px rgba(245, 158, 11, 0.1)"
        warningHeading="Reset all settings to defaults"
        warningBody="This will reset your theme, currency, number format, dashboard preferences, and all other settings to their default values. Your financial data will not be affected."
        requiredText={CONFIRM_RESET_TEXT}
        confirmLabelColor="var(--warning)"
        confirmText={confirmText}
        onConfirmTextChange={setConfirmText}
        isLoading={isResetting}
        canConfirm={canReset}
        onConfirm={handleResetToDefaults}
        confirmButtonVariant="warning"
        confirmButtonIcon={faUndo}
        confirmingLabel="Resetting..."
        confirmButtonLabel="Reset Settings"
      />
    </div>
  );
};

export default DataManagement;