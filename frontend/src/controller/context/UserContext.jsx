import { createContext, useContext } from 'react';
import { DEFAULT_PREFERENCES } from '../utils/constants.js';

// UserContext — provides user + preferences (theme, currency, number format) to the app.
// The real value is supplied by UserProvider. The fallback below keeps consumers safe
// if the hook is ever used outside the provider (it never persists / mutates anything).
const UserContext = createContext();

const noop = () => {};
const asyncNoop = async () => ({ success: false });

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    return {
      user: null,
      preferences: { ...DEFAULT_PREFERENCES },
      theme: DEFAULT_PREFERENCES.theme,
      isLoading: false,
      hasError: false,
      getError: () => null,
      error: null,
      actions: { loadUser: async () => {}, clearErrors: noop },
      setTheme: noop,
      updatePreference: asyncNoop,
      updatePreferences: asyncNoop,
      resetPreferences: asyncNoop,
      formatCurrency: (amount) => `$${(parseFloat(amount) || 0).toFixed(2)}`,
      formatDate: (date) => new Date(date).toLocaleDateString(),
    };
  }
  return context;
};

export default UserContext;
