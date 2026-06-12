import { Transaction } from '../../entities/index.js';

/**
 * Pure aggregation helpers for TransactionRepository.
 * All functions take a plain transaction-data array.
 */

export function computeTotalsByType(transactions) {
  const totals = { income: 0, expense: 0, count: { income: 0, expense: 0 } };
  transactions.forEach(t => {
    const amount = parseFloat(t.amount) || 0;
    if (t.type === 'income') { totals.income += amount; totals.count.income++; }
    else if (t.type === 'expense') { totals.expense += amount; totals.count.expense++; }
  });
  totals.balance = totals.income - totals.expense;
  totals.total = transactions.length;
  return totals;
}

export function computeTotalsByCategory(transactions, type = null) {
  const categoryTotals = {};
  transactions
    .filter(t => !type || t.type === type)
    .forEach(t => {
      const category = t.category || 'Uncategorized';
      const amount = parseFloat(t.amount) || 0;
      if (!categoryTotals[category]) {
        categoryTotals[category] = { category, amount: 0, count: 0 };
      }
      categoryTotals[category].amount += amount;
      categoryTotals[category].count++;
    });
  return Object.values(categoryTotals).sort((a, b) => b.amount - a.amount);
}

export function computeMonthlyTotals(transactions, year) {
  const monthlyTotals = {};
  for (let month = 0; month < 12; month++) {
    const key = `${year}-${(month + 1).toString().padStart(2, '0')}`;
    monthlyTotals[key] = { month: month + 1, year, income: 0, expense: 0, balance: 0, count: 0 };
  }
  transactions
    .filter(t => new Date(t.date).getFullYear() === year)
    .forEach(t => {
      const date = new Date(t.date);
      const key = `${year}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const amount = parseFloat(t.amount) || 0;
      if (monthlyTotals[key]) {
        if (t.type === 'income') { monthlyTotals[key].income += amount; }
        else if (t.type === 'expense') { monthlyTotals[key].expense += amount; }
        monthlyTotals[key].count++;
      }
    });
  Object.values(monthlyTotals).forEach(m => { m.balance = m.income - m.expense; });
  return Object.values(monthlyTotals);
}

export function computeStatistics(transactions, totals) {
  if (transactions.length === 0) {
    return {
      total: 0, totalIncome: 0, totalExpense: 0, balance: 0,
      averageTransaction: 0, largestTransaction: 0, smallestTransaction: 0,
      categoriesCount: 0, dateRange: null
    };
  }
  const amounts = transactions.map(t => parseFloat(t.amount));
  const categories = new Set(transactions.map(t => t.category));
  const dates = transactions.map(t => new Date(t.date)).sort();
  return {
    total: transactions.length,
    totalIncome: totals.income,
    totalExpense: totals.expense,
    balance: totals.balance,
    averageTransaction: (totals.income + totals.expense) / transactions.length,
    largestTransaction: Math.max(...amounts),
    smallestTransaction: Math.min(...amounts),
    categoriesCount: categories.size,
    dateRange: { earliest: dates[0], latest: dates[dates.length - 1] }
  };
}

/**
 * Find transactions that match amount/description/category within 1 day of the given transaction.
 */
export function findPotentialDuplicates(allTransactions, transaction) {
  const transactionDate = new Date(transaction.date);
  return allTransactions.filter(t => {
    if (t.id === transaction.id) return false;
    const tDate = new Date(t.date);
    const daysDiff = Math.abs(transactionDate - tDate) / (1000 * 60 * 60 * 24);
    return (
      t.amount === transaction.amount &&
      t.description === transaction.description &&
      t.category === transaction.category &&
      daysDiff <= 1
    );
  });
}

/**
 * Filter out transactions that fail Transaction entity construction.
 * Returns { validTransactions, removedCount }.
 */
export function filterInvalidTransactions(allTransactions) {
  const validTransactions = [];
  let removedCount = 0;
  for (const td of allTransactions) {
    try {
      new Transaction(td);
      validTransactions.push(td);
    } catch {
      removedCount++;
    }
  }
  return { validTransactions, removedCount };
}

/**
 * Build a CSV string from a transaction array.
 */
export function buildTransactionCSV(transactions) {
  if (transactions.length === 0) return '';
  const headers = ['ID', 'Type', 'Amount', 'Description', 'Category', 'Date', 'Created At'];
  const rows = transactions.map(t => [
    t.id,
    t.type,
    t.amount,
    `"${t.description}"`,
    t.category,
    t.date,
    t.createdAt
  ].join(','));
  return [headers.join(','), ...rows].join('\n');
}
