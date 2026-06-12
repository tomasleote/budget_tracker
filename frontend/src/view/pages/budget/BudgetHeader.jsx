import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet, faRefresh } from '@fortawesome/free-solid-svg-icons';
import Button from '../../components/ui/Button';
import { loadMockDataToStorage, clearMockData } from '../../../data/mockDataGenerator.js';

const BudgetHeader = ({ hasAlerts, alertCount }) => {
  const handleCompleteReset = async () => {
    if (process.env.NODE_ENV === 'development') {
      try {
        clearMockData();
        await new Promise(resolve => setTimeout(resolve, 500));
        window.location.reload();
      } catch (error) {
        console.error('Error during reset:', error);
        alert('Error during reset. Check console for details.');
      }
    }
  };

  const handleRegenerateMockData = async () => {
    if (process.env.NODE_ENV === 'development') {
      try {
        clearMockData();
        await new Promise(resolve => setTimeout(resolve, 200));
        await loadMockDataToStorage(4);
        window.dispatchEvent(new CustomEvent('refreshTransactions'));
        window.dispatchEvent(new CustomEvent('refreshBudgets'));
        setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
        console.error('Error regenerating mock data:', error);
        alert('Error regenerating mock data. Check console for details.');
      }
    }
  };

  const handleResetAlerts = async () => {
    const { default: BudgetService } = await import('../../../model/services/BudgetService.js');
    BudgetService.clearDismissedAlerts();
    window.location.reload();
  };

  return (
    <div className="mb-6 lg:mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="mb-4 lg:mb-0">
          <div className="flex items-center space-x-3 mb-2">
            <FontAwesomeIcon icon={faWallet} className="text-xl" style={{ color: 'var(--accent-primary)' }} />
            <h1 className="text-2xl lg:text-3xl font-bold text-theme-primary">Budget Management</h1>
            {hasAlerts && (
              <span className="text-xs font-medium px-2 py-1 rounded-full" style={{
                backgroundColor: 'var(--error-bg)',
                color: 'var(--error)'
              }}>
                {alertCount} alerts
              </span>
            )}
          </div>
          <p className="text-sm lg:text-base text-theme-secondary">
            Create and track budgets to stay on top of your spending
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleCompleteReset}
              size="sm"
              className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
            >
              🧼 Reset All
            </Button>
            <Button
              variant="outline"
              onClick={handleRegenerateMockData}
              icon={faRefresh}
              size="sm"
              className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
            >
              🎭 Regenerate Data
            </Button>
            <Button
              variant="outline"
              onClick={handleResetAlerts}
              size="sm"
              className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
            >
              🚨 Reset Alerts
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetHeader;
