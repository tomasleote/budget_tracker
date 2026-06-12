import { CURRENCY_CONFIG } from '../../../../controller/utils/constants';

const formatPreviewCurrency = (amount, settings) => {
  try {
    const currency = CURRENCY_CONFIG.SUPPORTED.find(c => c.code === settings.currency);
    const formatter = new Intl.NumberFormat(currency?.locale || 'en-US', {
      style: 'currency',
      currency: settings.currency,
      minimumFractionDigits: settings.decimalPlaces,
      maximumFractionDigits: settings.decimalPlaces
    });
    let formatted = formatter.format(amount);
    if (settings.thousandsSeparator !== ',') {
      if (settings.thousandsSeparator === '.') {
        formatted = formatted.replace(/,/g, 'TEMP').replace(/\./g, ',').replace(/TEMP/g, '.');
      } else if (settings.thousandsSeparator === ' ') {
        formatted = formatted.replace(/,/g, ' ');
      }
    }
    return formatted;
  } catch (error) {
    return `$${amount.toFixed(settings.decimalPlaces)}`;
  }
};

export default formatPreviewCurrency;
