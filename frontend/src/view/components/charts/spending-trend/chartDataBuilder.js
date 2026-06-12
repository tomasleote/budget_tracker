const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const buildSpendingChartData = (transactions, dateRange, customStartDate, customEndDate) => {
  if (!transactions || transactions.length === 0) return [];

  let startDate, endDate;

  if (customStartDate && customEndDate) {
    startDate = new Date(customStartDate);
    endDate = new Date(customEndDate);
  } else {
    endDate = new Date();
    startDate = new Date();
    startDate.setDate(endDate.getDate() - dateRange);
  }

  const filteredTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= startDate && transactionDate <= endDate;
  });

  console.log('  - Transactions in last', dateRange, 'days:', filteredTransactions.length);

  const dailyData = {};
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    dailyData[dateStr] = { date: dateStr, income: 0, expenses: 0, net: 0 };
  }

  filteredTransactions.forEach(transaction => {
    const dateStr = new Date(transaction.date).toISOString().split('T')[0];
    if (dailyData[dateStr]) {
      const amount = parseFloat(transaction.amount) || 0;
      if (transaction.type === 'income') {
        dailyData[dateStr].income += amount;
      } else if (transaction.type === 'expense') {
        dailyData[dateStr].expenses += amount;
      }
    }
  });

  const result = Object.values(dailyData)
    .map(day => ({ ...day, net: day.income - day.expenses, displayDate: formatDate(day.date) }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  console.log('  - Chart data result:', {
    dataPoints: result.length,
    hasData: result.some(d => d.income > 0 || d.expenses > 0),
    sampleDataPoint: result[0]
  });

  return result;
};

const buildTrendStats = (chartData) => {
  if (chartData.length < 2) return null;

  const totalExpenses = chartData.reduce((sum, day) => sum + day.expenses, 0);
  const averageDaily = totalExpenses / chartData.length;

  const midpoint = Math.floor(chartData.length / 2);
  const firstHalf = chartData.slice(0, midpoint);
  const secondHalf = chartData.slice(midpoint);

  const firstHalfAvg = firstHalf.reduce((sum, day) => sum + day.expenses, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, day) => sum + day.expenses, 0) / secondHalf.length;

  const trendDirection = secondHalfAvg > firstHalfAvg ? 'up' : 'down';
  const trendPercentage = firstHalfAvg > 0 ? Math.abs((secondHalfAvg - firstHalfAvg) / firstHalfAvg * 100) : 0;

  return { totalExpenses, averageDaily, trendDirection, trendPercentage };
};

export { buildTrendStats };
export default buildSpendingChartData;
