# Budget Tracker - Quick Start Guide

## 🚀 Quick Fix for "Loading Dashboard..." Issue

If your dashboard is stuck loading forever, follow these steps:

### Solution: Use localStorage Mode (Default)

1. **Frontend Configuration** - Edit `frontend/.env`:
   ```env
   REACT_APP_USE_API=false  # Use localStorage instead of API
   ```

2. **Backend Configuration** - Edit `backend/.env`:
   ```env
   STORAGE_MODE=localStorage  # Use localStorage instead of database
   ```

3. **Restart Both Servers**:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend  
   cd frontend
   npm start
   ```

Your dashboard should now load instantly! ✨

## 📖 Understanding Storage Modes

The Budget Tracker supports two storage modes:

### 1. **localStorage Mode** (Recommended for Development)
- **Frontend**: Stores data in browser localStorage
- **Backend**: Stores data in JSON files
- **Benefits**: No database setup required, works immediately
- **Use When**: Developing, testing, or demonstrating

### 2. **API/Database Mode** (For Production)
- **Frontend**: Makes API calls to backend
- **Backend**: Uses Supabase PostgreSQL
- **Benefits**: Multi-user support, data persistence
- **Use When**: Deploying to production

## 🔧 Configuration Options

### Frontend Storage Configuration

Edit `frontend/.env`:

```env
# localStorage Mode (No backend needed)
REACT_APP_USE_API=false

# API Mode (Requires backend running)
REACT_APP_USE_API=true
REACT_APP_API_URL=http://localhost:3001/api
```

### Backend Storage Configuration

Edit `backend/.env`:

```env
# localStorage Mode (No database needed)
STORAGE_MODE=localStorage
LOCALSTORAGE_PATH=./data
LOCALSTORAGE_PERSIST=true

# Database Mode (Requires Supabase)
STORAGE_MODE=database
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

## 🎯 Common Scenarios

### Scenario 1: Just Want to Try the App
```env
# Frontend/.env
REACT_APP_USE_API=false

# No backend needed! Just run:
cd frontend && npm start
```

### Scenario 2: Develop with Backend (No Database)
```env
# Frontend/.env
REACT_APP_USE_API=true

# Backend/.env
STORAGE_MODE=localStorage

# Run both:
cd backend && npm run dev
cd frontend && npm start
```

### Scenario 3: Full Stack with Database
```env
# Frontend/.env
REACT_APP_USE_API=true

# Backend/.env
STORAGE_MODE=database
# Add Supabase credentials

# Run both:
cd backend && npm run dev
cd frontend && npm start
```

## 🐛 Troubleshooting

### Dashboard Stuck Loading?

**Symptoms:**
- Loading spinner never stops
- "Loading Dashboard..." message persists
- No data appears

**Causes & Solutions:**

1. **API Mode with No Backend**
   - Solution: Set `REACT_APP_USE_API=false` in frontend

2. **Backend Can't Connect to Database**
   - Solution: Set `STORAGE_MODE=localStorage` in backend

3. **CORS Issues**
   - Solution: Ensure backend allows frontend origin in CORS settings

4. **Port Conflicts**
   - Frontend should run on port 3000
   - Backend should run on port 3001

### Data Not Persisting?

**localStorage Mode:**
- Frontend: Data persists in browser (clear with DevTools)
- Backend: Check `./data` folder has write permissions

**Database Mode:**
- Check Supabase credentials are correct
- Verify database tables exist

## 📊 Storage Mode Comparison

| Feature | localStorage | Database |
|---------|-------------|----------|
| Setup Required | None | Supabase account |
| Data Location | Browser/Files | Cloud |
| Multi-User | No | Yes |
| Data Persistence | Device-specific | Universal |
| Performance | Fast (local) | Network-dependent |
| Best For | Development | Production |

## 🎉 Getting Started - Zero Config

Want to start immediately with zero configuration?

```bash
# 1. Clone the repo
git clone [repo-url]

# 2. Install dependencies
cd budget_tracker/frontend
npm install

# 3. Start the app (localStorage mode)
npm start
```

That's it! The app will open at http://localhost:3000 with localStorage mode enabled.

## 📚 Advanced Configuration

### Switching Storage Modes at Runtime

You can switch between storage modes without restarting:

1. **Frontend**: Use the Settings page to toggle API mode
2. **Backend**: Change `STORAGE_MODE` and restart server

### Data Migration

Moving from localStorage to Database:
1. Export data from localStorage (Settings > Export)
2. Switch to database mode
3. Import data (Settings > Import)

### Development Tips

- Use localStorage mode for rapid prototyping
- Test with database mode before deploying
- Keep both configurations in `.env.example` files
- Use different branches for different storage modes

## 🔗 Related Documentation

- [Backend Storage Configuration](backend/STORAGE_CONFIG.md)
- [Frontend Architecture](frontend/README.md)
- [API Documentation](backend/README.md)

## 💡 Pro Tips

1. **Fast Development**: Start with localStorage, migrate later
2. **Testing**: localStorage mode is perfect for tests
3. **Demo**: Use localStorage for live demos (no internet needed)
4. **Production**: Always use database mode with proper backups

## 🆘 Need Help?

- Check console for errors (F12 in browser)
- Verify `.env` files are loaded (restart after changes)
- Ensure ports 3000 and 3001 are free
- Try clearing browser cache and localStorage

---

**Remember**: Always restart servers after changing `.env` files!
