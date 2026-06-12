import React, { useState, useEffect, useCallback, useMemo } from 'react';
import UserContext from '../UserContext.jsx';
import { repositories } from '../../../model/repositories/RepositoryFactory.js';
import { getStorageItem, setStorageItem } from '../../utils/index.js';
import { DEFAULT_PREFERENCES, STORAGE_KEYS, CURRENCY_CONFIG } from '../../utils/constants.js';

const VALID_THEMES = ['light', 'dark', 'auto'];

/**
 * UserProvider — single source of truth for user + preferences
 * (theme, currency, number formatting).
 *
 * - Preferences are persisted to localStorage (STORAGE_KEYS.PREFERENCES) and are
 *   best-effort written through UserRepository so a future backend swap is transparent.
 * - The provider owns the ONE effect that applies the active theme to the document,
 *   so navigating between pages can no longer reset it (fixes the dark-theme bug).
 */
export const UserProvider = ({ children }) => {
  const userRepository = useMemo(() => repositories.users, []);

  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState(() => ({
    ...DEFAULT_PREFERENCES,
    ...(getStorageItem(STORAGE_KEYS.PREFERENCES, {}) || {}),
  }));
  const [isLoading] = useState(false);
  const [error, setError] = useState(null);

  // Best-effort load of a persisted user; merge any stored user preferences once.
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const currentUser = await userRepository.getCurrentUser();
        if (!mounted || !currentUser) return;
        setUser(currentUser);
        if (currentUser.preferences) {
          setPreferences(prev => ({ ...prev, ...currentUser.preferences }));
        }
      } catch (err) {
        if (mounted) setError(err?.message || 'Failed to load user');
      }
    })();
    return () => { mounted = false; };
  }, [userRepository]);

  // Single source of truth: apply theme to <html> whenever it changes.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', preferences.theme || 'light');
  }, [preferences.theme]);

  const persistPreferences = useCallback((next) => {
    setStorageItem(STORAGE_KEYS.PREFERENCES, next);
    // Write-through to the repository layer (no-op until a user/backend exists).
    Promise.resolve(userRepository.updatePreferences(next)).catch(() => {});
  }, [userRepository]);

  const updatePreferences = useCallback((partial) => {
    let merged;
    setPreferences(prev => {
      merged = { ...prev, ...partial };
      return merged;
    });
    persistPreferences(merged);
    return Promise.resolve({ success: true, data: merged });
  }, [persistPreferences]);

  const updatePreference = useCallback(
    (key, value) => updatePreferences({ [key]: value }),
    [updatePreferences]
  );

  const setTheme = useCallback((theme) => {
    if (!VALID_THEMES.includes(theme)) return;
    updatePreferences({ theme });
  }, [updatePreferences]);

  const resetPreferences = useCallback(() => {
    const defaults = { ...DEFAULT_PREFERENCES };
    setPreferences(defaults);
    persistPreferences(defaults);
    return Promise.resolve({ success: true, data: defaults });
  }, [persistPreferences]);

  const formatCurrency = useCallback((amount, options = {}) => {
    const currency = options.currency || preferences.currency || 'USD';
    const decimalPlaces = options.decimalPlaces ?? preferences.decimalPlaces ?? 2;
    const info = CURRENCY_CONFIG.SUPPORTED.find(c => c.code === currency);
    try {
      return new Intl.NumberFormat(info?.locale || 'en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      }).format(parseFloat(amount) || 0);
    } catch (e) {
      return `${info?.symbol || '$'}${(parseFloat(amount) || 0).toFixed(decimalPlaces)}`;
    }
  }, [preferences.currency, preferences.decimalPlaces]);

  const formatDate = useCallback((date, options = {}) => {
    const format = options.format || preferences.dateFormat || 'MM/DD/YYYY';
    const dateObj = new Date(date);
    if (isNaN(dateObj)) return 'Invalid Date';
    try {
      switch (format) {
        case 'DD/MM/YYYY': return dateObj.toLocaleDateString('en-GB');
        case 'YYYY-MM-DD': return dateObj.toISOString().split('T')[0];
        default: return dateObj.toLocaleDateString('en-US');
      }
    } catch (e) {
      return dateObj.toLocaleDateString();
    }
  }, [preferences.dateFormat]);

  const value = useMemo(() => ({
    user,
    preferences,
    theme: preferences.theme || 'light',
    isLoading,
    hasError: !!error,
    getError: () => error,
    error,
    actions: {
      loadUser: async () => {},
      clearErrors: () => setError(null),
    },
    setTheme,
    updatePreference,
    updatePreferences,
    resetPreferences,
    formatCurrency,
    formatDate,
  }), [
    user, preferences, isLoading, error,
    setTheme, updatePreference, updatePreferences, resetPreferences,
    formatCurrency, formatDate,
  ]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
