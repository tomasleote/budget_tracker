# Storage Configuration Guide

## Overview

The Budget Tracker backend now supports two storage modes:
1. **localStorage** (default) - File-based storage for development/testing
2. **database** - Supabase PostgreSQL for production

## Quick Start

By default, the application uses localStorage, so you can start developing immediately without database setup:

```bash
npm install
npm run dev
```

## Configuration

### Using localStorage (Default)

Set in your `.env` file:
```env
STORAGE_MODE=localStorage
LOCALSTORAGE_PATH=./data
LOCALSTORAGE_PERSIST=true
```

- **STORAGE_MODE**: Set to `localStorage` to use file-based storage
- **LOCALSTORAGE_PATH**: Directory where data files are stored (default: `./data`)
- **LOCALSTORAGE_PERSIST**: Enable file persistence (set to `false` for in-memory only)

### Using Database (Supabase)

Set in your `.env` file:
```env
STORAGE_MODE=database
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

## How It Works

### Repository Factory Pattern

The application uses a Repository Factory pattern that automatically selects the appropriate repository implementation based on the `STORAGE_MODE`:

```typescript
// Automatically uses localStorage or database based on config
const categoryRepository = getCategoryRepository();
const transactionRepository = getTransactionRepository();
```

### LocalStorage Implementation

When using localStorage:
- Data is stored as JSON files in the configured directory
- Each entity type (categories, transactions, budgets) has its own file
- Files are automatically created on first write
- Data persists across server restarts (if `LOCALSTORAGE_PERSIST=true`)

File structure:
```
data/
  ├── categories.json
  ├── transactions.json
  ├── budgets.json
  └── ...
```

### Automatic Fallback

If database connection fails, the system automatically falls back to localStorage:
1. Attempts database connection
2. If failed, switches to localStorage mode
3. Seeds default data if needed
4. Continues operation without interruption

## Benefits

### For Development
- **No Database Setup Required**: Start coding immediately
- **Zero Configuration**: Works out of the box
- **Fast Iteration**: No network latency
- **Isolated Testing**: Each developer has their own data

### For Testing
- **Predictable State**: Easy to reset and control test data
- **CI/CD Friendly**: No external dependencies
- **Snapshot Testing**: Can version control test data

### For Production
- **Easy Migration**: Same API for both storage modes
- **Gradual Rollout**: Can switch between modes via environment variable
- **Backup Option**: localStorage can serve as emergency fallback

## API Compatibility

All endpoints work identically regardless of storage mode:

```javascript
// These work the same with localStorage or database
GET /api/categories
POST /api/transactions
PUT /api/budgets/:id
DELETE /api/categories/:id
```

## Data Management

### Clearing Data (localStorage)

To reset all data when using localStorage:
```bash
rm -rf ./data
```

Or programmatically:
```typescript
await repositoryFactory.clearAllData();
```

### Seeding Default Data

Default categories are automatically seeded on first run:
- 10 expense categories
- 6 income categories

### Backup and Restore

With localStorage, you can easily backup/restore data:
```bash
# Backup
cp -r ./data ./data-backup

# Restore
cp -r ./data-backup/* ./data/
```

## Performance Considerations

### LocalStorage Performance
- **Pros**: 
  - No network latency
  - Fast read/write operations
  - No connection pool limits
- **Cons**:
  - Not suitable for concurrent multi-instance deployments
  - Limited by file system performance
  - No built-in query optimization

### When to Use Each Mode

**Use localStorage when:**
- Developing locally
- Running tests
- Prototyping features
- Single-instance deployments
- Demo environments

**Use database when:**
- Production deployments
- Multi-instance deployments
- Need data persistence guarantees
- Require advanced queries
- Need user authentication

## Migration Guide

### From localStorage to Database

1. Export your data (future feature):
```bash
npm run export:data
```

2. Update `.env`:
```env
STORAGE_MODE=database
# Add Supabase credentials
```

3. Import data (future feature):
```bash
npm run import:data
```

### From Database to localStorage

1. Update `.env`:
```env
STORAGE_MODE=localStorage
```

2. Restart server - data will be fetched from database on first access

## Troubleshooting

### localStorage Issues

**Data not persisting:**
- Check `LOCALSTORAGE_PERSIST=true` in `.env`
- Verify write permissions for `LOCALSTORAGE_PATH`
- Check disk space

**Performance issues:**
- Consider reducing data size
- Enable in-memory only mode (`LOCALSTORAGE_PERSIST=false`)
- Implement pagination for large datasets

### Database Issues

**Connection failures:**
- Verify Supabase credentials
- Check network connectivity
- System auto-falls back to localStorage

## Future Enhancements

- [ ] Data export/import tools
- [ ] Automatic sync between storage modes
- [ ] Data compression for localStorage
- [ ] Redis cache integration
- [ ] SQLite option for local database
