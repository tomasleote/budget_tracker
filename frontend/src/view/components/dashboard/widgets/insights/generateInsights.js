import {
  faExclamationTriangle,
  faCheckCircle,
  faInfoCircle,
  faArrowTrendUp,
  faArrowTrendDown,
  faPiggyBank,
  faWallet
} from '@fortawesome/free-solid-svg-icons';

const PRIORITY_ORDER = { high: 3, medium: 2, low: 1 };

const generateInsights = ({ quickStats = {}, financialHealth = {}, utils = {} }) => {
  const insights = [];

  if (utils.getFinancialInsights && typeof utils.getFinancialInsights === 'function') {
    insights.push(...utils.getFinancialInsights());
  }

  const savingsRate = quickStats.savingsRate?.percentage || 0;
  if (savingsRate < 5) {
    insights.push({
      type: 'critical',
      icon: faExclamationTriangle,
      title: 'Critical Savings Rate',
      message: 'Your savings rate is very low. Try to save at least 10% of your income.',
      action: 'Review your budget and find areas to reduce spending',
      priority: 'high'
    });
  } else if (savingsRate < 15) {
    insights.push({
      type: 'warning',
      icon: faPiggyBank,
      title: 'Improve Savings Rate',
      message: `Current savings rate: ${quickStats.savingsRate?.formatted}. Aim for 20% or higher.`,
      action: 'Identify unnecessary expenses to increase savings',
      priority: 'medium'
    });
  } else if (savingsRate >= 20) {
    insights.push({
      type: 'success',
      icon: faCheckCircle,
      title: 'Excellent Savings Rate!',
      message: `Great job! You're saving ${quickStats.savingsRate?.formatted} of your income.`,
      action: 'Consider investing your surplus savings',
      priority: 'low'
    });
  }

  const balance = quickStats.balance || {};
  if (!balance.isPositive) {
    insights.push({
      type: 'critical',
      icon: faExclamationTriangle,
      title: 'Negative Balance Alert',
      message: `Your current balance is ${balance.formatted}. Immediate action needed.`,
      action: 'Reduce expenses or increase income urgently',
      priority: 'high'
    });
  } else if (balance.amount < 1000) {
    insights.push({
      type: 'warning',
      icon: faWallet,
      title: 'Low Emergency Fund',
      message: 'Consider building an emergency fund of 3-6 months of expenses.',
      action: 'Set up automatic savings to build your emergency fund',
      priority: 'medium'
    });
  }

  const budgetStatus = quickStats.budgetStatus || {};
  if (budgetStatus.hasIssues && budgetStatus.alerts > 0) {
    insights.push({
      type: 'warning',
      icon: faExclamationTriangle,
      title: 'Budget Alerts Active',
      message: `You have ${budgetStatus.alerts} budget alert${budgetStatus.alerts > 1 ? 's' : ''} requiring attention.`,
      action: 'Review and adjust your spending in flagged categories',
      priority: 'medium'
    });
  }

  const spendingTrend = utils.getSpendingTrend ? utils.getSpendingTrend() : { trend: 'stable' };
  if (spendingTrend.trend === 'up' && spendingTrend.percentage > 10) {
    insights.push({
      type: 'warning',
      icon: faArrowTrendUp,
      title: 'Spending Increase Detected',
      message: `Your spending has increased by ${spendingTrend.percentage}% this month.`,
      action: 'Review recent transactions to identify the cause',
      priority: 'medium'
    });
  } else if (spendingTrend.trend === 'down') {
    insights.push({
      type: 'success',
      icon: faArrowTrendDown,
      title: 'Spending Reduction Success',
      message: 'Great job! Your spending has decreased compared to last month.',
      action: 'Keep up the good spending habits',
      priority: 'low'
    });
  }

  const healthScore = financialHealth.score || 0;
  if (healthScore < 40) {
    insights.push({
      type: 'critical',
      icon: faExclamationTriangle,
      title: 'Financial Health Needs Attention',
      message: `Your financial health score is ${healthScore}/100. Focus on basic financial stability.`,
      action: 'Start with budgeting and emergency fund building',
      priority: 'high'
    });
  } else if (healthScore >= 80) {
    insights.push({
      type: 'success',
      icon: faCheckCircle,
      title: 'Excellent Financial Health',
      message: `Outstanding! Your financial health score is ${healthScore}/100.`,
      action: 'Consider advanced investment strategies',
      priority: 'low'
    });
  }

  if (insights.length === 0) {
    insights.push({
      type: 'info',
      icon: faInfoCircle,
      title: 'Keep Building Good Habits',
      message: 'Continue tracking your finances to get personalized insights.',
      action: 'Add more transactions to improve recommendations',
      priority: 'low'
    });
  }

  return insights
    .sort((a, b) => (PRIORITY_ORDER[b.priority] || 0) - (PRIORITY_ORDER[a.priority] || 0))
    .slice(0, 4);
};

export default generateInsights;
