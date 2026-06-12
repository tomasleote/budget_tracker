/**
 * Balance calculation utilities for dashboard
 * Pure functions with no React hooks
 */

// Basic balance calculation
export const calculateBalance = (transactions = []) => {
  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
  return { income, expenses, balance: income - expenses };
};

// Calculate balance for last 30 days (rolling window)
export const calculateLast30DaysBalance = (transactions = []) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const last30DaysTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= thirtyDaysAgo && transactionDate <= now;
  });

  return calculateBalance(last30DaysTransactions);
};

// Calculate balance for the last FULL calendar month
// Today = Nov 5, 2025 → Last full month = October 2025 (Oct 1 - Oct 31)
export const calculateLastFullMonthBalance = (transactions = []) => {
  const now = new Date();

  // Get the first day of the current month
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get the last full month by going back one month from current month start
  const lastFullMonthStart = new Date(currentMonthStart);
  lastFullMonthStart.setMonth(lastFullMonthStart.getMonth() - 1);

  // Get the last day of the last full month (one day before current month starts)
  const lastFullMonthEnd = new Date(currentMonthStart);
  lastFullMonthEnd.setDate(lastFullMonthEnd.getDate() - 1);
  lastFullMonthEnd.setHours(23, 59, 59, 999);

  const lastFullMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= lastFullMonthStart && transactionDate <= lastFullMonthEnd;
  });

  const balance = calculateBalance(lastFullMonthTransactions);

  return {
    ...balance,
    monthName: lastFullMonthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    startDate: lastFullMonthStart,
    endDate: lastFullMonthEnd
  };
};

// Helper to get last full month name for display
export const getLastFullMonthName = () => {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return lastMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

// Calculate spending by category
export const calculateSpendingByCategory = (transactions = [], type = 'expense') => {
  const categoryMap = {};

  transactions
    .filter(t => t.type === type)
    .forEach(t => {
      // Try different ways to get category identifier
      const category = t.category?.name || t.category?.id || t.categoryId || t.category_id || t.category || 'Other';

      if (!categoryMap[category]) {
        categoryMap[category] = { amount: 0, count: 0 };
      }
      categoryMap[category].amount += (t.amount || 0);
      categoryMap[category].count += 1;
    });

  const result = Object.entries(categoryMap)
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      transactionCount: data.count
    }))
    .sort((a, b) => b.amount - a.amount);

  return result;
};
