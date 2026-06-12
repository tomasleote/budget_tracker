import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExchangeAlt, faChartLine } from '@fortawesome/free-solid-svg-icons';
import Card from '../../components/ui/Card';

const TransactionSummaryCards = ({ stats, summary }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 lg:mb-8">
    <Card className="p-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--info-bg)' }}>
          <FontAwesomeIcon icon={faExchangeAlt} className="w-5 h-5" style={{ color: 'var(--info)' }} />
        </div>
        <div>
          <p className="text-sm font-medium text-theme-secondary">Total Transactions</p>
          <p className="text-2xl font-bold text-theme-primary">{stats.totalTransactions}</p>
        </div>
      </div>
    </Card>

    <Card className="p-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--success-bg)' }}>
          <FontAwesomeIcon icon={faChartLine} className="w-5 h-5" style={{ color: 'var(--success)' }} />
        </div>
        <div>
          <p className="text-sm font-medium text-theme-secondary">Total Income</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--success)' }}>{summary.formattedIncome}</p>
        </div>
      </div>
    </Card>

    <Card className="p-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--error-bg)' }}>
          <FontAwesomeIcon icon={faChartLine} className="w-5 h-5" style={{ color: 'var(--error)' }} />
        </div>
        <div>
          <p className="text-sm font-medium text-theme-secondary">Total Expenses</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--error)' }}>{summary.formattedExpenses}</p>
        </div>
      </div>
    </Card>

    <Card className="p-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-lg" style={{
          backgroundColor: summary.isPositiveBalance ? 'var(--success-bg)' : 'var(--error-bg)'
        }}>
          <FontAwesomeIcon
            icon={summary.balanceIcon}
            className="w-5 h-5"
            style={{ color: summary.isPositiveBalance ? 'var(--success)' : 'var(--error)' }}
          />
        </div>
        <div>
          <p className="text-sm font-medium text-theme-secondary">Net Balance</p>
          <p className="text-2xl font-bold" style={{
            color: summary.isPositiveBalance ? 'var(--success)' : 'var(--error)'
          }}>
            {summary.formattedBalance}
          </p>
        </div>
      </div>
    </Card>
  </div>
);

export default TransactionSummaryCards;
