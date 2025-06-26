# Budget Tracker

A comprehensive personal finance management application built with React 19, following strict MVC (Model-View-Controller) architecture patterns. Track expenses, manage budgets, visualize spending patterns, and gain insights into your financial health.

## 🚀 Quick Start

### Prerequisites

- **Node.js**: Version 16.x or higher
- **npm**: Version 8.x or higher (comes with Node.js)
- **Modern Browser**: Chrome, Firefox, Safari, or Edge

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd budget_tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```
   The application will open in your browser at `http://localhost:3000`

4. **Build for production:**
   ```bash
   npm run build
   ```

### First-Time Setup

The application automatically generates mock data for demonstration purposes. On first launch, you'll see:
- Sample transactions across different categories
- Pre-configured budgets
- Demo user profile with default preferences

## 📱 Features Overview

### Core Financial Management
- **Transaction Tracking**: Add, edit, delete, and categorize income/expenses
- **Budget Management**: Create monthly budgets with progress tracking and alerts
- **Category System**: Organize transactions with customizable categories
- **Balance Monitoring**: Real-time balance calculation and financial overview

### Data Visualization & Analytics
- **Dashboard Overview**: Quick stats, balance cards, spending charts
- **Advanced Charts**: Spending trends, budget comparisons, monthly analytics
- **Financial Health Metrics**: Savings rate, spending patterns, budget adherence
- **Interactive Reports**: Filter by date, category, amount ranges

### User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Theme**: System-aware theme switching with smooth transitions
- **Real-time Updates**: Live data synchronization without page refreshes
- **Bulk Operations**: Mass delete transactions, bulk budget updates

### Customization & Settings
- **Currency Support**: Multiple currencies with live formatting
- **Dashboard Customization**: Show/hide sections, personalized layouts
- **Number Formatting**: Custom decimal places and thousands separators
- **Color Themes**: Multiple theme presets with category color customization

## 🏗️ Architecture Overview

This application follows a strict **MVC (Model-View-Controller)** architecture pattern, ensuring clean separation of concerns and maintainability.

```
src/
├── Model/           # Data Layer (Business Logic & Data Management)
├── Controller/      # Control Layer (State Management & Business Logic)
├── View/           # Presentation Layer (UI Components & Pages)
└── data/           # Mock Data & Configuration
```

### 📊 Model Layer (`src/model/`)

The Model layer handles all data-related operations and business logic.

```
model/
├── entities/       # Data models with validation and business rules
│   ├── User.js        # User profile, preferences, settings
│   ├── Transaction.js # Financial transaction model
│   ├── Budget.js      # Budget model with progress tracking
│   └── Category.js    # Transaction categorization
├── services/       # Business logic services
│   ├── TransactionService.js    # Transaction CRUD operations
│   ├── BudgetService.js         # Budget management logic
│   ├── StorageService.js        # LocalStorage abstraction
│   └── CalculationService.js    # Financial calculations
└── repositories/   # Data persistence layer
    ├── TransactionRepository.js # Transaction data access
    ├── BudgetRepository.js      # Budget data access
    └── BaseRepository.js        # Common repository patterns
```

**Key Features:**
- **Entity Validation**: All models include comprehensive validation
- **Business Rules**: Entities enforce business logic (e.g., budget limits)
- **Data Transformation**: Automatic formatting and type conversion
- **Persistence**: LocalStorage integration with fallback mechanisms

### 🎮 Controller Layer (`src/controller/`)

The Controller layer manages application state and coordinates between Model and View.

```
controller/
├── context/        # Global state management
│   ├── AppProvider.js       # Main application context
│   ├── TransactionContext.js # Transaction state management
│   └── BudgetContext.js     # Budget state management
├── hooks/          # Custom React hooks (Controllers)
│   ├── useTransactions.js   # Transaction operations
│   ├── useBudgets.js        # Budget operations
│   ├── useDashboard.js      # Dashboard data aggregation
│   ├── useUser.js           # User preferences & settings
│   └── useCategories.js     # Category management
└── utils/          # Helper functions and utilities
    ├── formatters.js        # Currency, date, number formatting
    ├── validators.js        # Input validation functions
    ├── constants.js         # Application constants
    └── calculations.js      # Financial calculations
```

**Key Features:**
- **React Context**: Global state management with Context API
- **Custom Hooks**: Encapsulate business logic in reusable hooks
- **State Synchronization**: Automatic LocalStorage persistence
- **Error Handling**: Comprehensive error boundaries and logging

### 🎨 View Layer (`src/view/`)

The View layer contains all UI components and pages, organized by functionality.

```
view/
├── components/     # Reusable UI components
│   ├── ui/            # Base UI components
│   │   ├── Button.jsx     # Standardized button component
│   │   ├── Modal.jsx      # Modal dialogs
│   │   ├── LoadingSpinner.jsx # Loading states
│   │   └── PageWrapper.jsx    # Page layout wrapper
│   ├── layout/        # Layout components
│   │   ├── Layout.jsx     # Main application layout
│   │   ├── Sidebar.jsx    # Navigation sidebar
│   │   └── Header.jsx     # Application header
│   ├── dashboard/     # Dashboard-specific components
│   │   ├── BalanceCard.jsx        # Account balance display
│   │   ├── BudgetProgress.jsx     # Budget progress bars
│   │   ├── SpendingChart.jsx      # Spending visualization
│   │   ├── RecentTransactions.jsx # Transaction list
│   │   └── QuickStats.jsx         # Financial metrics
│   ├── charts/        # Data visualization components
│   │   ├── SpendingPieChart.jsx   # Category spending breakdown
│   │   ├── SpendingTrendChart.jsx # Spending over time
│   │   ├── BudgetComparisonChart.jsx # Budget vs actual
│   │   └── MonthlyAnalyticsChart.jsx # Monthly analysis
│   ├── forms/         # Form components
│   │   ├── TransactionForm.jsx    # Add/edit transactions
│   │   ├── BudgetForm.jsx         # Budget creation/editing
│   │   └── SettingsForm.jsx       # User preferences
│   └── settings/      # Settings page components
│       ├── GeneralSettings.jsx    # General preferences
│       ├── DashboardSettings.jsx  # Dashboard customization
│       └── AppearanceSettings.jsx # Theme and appearance
├── pages/          # Main application pages
│   ├── Dashboard.jsx      # Financial overview page
│   ├── Transactions.jsx   # Transaction management
│   ├── Budget.jsx         # Budget management
│   ├── Reports.jsx        # Financial reports
│   └── Settings.jsx       # Application settings
└── themes.css      # Theme system (light/dark mode)
```

**Key Features:**
- **Component Composition**: Reusable, composable components
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Accessibility**: ARIA compliance and keyboard navigation
- **Theme System**: Complete light/dark mode with CSS variables

## 🔧 Technology Stack

### Core Technologies
- **React 19.1.0**: Latest React with concurrent features and hooks
- **React Router 7.6.2**: Client-side routing and navigation
- **Tailwind CSS 3.4.0**: Utility-first CSS framework
- **LocalStorage**: Data persistence without backend

### UI & Visualization
- **FontAwesome**: Comprehensive icon library
- **Recharts 2.15.3**: React-based charting library
- **CSS Variables**: Dynamic theming system
- **Responsive Grid**: Mobile-first responsive layouts

### Development Tools
- **Create React App**: Development environment and build tools
- **ESLint**: Code linting and style enforcement
- **Jest & React Testing Library**: Unit and integration testing

## 🗂️ Data Flow & State Management

### State Architecture

The application uses a layered state management approach:

1. **Global State** (React Context)
   - User preferences and settings
   - Application-wide configuration
   - Theme and UI state

2. **Feature State** (Custom Hooks)
   - Transaction data and operations
   - Budget data and calculations
   - Dashboard aggregations

3. **Local State** (Component State)
   - Form inputs and validation
   - UI interaction states
   - Temporary display states

### Data Persistence

All data is stored in browser LocalStorage with the following structure:
```javascript
localStorage = {
  'budget_tracker_user': {
    profile: UserEntity,
    preferences: { theme, currency, dateFormat, ... },
    settings: { dashboardSections, categoryColors, ... }
  },
  'budget_tracker_transactions': TransactionEntity[],
  'budget_tracker_budgets': BudgetEntity[],
  'budget_tracker_categories': CategoryEntity[]
}
```

### Data Synchronization

- **Automatic Sync**: Changes are immediately persisted to LocalStorage
- **Optimistic Updates**: UI updates immediately, with rollback on errors
- **Event System**: Components can listen for data changes across the app
- **Validation**: All data is validated before persistence


## 📈 Future Roadmap

### Settings & Customization (In Progress)
- Complete theme system implementation
- Dashboard customization options
- Advanced user preferences

### Advanced Analytics
- Spending predictions
- Financial goal tracking
- Advanced reporting

### Mobile App
- React Native implementation
- Offline functionality
- Push notifications

## 🐛 Troubleshooting

### Common Issues

**Application won't start:**
- Check Node.js version (16+ required)
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

**Data not persisting:**
- Check browser LocalStorage availability
- Verify storage quota (shouldn't exceed 10MB)
- Check for private browsing mode

**Theme not switching:**
- Verify CSS variables are loaded
- Check data-theme attribute on root element
- Clear browser cache

**Charts not displaying:**
- Verify Recharts import statements
- Check data format matches chart requirements
- Ensure container has defined dimensions

### Debug Mode
The application includes development-only features:
- Mock data indicators
- Performance timestamps
- Debug information panels
- Detailed error logging

## 📄 License

This project is developed for educational and personal use. See project documentation for specific licensing terms.

*Last updated: 25th June 2025*
