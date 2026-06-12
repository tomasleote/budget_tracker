import { TIME_PERIODS, BUDGET_STATUS } from '../constants.js';
import { roundCurrency, roundNumber } from './balanceCalculations.js';

export const isDateInBudgetPeriod = (date, budget) => {
  const transactionDate = new Date(date);
  const startDate = new Date(budget.startDate);
  const endDate = new Date(budget.endDate);

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

  return transactionDate >= startDate && transactionDate <= endDate;
};

export const getBudgetStatus = (percentage, spent, budgetAmount) => {
  if (spent > budgetAmount) return BUDGET_STATUS.EXCEEDED.value;
  if (percentage >= 90) return BUDGET_STATUS.CRITICAL.value;
  if (percentage >= 80) return BUDGET_STATUS.WARNING.value;
  if (percentage >= 60) return BUDGET_STATUS.CAUTION.value;
  return BUDGET_STATUS.NORMAL.value;
};

export const calculateBudgetProgress = (budget, transactions = []) => {
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

  return {
    budgetAmount: roundCurrency(budgetAmount),
    spent: roundCurrency(spent),
    remaining: roundCurrency(remaining),
    percentage: roundNumber(percentage, 1),
    isExceeded: spent > budgetAmount,
    isNearLimit: percentage >= 80,
    status: getBudgetStatus(percentage, spent, budgetAmount)
  };
};

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
