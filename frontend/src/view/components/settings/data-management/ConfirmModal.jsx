import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../ui/Button';
import Modal from '../../ui/Modal';

const ConfirmModal = ({
  isOpen,
  onClose,
  title,
  warningIcon,
  warningBg,
  warningBorder,
  warningIconColor,
  focusBorderColor,
  focusBoxShadow,
  warningHeading,
  warningBody,
  requiredText,
  confirmLabelColor,
  confirmText,
  onConfirmTextChange,
  isLoading,
  canConfirm,
  onConfirm,
  confirmButtonVariant,
  confirmButtonIcon,
  confirmingLabel,
  confirmButtonLabel
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
    <div className="space-y-4">
      <div className="flex items-start space-x-3 p-4 rounded-lg" style={{ backgroundColor: warningBg, borderWidth: '1px', borderColor: warningBorder }}>
        <FontAwesomeIcon icon={warningIcon} className="text-xl mt-1" style={{ color: warningIconColor }} />
        <div>
          <h4 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {warningHeading}
          </h4>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {warningBody}
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          To confirm, type <span className="font-bold" style={{ color: confirmLabelColor }}>{requiredText}</span> in the box below:
        </label>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => onConfirmTextChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg transition-colors"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border-primary)',
            borderWidth: '1px',
            color: 'var(--text-primary)'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = focusBorderColor;
            e.target.style.boxShadow = focusBoxShadow;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--border-primary)';
            e.target.style.boxShadow = 'none';
          }}
          placeholder="Type confirmation text..."
        />
      </div>

      <div className="flex items-center justify-end space-x-3 pt-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant={confirmButtonVariant}
          onClick={onConfirm}
          disabled={!canConfirm || isLoading}
          isLoading={isLoading}
          icon={confirmButtonIcon}
        >
          {isLoading ? confirmingLabel : confirmButtonLabel}
        </Button>
      </div>
    </div>
  </Modal>
);

export default ConfirmModal;
