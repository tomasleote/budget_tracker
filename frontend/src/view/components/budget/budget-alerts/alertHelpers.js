import {
  faExclamationTriangle,
  faExclamationCircle,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import { formatPercentage } from '../../../../controller/utils/formatters';

export const getAlertStyling = (severity) => {
  switch (severity) {
    case 'high':
      return {
        icon: faExclamationTriangle,
        iconColor: 'text-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-700',
        badgeColor: 'bg-red-100 text-red-800'
      };
    case 'medium':
      return {
        icon: faExclamationCircle,
        iconColor: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-700',
        badgeColor: 'bg-yellow-100 text-yellow-800'
      };
    case 'low':
      return {
        icon: faInfoCircle,
        iconColor: 'text-blue-500',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-700',
        badgeColor: 'bg-blue-100 text-blue-800'
      };
    default:
      return {
        icon: faInfoCircle,
        iconColor: 'text-gray-500',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        textColor: 'text-gray-700',
        badgeColor: 'bg-gray-100 text-gray-800'
      };
  }
};

export const getDefaultAlertTitle = (alert) => {
  switch (alert.type) {
    case 'budget_exceeded': return 'Budget Exceeded';
    case 'budget_warning': return 'Budget Warning';
    case 'budget_info': return 'Budget Update';
    default: return 'Budget Alert';
  }
};

export const getDefaultAlertMessage = (alert) => {
  if (alert.percentage > 100) {
    return `You've exceeded your ${alert.category} budget by ${formatPercentage(alert.percentage - 100)}.`;
  } else if (alert.percentage >= 80) {
    return `You've used ${formatPercentage(alert.percentage)} of your ${alert.category} budget.`;
  }
  return `Budget update for ${alert.category}.`;
};
