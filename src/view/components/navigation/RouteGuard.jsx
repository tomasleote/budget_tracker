import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { PageLoading } from '../ui/LoadingSpinner';

/**
 * Route Guard Component
 * Protects routes based on authentication and authorization
 */
const RouteGuard = ({ 
  children, 
  requireAuth = true,
  requiredRole = null,
  fallbackPath = '/login',
  loadingComponent = null
}) => {
  const location = useLocation();
  
  // Mock authentication state (replace with real auth logic)
  const [isAuthenticated, setIsAuthenticated] = React.useState(true);
  const [userRole, setUserRole] = React.useState('user');
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Simulate auth check loading
  React.useEffect(() => {
    setIsLoading(true);
    // Simulate API call to check auth status
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);
  
  // Show loading state
  if (isLoading) {
    return loadingComponent || (
      <PageLoading 
        title="Checking access..."
        description="Verifying your permissions"
      />
    );
  }
  
  // Check authentication
  if (requireAuth && !isAuthenticated) {
    // Redirect to login with return path
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }
  
  // Check role authorization
  if (requiredRole && userRole !== requiredRole) {
    return (
      <Navigate 
        to="/unauthorized" 
        state={{ requiredRole, userRole }} 
        replace 
      />
    );
  }
  
  // Render protected content
  return children;
};

/**
 * Public Route Component
 * For routes that should redirect authenticated users
 */
const PublicRoute = ({ 
  children, 
  redirectPath = '/dashboard' 
}) => {
  // Mock authentication state
  const [isAuthenticated] = React.useState(true);
  
  // Redirect authenticated users
  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }
  
  return children;
};

/**
 * Unauthorized Access Component
 */
const UnauthorizedAccess = () => {
  const location = useLocation();
  const { requiredRole, userRole } = location.state || {};
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-4">
        <div className="text-6xl mb-6">🚫</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Access Denied
        </h1>
        <p className="text-gray-600 mb-8">
          You don't have permission to access this page.
          {requiredRole && (
            <span className="block mt-2 text-sm">
              Required role: <code className="bg-gray-100 px-2 py-1 rounded">{requiredRole}</code><br/>
              Your role: <code className="bg-gray-100 px-2 py-1 rounded">{userRole}</code>
            </span>
          )}
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
      </div>
    </div>
  );
};

export default RouteGuard;
export { PublicRoute, UnauthorizedAccess };