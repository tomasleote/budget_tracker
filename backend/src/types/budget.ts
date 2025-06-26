export interface Budget {
  id: string;
  category_id: string;
  budget_amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BudgetWithCategory extends Budget {
  category: {
    id: string;
    name: string;
    type: 'income' | 'expense';
    color: string;
    icon: string;
  };
}

export interface BudgetWithProgress extends BudgetWithCategory {
  spent_amount: number;
  remaining_amount: number;
  progress_percentage: number;
  is_overspent: boolean;
  days_remaining: number;
  average_daily_spending: number;
  projected_total: number;
}

export interface CreateBudgetDto {
  category_id: string;
  budget_amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  start_date: string; // ISO date string
  end_date?: string; // ISO date string - optional, will be calculated based on period if not provided
}

export interface UpdateBudgetDto {
  category_id?: string;
  budget_amount?: number;
  period?: 'weekly' | 'monthly' | 'yearly';
  start_date?: string; // ISO date string
  end_date?: string; // ISO date string
  is_active?: boolean;
}

export interface BudgetQuery {
  page?: number;
  limit?: number;
  category_id?: string;
  period?: 'weekly' | 'monthly' | 'yearly';
  is_active?: boolean;
  start_date?: string; // ISO date string
  end_date?: string; // ISO date string
  include_category?: boolean;
  include_progress?: boolean;
  overspent_only?: boolean;
  sort?: 'start_date' | 'budget_amount' | 'progress_percentage' | 'created_at';
  order?: 'asc' | 'desc';
}

export interface BudgetSummary {
  total_budgets: number;
  active_budgets: number;
  total_budget_amount: number;
  total_spent_amount: number;
  total_remaining_amount: number;
  overspent_budgets: number;
  average_progress_percentage: number;
  date_range: {
    start: string;
    end: string;
  };
}

export interface BulkBudgetOperation {
  action: 'create' | 'update' | 'delete';
  budgets: (CreateBudgetDto | (UpdateBudgetDto & { id: string }) | { id: string })[];
}

export interface PaginatedBudgets {
  budgets: Budget[] | BudgetWithCategory[] | BudgetWithProgress[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  summary?: BudgetSummary;
}

export interface BudgetAlert {
  budget_id: string;
  category_name: string;
  alert_type: 'approaching_limit' | 'overspent' | 'exceeded_projection';
  message: string;
  severity: 'low' | 'medium' | 'high';
  current_amount: number;
  budget_amount: number;
  progress_percentage: number;
}
