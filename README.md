# Budget Tracker - Personal Finance Management Application

A comprehensive full-stack budget tracker application built with React and Node.js, implementing strict MVC architecture patterns for scalable personal finance management.

## 🚀 Project Overview

Budget Tracker is a modern web application designed to help users manage their personal finances through intuitive transaction tracking, budget management, and financial analytics. The application follows enterprise-grade architecture patterns with a React frontend and Node.js backend.

### Key Features

- **Transaction Management**: Complete CRUD operations with advanced filtering and search
- **Category System**: Hierarchical category structure with customizable income/expense types
- **Budget Planning**: Create and track budgets with progress monitoring and alerts
- **Financial Analytics**: Comprehensive insights with charts and spending patterns
- **Data Import/Export**: CSV and Excel file support for bulk operations
- **Real-time Updates**: Live synchronization between frontend and backend
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## 🏗️ Architecture

The project implements a **monorepo structure** with strict separation of concerns:

```
budget_tracker/
├── frontend/          # React 18 + TypeScript Frontend
├── backend/           # Node.js + Express + TypeScript Backend
├── package.json       # Monorepo workspace configuration
└── README.md         # This file
```

### Technology Stack

**Frontend:**
- React 18.2 with Hooks and Context API
- React Router 6 for navigation
- Tailwind CSS for styling
- FontAwesome for icons
- Recharts for data visualization
- Axios for API communication

**Backend:**
- Node.js 18+ with TypeScript
- Express.js 4.18+ with security middleware
- Supabase (PostgreSQL 14+) for database
- Swagger/OpenAPI 3.0 for documentation
- Winston for logging
- Jest for testing

**Development Tools:**
- ESLint + Prettier for code quality
- Nodemon for development
- Git for version control
- Monorepo workspace management

## 🗂️ Project Structure

### Frontend Architecture (MVC Pattern)

```
frontend/src/
├── model/                    # Data Layer
│   ├── entities/            # Domain entities (Transaction, Category, Budget)
│   ├── repositories/        # Data access abstraction
│   ├── services/           # Business logic services
│   └── transformers/       # Data transformation utilities
├── view/                    # Presentation Layer
│   ├── components/         # Reusable UI components
│   ├── pages/              # Main application pages
│   └── themes.css          # Global styling
├── controller/              # Control Layer
│   ├── context/            # React Context providers
│   ├── hooks/              # Custom React hooks
│   └── utils/              # Helper utilities
├── api/                     # API Communication Layer
│   ├── services/           # API service classes
│   ├── client.js           # Axios configuration
│   └── config.js           # API endpoints configuration
└── App.js                   # Main application component
```

### Backend Architecture (Routes → Controllers → Services → Repositories)

```
backend/src/
├── routes/                  # Express route definitions
├── controllers/             # HTTP request handlers
├── services/               # Business logic layer
├── repositories/           # Data access layer
├── models/                 # Database models (future use)
├── middleware/             # Express middleware
├── config/                 # Configuration files
├── types/                  # TypeScript type definitions
├── utils/                  # Utility functions
├── scripts/                # Database scripts and CLI tools
└── tests/                  # Test suites
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- Supabase account (for database)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/budget_tracker.git
   cd budget_tracker
   ```

2. **Install dependencies:**
   ```bash
   npm run install-all
   ```

3. **Environment Setup:**
   
   **Backend configuration:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

   **Frontend configuration:**
   ```bash
   cd ../frontend
   cp .env.example .env
   # Configure API URL if different from localhost:3001
   ```

4. **Database Setup:**
   ```bash
   cd backend
   npm run seed        # Create default categories
   npm run populate    # Add sample data (optional)
   ```

### Development

**Start backend server:**
```bash
cd backend
npm run dev         # Starts on http://localhost:3001
```

**Start frontend application:**
```bash
cd frontend
npm start          # Starts on http://localhost:3000
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- API Documentation: http://localhost:3001/api-docs

## 📊 Database Schema

The application uses Supabase PostgreSQL with the following core tables:

### Categories Table
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(10) CHECK (type IN ('income', 'expense')),
  color VARCHAR(7) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  parent_id UUID REFERENCES categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(10) CHECK (type IN ('income', 'expense')),
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  description VARCHAR(255) NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id),
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Budgets Table (In Development)
```sql
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  period VARCHAR(20) CHECK (period IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  category_id UUID REFERENCES categories(id),
  alert_threshold INTEGER CHECK (alert_threshold BETWEEN 0 AND 100),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🛠️ API Endpoints

### Categories API
- `GET /api/categories` - List all categories with optional filtering
- `POST /api/categories` - Create a new category
- `GET /api/categories/:id` - Get category by ID
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
- `POST /api/categories/bulk` - Bulk operations

### Transactions API
- `GET /api/transactions` - List transactions with advanced filtering and pagination
- `POST /api/transactions` - Create a new transaction
- `GET /api/transactions/:id` - Get transaction by ID
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `POST /api/transactions/bulk` - Bulk operations (up to 50 transactions)
- `GET /api/transactions/summary` - Financial summary calculations
- `GET /api/transactions/search` - Search transactions

### Health & Documentation
- `GET /health` - API health check
- `GET /api-docs` - Swagger API documentation

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test                    # Run all tests
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:coverage     # Coverage report
```

### Frontend Testing
```bash
cd frontend
npm test                   # Run React tests
```

## 📈 Performance Features

- **Database Optimization**: Indexed queries for fast retrieval
- **Caching**: Response caching for analytics endpoints
- **Pagination**: Efficient data loading with customizable page sizes
- **Bulk Operations**: Process multiple records in single requests
- **Connection Pooling**: Optimized database connections
- **Compression**: Gzip compression for API responses

## 🔒 Security Features

- **CORS Protection**: Configurable cross-origin resource sharing
- **Rate Limiting**: Prevents API abuse (disabled in development)
- **Input Validation**: Joi schema validation for all endpoints
- **SQL Injection Protection**: Parameterized queries via Supabase
- **Error Handling**: Secure error messages without data leaks
- **Helmet.js**: Security headers for Express.js

## 🎯 Development Workflow

1. **Feature Development**: Create feature branches from main
2. **Code Quality**: ESLint and Prettier enforce code standards
3. **Testing**: Unit and integration tests for all features
4. **Documentation**: Swagger API docs and inline comments
5. **Database Changes**: Migration scripts for schema updates
6. **Deployment**: Environment-specific configurations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and add tests
4. Run linting and tests: `npm run lint && npm test`
5. Commit your changes: `git commit -m 'Add some feature'`
6. Push to the branch: `git push origin feature/your-feature-name`
7. Submit a pull request

## 🔮 Roadmap

- **Phase 6**: Frontend API integration
- **Phase 7**: Production deployment and monitoring
- **Future**: Mobile app, advanced reporting, AI-powered insights

## 📞 Support

For questions, issues, or contributions:
- Open an issue on GitHub
- Check the [API documentation](http://localhost:3001/api-docs) when running locally
- Review the architecture documentation in respective README files

---

**Budget Tracker** - Building better financial habits through smart technology 💰
