import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import Button from '../../ui/Button';

function BulkActionBar({ selectedCount, onClearSelection, onBulkDelete, isDeleting }) {
  if (selectedCount === 0) return null;

  return (
    <div
      className="rounded-lg p-4 mb-4"
      style={{ backgroundColor: 'var(--info-bg)', border: '1px solid var(--info-border)' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm" style={{ color: 'var(--info)' }}>
          {selectedCount} transaction(s) selected
        </span>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onClearSelection}>
            Clear Selection
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onBulkDelete}
            disabled={isDeleting}
          >
            <FontAwesomeIcon icon={faTrash} className="mr-2" />
            Delete Selected
          </Button>
        </div>
      </div>
    </div>
  );
}

export default BulkActionBar;
