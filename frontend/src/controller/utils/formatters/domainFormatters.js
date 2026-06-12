import { formatCurrency, formatNumber, formatPercentage } from './currencyFormatters.js';

export const formatTransactionAmount = (transaction) => {
  if (!transaction) return formatCurrency(0);

  const amount = parseFloat(transaction.amount) || 0;
  const prefix = transaction.type === 'expense' ? '-' : '+';
  const formatted = formatCurrency(amount);

  return `${prefix}${formatted}`;
};

export const formatTransactionType = (type) => {
  const types = {
    income: { label: 'Income', color: '#52C41A', icon: 'fas fa-arrow-up' },
    expense: { label: 'Expense', color: '#FF4D4F', icon: 'fas fa-arrow-down' }
  };

  return types[type] || { label: 'Unknown', color: '#999', icon: 'fas fa-question-circle' };
};

export const formatIcon = (iconClass, options = {}) => {
  const {
    size = '',
    color = '',
    spin = false,
    pulse = false,
    fixedWidth = false,
    additionalClasses = ''
  } = options;

  let classes = [iconClass];

  if (size) classes.push(`fa-${size}`);
  if (color) classes.push(`text-${color}`);
  if (spin) classes.push('fa-spin');
  if (pulse) classes.push('fa-pulse');
  if (fixedWidth) classes.push('fa-fw');
  if (additionalClasses) classes.push(additionalClasses);

  return classes.join(' ');
};

export const formatCategoryIcon = (category, type = 'expense') => {
  const categoryMap = {
    expense: {
      'Food & Dining': 'fas fa-utensils',
      'Transportation': 'fas fa-car',
      'Shopping': 'fas fa-shopping-bag',
      'Bills & Utilities': 'fas fa-bolt',
      'Entertainment': 'fas fa-film',
      'Healthcare': 'fas fa-hospital',
      'Education': 'fas fa-graduation-cap',
      'Travel': 'fas fa-plane',
      'Insurance': 'fas fa-shield-alt',
      'Investments': 'fas fa-chart-line',
      'Gifts & Donations': 'fas fa-gift',
      'Personal Care': 'fas fa-spa',
      'Home & Garden': 'fas fa-home',
      'Taxes': 'fas fa-file-invoice-dollar',
      'Other': 'fas fa-question-circle'
    },
    income: {
      'Salary': 'fas fa-money-bill-wave',
      'Freelance': 'fas fa-laptop-code',
      'Business': 'fas fa-building',
      'Investments': 'fas fa-chart-bar',
      'Rental': 'fas fa-key',
      'Side Hustle': 'fas fa-rocket',
      'Gifts': 'fas fa-hand-holding-heart',
      'Refunds': 'fas fa-undo',
      'Other': 'fas fa-plus-circle'
    }
  };

  return categoryMap[type]?.[category] || 'fas fa-question-circle';
};

export const formatBudgetProgress = (budget, spent) => {
  if (!budget) return { percentage: 0, status: 'normal', formatted: '0%' };

  const budgetAmount = parseFloat(budget.budgetAmount) || 0;
  const spentAmount = parseFloat(spent) || 0;
  const percentage = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;

  let status = 'normal';
  if (percentage >= 100) status = 'exceeded';
  else if (percentage >= 90) status = 'critical';
  else if (percentage >= 80) status = 'warning';
  else if (percentage >= 60) status = 'caution';

  return {
    percentage: Math.round(percentage),
    status,
    formatted: formatPercentage(percentage)
  };
};

export const formatBudgetPeriod = (period) => {
  const periods = {
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly'
  };

  return periods[period] || period;
};

export const formatChartData = (data, type = 'currency') => {
  if (!Array.isArray(data)) return [];

  return data.map(item => ({
    ...item,
    value: type === 'currency' ? parseFloat(item.value) || 0 : item.value,
    formattedValue: type === 'currency'
      ? formatCurrency(item.value)
      : formatNumber(item.value),
    label: item.label || item.name || 'Unknown'
  }));
};

export const formatChartTooltip = (value, name, type = 'currency') => {
  const formattedValue = type === 'currency'
    ? formatCurrency(value)
    : formatNumber(value);

  return [`${formattedValue}`, name];
};

export const formatCurrencyInput = (value) => {
  const cleaned = value.toString().replace(/[^\d.]/g, '');

  const parts = cleaned.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }

  if (parts[1] && parts[1].length > 2) {
    return parts[0] + '.' + parts[1].slice(0, 2);
  }

  return cleaned;
};
