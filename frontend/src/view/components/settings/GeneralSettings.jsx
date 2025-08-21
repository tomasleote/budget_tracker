import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSun,
  faMoon,
  faDesktop,
  faDollarSign,
  faHashtag,
  faCheck,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import Button from '../ui/Button';
import { useUser } from '../../../controller/hooks/useUser';
import { CURRENCY_CONFIG, APP_CONFIG } from '../../../controller/utils/constants';

/**
 * GeneralSettings Component
 * 
 * Provides controls for:
 * - Theme selection (Light/Dark/Auto)
 * - Currency selection with preview
 * - Number format preferences (decimal places, thousands separator)
 * - Real-time preview of changes
 * 
 * Phase 2 Implementation: Core Settings
 */
const GeneralSettings = () => {
  const { user, preferences } = useUser();
  
  // Local state for settings (before saving)
  const [localSettings, setLocalSettings] = useState({
    theme: preferences?.theme || 'light',
    currency: preferences?.currency || 'USD',
    decimalPlaces: user?.settings?.decimalPlaces || 2,
    thousandsSeparator: user?.settings?.thousandsSeparator || ','
  });
  
  // State for preview values
  const [previewAmount] = useState(1234.56);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Available theme options
  const themeOptions = [
    {
      value: 'light',
      label: 'Light',
      description: 'Classic light theme',
      icon: faSun,
      preview: '#ffffff'
    },
    {
      value: 'dark',
      label: 'Dark',
      description: 'Dark theme for low light',
      icon: faMoon,
      preview: '#1e293b'
    },
    {
      value: 'auto',
      label: 'Auto',
      description: 'Follow system preference',
      icon: faDesktop,
      preview: 'linear-gradient(45deg, #ffffff 50%, #1e293b 50%)'
    }
  ];
  
  // Thousands separator options
  const separatorOptions = [
    { value: ',', label: 'Comma (1,234.56)', description: 'US/UK standard' },
    { value: '.', label: 'Period (1.234,56)', description: 'European standard' },
    { value: ' ', label: 'Space (1 234.56)', description: 'International standard' }
  ];
  
  // Check for changes
  useEffect(() => {
    const currentSettings = {
      theme: preferences?.theme || 'light',
      currency: preferences?.currency || 'USD',
      decimalPlaces: user?.settings?.decimalPlaces || 2,
      thousandsSeparator: user?.settings?.thousandsSeparator || ','
    };
    
    const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(currentSettings);
    setHasChanges(hasChanges);
  }, [localSettings, preferences, user?.settings]);
  
  // Apply theme immediately for preview
  useEffect(() => {
    if (localSettings.theme) {
      document.documentElement.setAttribute('data-theme', localSettings.theme);
    }
  }, [localSettings.theme]);
  
  // Format preview currency
  const formatPreviewCurrency = () => {
    try {
      const currency = CURRENCY_CONFIG.SUPPORTED.find(c => c.code === localSettings.currency);
      const formatter = new Intl.NumberFormat(currency?.locale || 'en-US', {
        style: 'currency',
        currency: localSettings.currency,
        minimumFractionDigits: localSettings.decimalPlaces,
        maximumFractionDigits: localSettings.decimalPlaces
      });
      
      let formatted = formatter.format(previewAmount);
      
      // Apply thousands separator preference
      if (localSettings.thousandsSeparator !== ',') {
        if (localSettings.thousandsSeparator === '.') {
          // European style: swap . and ,
          formatted = formatted.replace(/,/g, 'TEMP').replace(/\./g, ',').replace(/TEMP/g, '.');
        } else if (localSettings.thousandsSeparator === ' ') {
          // Space separator
          formatted = formatted.replace(/,/g, ' ');
        }
      }
      
      return formatted;
    } catch (error) {
      return `$${previewAmount.toFixed(localSettings.decimalPlaces)}`;
    }
  };
  
  // Handle setting changes
  const handleSettingChange = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Save settings
  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement actual save logic with user context
      console.log('Saving settings:', localSettings);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasChanges(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Reset settings
  const handleResetSettings = () => {
    setLocalSettings({
      theme: preferences?.theme || 'light',
      currency: preferences?.currency || 'USD',
      decimalPlaces: user?.settings?.decimalPlaces || 2,
      thousandsSeparator: user?.settings?.thousandsSeparator || ','
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)', borderWidth: '1px', borderColor: 'var(--border-primary)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Theme Selection
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Choose your preferred theme appearance
            </p>
          </div>
          <FontAwesomeIcon icon={faSun} className="text-xl" style={{ color: 'var(--accent-primary)' }} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themeOptions.map((theme) => (
            <button
              key={theme.value}
              onClick={() => handleSettingChange('theme', theme.value)}
              className="relative p-4 rounded-lg border-2 transition-all duration-200 text-left"
              style={{
                borderColor: localSettings.theme === theme.value ? 'var(--accent-primary)' : 'var(--border-primary)',
                backgroundColor: localSettings.theme === theme.value ? 'var(--accent-primary)' : 'var(--bg-card)'
              }}
              onMouseEnter={(e) => {
                if (localSettings.theme !== theme.value) {
                  e.target.style.borderColor = 'var(--border-secondary)';
                }
              }}
              onMouseLeave={(e) => {
                if (localSettings.theme !== theme.value) {
                  e.target.style.borderColor = 'var(--border-primary)';
                }
              }}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div 
                  className="w-6 h-6 rounded-full border-2"
                  style={{ 
                    background: theme.preview,
                    borderColor: 'var(--border-secondary)'
                  }}
                ></div>
                <FontAwesomeIcon 
                  icon={theme.icon} 
                  className="w-4 h-4"
                  style={{
                    color: localSettings.theme === theme.value ? 'var(--text-inverse)' : 'var(--text-secondary)'
                  }}
                />
                <span className="font-medium" style={{
                  color: localSettings.theme === theme.value ? 'var(--text-inverse)' : 'var(--text-primary)'
                }}>
                  {theme.label}
                </span>
              </div>
              <p className="text-sm" style={{
                color: localSettings.theme === theme.value ? 'var(--text-inverse)' : 'var(--text-secondary)'
              }}>
                {theme.description}
              </p>
              
              {localSettings.theme === theme.value && (
                <div className="absolute top-2 right-2">
                  <FontAwesomeIcon 
                    icon={faCheck} 
                    className="w-4 h-4" 
                    style={{ color: 'var(--text-inverse)' }}
                  />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Currency Selection */}
      <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)', borderWidth: '1px', borderColor: 'var(--border-primary)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Currency
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Select your default currency for all financial displays
            </p>
          </div>
          <FontAwesomeIcon icon={faDollarSign} className="text-xl" style={{ color: 'var(--success)' }} />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Currency
          </label>
          <select
            value={localSettings.currency}
            onChange={(e) => handleSettingChange('currency', e.target.value)}
            className="w-full px-3 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-primary)',
              borderWidth: '1px',
              color: 'var(--text-primary)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--border-focus)';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border-primary)';
              e.target.style.boxShadow = 'none';
            }}
          >
            {CURRENCY_CONFIG.SUPPORTED.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.symbol} {currency.name} ({currency.code})
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Number Format */}
      <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)', borderWidth: '1px', borderColor: 'var(--border-primary)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Number Format
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Customize how numbers and currencies are displayed
            </p>
          </div>
          <FontAwesomeIcon icon={faHashtag} className="text-xl" style={{ color: 'var(--accent-tertiary)' }} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Decimal Places
            </label>
            <select
              value={localSettings.decimalPlaces}
              onChange={(e) => handleSettingChange('decimalPlaces', parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-primary)',
                borderWidth: '1px',
                color: 'var(--text-primary)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--border-focus)';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-primary)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value={0}>0 (No decimals)</option>
              <option value={1}>1 (0.0)</option>
              <option value={2}>2 (0.00)</option>
              <option value={3}>3 (0.000)</option>
              <option value={4}>4 (0.0000)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Thousands Separator
            </label>
            <select
              value={localSettings.thousandsSeparator}
              onChange={(e) => handleSettingChange('thousandsSeparator', e.target.value)}
              className="w-full px-3 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-primary)',
                borderWidth: '1px',
                color: 'var(--text-primary)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--border-focus)';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-primary)';
                e.target.style.boxShadow = 'none';
              }}
            >
              {separatorOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--info-bg)', borderWidth: '1px', borderColor: 'var(--info-border)' }}>
          <div className="flex items-center space-x-2 mb-1">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-sm" style={{ color: 'var(--info)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Live Preview:</span>
          </div>
          <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {formatPreviewCurrency()}
          </span>
        </div>
      </div>
      
      {/* Action Buttons */}
      {hasChanges && (
        <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--warning-bg)', borderWidth: '1px', borderColor: 'var(--warning-border)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: 'var(--warning)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                You have unsaved changes
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetSettings}
                disabled={isSaving}
              >
                Reset
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveSettings}
                disabled={isSaving}
                isLoading={isSaving}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Success Message */}
      {showSuccess && (
        <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--success-bg)', borderWidth: '1px', borderColor: 'var(--success-border)' }}>
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faCheck} style={{ color: 'var(--success)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Settings saved successfully!
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneralSettings;