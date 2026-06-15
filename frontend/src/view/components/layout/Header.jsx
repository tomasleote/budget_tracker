import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faUser,
  faBell,
  faCog,
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import Button from '../ui/Button';
import Breadcrumbs from './Breadcrumbs';
import { NotificationDropdown } from '../ui';
import { useNotifications } from '../../../controller/hooks';
import { useAuth } from '../../../controller/hooks/useAuth';
import { getAppMode } from '../../../controller/appMode';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, exitDemo } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isDemo = getAppMode() === 'demo';
  const accountLabel = isDemo ? 'Demo user' : (user?.email || 'Account');

  const handleSignOut = async () => {
    setMenuOpen(false);
    if (isDemo) {
      exitDemo();
    } else {
      await logout();
    }
    navigate('/welcome', { replace: true });
  };

  // Notifications hook
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    dismissAll
  } = useNotifications();

  // Get page-specific actions
  const getPageActions = () => {
    switch (location.pathname) {
      case '/dashboard':
        return []; // Removed Add Transaction button
      case '/transactions':
        return [
          {
            label: 'Add Transaction',
            icon: faPlus,
            variant: 'primary',
            action: () => console.log('Open transaction modal')
          }
        ];
      case '/budget':
        return [
          {
            label: 'Create Budget',
            icon: faPlus,
            variant: 'primary',
            action: () => console.log('Open budget modal')
          }
        ];
      case '/reports':
        return [
          {
            label: 'Export Report',
            icon: faPlus,
            variant: 'outline',
            action: () => console.log('Export report')
          }
        ];
      default:
        return [];
    }
  };

  const pageActions = getPageActions();

  return (
    <header className="bg-theme-card border-b border-theme-primary">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Breadcrumbs */}
          <div className="flex-1">
            <Breadcrumbs />
          </div>

          {/* Header Actions */}
          <div className="flex items-center space-x-4">
            {/* Page-specific Actions */}
            {pageActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                icon={action.icon}
                onClick={action.action}
                size="sm"
              >
                {action.label}
              </Button>
            ))}

            {/* Notifications */}
            <NotificationDropdown
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              onDismiss={dismissNotification}
              onDismissAll={dismissAll}
            />

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                className="flex items-center space-x-3 p-2 rounded-lg hover-bg-theme transition-colors"
                onClick={() => setMenuOpen((open) => !open)}
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faUser} className="w-4 h-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-theme-primary">{isDemo ? 'Demo' : 'Account'}</div>
                  <div className="text-xs text-theme-secondary">{accountLabel}</div>
                </div>
              </button>

              <div className={`${menuOpen ? '' : 'hidden'} absolute right-0 mt-2 w-48 card-theme border rounded-lg shadow-lg z-10`}>
                <div className="py-1">
                  <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-theme-primary hover-bg-theme">
                    <FontAwesomeIcon icon={faUser} className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                  <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-theme-primary hover-bg-theme">
                    <FontAwesomeIcon icon={faCog} className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                  <hr className="my-1 border-theme-primary" />
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-theme-error hover-bg-theme"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
                    <span>{isDemo ? 'Exit demo' : 'Sign Out'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;