import {
  faExclamationTriangle,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';

export const getBudgetStatusInfo = (budget) => {
  const percentage = budget.progressPercentage || 0;
  const isExceeded = budget.isExceeded || percentage > 100;
  const isNearLimit = budget.isNearLimit || (percentage >= 80 && !isExceeded);

  if (isExceeded) {
    return { status: 'exceeded', icon: faExclamationTriangle, progressColor: 'red' };
  } else if (isNearLimit) {
    return { status: 'warning', icon: faExclamationTriangle, progressColor: 'yellow' };
  }
  return { status: 'good', icon: faCheckCircle, progressColor: 'dynamic' };
};

export const getStatusColors = (status) => {
  if (status === 'exceeded') {
    return {
      bg: 'var(--error-bg)',
      border: 'var(--error-border)',
      icon: 'var(--error)',
      statusBg: 'var(--error-bg)',
      statusText: 'var(--error)'
    };
  } else if (status === 'warning') {
    return {
      bg: 'var(--warning-bg)',
      border: 'var(--warning-border)',
      icon: 'var(--warning)',
      statusBg: 'var(--warning-bg)',
      statusText: 'var(--warning)'
    };
  }
  return {
    bg: 'var(--bg-card)',
    border: 'var(--border-primary)',
    icon: 'var(--success)',
    statusBg: 'var(--success-bg)',
    statusText: 'var(--success)'
  };
};

export const computeSummaryStats = (budgetOverview) => {
  const total = budgetOverview.length;
  const exceeded = budgetOverview.filter(b => b.isExceeded || b.progressPercentage > 100).length;
  const warning = budgetOverview.filter(b =>
    (b.isNearLimit || b.progressPercentage >= 80) &&
    !(b.isExceeded || b.progressPercentage > 100)
  ).length;
  return { total, exceeded, warning, healthy: total - exceeded - warning };
};
