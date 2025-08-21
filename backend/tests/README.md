# Budget Tracker Backend - Testing Documentation

This document describes the comprehensive testing setup for the Budget Tracker backend application.

## Testing Framework

- **Jest**: Main testing framework
- **Supertest**: HTTP endpoint testing
- **TypeScript**: Full TypeScript support in tests
- **Coverage**: Code coverage reporting

## Test Structure

```
tests/
├── setup.ts                    # Global test setup and utilities
├── utils/
│   └── mockSupabase.ts         # Supabase mocking utilities
├── unit/
│   └── services/
│       ├── CategoryService.test.ts
│       ├── TransactionService.test.ts
│       ├── BudgetService.test.ts
│       └── AnalyticsService.test.ts
└── integration/
    └── categories.test.ts       # API endpoint integration tests
```

## Test Scripts

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

### Coverage Thresholds

The project maintains high code coverage standards:

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## Unit Tests

### Service Layer Tests

Each service has comprehensive unit tests covering:

#### CategoryService Tests
✅ Get categories with filtering
✅ Get category hierarchy
✅ Get category by ID
✅ Create category with validation
✅ Update category with business rules
✅ Delete category with constraints
✅ Bulk create categories
✅ Validate categories exist
✅ Cache management

#### TransactionService Tests
✅ Get transactions with pagination and filtering
✅ Get transaction by ID with/without category
✅ Create transaction with validation
✅ Update transaction with business rules
✅ Delete transaction
✅ Bulk create/delete transactions
✅ Transaction summary calculations
✅ Search transactions
✅ Get transactions by category

#### BudgetService Tests
✅ Get budgets with filtering and pagination
✅ Get budget by ID with/without progress
✅ Create budget with validation
✅ Update budget with business rules
✅ Delete budget
✅ Budget alerts generation
✅ Budget summary analytics
✅ Bulk create budgets
✅ Date calculations for different periods

#### AnalyticsService Tests
✅ Dashboard summary
✅ Spending insights
✅ Budget performance analysis
✅ Trends analysis
✅ Financial health score
✅ Comparison analysis between periods
✅ Date range calculations

## Integration Tests

### API Endpoint Tests

Integration tests cover complete request/response cycles for all major endpoints.

## Commands Summary

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm test CategoryService.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="create"
```

This testing setup ensures high code quality, comprehensive coverage, and reliable functionality across all backend services.