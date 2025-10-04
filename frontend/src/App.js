import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { GlobalErrorBoundary } from './view/components/ui/PageWrapper';
import AppProvider from './controller/context/providers/AppProvider';
import Layout from './view/components/layout/Layout';
import RouteGuard, { UnauthorizedAccess } from './view/components/navigation/RouteGuard';
// Backend components removed for localStorage-only mode
// import BackendStatus from './components/BackendStatus';
// import ApiDataDebugger from './components/debug/ApiDataDebugger';

// Import page components
import {
  Dashboard,
  Transactions,
  Budget,
  Reports,
  Settings
} from './view/pages';

import './App.css';

/**
 * Main App Component with React Router
 * Sets up routing structure with error boundaries and providers
 */
function App() {
  const handleGlobalError = (error, errorInfo) => {
    // Log to external error service (Sentry, LogRocket, etc.)
    console.error('Global Application Error:', {
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    });
    
    // TODO: Send to error tracking service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  };

  return (
    <GlobalErrorBoundary onError={handleGlobalError}>
      <Router>
        <AppProvider>
          <Layout>
            <Routes>
              {/* Root redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Protected Application Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <RouteGuard requireAuth={true}>
                    <Dashboard />
                  </RouteGuard>
                } 
              />
              <Route 
                path="/transactions" 
                element={
                  <RouteGuard requireAuth={true}>
                    <Transactions />
                  </RouteGuard>
                } 
              />
              <Route 
                path="/budget" 
                element={
                  <RouteGuard requireAuth={true}>
                    <Budget />
                  </RouteGuard>
                } 
              />
              <Route 
                path="/reports" 
                element={
                  <RouteGuard requireAuth={true}>
                    <Reports />
                  </RouteGuard>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <RouteGuard requireAuth={true}>
                    <Settings />
                  </RouteGuard>
                } 
              />
              
              {/* Error Routes */}
              <Route path="/unauthorized" element={<UnauthorizedAccess />} />
              
              {/* Catch-all route for 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
          
          {/* Backend components removed for localStorage-only mode */}
          {/* <BackendStatus /> */}
          {/* <ApiDataDebugger /> */}
        </AppProvider>
      </Router>
    </GlobalErrorBoundary>
  );
}

/**
 * 404 Not Found Page Component
 */
const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-4">
        <div className="text-6xl mb-6">🔍</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Go Back
          </button>
        </div>
        
        {/* Development info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left">
            <h4 className="font-semibold text-gray-900 mb-2">Available Routes:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <code>/dashboard</code> - Financial overview</li>
              <li>• <code>/transactions</code> - Transaction management</li>
              <li>• <code>/budget</code> - Budget management</li>
              <li>• <code>/reports</code> - Financial reports</li>
              <li>• <code>/settings</code> - Application settings</li>
            </ul>
            <p className="text-xs text-gray-500 mt-2">
              Current URL: {window.location.pathname}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;