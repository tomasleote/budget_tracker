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
