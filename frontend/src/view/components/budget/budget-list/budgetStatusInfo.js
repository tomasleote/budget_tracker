import { faExclamationTriangle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const getBudgetStatusInfo = (budget) => {
  const percentage = budget.utilizationPercentage || 0;
  const isExceeded = budget.isOverBudget || percentage > 100;
  const isNearLimit = budget.isNearLimit || (percentage >= 80 && !isExceeded);

  if (isExceeded) {
    return {
      status: 'exceeded',
      icon: faExclamationTriangle,
      text: 'Exceeded',
      bgColor: 'var(--error-bg)',
      textColor: 'var(--error)',
      borderColor: 'var(--error-border)'
    };
  } else if (isNearLimit) {
    return {
      status: 'warning',
      icon: faExclamationTriangle,
      text: 'Near Limit',
      bgColor: 'var(--warning-bg)',
      textColor: 'var(--warning)',
      borderColor: 'var(--warning-border)'
    };
  } else {
    return {
      status: 'good',
      icon: faCheckCircle,
      text: 'On Track',
      bgColor: 'var(--success-bg)',
      textColor: 'var(--success)',
      borderColor: 'var(--success-border)'
    };
  }
};

export { getBudgetStatusInfo };
