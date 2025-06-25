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

## 🎯 Development Phases

The project was developed in phases, each building upon the previous:

### ✅ Completed Phases (1-6)

1. **Phase 1-2: Model Layer Foundation**
   - Entity models with validation
   - Service layer for business logic
   - Repository pattern for data access
   - Mock data generation system

2. **Phase 3: Controller Layer Implementation**
   - React Context for global state
   - Custom hooks for feature logic
   - Utility functions and helpers

3. **Phase 4: View Layer Development**
   - Dashboard components and widgets
   - Transaction management UI
   - Budget creation and tracking forms

4. **Phase 5: Pages & Navigation**
   - Complete page implementations
   - React Router integration
   - Navigation and breadcrumbs

5. **Phase 6: Data Visualization & Advanced Features**
   - Interactive charts with Recharts
   - Advanced filtering and search
   - Data export functionality
   - Enhanced analytics

### 🔧 Current Stage: Post-Phase 6 Bug Fixes & Polish

Currently refining and polishing features before Phase 7:
- **Recently Completed**: Transactions page debugging and optimization
- **Next**: Budget page refinement and bug fixes

### 🚀 Upcoming: Phase 7 - Settings & Customization

Complete settings system implementation:
- Light/Dark theme switching
- Currency and number formatting preferences
- Dashboard section customization
- Color theme presets
- Category color customization

## 🛠️ Developer Guide

### Working with the MVC Pattern

#### Adding a New Feature

1. **Model Layer** - Create entities and services:
   ```javascript
   // src/model/entities/NewEntity.js
   class NewEntity {
     constructor(data) {
       this.validate(data);
       // Entity logic
     }
   }
   
   // src/model/services/NewService.js
   class NewService {
     static create(data) {
       // Business logic
     }
   }
   ```

2. **Controller Layer** - Add hooks and context:
   ```javascript
   // src/controller/hooks/useNewFeature.js
   export const useNewFeature = () => {
     const [state, setState] = useState();
     // Hook logic
     return { state, actions };
   };
   ```

3. **View Layer** - Create components:
   ```javascript
   // src/view/components/NewComponent.jsx
   const NewComponent = () => {
     const { state, actions } = useNewFeature();
     return <div>{/* Component JSX */}</div>;
   };
   ```

### Code Style Guidelines

- **File Naming**: PascalCase for components, camelCase for utilities
- **Component Structure**: Props → State → Effects → Handlers → Render
- **State Management**: Use appropriate level (local, hook, context)
- **Error Handling**: Always include error boundaries and try-catch blocks
- **Performance**: Implement React.memo, useCallback, useMemo where beneficial

### Testing Strategy

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test hook and context interactions
- **Component Tests**: Test UI behavior and user interactions
- **E2E Tests**: Test complete user workflows

### Common Development Tasks

#### Adding a New Chart Component
```javascript
// 1. Create chart in src/view/components/charts/
// 2. Use Recharts with theme variables
// 3. Accept data props from parent
// 4. Include loading and error states
// 5. Export from charts/index.js
```

#### Adding a New Page
```javascript
// 1. Create page in src/view/pages/
// 2. Wrap with PageWrapper for error handling
// 3. Add route in src/App.js
// 4. Update navigation in src/view/components/layout/Sidebar.jsx
// 5. Export from pages/index.js
```

#### Modifying User Preferences
```javascript
// 1. Update User entity model
// 2. Modify useUser hook
// 3. Add settings component in src/view/components/settings/
// 4. Update Settings page to include new preference
```

## 📊 Performance Optimizations

### Implemented Optimizations

- **Component Memoization**: React.memo for expensive components
- **Callback Optimization**: useCallback for event handlers
- **State Optimization**: useMemo for computed values
- **Bundle Splitting**: Code splitting with React.lazy
- **Image Optimization**: Optimized asset loading

### Performance Monitoring

- **React DevTools Profiler**: Monitor component render times
- **Web Vitals**: Track Core Web Vitals metrics
- **LocalStorage Usage**: Monitor storage consumption
- **Memory Leaks**: Track component cleanup

## 🔐 Security Considerations

- **Input Validation**: All user inputs are validated client-side
- **XSS Prevention**: Proper escaping of dynamic content
- **Data Sanitization**: Clean data before storage
- **Error Boundaries**: Prevent crashes from propagating
- **LocalStorage Limits**: Handle storage quota exceeded scenarios

## 🚀 Deployment

### Development Build
```bash
npm start
# Runs on http://localhost:3000
```

### Production Build
```bash
npm run build
# Creates optimized build in `build/` directory
```

### Deployment Options
- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **CDN**: AWS CloudFront, Cloudflare
- **Traditional Hosting**: Any web server capable of serving static files

## 📈 Future Roadmap

### Phase 7: Settings & Customization (In Progress)
- Complete theme system implementation
- Dashboard customization options
- Advanced user preferences

### Phase 8: Data Import/Export
- CSV import/export functionality
- Backup and restore features
- Data migration tools

### Phase 9: Advanced Analytics
- Spending predictions
- Financial goal tracking
- Advanced reporting

### Phase 10: Mobile App
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

## 📝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Follow MVC architecture patterns
4. Add tests for new functionality
5. Submit a pull request

### Code Standards
- Follow existing file structure and naming conventions
- Include comprehensive error handling
- Add JSDoc comments for complex functions
- Ensure responsive design compatibility
- Test across different browsers and devices

## 📄 License

This project is developed for educational and personal use. See project documentation for specific licensing terms.

---

## 🔗 Quick Links

- **Live Demo**: [Add your deployment URL]
- **Development Server**: http://localhost:3000
- **Build Output**: `./build/`
- **Documentation**: See inline code comments and JSDoc
- **Support**: Create an issue in the project repository

---

*Last updated: June 2025*
*Project Status: Phase 6 Complete, Phase 7 In Development*