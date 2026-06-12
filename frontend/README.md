# Budget Tracker -- Frontend

A React 18 single-page app for personal finance management, written in plain
JavaScript/JSX (not TypeScript) and bootstrapped with Create React App. All data is
persisted in the browser's `localStorage`. No backend or database is required to run
the app.

## Architecture

MVC-style layering with shared state held in React Context providers:

- **Model** (`src/model/`) -- entities, repositories (localStorage), services, transformers
- **View** (`src/view/`) -- pages, components, and the theme class library
- **Controller** (`src/controller/`) -- context providers, custom hooks, utilities

## Getting Started

**Prerequisites:** Node.js 18+ and npm 8+

```bash
cd frontend
npm install
npm start          # dev server at http://localhost:3000
```

No `.env` file is required. The app runs in localStorage mode by default.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start the development server on port 3000 |
| `npm run build` | Create a production build in `build/` |
| `npm test` | Run the Create React App test runner |

## Project Structure

    frontend/src/
      model/                    Data layer
        entities/               Domain entities (Transaction, Category, Budget, User)
        repositories/           localStorage repositories + RepositoryFactory
          api/                  API repositories (kept for future backend, not active)
        services/               Business logic and data initialisation
        transformers/           Data transformation helpers
      view/                     Presentation layer
        components/             Reusable UI and feature components
        pages/                  Dashboard, Transactions, Budget, Reports, Settings
        themes.css              Theme class library (color and surface tokens)
      controller/               Control layer
        context/                React Context providers (shared state)
        hooks/                  Custom hooks (useTransactions, useDashboard, useUser, ...)
        utils/                  Helpers, formatters, calculations, logger
      api/                      Axios client and API services (kept, not active)
      App.js                    Routes and providers
      index.js                  Entry point

## Styling

- **Layout** (flex, grid, spacing, sizing): Tailwind CSS utility classes.
- **Color and surfaces**: theme classes from `view/themes.css` (`.card-theme`,
  `.input-theme`, `.btn-theme-primary`, ...).

Theme (light/dark) is applied once at the provider level via
`document.documentElement[data-theme]`. No component sets it directly.

## Data Source: REACT_APP_USE_API

`RepositoryFactory` (`src/model/repositories/RepositoryFactory.js`) selects the
data source based on the environment variable:

- **Unset or `false` (default):** localStorage repositories. This is the only
  supported mode today.
- **`true`:** API repositories. Reserved for future backend integration. The backend
  is not wired to the frontend yet, so keep this unset.

## Roadmap

- Enable the Express/Supabase backend through the existing API repositories behind
  `REACT_APP_USE_API=true`.
