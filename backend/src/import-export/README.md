# Import/Export Module

This module provides comprehensive data import and export functionality for the Budget Tracker application.

## Features

### Import
- **Formats**: CSV and Excel (.xlsx)
- **Data Types**: Transactions, Categories, Budgets, or Full database
- **Validation**: Row-by-row validation with detailed error reporting
- **Options**:
  - Skip duplicates
  - Update existing records
  - Custom date formats
  - Multiple encodings (UTF-8, Latin1, ASCII)

### Export
- **Formats**: CSV and Excel (.xlsx)
- **Data Types**: Single type or full database export
- **Filtering**: Date range, categories, transaction types, budget periods
- **Options**:
  - Include/exclude headers
  - Add metadata (Excel only)
  - Custom field selection

### Templates
- Ready-to-use import templates
- Example data and instructions
- Available in both CSV and Excel formats

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/import-export/config` | Get configuration and limits |
| POST | `/api/import-export/import` | Import data from file |
| GET | `/api/import-export/export` | Export data to file |
| GET | `/api/import-export/export/info` | Get export metadata |
| GET | `/api/import-export/template/{type}` | Download templates |
| POST | `/api/import-export/validate` | Validate file structure |

## Usage Examples

### Import Transactions
```bash
curl -X POST http://localhost:3001/api/import-export/import \
  -F "file=@transactions.csv" \
  -F "type=transactions" \
  -F "validateData=true" \
  -F "skipDuplicates=true"
```

### Export Full Database
```bash
curl "http://localhost:3001/api/import-export/export?format=xlsx&type=full" \
  --output budget_export.xlsx
```

### Download Template
```bash
curl "http://localhost:3001/api/import-export/template/transactions?format=csv" \
  --output transactions_template.csv
```

## File Formats

### CSV Headers
**Transactions**: Type, Amount, Description, Category, Date
**Categories**: Name, Type, Color, Icon, Description, Parent Category
**Budgets**: Category, Budget Amount, Period, Start Date, End Date

### Excel Sheets
- Multiple sheets for different data types
- Formatting and data validation
- Instructions sheet with guidelines

## Validation Rules

### Transactions
- Type must be "income" or "expense"
- Amount must be positive number
- Description is required (max 200 chars)
- Category must exist in database
- Date must be valid format

### Categories
- Name must be unique per type
- Type must be "income" or "expense"
- Color must be valid hex code
- Icon must be specified
- Parent category must exist (if specified)

### Budgets
- Category must be expense type
- Amount must be positive
- Period must be "weekly", "monthly", or "yearly"
- Start date is required
- No overlapping budgets for same category

## Error Handling

The system provides detailed error reporting:
- Row-level error tracking
- Field-specific validation messages
- Warning vs error classification
- Import summary with counts
- Helpful suggestions for corrections

## Security & Performance

- File size limits (10MB)
- Rate limiting (5 imports/min, 10 exports/min)
- File type validation
- Batch processing for large files
- Automatic temporary file cleanup
