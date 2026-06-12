# Budget Tracker -- Backend

A Node.js/TypeScript API for the Budget Tracker application, built with Express and
Supabase (PostgreSQL). The frontend does not call this backend yet; wiring it up is a
roadmap item.

## Stack

- Node.js 18+, TypeScript
- Express
- Supabase (PostgreSQL)
- Joi for input validation
- Winston for logging
- Jest for testing

## Architecture

Requests flow through a layered structure:

    Routes -> Controllers -> Services -> Repositories -> Supabase

Each layer has a single responsibility: routes define endpoints, controllers handle
HTTP concerns, services contain business rules, and repositories abstract database
access.

## Project Structure

    backend/src/
      routes/              Express route definitions
      controllers/         HTTP request handlers
      services/            Business logic layer
      repositories/        Data access layer (Supabase)
      middleware/          Error handling, validation, rate limiting, caching
      config/              App, database, logger, and Swagger configuration
      types/               TypeScript interfaces
      utils/               Shared validation helpers
      scripts/             Data population and CLI tools
      import-export/       CSV and Excel import/export
      app.ts               Express app setup
      server.ts            Server entry point

## Getting Started

**Prerequisites:** Node.js 18+, npm 8+, a Supabase project.

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```env
NODE_ENV=development
PORT=3001
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
CORS_ORIGINS=http://localhost:3000
```

Seed default categories (optional):

```bash
npm run seed
```

Start the development server:

```bash
npm run dev       # hot reload on port 3001
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled production server |
| `npm test` | Run all tests |
| `npm run test:unit` | Unit tests only |
| `npm run test:integration` | Integration tests only |
| `npm run test:coverage` | Generate coverage report |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run seed` | Seed default categories |
| `npm run populate` | Add sample transaction data |

### Data management CLI

```bash
npm run data:populate-1m   # 1 month of data
npm run data:populate-3m   # 3 months
npm run data:populate-6m   # 6 months
npm run data:populate-12m  # 12 months
npm run data:delete        # delete all data
npm run data:reset         # reset to default state
npm run data:summary       # print a database summary
npm run data:verify        # verify data integrity
```

## API Endpoints

### Health

```
GET /health
GET /api-docs    (Swagger UI)
```

### Categories (`/api/categories`)

```
GET    /api/categories
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id
POST   /api/categories/bulk
```

### Transactions (`/api/transactions`)

```
GET    /api/transactions
POST   /api/transactions
PUT    /api/transactions/:id
DELETE /api/transactions/:id
GET    /api/transactions/summary
GET    /api/transactions/search
POST   /api/transactions/bulk
```

## Database Schema

### categories

```sql
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(255) NOT NULL,
  type        VARCHAR(10) CHECK (type IN ('income', 'expense')) NOT NULL,
  color       VARCHAR(7) NOT NULL,
  icon        VARCHAR(50) NOT NULL,
  description TEXT,
  is_default  BOOLEAN DEFAULT false,
  is_active   BOOLEAN DEFAULT true,
  parent_id   UUID REFERENCES categories(id),
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### transactions

```sql
CREATE TABLE transactions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type        VARCHAR(10) CHECK (type IN ('income', 'expense')) NOT NULL,
  amount      DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  description VARCHAR(255) NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id),
  date        DATE NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Configuration Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment | development | No |
| `PORT` | Server port | 3001 | No |
| `SUPABASE_URL` | Supabase project URL | - | Yes |
| `SUPABASE_ANON_KEY` | Supabase anon key | - | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | - | Yes |
| `CORS_ORIGINS` | Allowed CORS origins | http://localhost:3000 | No |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | 900000 | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 | No |

## Security

The middleware stack includes Helmet.js (security headers), CORS, rate limiting, Joi
input validation, and centralised error handling.

## Logging

Winston is configured with separate error and combined log files plus a console
transport. Log level is controlled via `LOG_LEVEL` (defaults to `info`).
