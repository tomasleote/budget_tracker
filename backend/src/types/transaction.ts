export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category_id: string;
  date: string; // ISO date string
  created_at: string;
  updated_at: string;
}

export interface TransactionWithCategory extends Transaction {
  category: {
    id: string;
    name: string;
    type: 'income' | 'expense';
    color: string;
    icon: string;
  };
}

export interface CreateTransactionDto {
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category_id: string;
  date: string; // ISO date string
}

export interface UpdateTransactionDto {
  type?: 'income' | 'expense';
  amount?: number;
  description?: string;
  category_id?: string;
  date?: string; // ISO date string
}

export interface TransactionQuery {
  page?: number;
  limit?: number;
  type?: 'income' | 'expense';
  category_id?: string;
  start_date?: string; // ISO date string
  end_date?: string; // ISO date string
  min_amount?: number;
  max_amount?: number;
  search?: string; // Search in description
  sort?: 'date' | 'amount' | 'description' | 'created_at';
  order?: 'asc' | 'desc';
  include_category?: boolean;
}

export interface TransactionSummary {
  total_transactions: number;
  total_income: number;
  total_expenses: number;
  net_amount: number;
  average_transaction: number;
  date_range: {
    start: string;
    end: string;
  };
}

// Filter shape used by the localStorage repository layer. Distinct from
// TransactionQuery (the HTTP query DTO) - it uses date_from/date_to/amount_min/
// amount_max rather than the API's start_date/end_date/min_amount/max_amount.
export interface TransactionFilters {
  type?: 'income' | 'expense';
  category_id?: string;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  search?: string;
}

// Richer summary produced by the localStorage layer. The API-facing
// TransactionSummary above is the contract returned by the service layer;
// this internal shape additionally tracks averages, extremes and category usage.
export interface LocalTransactionSummary {
  total_income: number;
  total_expense: number;
  balance: number;
  transaction_count: number;
  avg_income: number;
  avg_expense: number;
  largest_income: Transaction | null;
  largest_expense: Transaction | null;
  categories_used: Set<string>;
}

export interface BulkTransactionOperation {
  action: 'create' | 'update' | 'delete';
  transactions: (CreateTransactionDto | (UpdateTransactionDto & { id: string }) | { id: string })[];
}

export interface PaginatedTransactions {
  transactions: Transaction[] | TransactionWithCategory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  summary?: TransactionSummary;
}
