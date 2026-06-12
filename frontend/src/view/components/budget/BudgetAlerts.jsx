import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faInfoCircle,
  faBell,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import Card from '../ui/Card';
import Button from '../ui/Button';
import AlertSummary from './budget-alerts/AlertSummary';
import AlertItem from './budget-alerts/AlertItem';

const BudgetAlerts = ({
  alerts = [],
  isLoading = false,
  onAlertClick = () => {},
  onDismissAlert = () => {},
  onViewBudget = () => {},
  className = ''
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState('all');

  if (isLoading) {
    return (
      <Card className={className} title="Budget Alerts">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <Card className={className} title="Budget Alerts">
        <div className="text-center py-8">
          <FontAwesomeIcon icon={faCheckCircle} className="text-green-400 text-4xl mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">All Clear!</h3>
          <p className="text-gray-500">No budget alerts at the moment. Your budgets are on track.</p>
        </div>
      </Card>
    );
  }

  const alertsBySeverity = {
    high: alerts.filter(a => a.severity === 'high'),
    medium: alerts.filter(a => a.severity === 'medium'),
    low: alerts.filter(a => a.severity === 'low')
  };

  const filteredAlerts = selectedSeverity === 'all'
    ? alerts
    : alerts.filter(alert => alert.severity === selectedSeverity);

  return (
    <Card
      className={className}
      title={
        <div className="flex items-center space-x-2">
          <FontAwesomeIcon icon={faBell} className="text-red-500" />
          <span>Budget Alerts</span>
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
            {alerts.length}
          </span>
        </div>
      }
    >
      <div className="space-y-4">
        <AlertSummary
          alertsBySeverity={alertsBySeverity}
          totalCount={alerts.length}
          selectedSeverity={selectedSeverity}
          onSelectSeverity={setSelectedSeverity}
        />

        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <AlertItem
              key={alert.id}
              alert={alert}
              onAlertClick={onAlertClick}
              onDismissAlert={onDismissAlert}
              onViewBudget={onViewBudget}
            />
          ))}
        </div>

        {filteredAlerts.length === 0 && selectedSeverity !== 'all' && (
          <div className="text-center py-6">
            <FontAwesomeIcon icon={faInfoCircle} className="text-gray-400 text-3xl mb-3" />
            <p className="text-gray-500">No {selectedSeverity} severity alerts found.</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedSeverity('all')}
              className="mt-2"
            >
              Show All Alerts
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default BudgetAlerts;
