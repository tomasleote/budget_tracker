import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../controller/hooks/useAuth';
import { getAppMode } from '../../../controller/appMode';
import { PageLoading } from '../ui/LoadingSpinner';

/**
 * Gates protected routes. Access is granted to an authenticated user or to an
 * active demo session; everyone else is sent to the Welcome screen. While the
 * auth state is resolving, a full-page spinner is shown.
 */
export function RouteGuard({ children }) {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoading title="Checking access..." description="Verifying your session" />;
  }

  if (!user && getAppMode() !== 'demo') {
    return <Navigate to="/welcome" state={{ from: location.pathname }} replace />;
  }

  return children;
}

/**
 * Shown when a user reaches a route they are not allowed to view.
 */
export function UnauthorizedAccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-secondary px-4">
      <div className="card-theme max-w-md rounded-2xl border p-8 text-center">
        <h1 className="text-2xl font-bold text-theme-primary">Access denied</h1>
        <p className="mt-3 text-sm text-theme-secondary">
          You do not have permission to view this page.
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
}
