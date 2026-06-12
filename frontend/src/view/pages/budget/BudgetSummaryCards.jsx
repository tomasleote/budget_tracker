import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWallet,
  faCheckCircle,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import Card from '../../components/ui/Card';

const BudgetSummaryCards = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 lg:mb-8">
    <Card className="p-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--info-bg)' }}>
          <FontAwesomeIcon icon={faWallet} className="w-5 h-5" style={{ color: 'var(--info)' }} />
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Total Budgets</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.totalBudgets}</p>
        </div>
      </div>
    </Card>

    <Card className="p-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--success-bg)' }}>
          <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5" style={{ color: 'var(--success)' }} />
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Healthy Budgets</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--success)' }}>{stats.healthyBudgets}</p>
        </div>
      </div>
    </Card>

    <Card className="p-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--warning-bg)' }}>
          <FontAwesomeIcon icon={faExclamationTriangle} className="w-5 h-5" style={{ color: 'var(--warning)' }} />
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Near Limit</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--warning)' }}>{stats.nearLimitBudgets}</p>
        </div>
      </div>
    </Card>

    <Card className="p-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--error-bg)' }}>
          <FontAwesomeIcon icon={faExclamationTriangle} className="w-5 h-5" style={{ color: 'var(--error)' }} />
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Exceeded</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--error)' }}>{stats.exceededBudgets}</p>
        </div>
      </div>
    </Card>
  </div>
);

export default BudgetSummaryCards;
