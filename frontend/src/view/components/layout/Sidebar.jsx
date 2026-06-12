import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faExchangeAlt,
  faWallet,
  faChartBar,
  faCog,
  faCoins
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: faChartLine,
      path: '/dashboard',
      description: 'Financial overview'
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: faExchangeAlt,
      path: '/transactions',
      description: 'Manage transactions'
    },
    {
      id: 'budget',
      label: 'Budget',
      icon: faWallet,
      path: '/budget',
      description: 'Track budgets'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: faChartBar,
      path: '/reports',
      description: 'Financial reports'
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  // Hover/active styling lives in CSS (.sidebar-theme .nav-item:hover/.active).
  const renderNavItem = ({ label, icon, path, description, title }) => {
    const isActive = isActiveRoute(path);

    return (
      <button
        onClick={() => handleNavigation(path)}
        className={`nav-item w-full flex items-center space-x-3 px-4 py-3 rounded-lg relative ${isActive ? 'active' : ''}`}
        title={title || description}
      >
        <FontAwesomeIcon icon={icon} className="nav-icon w-5 h-5" />
        <div className="flex-1 text-left">
          <div className="font-medium">{label}</div>
          <div className="nav-desc text-xs">{description}</div>
        </div>
      </button>
    );
  };

  return (
    <div className="sidebar-theme w-60 h-full flex flex-col border-r transition-colors duration-300">
      {/* Logo/Brand */}
      <div className="sidebar-brand p-6">
        <div
          className="flex items-center space-x-3 cursor-pointer transition-opacity hover:opacity-80"
          onClick={() => handleNavigation('/dashboard')}
        >
          <FontAwesomeIcon icon={faCoins} className="brand-icon text-xl" />
          <h1 className="text-xl font-bold">Budget Tracker</h1>
        </div>
        <p className="sidebar-subtitle text-xs mt-1">Personal Finance Manager</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              {renderNavItem(item)}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="sidebar-divider-t p-4">
        {renderNavItem({
          label: 'Settings',
          icon: faCog,
          path: '/settings',
          description: 'App preferences',
          title: 'Application settings'
        })}

        {/* Version info */}
        <div className="sidebar-divider-t mt-4 pt-4">
          <p className="sidebar-subtitle text-xs text-center">
            Budget Tracker v1.0
          </p>
          {process.env.NODE_ENV === 'development' && (
            <p className="sidebar-subtitle text-xs text-center mt-1">
              Development Mode
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
