export const roundCurrency = (amount, decimals = 2) => {
  return Math.round((parseFloat(amount) || 0) * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

export const roundNumber = (number, decimals = 2) => {
  return Math.round((parseFloat(number) || 0) * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

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

  return Object.values(categoryTotals)
    .map(cat => ({
      ...cat,
      amount: roundCurrency(cat.amount),
      percentage: 0
    }))
    .sort((a, b) => b.amount - a.amount);
};

export const calculateCategoryPercentages = (categoryData, totalAmount) => {
  if (totalAmount === 0) return categoryData;

  return categoryData.map(cat => ({
    ...cat,
    percentage: roundNumber((cat.amount / totalAmount) * 100, 1)
  }));
};
