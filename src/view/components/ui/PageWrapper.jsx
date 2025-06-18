import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { PageLoading } from './LoadingSpinner';

// Page wrapper that provides error boundary and loading states
const PageWrapper = ({ 
  children,
  isLoading = false,
  loadingText = 'Loading page...',
  loadingDescription = 'Please wait while we prepare your data',
  errorFallback = null,
  onError = null,
  className = ''
}) => {
  if (isLoading) {
    return (
      <PageLoading 
        title={loadingText}
        description={loadingDescription}
      />
    );
  }

  return (
    <ErrorBoundary 
      level="page"
      fallback={errorFallback}
      onError={onError}
    >
      <div className={className}>
        {children}
      </div>
    </ErrorBoundary>
  );
};

// Component wrapper for smaller sections
const ComponentWrapper = ({
  children,
  isLoading = false,
  loadingComponent = null,
  errorFallback = null,
  onError = null,
  className = ''
}) => {
  return (
    <ErrorBoundary
      level="component"
      fallback={errorFallback}
      onError={onError}
    >
      <div className={className}>
        {isLoading && loadingComponent ? loadingComponent : children}
      </div>
    </ErrorBoundary>
  );
};

// Global error boundary for the entire app
const GlobalErrorBoundary = ({ 
  children,
  onError = null 
}) => {
  const handleGlobalError = (error, errorInfo) => {
    // Log to external service (e.g., Sentry, LogRocket)
    console.error('Global Error:', { error, errorInfo });
    
    if (onError) {
      onError(error, errorInfo);
    }
  };

  return (
    <ErrorBoundary
      level="page"
      onError={handleGlobalError}
      fallback={({ error, onRetry, onReload, onGoHome }) => (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-lg w-full mx-4 text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-6xl mb-6">💥</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Application Error
              </h1>
              <p className="text-gray-600 mb-6">
                The application encountered a critical error. We apologize for the inconvenience.
              </p>
              <div className="space-y-3">
                <button
                  onClick={onRetry}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={onReload}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Reload Application
                </button>
              </div>
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                    {error?.toString()}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
};

export default PageWrapper;
export {
  ComponentWrapper,
  GlobalErrorBoundary
};