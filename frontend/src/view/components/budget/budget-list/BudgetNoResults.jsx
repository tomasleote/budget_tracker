import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus } from '@fortawesome/free-solid-svg-icons';
import Button from '../../ui/Button';

const BudgetNoResults = ({ onClearFilters, onCreateBudget }) => (
  <div className="text-center py-8">
    <FontAwesomeIcon
      icon={faSearch}
      className="text-4xl mb-4"
      style={{ color: 'var(--text-tertiary)' }}
    />
    <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
      No Budgets Found
    </h3>
    <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
      No budgets match your current search and filter criteria.
    </p>
    <div className="space-x-3">
      <Button variant="outline" onClick={onClearFilters}>
        Clear Filters
      </Button>
      <Button variant="primary" onClick={onCreateBudget} icon={faPlus}>
        Create New Budget
      </Button>
    </div>
  </div>
);

export default BudgetNoResults;
