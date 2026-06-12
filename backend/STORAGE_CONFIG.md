# Backend Storage Configuration

The backend supports two storage modes, selected via the `STORAGE_MODE` environment
variable.

## Modes

### localStorage (default)

Data is written as JSON files on the local filesystem.

```env
STORAGE_MODE=localStorage
LOCALSTORAGE_PATH=./data
LOCALSTORAGE_PERSIST=true
```

- `LOCALSTORAGE_PATH`: Directory where JSON files are stored (default: `./data`).
- `LOCALSTORAGE_PERSIST`: Set to `false` for in-memory only (no file writes).

File layout when active:

    data/
      categories.json
      transactions.json
      budgets.json

### database (Supabase)

```env
STORAGE_MODE=database
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

## How It Works

`RepositoryFactory` reads `STORAGE_MODE` at startup and returns the correct
repository implementation. All API endpoints behave identically in both modes.

If the database connection fails at startup, the server falls back to localStorage
automatically.

## Default Data

Default categories (10 expense, 6 income) are seeded automatically on first run.

## Data Management

### Clear localStorage data

```bash
rm -rf ./data
```

### Backup and restore

```bash
cp -r ./data ./data-backup     # backup
cp -r ./data-backup/* ./data/  # restore
```

## Switching Modes

Update `STORAGE_MODE` in `.env` and restart the server. No code changes are needed.

Data migration between modes (export/import tooling) is a planned future enhancement.

## Trade-offs

**localStorage mode:**
- No external dependencies, fast for development and testing.
- Not suitable for concurrent multi-instance deployments.

**Database mode:**
- Suitable for production and multi-instance deployments.
- Requires a Supabase project and valid credentials.
