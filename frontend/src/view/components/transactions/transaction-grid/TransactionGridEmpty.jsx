import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

function TransactionGridEmpty({ isFiltered }) {
  return (
    <div className="text-center py-12">
      <FontAwesomeIcon
        icon={faInfoCircle}
        className="text-theme-tertiary text-4xl mb-4"
      />
      <h3 className="text-lg font-medium text-theme-primary mb-2">
        {isFiltered ? 'No transactions found' : 'No transactions yet'}
      </h3>
      <p className="text-theme-secondary mb-6">
        {isFiltered
          ? 'Try adjusting your search or filters'
          : 'Start by adding your first transaction'}
      </p>
    </div>
  );
}

export default TransactionGridEmpty;
