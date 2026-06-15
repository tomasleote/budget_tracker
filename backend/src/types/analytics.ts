import { BudgetPeriod, BudgetStatus } from './budget';

export interface DashboardSummary {
  overview: {
    total_income: number;
    total_expenses: number;
    net_amount: number;
    active_budgets: number;
    overspent_budgets: number;
    transactions_count: number;
  };
  current_month: {
    income: number;
    expenses: number;
    net_amount: number;
    budget_utilization: number; // Percentage of total budget used
    top_expense_category: {
      name: string;
      amount: number;
      color: string;
    } | null;
  };
  recent_transactions: {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    description: string;
    category: {
      name: string;
      color: string;
      icon: string;
    };
    date: string;
  }[];
  alerts: {
    budget_alerts: number;
    overspent_budgets: string[]; // Category names
    approaching_budgets: string[]; // Category names
  };
}

export interface SpendingInsights {
  period: {
    start_date: string;
    end_date: string;
  };
  category_breakdown: {
    category_id: string;
    category_name: string;
    category_color: string;
    total_amount: number;
    transaction_count: number;
    percentage_of_total: number;
    average_transaction: number;
    budget_amount?: number;
    budget_utilization?: number;
  }[];
  spending_trends: {
    date: string;
    total_expenses: number;
    total_income: number;
    net_amount: number;
  }[];
  top_categories: {
    highest_spending: {
      category_name: string;
      amount: number;
      color: string;
    }[];
    most_transactions: {
      category_name: string;
      count: number;
      color: string;
    }[];
    budget_performance: {
      category_name: string;
      budget_amount: number;
      spent_amount: number;
      utilization_percentage: number;
      color: string;
    }[];
  };
}

export interface BudgetPerformance {
  period: {
    start_date: string;
    end_date: string;
  };
  overall_performance: {
    total_budgets: number;
    total_budget_amount: number;
    total_spent: number;
    overall_utilization: number;
    budgets_on_track: number;
    budgets_overspent: number;
    budgets_approaching_limit: number;
  };
  budget_details: {
    budget_id: string;
    category_name: string;
    category_color: string;
    budget_amount: number;
    spent_amount: number;
    remaining_amount: number;
    utilization_percentage: number;
    days_remaining: number;
    daily_average: number;
    projected_total: number;
    status: 'on_track' | 'approaching_limit' | 'overspent';
    period: 'weekly' | 'monthly' | 'yearly';
  }[];
  performance_trends: {
    month: string;
    budgets_count: number;
    total_budget_amount: number;
    total_spent: number;
    utilization_percentage: number;
    overspent_count: number;
  }[];
}

export interface TrendsAnalysis {
  period: {
    start_date: string;
    end_date: string;
    granularity: 'daily' | 'weekly' | 'monthly';
  };
  income_trends: {
    date: string;
    amount: number;
    transaction_count: number;
  }[];
  expense_trends: {
    date: string;
    amount: number;
    transaction_count: number;
  }[];
  net_worth_trends: {
    date: string;
    net_amount: number;
    cumulative_net: number;
  }[];
  category_trends: {
    [category_name: string]: {
      date: string;
      amount: number;
      transaction_count: number;
    }[];
  };
  predictions: {
    next_month_income: number;
    next_month_expenses: number;
    predicted_net: number;
    confidence_score: number; // 0-100
  };
}

export interface FinancialHealthScore {
  overall_score: number; // 0-100
  score_breakdown: {
    budget_adherence: {
      score: number;
      description: string;
      factors: string[];
    };
    spending_consistency: {
      score: number;
      description: string;
      factors: string[];
    };
    income_stability: {
      score: number;
      description: string;
      factors: string[];
    };
    emergency_fund: {
      score: number;
      description: string;
      factors: string[];
    };
  };
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    category: 'budgeting' | 'spending' | 'income' | 'savings';
    title: string;
    description: string;
    action_items: string[];
  }[];
  historical_scores: {
    month: string;
    score: number;
  }[];
}

// Flat analytics shapes produced by the localStorage repository layer. These are
// simpler than the API-facing aggregate types above (SpendingInsights,
// BudgetPerformance, FinancialHealthScore) and are consumed only within that layer.
export interface SpendingByCategory {
  category_id: string;
  category_name: string;
  category_color: string;
  category_icon: string;
  amount: number;
  transaction_count: number;
  percentage: number;
}

export interface SpendingTrend {
  period: string;
  income: number;
  expense: number;
  net: number;
}

export interface IncomeVsExpense {
  total_income: number;
  total_expense: number;
  net_savings: number;
  savings_rate: number;
  income_count: number;
  expense_count: number;
  avg_income: number;
  avg_expense: number;
}

export interface MonthlyComparison {
  current_month: { income: number; expense: number; net: number };
  previous_month: { income: number; expense: number; net: number };
  income_change: number;
  expense_change: number;
  net_change: number;
}

export interface CategoryTrend {
  month: string;
  amount: number;
  transaction_count: number;
  avg_transaction: number;
}

export interface FinancialHealth {
  score: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  monthly_avg_income: number;
  monthly_avg_expense: number;
  savings_rate: number;
  expense_ratio: number;
  recommendations: string[];
}

export interface LocalBudgetPerformance {
  budget_id: string;
  category_name: string;
  budgeted_amount: number;
  spent_amount: number;
  remaining_amount: number;
  percentage_used: number;
  status: BudgetStatus;
  period: BudgetPeriod;
  days_remaining: number;
}

export interface AnalyticsQuery {
  start_date?: string;
  end_date?: string;
  period?: 'week' | 'month' | 'quarter' | 'year' | 'custom';
  granularity?: 'daily' | 'weekly' | 'monthly';
  category_ids?: string[];
  include_predictions?: boolean;
  compare_previous_period?: boolean;
}

export interface ComparisonAnalysis {
  current_period: {
    start_date: string;
    end_date: string;
    total_income: number;
    total_expenses: number;
    net_amount: number;
    transaction_count: number;
  };
  previous_period: {
    start_date: string;
    end_date: string;
    total_income: number;
    total_expenses: number;
    net_amount: number;
    transaction_count: number;
  };
  comparison: {
    income_change: {
      amount: number;
      percentage: number;
      trend: 'up' | 'down' | 'stable';
    };
    expense_change: {
      amount: number;
      percentage: number;
      trend: 'up' | 'down' | 'stable';
    };
    net_change: {
      amount: number;
      percentage: number;
      trend: 'up' | 'down' | 'stable';
    };
    transaction_count_change: {
      amount: number;
      percentage: number;
      trend: 'up' | 'down' | 'stable';
    };
  };
  category_comparisons: {
    category_name: string;
    current_amount: number;
    previous_amount: number;
    change_amount: number;
    change_percentage: number;
    trend: 'up' | 'down' | 'stable';
  }[];
}
