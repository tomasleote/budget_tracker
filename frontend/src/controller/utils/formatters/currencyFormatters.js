import { CURRENCY_CONFIG } from '../constants.js';

const getUserPreferences = () => {
  try {
    const stored = localStorage.getItem('budget_tracker_preferences');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

export const formatCurrency = (amount, options = {}) => {
  const userPrefs = getUserPreferences();
  const {
    currency = userPrefs.currency || CURRENCY_CONFIG.DEFAULT,
    locale = 'en-US',
    minimumFractionDigits = userPrefs.decimalPlaces ?? 2,
    maximumFractionDigits = userPrefs.decimalPlaces ?? 2,
    useUserFormat = true
  } = options;

  const currencyInfo = CURRENCY_CONFIG.SUPPORTED.find(c => c.code === currency);
  const localeToUse = currencyInfo?.locale || locale;

  try {
    let formatted = new Intl.NumberFormat(localeToUse, {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits
    }).format(parseFloat(amount) || 0);

    if (useUserFormat && userPrefs.thousandsSeparator && userPrefs.thousandsSeparator !== ',') {
      if (userPrefs.thousandsSeparator === '.') {
        // European style: swap . and ,
        formatted = formatted.replace(/,/g, 'TEMP').replace(/\./g, ',').replace(/TEMP/g, '.');
      } else if (userPrefs.thousandsSeparator === ' ') {
        formatted = formatted.replace(/,/g, ' ');
      }
    }

    return formatted;
  } catch (error) {
    const symbol = currencyInfo?.symbol || '$';
    return `${symbol}${(parseFloat(amount) || 0).toFixed(minimumFractionDigits)}`;
  }
};

export const formatCurrencyCompact = (amount, options = {}) => {
  const userPrefs = getUserPreferences();
  const { currency = userPrefs.currency || CURRENCY_CONFIG.DEFAULT, locale = 'en-US' } = options;
  const value = parseFloat(amount) || 0;

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  } catch (error) {
    const currencyInfo = CURRENCY_CONFIG.SUPPORTED.find(c => c.code === currency);
    const symbol = currencyInfo?.symbol || '$';

    if (value >= 1000000) {
      return `${symbol}${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${symbol}${(value / 1000).toFixed(1)}K`;
    } else {
      return `${symbol}${value.toFixed(2)}`;
    }
  }
};

export const formatNumber = (number, options = {}) => {
  const userPrefs = getUserPreferences();
  const {
    locale = 'en-US',
    minimumFractionDigits = 0,
    maximumFractionDigits = userPrefs.decimalPlaces ?? 2
  } = options;

  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits,
      maximumFractionDigits
    }).format(parseFloat(number) || 0);
  } catch (error) {
    return (parseFloat(number) || 0).toFixed(maximumFractionDigits);
  }
};

export const formatPercentage = (value, options = {}) => {
  const {
    locale = 'en-US',
    minimumFractionDigits = 1,
    maximumFractionDigits = 1
  } = options;

  try {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits,
      maximumFractionDigits
    }).format((parseFloat(value) || 0) / 100);
  } catch (error) {
    return `${(parseFloat(value) || 0).toFixed(maximumFractionDigits)}%`;
  }
};
