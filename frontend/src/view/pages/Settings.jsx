import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCog,
  faUser,
  faTachometerAlt,
  faPalette
} from '@fortawesome/free-solid-svg-icons';
import Button from '../components/ui/Button';
import PageWrapper from '../components/ui/PageWrapper';
import GeneralSettings from '../components/settings/GeneralSettings';
import DataManagement from '../components/settings/DataManagement';

/**
 * Settings Page Component
 * 
 * Phase 2 Implementation: Complete settings page with:
 * - General settings (theme, currency, preferences)
 * - Data management (export, delete, reset)
 * - Responsive tabbed interface
 * 
 * Future phases will add:
 * - Dashboard customization (section visibility, layout)
 * - Appearance settings (colors, themes, visual preferences)
 */
const Settings = () => {
  // Active tab state
  const [activeTab, setActiveTab] = useState('general');
  
  // Available tabs configuration
  const tabs = [
    {
      id: 'general',
      label: 'General',
      icon: faUser,
      description: 'Theme, currency, and core preferences'
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: faTachometerAlt,
      description: 'Customize your dashboard layout'
    },
    {
      id: 'appearance',
      label: 'Appearance',
      icon: faPalette,
      description: 'Colors, themes, and visual preferences'
    }
  ];

  // Tab content renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <GeneralSettings />
            <DataManagement />
          </div>
        );
        
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)', borderWidth: '1px', borderColor: 'var(--border-primary)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Dashboard Customization
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <div>
                    <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Section Visibility</h4>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Show or hide dashboard sections</p>
                  </div>
                  <div className="text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>
                    Coming in Phase 3
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <div>
                    <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Layout Options</h4>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Customize dashboard layout</p>
                  </div>
                  <div className="text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>
                    Coming in Phase 3
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'appearance':
        return (
          <div className="space-y-6">
            <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)', borderWidth: '1px', borderColor: 'var(--border-primary)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Appearance Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <div>
                    <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Color Themes</h4>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Choose from preset color themes</p>
                  </div>
                  <div className="text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>
                    Coming in Phase 4
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <div>
                    <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Category Colors</h4>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Customize category colors</p>
                  </div>
                  <div className="text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>
                    Coming in Phase 4
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <PageWrapper
      isLoading={false}
      loadingText="Loading Settings..."
      loadingDescription="Preparing your settings"
      onError={(error, errorInfo) => {
        console.error('Settings Error:', error, errorInfo);
      }}
    >
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Settings Header */}
          <div className="mb-6 lg:mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <FontAwesomeIcon icon={faCog} className="text-xl" style={{ color: 'var(--accent-primary)' }} />
              <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Settings
              </h1>
            </div>
            <p className="text-sm lg:text-base" style={{ color: 'var(--text-secondary)' }}>
              Customize your Budget Tracker experience and preferences.
            </p>
          </div>

          {/* Settings Content */}
          <div className="rounded-lg" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)', borderWidth: '1px', borderColor: 'var(--border-primary)' }}>
            {/* Tab Navigation */}
            <div style={{ borderBottom: '1px solid var(--border-primary)' }}>
              <nav className="flex space-x-8 px-6" aria-label="Settings tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors"
                    style={{
                      borderBottomColor: activeTab === tab.id ? 'var(--accent-primary)' : 'transparent',
                      color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)'
                    }}
                    onMouseEnter={(e) => {
                      if (activeTab !== tab.id) {
                        e.target.style.color = 'var(--text-primary)';
                        e.target.style.borderBottomColor = 'var(--border-secondary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== tab.id) {
                        e.target.style.color = 'var(--text-secondary)';
                        e.target.style.borderBottomColor = 'transparent';
                      }
                    }}
                    title={tab.description}
                  >
                    <FontAwesomeIcon 
                      icon={tab.icon} 
                      className="w-4 h-4"
                      style={{
                        color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-tertiary)'
                      }}
                    />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {renderTabContent()}
            </div>
          </div>

          {/* Phase 2 Development Notice */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 rounded-lg p-4" style={{ backgroundColor: 'var(--success-bg)', borderWidth: '1px', borderColor: 'var(--success-border)' }}>
              <div className="flex items-start space-x-3">
                <FontAwesomeIcon 
                  icon={faCog} 
                  className="mt-0.5" 
                  style={{ color: 'var(--success)' }}
                />
                <div>
                  <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Settings Page - Phase 2 Complete ✅
                  </h4>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Core settings functionality is now implemented:
                  </p>
                  <ul className="text-sm mt-2 space-y-1" style={{ color: 'var(--text-secondary)' }}>
                    <li>✅ Theme system (Light/Dark/Auto)</li>
                    <li>✅ Currency selection with live preview</li>
                    <li>✅ Number format preferences</li>
                    <li>✅ Data export and management</li>
                    <li>✅ Settings persistence</li>
                  </ul>
                  <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                    <strong>Next:</strong> Phase 3 - Dashboard customization, Phase 4 - Color themes
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default Settings;