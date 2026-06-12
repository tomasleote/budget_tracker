# Budget Tracker

A personal finance web app for tracking transactions, categories, and budgets. The
frontend runs entirely in the browser using localStorage. An Express/Supabase backend
exists in this repository but is not yet wired to the frontend (see Roadmap).

## Tech Stack

**Frontend (active):**
- React 18, Create React App, plain JavaScript/JSX (not TypeScript)
- React Router 6
- Tailwind CSS for layout utilities, plus a theme class library in `view/themes.css`
- Recharts for data visualisation
- Persistence: browser `localStorage` via a repository layer

**Backend (present, not wired to the frontend yet):**
- Node.js, Express, TypeScript
- Supabase (PostgreSQL)

## Project Structure

    budget_tracker/
      frontend/          React 18 app (JavaScript/JSX) -- the active application
      backend/           Node.js + Express + TypeScript + Supabase API
      package.json       Root helper scripts that proxy to frontend/
      README.md

### Frontend source layout

    frontend/src/
      model/              Data layer
        entities/         Domain entities (Transaction, Category, Budget, User)
        repositories/     localStorage repos + RepositoryFactory
          api/            API repositories (kept for future backend wiring)
        services/         Business logic and data initialisation
        transformers/     Data transformation helpers
      view/               Presentation layer
        components/       Reusable UI and feature components
        pages/            Dashboard, Transactions, Budget, Reports, Settings
        themes.css        Theme class library (color and surface tokens)
      controller/         Control layer
        context/          React Context providers (shared app state)
        hooks/            Custom hooks (useTransactions, useDashboard, useUser, ...)
        utils/            Helpers, formatters, calculations, logger
      api/                Axios client and API services (kept, not active)
      App.js              Routes and providers
      index.js            Entry point

## Getting Started

**Prerequisites:** Node.js 18+ and npm 8+

```bash
cd frontend
npm install
npm start        # dev server at http://localhost:3000
```

No backend, no database, no `.env` file required. Data is stored in the browser's
`localStorage`.

## Available Scripts

From `frontend/`:

| Script | Description |
|--------|-------------|
| `npm start` | Start the development server on port 3000 |
| `npm run build` | Create a production build in `frontend/build/` |
| `npm test` | Run the Create React App test runner |

From the repo root (proxies to `frontend/`):

```bash
npm start
npm run build
```

## Architecture Notes

The frontend uses a repository pattern. `RepositoryFactory`
(`frontend/src/model/repositories/RepositoryFactory.js`) selects the data source
based on the `REACT_APP_USE_API` environment variable:

- **Unset or `false` (default):** localStorage repositories. This is the only
  supported mode today. No `.env` file needed.
- **`true`:** API repositories. Reserved for future backend integration. The backend
  is not connected to the frontend yet, so this path is not usable for normal runs.

To be explicit, you can create `frontend/.env`:

```env
REACT_APP_USE_API=false
```

## Roadmap

- Wire the Express/Supabase backend to the frontend via the existing API repositories,
  gated behind `REACT_APP_USE_API=true`.
- Data migration path from localStorage to the backend database.
- Production deployment configuration.

## Backend

The `backend/` directory contains a standalone Express + Supabase API. It can be run
independently but the frontend does not call it yet. See `backend/README.md` for
setup instructions.
