# API Layer

This directory contains the Axios-based client and service classes for communicating
with the backend. It is kept in the codebase but is not active in the current build.

The frontend uses localStorage repositories by default. This layer becomes active only
when `REACT_APP_USE_API=true` is set, which is reserved for a future backend
integration phase.

## Structure

    src/api/
      client.js               Axios instance with defaults and interceptors
      config.js               Base URL, timeout, and endpoint constants
      errors.js               Custom error classes (NetworkError, ValidationError, etc.)
      interceptors.js         Request/response interceptors
      index.js                Main export
      services/
        BaseApiService.js     Common CRUD operations
        CategoryService.js    Category-specific methods
        TransactionService.js
        BudgetService.js
        AnalyticsService.js
        index.js

## Activation

To enable this layer (for future development), add to `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_USE_API=true
```

`RepositoryFactory` (`src/model/repositories/RepositoryFactory.js`) reads
`REACT_APP_USE_API` and switches from localStorage repositories to the API
repositories in this directory.
