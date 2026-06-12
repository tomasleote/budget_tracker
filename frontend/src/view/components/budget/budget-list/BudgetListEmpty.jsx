import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet, faPlus } from '@fortawesome/free-solid-svg-icons';
import Card from '../../ui/Card';
import Button from '../../ui/Button';

const BudgetListEmpty = ({ className, onCreateBudget }) => (
  <Card className={className} title="Budget Management">
    <div className="text-center py-12">
      <FontAwesomeIcon
        icon={faWallet}
        className="text-5xl mb-6"
        style={{ color: 'var(--text-tertiary)' }}
      />
      <h3 className="text-xl font-medium mb-3" style={{
        color: 'var(--text-primary)'
      }}>
        No Budgets Created Yet
      </h3>
      <p className="mb-8 max-w-md mx-auto" style={{
        color: 'var(--text-secondary)'
      }}>
        Create your first budget to start tracking your spending and stay on top of your financial goals.
      </p>
      <Button
        variant="primary"
        onClick={onCreateBudget}
        icon={faPlus}
        size="lg"
      >
        Create Your First Budget
      </Button>
    </div>
  </Card>
);

export default BudgetListEmpty;
