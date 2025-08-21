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
import Button from '../ui/Button';

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

  return (
    <div className="w-60 h-full flex flex-col transition-colors duration-300" style={{
      backgroundColor: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--sidebar-border)'
    }}>
      {/* Logo/Brand */}
      <div className="p-6" style={{
        borderBottom: '1px solid var(--sidebar-border)'
      }}>
        <div 
          className="flex items-center space-x-3 cursor-pointer transition-opacity hover:opacity-80"
          onClick={() => handleNavigation('/dashboard')}
        >
          <FontAwesomeIcon 
            icon={faCoins} 
            className="text-xl" 
            style={{ color: 'var(--accent-primary)' }}
          />
          <h1 className="text-xl font-bold" style={{
            color: 'var(--sidebar-text-active)'
          }}>Budget Tracker</h1>
        </div>
        <p className="text-xs mt-1" style={{
          color: 'var(--sidebar-text-muted)'
        }}>Personal Finance Manager</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = isActiveRoute(item.path);
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 relative"
                  title={item.description}
                  style={{
                    backgroundColor: isActive 
                      ? 'var(--sidebar-active)' 
                      : 'transparent',
                    color: isActive 
                      ? 'var(--sidebar-text-active)' 
                      : 'var(--sidebar-text)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.target.style.backgroundColor = 'var(--sidebar-hover)';
                      e.target.style.color = 'var(--sidebar-text-active)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = 'var(--sidebar-text)';
                    }
                  }}
                >
                  <FontAwesomeIcon 
                    icon={item.icon} 
                    className="w-5 h-5" 
                    style={{
                      color: isActive 
                        ? 'var(--sidebar-icon-active)' 
                        : 'var(--sidebar-icon)'
                    }}
                  />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs" style={{
                      color: isActive 
                        ? 'var(--sidebar-text-active)'
                        : 'var(--sidebar-text-muted)'
                    }}>
                      {item.description}
                    </div>
                  </div>
                  {isActive && (
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: 'var(--sidebar-active-indicator)' }}
                    ></div>
                  )}
                  {/* Active indicator bar */}
                  {isActive && (
                    <div 
                      className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full" 
                      style={{ backgroundColor: 'var(--sidebar-active-indicator)' }}
                    ></div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4" style={{
        borderTop: '1px solid var(--sidebar-border)'
      }}>
        <button
          onClick={() => handleNavigation('/settings')}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 relative"
          title="Application settings"
          style={{
            backgroundColor: isActiveRoute('/settings')
              ? 'var(--sidebar-active)' 
              : 'transparent',
            color: isActiveRoute('/settings')
              ? 'var(--sidebar-text-active)' 
              : 'var(--sidebar-text)'
          }}
          onMouseEnter={(e) => {
            if (!isActiveRoute('/settings')) {
              e.target.style.backgroundColor = 'var(--sidebar-hover)';
              e.target.style.color = 'var(--sidebar-text-active)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isActiveRoute('/settings')) {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = 'var(--sidebar-text)';
            }
          }}
        >
          <FontAwesomeIcon 
            icon={faCog} 
            className="w-5 h-5" 
            style={{
              color: isActiveRoute('/settings')
                ? 'var(--sidebar-icon-active)' 
                : 'var(--sidebar-icon)'
            }}
          />
          <div className="flex-1 text-left">
            <div className="font-medium">Settings</div>
            <div className="text-xs" style={{
              color: isActiveRoute('/settings')
                ? 'var(--sidebar-text-active)'
                : 'var(--sidebar-text-muted)'
            }}>
              App preferences
            </div>
          </div>
          {isActiveRoute('/settings') && (
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: 'var(--sidebar-active-indicator)' }}
            ></div>
          )}
          {/* Active indicator bar */}
          {isActiveRoute('/settings') && (
            <div 
              className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full" 
              style={{ backgroundColor: 'var(--sidebar-active-indicator)' }}
            ></div>
          )}
        </button>
        
        {/* Version info */}
        <div className="mt-4 pt-4" style={{
          borderTop: '1px solid var(--sidebar-border)'
        }}>
          <p className="text-xs text-center" style={{
            color: 'var(--sidebar-text-muted)'
          }}>
            Budget Tracker v1.0
          </p>
          {process.env.NODE_ENV === 'development' && (
            <p className="text-xs text-center mt-1" style={{
              color: 'var(--sidebar-text-muted)'
            }}>
              Development Mode
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;