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
import Modal from '../ui/Modal';

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
  // State for modals and operations
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Required confirmation text for destructive operations
  const CONFIRM_DELETE_TEXT = 'DELETE ALL DATA';
  const CONFIRM_RESET_TEXT = 'RESET TO DEFAULTS';
  
  // Check if user can perform delete (confirmation text matches)
  const canDelete = confirmText === CONFIRM_DELETE_TEXT;
  const canReset = confirmText === CONFIRM_RESET_TEXT;
  

  
  // Handle delete all data
  const handleDeleteAllData = async () => {
    setIsDeleting(true);
    try {
      // TODO: Implement actual data deletion logic
      console.log('Deleting all user data...');
      
      // Simulate deletion process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setSuccessMessage('All data has been permanently deleted');
      setShowSuccess(true);
      setShowDeleteModal(false);
      setConfirmText('');
      setTimeout(() => setShowSuccess(false), 5000);
      
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Handle reset to defaults
  const handleResetToDefaults = async () => {
    setIsResetting(true);
    try {
      // TODO: Implement actual reset logic
      console.log('Resetting all settings to defaults...');
      
      // Simulate reset process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
  
  // Close modals and reset state
  const closeModals = () => {
    setShowDeleteModal(false);
    setShowResetModal(false);
    setConfirmText('');
  };
  
  return (
    <div className="space-y-6">

      
      {/* Reset Settings Section */}
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
          <Button
            variant="outline"
            onClick={() => setShowResetModal(true)}
            className="ml-4"
          >
            Reset Settings
          </Button>
        </div>
      </div>
      
      {/* Danger Zone - Delete All Data */}
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
            <FontAwesomeIcon 
              icon={faTrashAlt} 
              className="mt-1" 
              style={{ color: 'var(--error)' }}
            />
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
                <Button
                  variant="danger"
                  onClick={() => setShowDeleteModal(true)}
                  icon={faTrashAlt}
                >
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
      
      {/* Success Message */}
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
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={closeModals}
        title="Delete All Data"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 rounded-lg" style={{ backgroundColor: 'var(--error-bg)', borderWidth: '1px', borderColor: 'var(--error-border)' }}>
            <FontAwesomeIcon 
              icon={faExclamationTriangle} 
              className="text-xl mt-1" 
              style={{ color: 'var(--error)' }}
            />
            <div>
              <h4 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                This action is irreversible!
              </h4>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                All your financial data will be permanently deleted and cannot be recovered. 
                Make sure you have exported your data if you want to keep a backup.
              </p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              To confirm, type <span className="font-bold" style={{ color: 'var(--error)' }}>{CONFIRM_DELETE_TEXT}</span> in the box below:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-3 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-primary)',
                borderWidth: '1px',
                color: 'var(--text-primary)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--error)';
                e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-primary)';
                e.target.style.boxShadow = 'none';
              }}
              placeholder="Type confirmation text..."
            />
          </div>
          
          <div className="flex items-center justify-end space-x-3 pt-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
            <Button
              variant="outline"
              onClick={closeModals}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAllData}
              disabled={!canDelete || isDeleting}
              isLoading={isDeleting}
              icon={faTrashAlt}
            >
              {isDeleting ? 'Deleting...' : 'Delete All Data'}
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={closeModals}
        title="Reset All Settings"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 rounded-lg" style={{ backgroundColor: 'var(--warning-bg)', borderWidth: '1px', borderColor: 'var(--warning-border)' }}>
            <FontAwesomeIcon 
              icon={faUndo} 
              className="text-xl mt-1" 
              style={{ color: 'var(--warning)' }}
            />
            <div>
              <h4 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Reset all settings to defaults
              </h4>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                This will reset your theme, currency, number format, dashboard preferences, 
                and all other settings to their default values. Your financial data will not be affected.
              </p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              To confirm, type <span className="font-bold" style={{ color: 'var(--warning)' }}>{CONFIRM_RESET_TEXT}</span> in the box below:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-3 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-primary)',
                borderWidth: '1px',
                color: 'var(--text-primary)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--warning)';
                e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-primary)';
                e.target.style.boxShadow = 'none';
              }}
              placeholder="Type confirmation text..."
            />
          </div>
          
          <div className="flex items-center justify-end space-x-3 pt-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
            <Button
              variant="outline"
              onClick={closeModals}
              disabled={isResetting}
            >
              Cancel
            </Button>
            <Button
              variant="warning"
              onClick={handleResetToDefaults}
              disabled={!canReset || isResetting}
              isLoading={isResetting}
              icon={faUndo}
            >
              {isResetting ? 'Resetting...' : 'Reset Settings'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DataManagement;