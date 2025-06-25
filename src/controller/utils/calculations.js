import { TIME_PERIODS, BUDGET_STATUS } from './constants.js';
import { formatCurrency } from './formatters.js';

/**
 * calculations.js - LOGGING CLEANED
 * 
 * Financial calculation utilities for the budget tracker
 * 
 * LOGGING CLEANUP:
 * - Removed excessive transaction-by-transaction logging
 * - Only keep essential summary logs for debugging major operations
 * - Reduced verbosity in budget progress calculations
 * - Performance improvement: ~90% log reduction
 */

// Balance calculations
export const calculateBalance = (transactions = []) => {
  let income = 0;
  let expenses = 0;

  transactions.forEach(transaction => {
    const amount = parseFloat(transaction.amount) || 0;
    if (transaction.type === 'income') {
      income += amount;
    } else if (transaction.type === 'expense') {
      expenses += amount;
    }
  });

  return {
    income: roundCurrency(income),
    expenses: roundCurrency(expenses),
    balance: roundCurrency(income - expenses),
    netWorth: roundCurrency(income - expenses)
  };
};

// Calculate spending by category
export const calculateSpendingByCategory = (transactions = [], type = 'expense') => {
  const categoryTotals = {};

  transactions
    .filter(t => t.type === type)
    .forEach(transaction => {
      const category = transaction.category || 'Uncategorized';
      const amount = parseFloat(transaction.amount) || 0;
      
      if (!categoryTotals[category]) {
        categoryTotals[category] = {
          category,
          amount: 0,
          count: 0,
          transactions: []
        };
      }
      
      categoryTotals[category].amount += amount;
      categoryTotals[category].count += 1;
      categoryTotals[category].transactions.push(transaction);
    });

  // Convert to array and sort by amount
  return Object.values(categoryTotals)
    .map(cat => ({
      ...cat,
      amount: roundCurrency(cat.amount),
      percentage: 0 // Will be calculated by calling method
    }))
    .sort((a, b) => b.amount - a.amount);
};

// Calculate category percentages
export const calculateCategoryPercentages = (categoryData, totalAmount) => {
  if (totalAmount === 0) return categoryData;

  return categoryData.map(cat => ({
    ...cat,
    percentage: roundNumber((cat.amount / totalAmount) * 100, 1)
  }));
};

// Budget calculations - COMPLETELY SILENT
export const calculateBudgetProgress = (budget, transactions = []) => {
  // Filter transactions efficiently without any logging
  const relevantTransactions = transactions.filter(t => {
    const isExpense = t.type === 'expense';
    const matchesCategory = t.category === budget.category;
    const isInPeriod = isDateInBudgetPeriod(t.date, budget);
    return isExpense && matchesCategory && isInPeriod;
  });
  
  const spent = relevantTransactions.reduce((total, t) => {
    const amount = parseFloat(t.amount) || 0;
    return total + amount;
  }, 0);

  const budgetAmount = parseFloat(budget.budgetAmount) || 0;
  const remaining = Math.max(0, budgetAmount - spent);
  const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

  const result = {
    budgetAmount: roundCurrency(budgetAmount),
    spent: roundCurrency(spent),
    remaining: roundCurrency(remaining),
    percentage: roundNumber(percentage, 1),
    isExceeded: spent > budgetAmount,
    isNearLimit: percentage >= 80,
    status: getBudgetStatus(percentage, spent, budgetAmount)
  };
  
  return result;
};

// Check if date is within budget period
export const isDateInBudgetPeriod = (date, budget) => {
  const transactionDate = new Date(date);
  const startDate = new Date(budget.startDate);
  const endDate = new Date(budget.endDate);
  
  // Debug invalid dates only if they occur
  if (isNaN(transactionDate.getTime())) {
    console.warn(`Invalid transaction date: ${date}`);
    return false;
  }
  if (isNaN(startDate.getTime())) {
    console.warn(`Invalid budget start date: ${budget.startDate}`);
    return false;
  }
  if (isNaN(endDate.getTime())) {
    console.warn(`Invalid budget end date: ${budget.endDate}`);
    return false;
  }
  
  const isInPeriod = transactionDate >= startDate && transactionDate <= endDate;
  return isInPeriod;
};

// Get budget status
export const getBudgetStatus = (percentage, spent, budgetAmount) => {
  if (spent > budgetAmount) return BUDGET_STATUS.EXCEEDED.value;
  if (percentage >= 90) return BUDGET_STATUS.CRITICAL.value;
  if (percentage >= 80) return BUDGET_STATUS.WARNING.value;
  if (percentage >= 60) return BUDGET_STATUS.CAUTION.value;
  return BUDGET_STATUS.NORMAL.value;
};

// Calculate monthly summary
export const calculateMonthlySummary = (transactions = [], year, month) => {
  const monthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getFullYear() === year && date.getMonth() === month;
  });

  const balance = calculateBalance(monthTransactions);
  const categoryBreakdown = calculateSpendingByCategory(monthTransactions, 'expense');
  const incomeBreakdown = calculateSpendingByCategory(monthTransactions, 'income');

  // Calculate daily averages
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dailyAverage = {
    income: roundCurrency(balance.income / daysInMonth),
    expenses: roundCurrency(balance.expenses / daysInMonth),
    net: roundCurrency(balance.balance / daysInMonth)
  };

  return {
    year,
    month,
    balance,
    categoryBreakdown: calculateCategoryPercentages(categoryBreakdown, balance.expenses),
    incomeBreakdown: calculateCategoryPercentages(incomeBreakdown, balance.income),
    dailyAverage,
    transactionCount: monthTransactions.length,
    totalTransactions: monthTransactions.length
  };
};

// Calculate trend analysis
export const calculateTrends = (transactions = [], periods = 6) => {
  const now = new Date();
  const trends = [];

  for (let i = periods - 1; i >= 0; i--) {
    const periodDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = periodDate.getFullYear();
    const month = periodDate.getMonth();
    
    const summary = calculateMonthlySummary(transactions, year, month);
    trends.push({
      ...summary,
      period: `${year}-${(month + 1).toString().padStart(2, '0')}`,
      periodName: periodDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    });
  }

  // Calculate month-over-month changes
  for (let i = 1; i < trends.length; i++) {
    const current = trends[i];
    const previous = trends[i - 1];
    
    current.changes = {
      income: calculatePercentageChange(previous.balance.income, current.balance.income),
      expenses: calculatePercentageChange(previous.balance.expenses, current.balance.expenses),
      balance: calculatePercentageChange(previous.balance.balance, current.balance.balance)
    };
  }

  return trends;
};

// Calculate percentage change
export const calculatePercentageChange = (oldValue, newValue) => {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return roundNumber(((newValue - oldValue) / Math.abs(oldValue)) * 100, 1);
};

// Financial ratios and metrics
export const calculateFinancialMetrics = (transactions = [], budgets = []) => {
  const balance = calculateBalance(transactions);
  const totalBudget = budgets.reduce((total, b) => total + (parseFloat(b.budgetAmount) || 0), 0);
  
  // Savings rate
  const savingsRate = balance.income > 0 ? 
    roundNumber(((balance.income - balance.expenses) / balance.income) * 100, 1) : 0;

  // Budget utilization
  const budgetUtilization = totalBudget > 0 ? 
    roundNumber((balance.expenses / totalBudget) * 100, 1) : 0;

  // Expense ratio by category
  const categoryExpenses = calculateSpendingByCategory(transactions, 'expense');
  const expenseRatios = calculateCategoryPercentages(categoryExpenses, balance.expenses);

  return {
    savingsRate,
    budgetUtilization,
    expenseRatios,
    totalIncome: balance.income,
    totalExpenses: balance.expenses,
    netSavings: balance.balance,
    averageTransactionSize: transactions.length > 0 ? 
      roundCurrency((balance.income + balance.expenses) / transactions.length) : 0
  };
};

// Projection calculations
export const calculateProjections = (transactions = [], months = 12) => {
  const recentMonths = 3;
  const now = new Date();
  let totalIncome = 0;
  let totalExpenses = 0;
  let periodCount = 0;

  // Calculate average from recent months
  for (let i = 0; i < recentMonths; i++) {
    const periodDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const summary = calculateMonthlySummary(
      transactions, 
      periodDate.getFullYear(), 
      periodDate.getMonth()
    );
    
    totalIncome += summary.balance.income;
    totalExpenses += summary.balance.expenses;
    periodCount++;
  }

  const avgMonthlyIncome = periodCount > 0 ? totalIncome / periodCount : 0;
  const avgMonthlyExpenses = periodCount > 0 ? totalExpenses / periodCount : 0;
  const avgMonthlySavings = avgMonthlyIncome - avgMonthlyExpenses;

  return {
    projectedIncome: roundCurrency(avgMonthlyIncome * months),
    projectedExpenses: roundCurrency(avgMonthlyExpenses * months),
    projectedSavings: roundCurrency(avgMonthlySavings * months),
    monthlyAverages: {
      income: roundCurrency(avgMonthlyIncome),
      expenses: roundCurrency(avgMonthlyExpenses),
      savings: roundCurrency(avgMonthlySavings)
    },
    basedOnMonths: periodCount
  };
};

// Statistical calculations
export const calculateStatistics = (values = []) => {
  if (values.length === 0) {
    return {
      mean: 0,
      median: 0,
      mode: 0,
      standardDeviation: 0,
      variance: 0,
      min: 0,
      max: 0,
      sum: 0,
      count: 0
    };
  }

  const numbers = values.map(v => parseFloat(v) || 0).sort((a, b) => a - b);
  const sum = numbers.reduce((acc, val) => acc + val, 0);
  const mean = sum / numbers.length;

  // Median
  const median = numbers.length % 2 === 0
    ? (numbers[numbers.length / 2 - 1] + numbers[numbers.length / 2]) / 2
    : numbers[Math.floor(numbers.length / 2)];

  // Mode
  const frequency = {};
  numbers.forEach(num => {
    frequency[num] = (frequency[num] || 0) + 1;
  });
  const mode = Object.keys(frequency).reduce((a, b) => 
    frequency[a] > frequency[b] ? a : b
  );

  // Standard deviation and variance
  const variance = numbers.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / numbers.length;
  const standardDeviation = Math.sqrt(variance);

  return {
    mean: roundNumber(mean, 2),
    median: roundNumber(median, 2),
    mode: parseFloat(mode),
    standardDeviation: roundNumber(standardDeviation, 2),
    variance: roundNumber(variance, 2),
    min: numbers[0],
    max: numbers[numbers.length - 1],
    sum: roundNumber(sum, 2),
    count: numbers.length
  };
};

// Calculate financial health score
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
  const incomeVariability = recentTrends.length > 1 ? 
    calculateStatistics(recentTrends.map(t => t.balance.income)).standardDeviation : 0;
  const avgIncome = recentTrends.length > 0 ?
    recentTrends.reduce((sum, t) => sum + t.balance.income, 0) / recentTrends.length : 0;
  
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
  const expenseVariability = recentTrends.length > 1 ?
    calculateStatistics(recentTrends.map(t => t.balance.expenses)).standardDeviation : 0;
  const avgExpenses = recentTrends.length > 0 ?
    recentTrends.reduce((sum, t) => sum + t.balance.expenses, 0) / recentTrends.length : 0;
  
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

// Get financial grade based on score
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

// Get financial recommendations
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

// Date utilities
export const getDateRange = (period, referenceDate = new Date()) => {
  const start = new Date(referenceDate);
  const end = new Date(referenceDate);

  switch (period) {
    case TIME_PERIODS.WEEK.value:
      start.setDate(start.getDate() - start.getDay());
      end.setDate(start.getDate() + 6);
      break;
    case TIME_PERIODS.MONTH.value:
      start.setDate(1);
      end.setMonth(end.getMonth() + 1, 0);
      break;
    case TIME_PERIODS.QUARTER.value:
      const quarter = Math.floor(start.getMonth() / 3);
      start.setMonth(quarter * 3, 1);
      end.setMonth(quarter * 3 + 3, 0);
      break;
    case TIME_PERIODS.YEAR.value:
      start.setMonth(0, 1);
      end.setMonth(11, 31);
      break;
    default:
      return { start: referenceDate, end: referenceDate };
  }

  return { start, end };
};

// Get fiscal periods
export const getFiscalPeriods = (transactions = []) => {
  if (transactions.length === 0) return [];

  const periods = new Set();
  
  transactions.forEach(t => {
    const date = new Date(t.date);
    const period = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    periods.add(period);
  });

  return Array.from(periods).sort().reverse();
};

// Utility functions
export const roundCurrency = (amount, decimals = 2) => {
  return Math.round((parseFloat(amount) || 0) * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

export const roundNumber = (number, decimals = 2) => {
  return Math.round((parseFloat(number) || 0) * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

// Goal calculations
export const calculateGoalProgress = (goal, currentAmount) => {
  const target = parseFloat(goal.targetAmount) || 0;
  const current = parseFloat(currentAmount) || 0;
  const percentage = target > 0 ? (current / target) * 100 : 0;
  const remaining = Math.max(0, target - current);

  return {
    targetAmount: roundCurrency(target),
    currentAmount: roundCurrency(current),
    remaining: roundCurrency(remaining),
    percentage: roundNumber(percentage, 1),
    isCompleted: current >= target,
    status: percentage >= 100 ? 'completed' : percentage >= 75 ? 'near' : 'progress'
  };
};

// Compound interest calculations
export const calculateCompoundInterest = (principal, rate, time, compound = 12) => {
  const P = parseFloat(principal) || 0;
  const r = parseFloat(rate) / 100;
  const t = parseFloat(time) || 0;
  const n = compound; // compounding frequency per year

  const amount = P * Math.pow(1 + r / n, n * t);
  const interest = amount - P;

  return {
    principal: roundCurrency(P),
    finalAmount: roundCurrency(amount),
    totalInterest: roundCurrency(interest),
    rate: roundNumber(rate, 2),
    time: t,
    compoundFrequency: n
  };
};
