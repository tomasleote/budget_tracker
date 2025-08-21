# Data Management Scripts

This document explains how to use the data management scripts to populate your Budget Tracker database with realistic test data.

## Overview

The data management system provides:
- **Realistic test data generation** for 1, 3, 6, or 12 months
- **Smart spending patterns** based on real category behaviors
- **Flexible data cleanup** and database reset options
- **Data integrity verification** to ensure consistency

## Quick Start Commands

### Generate Test Data

```bash
# Generate 3 months of data (default)
npm run data:populate-3m

# Generate 1 month of data
npm run data:populate-1m

# Generate 6 months of data
npm run data:populate-6m

# Generate 12 months of data
npm run data:populate-12m
```

### Data Management

```bash
# Delete all transactions and budgets (keep categories)
npm run data:delete

# Complete database reset (keep only default categories)
npm run data:reset

# Show current database summary
npm run data:summary

# Verify data integrity
npm run data:verify
```

### Advanced Usage (CLI)

```bash
# Custom data generation with CLI
npm run data populate --months 6 --variability high --include-weekends

# Custom start date
npm run data populate --months 3 --start-date 2025-01-01

# Different variability levels
npm run data populate --months 1 --variability low    # Consistent spending
npm run data populate --months 1 --variability medium # Normal variance (default)
npm run data populate --months 1 --variability high   # High variance
```

## Generated Data Details

### Transactions

The system generates realistic transactions across these categories:

**Expense Categories:**
- **Groceries** - 8 transactions/month, ~$120 average
- **Dining Out** - 6 transactions/month, ~$45 average  
- **Transportation** - 12 transactions/month, ~$80 average
- **Utilities** - 1 transaction/month, ~$150 average
- **Entertainment** - 4 transactions/month, ~$60 average
- **Healthcare** - 1.5 transactions/month, ~$200 average
- **Shopping** - 3 transactions/month, ~$100 average
- **Education** - 0.5 transactions/month, ~$300 average
- **Insurance** - 1 transaction/month, ~$250 average
- **Miscellaneous** - 3 transactions/month, ~$75 average

**Income Categories:**
- **Salary** - 1 transaction/month, ~$4,500 average
- **Freelance** - 2 transactions/month, ~$800 average
- **Investments** - 1 transaction/month, ~$200 average
- **Side Business** - 1.5 transactions/month, ~$500 average
- **Gifts** - 0.5 transactions/month, ~$150 average
- **Other Income** - 0.3 transactions/month, ~$100 average

### Budgets

- **Automatic budget creation** for all expense categories
- **Smart budget amounts** (110-130% of expected monthly spending)
- **Current month period** with proper start/end dates
- **Realistic budget limits** based on spending patterns

### Descriptions

The system generates contextual descriptions such as:
- "Weekly groceries - Walmart"
- "Restaurant dinner - Local Restaurant"
- "Gas station - Transportation"
- "Monthly salary - Paycheck"

## Data Patterns & Realism

### Spending Variability
- **Low variability** - Consistent, predictable spending
- **Medium variability** - Normal month-to-month variance (default)
- **High variability** - Irregular spending with larger fluctuations

### Smart Features
- **Weekend patterns** - Work-related expenses skip weekends (optional)
- **Monthly cycles** - Utilities and salary follow monthly patterns
- **Seasonal variance** - Random but realistic amount fluctuations
- **Category-appropriate** descriptions and amounts

## Example Workflows

### Setting Up Test Environment

```bash
# 1. Start with clean database
npm run data:reset

# 2. Generate 6 months of realistic data
npm run data:populate-6m

# 3. Verify everything looks good
npm run data:summary
npm run data:verify
```

### Testing Different Scenarios

```bash
# Test with minimal data (1 month)
npm run data:delete
npm run data:populate-1m

# Test with extensive history (12 months)
npm run data:delete
npm run data:populate-12m

# Test with high spending variance
npm run data:delete
npm run data populate --months 3 --variability high
```

### Development Workflow

```bash
# Quick reset and populate for development
npm run data:reset && npm run data:populate-3m

# Check current state
npm run data:summary
```

## Data Verification

The verification system checks for:
- **Orphaned transactions** (transactions without valid categories)
- **Orphaned budgets** (budgets without valid expense categories)
- **Overlapping budgets** (multiple budgets for same category/period)
- **Data consistency** (proper foreign key relationships)

```bash
# Run verification
npm run data:verify

# Example output
✅ Data integrity verification passed!
```

## Database Summary Format

```json
{
  "categories": 16,
  "transactions": 847,
  "budgets": 10,
  "date_range": {
    "earliest": "2024-12-26",
    "latest": "2025-06-26"
  }
}
```

## Error Handling

The scripts include comprehensive error handling:
- **Database connection** validation
- **Category existence** verification before transaction generation
- **Transaction batching** to handle large datasets
- **Graceful failure** with detailed error messages
- **Data integrity** checks before and after operations

## Performance Notes

- **Batch processing** - Transactions inserted in batches of 50
- **Optimized queries** - Efficient database operations
- **Progress logging** - Real-time feedback during generation
- **Memory efficient** - Handles large datasets without memory issues

## Troubleshooting

### Common Issues

1. **"No categories found"** - Run database migrations and seed default categories first
2. **Database connection errors** - Check your `.env` file and Supabase credentials  
3. **Permission errors** - Ensure your Supabase service role key has proper permissions

### Debug Mode

Add `LOG_LEVEL=debug` to your `.env` file for detailed logging during script execution.

### Data Cleanup

If you encounter issues, you can always reset and start fresh:

```bash
npm run data:reset
npm run data:populate-3m
```

This ensures a clean state with fresh, consistent test data.
