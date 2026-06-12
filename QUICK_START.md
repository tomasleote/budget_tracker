# Budget Tracker -- Quick Start

The app runs entirely in the browser using `localStorage`. No backend or database
setup is needed.

## Run it

```bash
cd frontend
npm install
npm start
```

Open http://localhost:3000. Data is saved in the browser's `localStorage`.

## Production build

```bash
cd frontend
npm run build      # static assets written to frontend/build/
```

## How data is stored

The frontend reads and writes through a repository layer. `RepositoryFactory`
(`frontend/src/model/repositories/RepositoryFactory.js`) picks the implementation
based on the `REACT_APP_USE_API` environment variable:

| `REACT_APP_USE_API` | Data source | Status |
|---|---|---|
| unset or `false` (default) | Browser `localStorage` | Supported today |
| `true` | Backend API repositories | Not yet wired -- reserved for future work |

You do not need a `.env` file. If you want to be explicit, create `frontend/.env`:

```env
REACT_APP_USE_API=false
```

The Express/Supabase backend in `backend/` exists but is not connected to the
frontend yet. Setting `REACT_APP_USE_API=true` is reserved for a future integration
phase.

## Troubleshooting

**App won't start / port in use**
- Make sure port 3000 is free, then re-run `npm start`.

**Data not persisting**
- `localStorage` is per-browser and per-origin. Clearing browser data (or using a
  different browser or incognito window) resets it.

**Dependency or build errors**
- Delete `frontend/node_modules` and run `npm install` again with Node.js 18+.

## More

- [Frontend README](frontend/README.md) -- architecture and structure
- [Root README](README.md) -- project overview and roadmap
