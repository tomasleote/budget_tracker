# Budget Tracker Frontend

A modern React 18 frontend application built with JavaScript, Tailwind CSS, and implementing MVC architecture patterns for personal finance management.

## 🏗️ Architecture Overview

The frontend follows MVC pattern with clear separation of concerns:

- **Model Layer**: Data entities, repositories, services, and transformers
- **View Layer**: React components, pages, and UI elements  
- **Controller Layer**: Context providers, custom hooks, and utilities
- **Data Layer**: API services and storage abstraction

## 🚀 Getting Started

### Prerequisites
- Node.js 16.0.0 or higher
- npm 8.0.0 or higher
- Backend API running on port 3001 (optional)

### Installation
```bash
cd frontend
npm install
npm start              # Starts on http://localhost:3000
```

### Environment Setup
```env
# API Configuration
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_API_TIMEOUT=30000

# Feature Flags
REACT_APP_ENABLE_MOCK_DATA=true
REACT_APP_ENABLE_API_INTEGRATION=false
```

## 📁 Project Structure

```
frontend/src/
├── model/                    # Data models, repositories, services
├── view/                     # React components and pages
├── controller/               # Context providers and hooks
├── api/                      # API communication layer
├── components/               # Standalone components
├── config/                   # Configuration files
└── App.js                    # Main application
```

## 🎨 Key Features

- **MVC Architecture** - Clean separation of concerns
- **Responsive Design** - Mobile-first with Tailwind CSS
- **State Management** - React Context + Custom Hooks
- **API Integration** - Axios-based services ready for backend
- **Component Library** - Reusable UI components
- **Mock Data** - Development mode with localStorage
- **Error Handling** - Comprehensive error boundaries

## 📋 Available Scripts

- `npm start` - Start development server
- `npm run build` - Create production build
- `npm test` - Run test suite

## 🔧 Configuration

Toggle between mock data (localStorage) and API integration via environment variables.

**Current Status**: Phase 6 complete with full MVC implementation and API-ready architecture.

---

**Budget Tracker Frontend** - Modern, responsive, and user-friendly interface 🎨