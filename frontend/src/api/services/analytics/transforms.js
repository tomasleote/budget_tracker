/**
 * Pure helpers: response normalizers for the four analytics API endpoints.
 */

export function transformOverviewResponse(response) {
  if (!response) return null;

  return {
    summary: {
      totalIncome: parseFloat(response.total_income || 0),
      totalExpenses: parseFloat(response.total_expenses || 0),
      netSavings: parseFloat(response.net_savings || 0),
      savingsRate: parseFloat(response.savings_rate || 0),
      transactionCount: response.transaction_count || 0,
    },
    periodComparison: response.period_comparison || [],
    topCategories: response.top_categories || [],
    dateRange: {
      start: response.date_range?.start,
      end: response.date_range?.end,
    },
  };
}

export function transformTrendsResponse(response) {
  if (!response) return null;

  return {
    trends: (response.trends || []).map(trend => ({
      date: trend.date,
      income: parseFloat(trend.income || 0),
      expenses: parseFloat(trend.expenses || 0),
      net: parseFloat(trend.net || 0),
      cumulativeNet: parseFloat(trend.cumulative_net || 0),
    })),
    summary: {
      averageIncome: parseFloat(response.average_income || 0),
      averageExpenses: parseFloat(response.average_expenses || 0),
      trend: response.trend || 'stable',
      volatility: parseFloat(response.volatility || 0),
    },
  };
}

export function transformCategoryAnalyticsResponse(response) {
  if (!response) return null;

  return {
    categories: (response.categories || []).map(cat => ({
      id: cat.id,
      name: cat.name,
      type: cat.type,
      total: parseFloat(cat.total || 0),
      percentage: parseFloat(cat.percentage || 0),
      transactionCount: cat.transaction_count || 0,
      averageTransaction: parseFloat(cat.average_transaction || 0),
      color: cat.color,
      icon: cat.icon,
    })),
    uncategorized: {
      total: parseFloat(response.uncategorized?.total || 0),
      percentage: parseFloat(response.uncategorized?.percentage || 0),
      count: response.uncategorized?.count || 0,
    },
  };
}

export function transformInsightsResponse(response) {
  if (!response) return null;

  return {
    insights: (response.insights || []).map(insight => ({
      type: insight.type,
      title: insight.title,
      description: insight.description,
      severity: insight.severity,
      value: insight.value,
      recommendation: insight.recommendation,
      category: insight.category,
    })),
    score: {
      overall: parseFloat(response.financial_score?.overall || 0),
      spending: parseFloat(response.financial_score?.spending || 0),
      saving: parseFloat(response.financial_score?.saving || 0),
      budgeting: parseFloat(response.financial_score?.budgeting || 0),
    },
  };
}
