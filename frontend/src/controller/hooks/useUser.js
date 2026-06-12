import { useUserContext } from '../context/UserContext.jsx';
import { CURRENCY_CONFIG } from '../utils/constants.js';

/**
 * useUser — thin consumer of UserContext.
 *
 * All user/preferences state now lives in UserProvider (single source of truth).
 * This hook only adapts the context into the convenience getters the views use;
 * it holds no local state of its own.
 */
export const useUser = () => {
  const ctx = useUserContext();
  const preferences = ctx.preferences || {};
  const theme = preferences.theme || 'light';

  const formatCurrency =
    ctx.formatCurrency || ((amount) => `$${(parseFloat(amount) || 0).toFixed(2)}`);
  const formatDate =
    ctx.formatDate || ((date) => new Date(date).toLocaleDateString());

  const setTheme = ctx.setTheme || (() => {});
  const updatePreferences = ctx.updatePreferences || (() => Promise.resolve());
  const updatePreference =
    ctx.updatePreference || ((key, value) => updatePreferences({ [key]: value }));

  return {
    // Core data
    user: ctx.user || { name: 'User', email: '' },
    preferences,

    // Status
    isLoading: typeof ctx.isLoading === 'function' ? ctx.isLoading() : !!ctx.isLoading,
    hasError: typeof ctx.hasError === 'function' ? ctx.hasError() : !!ctx.hasError,
    getError: typeof ctx.getError === 'function' ? ctx.getError() : (ctx.error || null),
    loadUser: ctx.actions?.loadUser || (() => Promise.resolve()),
    clearErrors: ctx.actions?.clearErrors || (() => {}),

    // Formatting
    formatCurrency,
    formatDate,

    // Theme
    getCurrentTheme: () => theme,
    isDarkMode: () => theme === 'dark',
    isLightMode: () => theme === 'light',
    isAutoMode: () => theme === 'auto',
    setTheme,
    toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'),

    // Preferences
    getPreferences: () => preferences,
    updatePreference,
    updatePreferences,
    savePreferences: updatePreferences,
    resetPreferences: ctx.resetPreferences || (() => Promise.resolve()),

    // Currency / locale helpers
    getCurrentCurrency: () => preferences.currency || 'USD',
    getLocale: () => {
      const info = CURRENCY_CONFIG.SUPPORTED.find(c => c.code === (preferences.currency || 'USD'));
      return info?.locale || 'en-US';
    },
    setCurrency: (currency) => updatePreference('currency', currency),
    setDateFormat: (format) => updatePreference('dateFormat', format),

    // Display helpers
    getUserDisplayName: () => ctx.user?.name || 'User',
    getUserEmail: () => ctx.user?.email || '',

    // Notification preference checks (read-only convenience)
    areBudgetAlertsEnabled: () => preferences.notifications?.budgetAlerts ?? true,
    areNotificationsEnabled: () => preferences.notifications?.budgetAlerts ?? true,
    areEmailNotificationsEnabled: () => preferences.notifications?.emailNotifications ?? false,
  };
};

export default useUser;
