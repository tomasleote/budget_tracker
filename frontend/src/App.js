import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet
} from 'react-router-dom';
import { GlobalErrorBoundary } from './view/components/ui/PageWrapper';
import AppProvider from './controller/context/providers/AppProvider';
import { AuthProvider } from './controller/context/providers/AuthProvider';
import Layout from './view/components/layout/Layout';
import { RouteGuard, UnauthorizedAccess } from './view/components/navigation/RouteGuard';
import { Welcome } from './view/pages/Welcome';

import {
  Dashboard,
  Transactions,
  Budget,
  Reports,
  Settings
} from './view/pages';

import './App.css';

/**
 * Application root. AuthProvider wraps the router so route guards and the
 * Welcome screen can read auth state. `/welcome` is public; every app route is
 * gated behind RouteGuard and rendered inside the shared Layout shell.
 */
function App() {
  const handleGlobalError = (error, errorInfo) => {
    console.error('Global Application Error:', {
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    });
  };

  return (
    <GlobalErrorBoundary onError={handleGlobalError}>
      <AuthProvider>
        <Router>
          <AppProvider>
            <Routes>
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              <Route
                element={
                  <RouteGuard>
                    <Layout>
                      <Outlet />
                    </Layout>
                  </RouteGuard>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/budget" element={<Budget />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              <Route path="/unauthorized" element={<UnauthorizedAccess />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppProvider>
        </Router>
      </AuthProvider>
    </GlobalErrorBoundary>
  );
}

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-secondary px-4">
      <div className="card-theme max-w-md rounded-2xl border p-8 text-center">
        <h1 className="text-2xl font-bold text-theme-primary">Page not found</h1>
        <p className="mt-3 text-sm text-theme-secondary">
          The page you are looking for does not exist or has been moved.
        </p>
        <button
          type="button"
          onClick={() => window.location.assign('/dashboard')}
          className="btn-theme-primary mt-6 rounded-lg border px-5 py-2 text-sm font-semibold"
        >
          Go to dashboard
        </button>
      </div>
    </div>
  );
};

export default App;
