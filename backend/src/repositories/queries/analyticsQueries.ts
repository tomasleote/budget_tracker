import { AnalyticsQuery } from '../../types/analytics';

/** Derive a concrete start/end date string pair from an AnalyticsQuery. */
export function resolveAnalyticsDateRange(query: AnalyticsQuery): { start_date: string; end_date: string } {
  if (query.start_date && query.end_date) {
    return { start_date: query.start_date, end_date: query.end_date };
  }

  const now = new Date();
  const end_date = now.toISOString().split('T')[0] || '';
  let start_date: string;

  switch (query.period) {
    case 'week':
      start_date = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '';
      break;
    case 'quarter':
      start_date = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1).toISOString().split('T')[0] || '';
      break;
    case 'year':
      start_date = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0] || '';
      break;
    case 'month':
    default:
      start_date = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0] || '';
      break;
  }

  return { start_date, end_date };
}

/** Aggregate raw transaction rows into per-category and per-day maps. */
export function aggregateSpendingInsights(transactions: any[]) {
  const categoryMap = new Map<string, {
    category_id: string;
    category_name: string;
    category_color: string;
    income_amount: number;
    expense_amount: number;
    transaction_count: number;
  }>();
  const dailyTotals = new Map<string, {
    date: string;
    total_expenses: number;
    total_income: number;
    net_amount: number;
  }>();

  transactions.forEach(transaction => {
    const categoryData = Array.isArray(transaction.category)
      ? transaction.category[0]
      : transaction.category;
    if (!categoryData) return;

    const categoryId = categoryData.id;
    const category = categoryMap.get(categoryId) || {
      category_id: categoryId,
      category_name: categoryData.name,
      category_color: categoryData.color,
      income_amount: 0,
      expense_amount: 0,
      transaction_count: 0
    };

    if (transaction.type === 'income') {
      category.income_amount += transaction.amount;
    } else {
      category.expense_amount += transaction.amount;
    }
    category.transaction_count++;
    categoryMap.set(categoryId, category);

    const date = transaction.date;
    const daily = dailyTotals.get(date) || {
      date,
      total_expenses: 0,
      total_income: 0,
      net_amount: 0
    };
    if (transaction.type === 'income') {
      daily.total_income += transaction.amount;
    } else {
      daily.total_expenses += transaction.amount;
    }
    daily.net_amount = daily.total_income - daily.total_expenses;
    dailyTotals.set(date, daily);
  });

  return { categoryMap, dailyTotals };
}

/** Aggregate expense transactions by category for dashboard top-category lookup. */
export function aggregateDashboardCategoryExpenses(categoryExpenses: any[]) {
  const categoryTotals = new Map<string, { name: string; color: string; amount: number }>();

  categoryExpenses.forEach(transaction => {
    const category = Array.isArray(transaction.category)
      ? transaction.category[0]
      : transaction.category;
    if (!category) return;

    const categoryId = category.id;
    const existing = categoryTotals.get(categoryId) || {
      name: category.name,
      color: category.color,
      amount: 0
    };
    existing.amount += transaction.amount;
    categoryTotals.set(categoryId, existing);
  });

  return categoryTotals;
}

/** Map raw recent-transaction rows to the dashboard shape. */
export function mapRecentTransactions(rows: any[]) {
  return rows.map(t => {
    const category = Array.isArray(t.category) ? t.category[0] : t.category;
    return {
      id: t.id,
      type: t.type,
      amount: t.amount,
      description: t.description,
      category: category || { name: '', color: '', icon: '' },
      date: t.date
    };
  });
}
