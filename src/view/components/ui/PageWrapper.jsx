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
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="max-w-lg w-full mx-4 text-center">
            <div className="rounded-lg p-8" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-lg)' }}>
              <div className="text-6xl mb-6">💥</div>
              <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Application Error
              </h1>
              <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                The application encountered a critical error. We apologize for the inconvenience.
              </p>
              <div className="space-y-3">
                <button
                  onClick={onRetry}
                  className="w-full py-2 px-4 rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: 'var(--text-inverse)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'var(--accent-primary-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'var(--accent-primary)';
                  }}
                >
                  Try Again
                </button>
                <button
                  onClick={onReload}
                  className="w-full py-2 px-4 rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    borderWidth: '1px',
                    borderColor: 'var(--border-primary)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'var(--bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'var(--bg-tertiary)';
                  }}
                >
                  Reload Application
                </button>
              </div>
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm hover:opacity-80" style={{ color: 'var(--text-tertiary)' }}>
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 p-3 rounded text-xs overflow-auto" style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)'
                  }}>
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