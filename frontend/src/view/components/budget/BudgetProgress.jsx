import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet, faPlus } from '@fortawesome/free-solid-svg-icons';
import Card from '../ui/Card';
import Button from '../ui/Button';
import BudgetSummaryStats from './budget-progress/BudgetSummaryStats';
import BudgetProgressItem from './budget-progress/BudgetProgressItem';
import { computeSummaryStats } from './budget-progress/budgetProgressHelpers';

const BudgetProgress = ({
  budgetOverview = [],
  isLoading = false,
  onBudgetClick = () => {},
  onCreateBudget = () => {},
  showCreateButton = true,
  className = ''
}) => {
  if (isLoading) {
    return (
      <Card className={className} title="Budget Progress">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 rounded mb-2" style={{ backgroundColor: 'var(--bg-tertiary)' }}></div>
              <div className="h-6 rounded mb-2" style={{ backgroundColor: 'var(--bg-tertiary)' }}></div>
              <div className="h-3 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!budgetOverview || budgetOverview.length === 0) {
    return (
      <Card className={className} title="Budget Progress">
        <div className="text-center py-8">
          <FontAwesomeIcon
            icon={faWallet}
            className="text-4xl mb-4"
            style={{ color: 'var(--text-tertiary)' }}
          />
          <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            No Budgets Yet
          </h3>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            Create your first budget to track spending and stay on target.
          </p>
          {showCreateButton && (
            <Button variant="primary" onClick={onCreateBudget} icon={faWallet}>
              Create Your First Budget
            </Button>
          )}
        </div>
      </Card>
    );
  }

  const { healthy, warning, exceeded } = computeSummaryStats(budgetOverview);

  return (
    <Card
      className={className}
      title="Budget Progress"
      headerAction={showCreateButton ? (
        <Button variant="primary" onClick={onCreateBudget} icon={faPlus}>
          New Budget
        </Button>
      ) : null}
    >
      <div className="space-y-6 pt-4">
        <BudgetSummaryStats healthy={healthy} warning={warning} exceeded={exceeded} />

        <div className="space-y-4 max-h-[28rem] overflow-y-auto pr-2">
          {budgetOverview.map((budget) => (
            <BudgetProgressItem
              key={budget.id}
              budget={budget}
              onBudgetClick={onBudgetClick}
            />
          ))}
        </div>
      </div>
    </Card>
  );
};

export default BudgetProgress;
