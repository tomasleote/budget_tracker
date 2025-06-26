# Budget Tracker Backend

Node.js backend API for the Budget Tracker application with Supabase integration.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm 8+
- Supabase account and project

### Installation

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your actual configuration values.

4. **Set up Supabase:**
   - Create a new Supabase project
   - Copy your project URL and keys to `.env`
   - Run database migrations (instructions below)

5. **Start development server:**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3001`

## 📋 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier

## 🗄️ Database Setup

### Supabase Configuration

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your keys
3. Update your `.env` file with the values:
   ```
   SUPABASE_URL=your-project-url
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### Database Schema

Run the SQL scripts in the `migrations/` folder in your Supabase SQL editor:

1. `001_initial_schema.sql` - Creates tables and RLS policies
2. `002_default_categories.sql` - Seeds default categories
3. `003_indexes.sql` - Creates performance indexes

## 🔧 Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Required
NODE_ENV=development
PORT=3001
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
JWT_SECRET=your-jwt-secret

# Optional
CORS_ORIGINS=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=debug
```

## 📚 API Documentation

### Health Check
```
GET /health
```

### API Endpoints (Coming Soon)
- `POST /api/auth/login` - User authentication
- `GET /api/transactions` - Get user transactions
- `POST /api/transactions` - Create new transaction
- `GET /api/budgets` - Get user budgets
- `POST /api/budgets` - Create new budget
- `GET /api/categories` - Get categories
- `GET /api/analytics/dashboard` - Get dashboard data

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": {...},
  "message": "Optional message",
  "meta": {
    "timestamp": "2024-01-15T15:30:00Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  },
  "timestamp": "2024-01-15T15:30:00Z",
  "path": "/api/endpoint",
  "method": "POST"
}
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Express middleware
│   ├── models/         # Data models
│   ├── routes/         # API route definitions
│   ├── services/       # Business logic
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Helper functions
│   ├── app.ts          # Express app setup
│   └── server.ts       # Server entry point
├── tests/              # Test files
├── migrations/         # Database migrations
├── seeds/              # Database seed data
└── docs/               # Documentation
```

## 🔒 Security Features

- JWT authentication
- Rate limiting
- CORS protection
- Helmet.js security headers
- Input validation with Joi
- Row Level Security (RLS) in Supabase

## 🚀 Deployment

### Production Environment

1. Set `NODE_ENV=production` in your environment
2. Configure production database URLs
3. Set strong JWT secrets
4. Configure CORS for your domain
5. Set up SSL certificates
6. Configure logging for production

### Docker (Optional)

```bash
# Build image
docker build -t budget-tracker-backend .

# Run container
docker run -p 3001:3001 budget-tracker-backend
```

## 🤝 Contributing

1. Follow TypeScript strict mode
2. Maintain test coverage above 80%
3. Use conventional commit messages
4. Run linting before commits
5. Update documentation for API changes

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Kill process on port 3001
npx kill-port 3001
```

**TypeScript compilation errors:**
```bash
# Clean build and reinstall
rm -rf dist node_modules
npm install
npm run build
```

**Supabase connection issues:**
- Verify your environment variables
- Check Supabase project status
- Ensure RLS policies are set correctly

### Getting Help

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Review API documentation
3. Check server logs for detailed error messages

---

**Built with ❤️ using Node.js, TypeScript, Express.js, and Supabase**
