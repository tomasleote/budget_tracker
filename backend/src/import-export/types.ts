export interface ImportOptions {
  format: 'csv' | 'xlsx';
  type: 'transactions' | 'categories' | 'budgets' | 'full';
  validateData?: boolean;
  skipDuplicates?: boolean;
  updateExisting?: boolean;
  dateFormat?: string; // e.g., 'YYYY-MM-DD', 'MM/DD/YYYY'
  delimiter?: string; // for CSV files
  encoding?: string; // file encoding
}

export interface ExportOptions {
  format: 'csv' | 'xlsx';
  type: 'transactions' | 'categories' | 'budgets' | 'full';
  dateRange?: {
    start_date: string;
    end_date: string;
  };
  includeHeaders?: boolean;
  includeMetadata?: boolean;
  customFields?: string[]; // specific fields to export
  filters?: {
    category_ids?: string[];
    transaction_types?: ('income' | 'expense')[];
    budget_periods?: ('weekly' | 'monthly' | 'yearly')[];
  };
}

export interface ImportResult {
  success: boolean;
  summary: {
    total_rows: number;
    processed: number;
    imported: number;
    updated: number;
    skipped: number;
    errors: number;
  };
  data?: {
    transactions?: any[];
    categories?: any[];
    budgets?: any[];
  };
  errors?: ImportError[];
  warnings?: ImportWarning[];
  execution_time_ms: number;
}

export interface ExportResult {
  success: boolean;
  file_name: string;
  file_size: number;
  format: 'csv' | 'xlsx';
  summary: {
    transactions?: number;
    categories?: number;
    budgets?: number;
    total_records: number;
  };
  download_url?: string;
  metadata?: {
    exported_at: string;
    date_range?: {
      start: string;
      end: string;
    };
    filters_applied?: any;
  };
  execution_time_ms: number;
}

export interface ImportError {
  row: number;
  field?: string;
  value?: any;
  error_code: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ImportWarning {
  row: number;
  field?: string;
  value?: any;
  warning_code: string;
  message: string;
}

export interface DataValidationResult {
  isValid: boolean;
  errors: ImportError[];
  warnings: ImportWarning[];
  summary: {
    total_rows: number;
    valid_rows: number;
    rows_with_errors: number;
    rows_with_warnings: number;
  };
}

export interface TemplateOptions {
  type: 'transactions' | 'categories' | 'budgets';
  format: 'csv' | 'xlsx';
  includeExamples?: boolean;
  includeInstructions?: boolean;
}

export interface TemplateResult {
  file_name: string;
  format: 'csv' | 'xlsx';
  headers: string[];
  example_data?: any[];
  instructions?: string[];
  download_url?: string;
}

// Field mapping for different data types
export interface FieldMapping {
  transactions: {
    type: string; // 'income' | 'expense'
    amount: string;
    description: string;
    category: string; // category name or ID
    date: string;
  };
  categories: {
    name: string;
    type: string; // 'income' | 'expense'
    color: string;
    icon: string;
    description?: string;
    parent_category?: string;
  };
  budgets: {
    category: string; // category name or ID
    amount: string;
    period: string; // 'weekly' | 'monthly' | 'yearly'
    start_date: string;
    end_date?: string;
  };
}

// Standard field mappings for different formats
export const STANDARD_FIELD_MAPPINGS: Record<string, FieldMapping> = {
  default: {
    transactions: {
      type: 'Type',
      amount: 'Amount',
      description: 'Description',
      category: 'Category',
      date: 'Date'
    },
    categories: {
      name: 'Name',
      type: 'Type',
      color: 'Color',
      icon: 'Icon',
      description: 'Description',
      parent_category: 'Parent Category'
    },
    budgets: {
      category: 'Category',
      amount: 'Budget Amount',
      period: 'Period',
      start_date: 'Start Date',
      end_date: 'End Date'
    }
  }
};

// Error codes for validation
export const IMPORT_ERROR_CODES = {
  INVALID_FORMAT: 'INVALID_FORMAT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FIELD_VALUE: 'INVALID_FIELD_VALUE',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  CATEGORY_NOT_FOUND: 'CATEGORY_NOT_FOUND',
  INVALID_DATE_FORMAT: 'INVALID_DATE_FORMAT',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  INVALID_TYPE: 'INVALID_TYPE',
  INVALID_PERIOD: 'INVALID_PERIOD',
  OVERLAPPING_BUDGET: 'OVERLAPPING_BUDGET',
  CIRCULAR_CATEGORY_REFERENCE: 'CIRCULAR_CATEGORY_REFERENCE',
  EXCEEDS_MAX_ROWS: 'EXCEEDS_MAX_ROWS',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  UNSUPPORTED_FILE_TYPE: 'UNSUPPORTED_FILE_TYPE'
} as const;

// Warning codes
export const IMPORT_WARNING_CODES = {
  MISSING_OPTIONAL_FIELD: 'MISSING_OPTIONAL_FIELD',
  DATA_TRUNCATED: 'DATA_TRUNCATED',
  AUTO_CORRECTED_VALUE: 'AUTO_CORRECTED_VALUE',
  DUPLICATE_SKIPPED: 'DUPLICATE_SKIPPED',
  CATEGORY_AUTO_CREATED: 'CATEGORY_AUTO_CREATED'
} as const;

// Configuration limits
export const IMPORT_LIMITS = {
  MAX_FILE_SIZE_MB: 10,
  MAX_ROWS_CSV: 10000,
  MAX_ROWS_XLSX: 5000,
  MAX_BATCH_SIZE: 100,
  SUPPORTED_ENCODINGS: ['utf8', 'latin1', 'ascii'],
  SUPPORTED_DATE_FORMATS: [
    'YYYY-MM-DD',
    'MM/DD/YYYY',
    'DD/MM/YYYY',
    'YYYY/MM/DD',
    'MM-DD-YYYY',
    'DD-MM-YYYY'
  ]
} as const;
