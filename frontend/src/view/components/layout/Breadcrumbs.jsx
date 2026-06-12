import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome,
  faChevronRight,
  faChartLine,
  faExchangeAlt,
  faWallet,
  faChartBar
} from '@fortawesome/free-solid-svg-icons';

const Breadcrumbs = ({ className = '' }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Route configuration
  const routeConfig = {
    '/dashboard': {
      label: 'Dashboard',
      icon: faChartLine,
      parent: null
    },
    '/transactions': {
      label: 'Transactions',
      icon: faExchangeAlt,
      parent: '/dashboard'
    },
    '/budget': {
      label: 'Budget',
      icon: faWallet,
      parent: '/dashboard'
    },
    '/reports': {
      label: 'Reports',
      icon: faChartBar,
      parent: '/dashboard'
    }
  };

  // Build breadcrumb path
  const buildBreadcrumbs = () => {
    const breadcrumbs = [];
    let currentPath = location.pathname;
    
    // Always start with home if not on dashboard
    if (currentPath !== '/dashboard') {
      breadcrumbs.unshift({
        label: 'Home',
        icon: faHome,
        path: '/dashboard',
        isActive: false
      });
    }
    
    // Add current page
    const currentRoute = routeConfig[currentPath];
    if (currentRoute) {
      breadcrumbs.push({
        label: currentRoute.label,
        icon: currentRoute.icon,
        path: currentPath,
        isActive: true
      });
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = buildBreadcrumbs();

  // Don't show breadcrumbs on dashboard
  if (location.pathname === '/dashboard') {
    return null;
  }

  return (
    <nav className={`flex items-center space-x-2 text-sm text-theme-secondary ${className}`}>
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.path} className="flex items-center space-x-2">
          {index > 0 && (
            <FontAwesomeIcon
              icon={faChevronRight}
              className="w-3 h-3 text-theme-tertiary"
            />
          )}

          <button
            onClick={() => navigate(crumb.path)}
            className={`flex items-center space-x-2 px-2 py-1 rounded transition-colors ${
              crumb.isActive
                ? 'text-theme-accent bg-theme-tertiary font-medium'
                : 'text-theme-secondary hover-bg-theme'
            }`}
            disabled={crumb.isActive}
          >
            <FontAwesomeIcon
              icon={crumb.icon}
              className={`w-4 h-4 ${
                crumb.isActive ? 'text-theme-accent' : 'text-theme-tertiary'
              }`}
            />
            <span>{crumb.label}</span>
          </button>
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumbs;