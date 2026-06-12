import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import Button from '../ui/Button';
import { useUser } from '../../../controller/hooks/useUser';
import ThemeSection from './general-settings/ThemeSection';
import CurrencySection from './general-settings/CurrencySection';
import NumberFormatSection from './general-settings/NumberFormatSection';
import formatPreviewCurrency from './general-settings/formatPreviewCurrency';

/**
 * GeneralSettings Component
 *
 * Theme/currency/number-format controls. Theme changes apply and persist
 * immediately (via the shared UserProvider). Currency and number-format changes
 * are batched and persisted on "Save Changes".
 */
const GeneralSettings = () => {
  const { preferences, setTheme, updatePreferences } = useUser();

  const [localSettings, setLocalSettings] = useState({
    theme: preferences?.theme || 'light',
    currency: preferences?.currency || 'USD',
    decimalPlaces: preferences?.decimalPlaces ?? 2,
    thousandsSeparator: preferences?.thousandsSeparator ?? ','
  });

  const [previewAmount] = useState(1234.56);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const current = {
      theme: preferences?.theme || 'light',
      currency: preferences?.currency || 'USD',
      decimalPlaces: preferences?.decimalPlaces ?? 2,
      thousandsSeparator: preferences?.thousandsSeparator ?? ','
    };
    setHasChanges(JSON.stringify(localSettings) !== JSON.stringify(current));
  }, [localSettings, preferences]);

  const handleSettingChange = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleThemeChange = (theme) => {
    setLocalSettings(prev => ({ ...prev, theme }));
    setTheme(theme);
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updatePreferences({
        theme: localSettings.theme,
        currency: localSettings.currency,
        decimalPlaces: localSettings.decimalPlaces,
        thousandsSeparator: localSettings.thousandsSeparator
      });
      setHasChanges(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = () => {
    setLocalSettings({
      theme: preferences?.theme || 'light',
      currency: preferences?.currency || 'USD',
      decimalPlaces: preferences?.decimalPlaces ?? 2,
      thousandsSeparator: preferences?.thousandsSeparator ?? ','
    });
  };

  return (
    <div className="space-y-6">
      <ThemeSection value={localSettings.theme} onChange={handleThemeChange} />

      <CurrencySection
        value={localSettings.currency}
        onChange={(v) => handleSettingChange('currency', v)}
      />

      <NumberFormatSection
        decimalPlaces={localSettings.decimalPlaces}
        thousandsSeparator={localSettings.thousandsSeparator}
        onDecimalChange={(v) => handleSettingChange('decimalPlaces', v)}
        onSeparatorChange={(v) => handleSettingChange('thousandsSeparator', v)}
        preview={formatPreviewCurrency(previewAmount, localSettings)}
      />

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
              <Button variant="outline" size="sm" onClick={handleResetSettings} disabled={isSaving}>
                Reset
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveSettings} disabled={isSaving} isLoading={isSaving}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

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
