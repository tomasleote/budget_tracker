import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

function TransactionListEmpty({ isFiltered }) {
  return (
    <div className="text-center py-8">
      <FontAwesomeIcon
        icon={faInfoCircle}
        className="text-3xl mb-4 text-theme-tertiary"
      />
      <h3 className="text-lg font-medium mb-2 text-theme-primary">
        {isFiltered ? 'No transactions found' : 'No transactions yet'}
      </h3>
      <p className="mb-4 text-theme-secondary">
        {isFiltered
          ? 'Try adjusting your search or filters'
          : 'Start by adding your first transaction'}
      </p>
    </div>
  );
}

export default TransactionListEmpty;
