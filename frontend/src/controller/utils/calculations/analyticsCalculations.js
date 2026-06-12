import {
  roundCurrency,
  roundNumber,
  calculateBalance,
  calculateSpendingByCategory,
  calculateCategoryPercentages
} from './balanceCalculations.js';

export const calculateMonthlySummary = (transactions = [], year, month) => {
  const monthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getFullYear() === year && date.getMonth() === month;
  });

  const balance = calculateBalance(monthTransactions);
  const categoryBreakdown = calculateSpendingByCategory(monthTransactions, 'expense');
  const incomeBreakdown = calculateSpendingByCategory(monthTransactions, 'income');

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

export const calculatePercentageChange = (oldValue, newValue) => {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return roundNumber(((newValue - oldValue) / Math.abs(oldValue)) * 100, 1);
};

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

export const calculateFinancialMetrics = (transactions = [], budgets = []) => {
  const balance = calculateBalance(transactions);
  const totalBudget = budgets.reduce((total, b) => total + (parseFloat(b.budgetAmount) || 0), 0);

  const savingsRate = balance.income > 0
    ? roundNumber(((balance.income - balance.expenses) / balance.income) * 100, 1)
    : 0;

  const budgetUtilization = totalBudget > 0
    ? roundNumber((balance.expenses / totalBudget) * 100, 1)
    : 0;

  const categoryExpenses = calculateSpendingByCategory(transactions, 'expense');
  const expenseRatios = calculateCategoryPercentages(categoryExpenses, balance.expenses);

  return {
    savingsRate,
    budgetUtilization,
    expenseRatios,
    totalIncome: balance.income,
    totalExpenses: balance.expenses,
    netSavings: balance.balance,
    averageTransactionSize: transactions.length > 0
      ? roundCurrency((balance.income + balance.expenses) / transactions.length)
      : 0
  };
};

export const calculateProjections = (transactions = [], months = 12) => {
  const recentMonths = 3;
  const now = new Date();
  let totalIncome = 0;
  let totalExpenses = 0;
  let periodCount = 0;

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

  const median = numbers.length % 2 === 0
    ? (numbers[numbers.length / 2 - 1] + numbers[numbers.length / 2]) / 2
    : numbers[Math.floor(numbers.length / 2)];

  const frequency = {};
  numbers.forEach(num => {
    frequency[num] = (frequency[num] || 0) + 1;
  });
  const mode = Object.keys(frequency).reduce((a, b) =>
    frequency[a] > frequency[b] ? a : b
  );

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
