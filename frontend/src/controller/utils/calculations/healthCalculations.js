import { calculateTrends, calculateFinancialMetrics, calculateStatistics } from './analyticsCalculations.js';

export const getFinancialGrade = (score) => {
  if (score >= 90) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 80) return 'A-';
  if (score >= 75) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 65) return 'B-';
  if (score >= 60) return 'C+';
  if (score >= 55) return 'C';
  if (score >= 50) return 'C-';
  if (score >= 45) return 'D+';
  if (score >= 40) return 'D';
  return 'F';
};

export const getFinancialRecommendations = (factors, metrics) => {
  const recommendations = [];

  if (factors.savingsRate < 20) {
    recommendations.push({
      category: 'savings',
      priority: 'high',
      message: 'Increase your savings rate to at least 20% of income',
      action: 'Review expenses and find areas to cut back'
    });
  }

  if (factors.budgetAdherence < 20) {
    recommendations.push({
      category: 'budgeting',
      priority: 'high',
      message: 'Improve budget adherence to stay within spending limits',
      action: 'Review and adjust budget amounts or spending habits'
    });
  }

  if (factors.incomeStability < 15) {
    recommendations.push({
      category: 'income',
      priority: 'medium',
      message: 'Work on stabilizing your income streams',
      action: 'Consider diversifying income sources or building an emergency fund'
    });
  }

  if (factors.expenseControl < 10) {
    recommendations.push({
      category: 'expenses',
      priority: 'medium',
      message: 'Focus on controlling expense variability',
      action: 'Track spending more carefully and identify irregular expenses'
    });
  }

  if (factors.budgetCoverage < 8) {
    recommendations.push({
      category: 'planning',
      priority: 'low',
      message: 'Create budgets for more expense categories',
      action: 'Analyze spending patterns and set budgets for major categories'
    });
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};

export const calculateFinancialHealthScore = (transactions = [], budgets = []) => {
  const metrics = calculateFinancialMetrics(transactions, budgets);
  let score = 0;
  const factors = {};

  // Savings rate (0-30 points)
  if (metrics.savingsRate >= 20) {
    factors.savingsRate = 30;
  } else if (metrics.savingsRate >= 10) {
    factors.savingsRate = 20;
  } else if (metrics.savingsRate >= 5) {
    factors.savingsRate = 10;
  } else if (metrics.savingsRate > 0) {
    factors.savingsRate = 5;
  } else {
    factors.savingsRate = 0;
  }

  // Budget adherence (0-25 points)
  if (metrics.budgetUtilization <= 80) {
    factors.budgetAdherence = 25;
  } else if (metrics.budgetUtilization <= 90) {
    factors.budgetAdherence = 20;
  } else if (metrics.budgetUtilization <= 100) {
    factors.budgetAdherence = 15;
  } else if (metrics.budgetUtilization <= 110) {
    factors.budgetAdherence = 10;
  } else {
    factors.budgetAdherence = 0;
  }

  // Income stability (0-20 points)
  const recentTrends = calculateTrends(transactions, 3);
  const incomeVariability = recentTrends.length > 1
    ? calculateStatistics(recentTrends.map(t => t.balance.income)).standardDeviation
    : 0;
  const avgIncome = recentTrends.length > 0
    ? recentTrends.reduce((sum, t) => sum + t.balance.income, 0) / recentTrends.length
    : 0;

  const variabilityRatio = avgIncome > 0 ? incomeVariability / avgIncome : 1;
  if (variabilityRatio <= 0.1) {
    factors.incomeStability = 20;
  } else if (variabilityRatio <= 0.2) {
    factors.incomeStability = 15;
  } else if (variabilityRatio <= 0.3) {
    factors.incomeStability = 10;
  } else {
    factors.incomeStability = 5;
  }

  // Expense control (0-15 points)
  const expenseVariability = recentTrends.length > 1
    ? calculateStatistics(recentTrends.map(t => t.balance.expenses)).standardDeviation
    : 0;
  const avgExpenses = recentTrends.length > 0
    ? recentTrends.reduce((sum, t) => sum + t.balance.expenses, 0) / recentTrends.length
    : 0;

  const expenseVariabilityRatio = avgExpenses > 0 ? expenseVariability / avgExpenses : 1;
  if (expenseVariabilityRatio <= 0.1) {
    factors.expenseControl = 15;
  } else if (expenseVariabilityRatio <= 0.2) {
    factors.expenseControl = 12;
  } else if (expenseVariabilityRatio <= 0.3) {
    factors.expenseControl = 8;
  } else {
    factors.expenseControl = 5;
  }

  // Budget coverage (0-10 points)
  const totalBudgeted = budgets.reduce((sum, b) => sum + (parseFloat(b.budgetAmount) || 0), 0);
  const budgetCoverage = metrics.totalExpenses > 0 ? totalBudgeted / metrics.totalExpenses : 0;
  if (budgetCoverage >= 0.9) {
    factors.budgetCoverage = 10;
  } else if (budgetCoverage >= 0.7) {
    factors.budgetCoverage = 8;
  } else if (budgetCoverage >= 0.5) {
    factors.budgetCoverage = 5;
  } else {
    factors.budgetCoverage = 2;
  }

  score = Object.values(factors).reduce((sum, val) => sum + val, 0);

  return {
    score,
    maxScore: 100,
    percentage: Math.min(100, score),
    grade: getFinancialGrade(score),
    factors,
    recommendations: getFinancialRecommendations(factors, metrics)
  };
};

