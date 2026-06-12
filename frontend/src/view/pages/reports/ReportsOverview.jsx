import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowTrendUp,
  faArrowTrendDown,
  faDollarSign,
  faExchangeAlt
} from '@fortawesome/free-solid-svg-icons';
import Card from '../../components/ui/Card';
import ProgressBar from '../../components/ui/ProgressBar';

const ReportsOverview = ({ filteredData, financialHealth }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="p-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--success-bg)' }}>
            <FontAwesomeIcon icon={faArrowTrendUp} className="w-6 h-6" style={{ color: 'var(--success)' }} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Total Income</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--success)' }}>{filteredData.summary.formattedIncome}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--error-bg)' }}>
            <FontAwesomeIcon icon={faArrowTrendDown} className="w-6 h-6" style={{ color: 'var(--error)' }} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Total Expenses</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--error)' }}>{filteredData.summary.formattedExpenses}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-lg" style={{
            backgroundColor: filteredData.summary.isPositiveBalance ? 'var(--info-bg)' : 'var(--error-bg)'
          }}>
            <FontAwesomeIcon
              icon={faDollarSign}
              className="w-6 h-6"
              style={{ color: filteredData.summary.isPositiveBalance ? 'var(--info)' : 'var(--error)' }}
            />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Net Balance</p>
            <p className="text-2xl font-bold" style={{
              color: filteredData.summary.isPositiveBalance ? 'var(--info)' : 'var(--error)'
            }}>
              {filteredData.summary.formattedBalance}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--accent-primary)', opacity: 0.1 }}>
            <FontAwesomeIcon icon={faExchangeAlt} className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Transactions</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>{filteredData.transactions.length}</p>
          </div>
        </div>
      </Card>
    </div>

    {financialHealth && (
      <Card title="Financial Health Score">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Overall Score</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Based on spending patterns and budget adherence</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold" style={{ color: 'var(--accent-primary)' }}>{financialHealth.score}/100</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Grade: {financialHealth.grade}</div>
            </div>
          </div>
          <ProgressBar value={financialHealth.score} max={100} color="dynamic" size="lg" animated={true} />
        </div>
      </Card>
    )}
  </div>
);

export default ReportsOverview;
