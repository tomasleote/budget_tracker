import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faList, faBell } from '@fortawesome/free-solid-svg-icons';

const VIEW_MODES = [
  { key: 'overview', label: 'Overview', icon: faChartLine },
  { key: 'list', label: 'Manage', icon: faList },
  { key: 'alerts', label: 'Alerts', icon: faBell }
];

const BudgetTabBar = ({ viewMode, onViewModeChange, alertCount, viewingBudget, onClearViewingBudget }) => (
  <div className="mb-6 lg:mb-8">
    <div className="flex items-center space-x-1 p-1 w-fit rounded-lg transition-colors duration-300" style={{
      backgroundColor: 'var(--bg-secondary)'
    }}>
      {VIEW_MODES.map((mode) => {
        const badge = mode.key === 'alerts' && alertCount > 0 ? alertCount : null;
        return (
          <button
            key={mode.key}
            onClick={() => {
              onViewModeChange(mode.key);
              if (viewingBudget) onClearViewingBudget();
            }}
            className="relative px-4 py-2 rounded flex items-center space-x-2 transition-all duration-200"
            style={{
              backgroundColor: viewMode === mode.key ? 'var(--bg-card)' : 'transparent',
              color: viewMode === mode.key ? 'var(--accent-primary)' : 'var(--text-secondary)',
              boxShadow: viewMode === mode.key ? 'var(--shadow-sm)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (viewMode !== mode.key) e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              if (viewMode !== mode.key) e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <FontAwesomeIcon icon={mode.icon} className="w-4 h-4" />
            <span className="font-medium">{mode.label}</span>
            {badge && (
              <span className="absolute -top-1 -right-1 text-xs rounded-full w-5 h-5 flex items-center justify-center" style={{
                backgroundColor: 'var(--error)',
                color: 'var(--text-inverse)'
              }}>
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  </div>
);

export default BudgetTabBar;
