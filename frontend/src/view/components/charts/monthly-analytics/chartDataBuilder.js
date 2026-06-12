const getMonthName = (date) =>
  new Date(date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

const buildMonthlyChartData = (transactions, budgets, monthsToShow) => {
  if (!transactions || transactions.length === 0) return [];

  const monthlyData = {};
  const endDate = new Date();

  for (let i = monthsToShow - 1; i >= 0; i--) {
    const date = new Date(endDate.getFullYear(), endDate.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyData[monthKey] = {
      month: getMonthName(date),
      monthKey,
      income: 0,
      expenses: 0,
      net: 0,
      budgeted: 0,
      transactions: 0,
      savingsRate: 0
    };
  }

  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (monthlyData[monthKey]) {
      monthlyData[monthKey].transactions++;
      if (transaction.type === 'income') {
        monthlyData[monthKey].income += transaction.amount || 0;
      } else if (transaction.type === 'expense') {
        monthlyData[monthKey].expenses += transaction.amount || 0;
      }
    }
  });

  budgets.forEach(budget => {
    if (budget.period === 'monthly' && budget.budgetAmount) {
      Object.keys(monthlyData).forEach(monthKey => {
        monthlyData[monthKey].budgeted += budget.budgetAmount;
      });
    }
  });

  Object.values(monthlyData).forEach(month => {
    month.net = month.income - month.expenses;
    month.savingsRate = month.income > 0 ? ((month.income - month.expenses) / month.income * 100) : 0;
    month.budgetVariance = month.budgeted > 0 ? month.expenses - month.budgeted : 0;
  });

  return Object.values(monthlyData).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
};

export default buildMonthlyChartData;
