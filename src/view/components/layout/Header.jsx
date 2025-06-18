import React from 'react';
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

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

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
    <header className="bg-white border-b border-gray-200">
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
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => console.log('User menu clicked')}
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faUser} className="w-4 h-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-900">User</div>
                  <div className="text-xs text-gray-500">user@example.com</div>
                </div>
              </button>
              
              {/* Dropdown Menu (hidden by default - would implement with state) */}
              <div className="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <FontAwesomeIcon icon={faUser} className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                  <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <FontAwesomeIcon icon={faCog} className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                  <hr className="my-1" />
                  <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Current Path Indicator (Development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="px-6 py-1 bg-blue-50 border-t border-blue-200">
          <p className="text-xs text-blue-600">
            Current Route: <code>{location.pathname}</code> | Key: <code>{location.key}</code>
          </p>
        </div>
      )}
    </header>
  );
};

export default Header;