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
    <div className="w-60 bg-gray-800 text-white h-full flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-700">
        <div 
          className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => handleNavigation('/dashboard')}
        >
          <FontAwesomeIcon icon={faCoins} className="text-blue-400 text-xl" />
          <h1 className="text-xl font-bold">Budget Tracker</h1>
        </div>
        <p className="text-gray-400 text-xs mt-1">Personal Finance Manager</p>
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
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                  title={item.description}
                >
                  <FontAwesomeIcon 
                    icon={item.icon} 
                    className={`w-5 h-5 ${
                      isActive ? 'text-blue-100' : 'text-gray-400'
                    }`} 
                  />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{item.label}</div>
                    <div className={`text-xs ${
                      isActive ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={() => console.log('Settings clicked')}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
          title="Application settings"
        >
          <FontAwesomeIcon icon={faCog} className="w-5 h-5 text-gray-400" />
          <div className="flex-1 text-left">
            <div className="font-medium">Settings</div>
            <div className="text-xs text-gray-500">App preferences</div>
          </div>
        </button>
        
        {/* Version info */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            Budget Tracker v1.0
          </p>
          {process.env.NODE_ENV === 'development' && (
            <p className="text-xs text-gray-600 text-center mt-1">
              Development Mode
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;