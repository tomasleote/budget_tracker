# API Module Documentation

## Overview
This module provides a complete API client layer for the Budget Tracker application, handling all communication with the backend services.

## Structure

```
src/api/
├── client.js          # Axios instance with configured defaults
├── config.js          # API configuration and endpoints
├── errors.js          # Custom error classes and error handling
├── interceptors.js    # Request/response interceptors
├── index.js          # Main export file
└── services/         # API service classes
    ├── BaseApiService.js      # Base class with common CRUD operations
    ├── CategoryService.js     # Category-specific operations
    ├── TransactionService.js  # Transaction-specific operations
    ├── BudgetService.js      # Budget-specific operations
    ├── AnalyticsService.js   # Analytics-specific operations
    └── index.js              # Services export file
```

## Usage

### Basic Usage

```javascript
import API from './api';

// Using the default export
const categories = await API.services.categories.getAllCategories();

// Or import specific services
import { categoryService, transactionService } from './api';

const transactions = await transactionService.getAllTransactions({
  page: 1,
  limit: 20,
  type: 'expense'
});
```

### Error Handling

```javascript
import { getUserFriendlyErrorMessage } from './api';

try {
  const result = await transactionService.createTransaction(data);
  console.log('Success:', result);
} catch (error) {
  const message = getUserFriendlyErrorMessage(error);
  console.error('Error:', message);
  
  // Check specific error types
  if (error instanceof ValidationError) {
    console.error('Validation errors:', error.details.errors);
  }
}
```

### Configuration

Create a `.env` file in the project root:

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_API_TIMEOUT=30000
REACT_APP_USE_API=true
```

## API Services

### CategoryService

```javascript
// Get all categories
const categories = await categoryService.getAllCategories();

// Get categories by type
const expenseCategories = await categoryService.getCategoriesByType('expense');

// Create a category
const newCategory = await categoryService.createCategory({
  name: 'Groceries',
  type: 'expense',
  color: '#22C55E',
  icon: 'fas fa-shopping-cart'
});

// Update a category
const updated = await categoryService.updateCategory(categoryId, {
  name: 'Updated Name'
});

// Delete a category
await categoryService.deleteCategory(categoryId);
```

### TransactionService

```javascript
// Get all transactions with filters
const transactions = await transactionService.getAllTransactions({
  page: 1,
  limit: 20,
  type: 'expense',
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  categoryId: 'uuid-here',
  sort: 'date',
  order: 'desc'
});

// Create a transaction
const newTransaction = await transactionService.createTransaction({
  type: 'expense',
  amount: 50.00,
  description: 'Grocery shopping',
  categoryId: 'category-uuid',
  date: new Date().toISOString()
});

// Get transaction summary
const summary = await transactionService.getTransactionSummary(startDate, endDate);

// Search transactions
const results = await transactionService.searchTransactions('coffee', 10);
```

### BudgetService

```javascript
// Get all budgets
const budgets = await budgetService.getAllBudgets({
  isActive: true,
  includeProgress: true
});

// Create a budget
const newBudget = await budgetService.createBudget({
  name: 'Monthly Groceries',
  amount: 500,
  categoryId: 'category-uuid',
  period: 'monthly',
  startDate: '2024-01-01',
  alertThreshold: 80
});

// Get budget progress
const progress = await budgetService.getBudgetProgress(budgetId);

// Get budget alerts
const alerts = await budgetService.getBudgetAlerts(80); // 80% threshold
```

### AnalyticsService

```javascript
// Get analytics overview
const overview = await analyticsService.getOverview({
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  groupBy: 'month'
});

// Get spending trends
const trends = await analyticsService.getSpendingTrends({
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  interval: 'daily'
});

// Get category analytics
const categoryStats = await analyticsService.getCategoryAnalytics({
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  type: 'expense',
  limit: 10
});

// Get insights
const insights = await analyticsService.getInsights({
  startDate: '2024-01-01',
  endDate: '2024-12-31'
});
```

## Features

### Automatic Retry
Failed requests are automatically retried with exponential backoff for network errors and server errors (5xx).

### Request/Response Interceptors
- Automatic token attachment (when implemented)
- Request ID generation for tracking
- Response time logging
- Error transformation

### Error Handling
Custom error classes provide detailed information:
- `NetworkError` - Network connectivity issues
- `TimeoutError` - Request timeout
- `ValidationError` - Input validation errors
- `NotFoundError` - Resource not found
- `ServerError` - Server-side errors

### Performance Monitoring
All requests are timed and logged in development mode for performance monitoring.

## Testing

Use the included test utility:

```javascript
import { runAllApiTests } from './testApi';

// Run all API tests
const results = await runAllApiTests();
```

This will test:
- API connection
- Category fetching
- Transaction creation and deletion

## Best Practices

1. **Always handle errors**: Use try-catch blocks and provide user feedback
2. **Use pagination**: For large datasets, always use pagination
3. **Cache when appropriate**: Consider implementing caching for rarely-changing data
4. **Monitor performance**: Check console logs in development for slow requests
5. **Validate input**: Services validate data before sending to API

## Migration from localStorage

To migrate from localStorage to API:

1. Update repository imports to use API services
2. Replace synchronous calls with async/await
3. Add proper error handling
4. Update loading states in UI

Example migration:

```javascript
// Before (localStorage)
const transactions = transactionRepository.getAll();

// After (API)
try {
  setIsLoading(true);
  const response = await transactionService.getAllTransactions();
  setTransactions(response.data);
} catch (error) {
  setError(getUserFriendlyErrorMessage(error));
} finally {
  setIsLoading(false);
}
```
