import React from 'react';
import Card from '../../components/ui/Card';
import ProgressBar from '../../components/ui/ProgressBar';
import { BudgetComparisonChart } from '../../components/charts';
import { formatCurrency } from '../../../controller/utils/formatters';

const ReportsBudget = ({ budgets, budgetStats }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="p-6">
        <div className="text-center">
          <div className="text-3xl font-bold mb-2" style={{ color: 'var(--accent-primary)' }}>{budgetStats.totalBudgets}</div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Budgets</div>
        </div>
      </Card>
      <Card className="p-6">
        <div className="text-center">
          <div className="text-3xl font-bold mb-2" style={{ color: 'var(--success)' }}>{budgetStats.healthyBudgets}</div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Healthy Budgets</div>
        </div>
      </Card>
      <Card className="p-6">
        <div className="text-center">
          <div className="text-3xl font-bold mb-2" style={{ color: 'var(--error)' }}>{budgetStats.exceededBudgets}</div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Exceeded Budgets</div>
        </div>
      </Card>
    </div>

    {budgets.length > 0 && (
      <div className="space-y-6">
        <BudgetComparisonChart budgets={budgets} isLoading={false} height={400} />

        <Card title="Budget Performance Details">
          <div className="p-6 space-y-4">
            {budgets.slice(0, 8).map((budget) => {
              const percentage = budget.utilizationPercentage || 0;
              return (
                <div key={budget.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{budget.category}</span>
                    <span className="text-gray-600">
                      {formatCurrency(budget.progress?.spent || 0)} / {formatCurrency(budget.budgetAmount)}
                    </span>
                  </div>
                  <ProgressBar value={percentage} max={100} color="dynamic" size="md" showPercentage={true} />
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    )}
  </div>
);

export default ReportsBudget;
