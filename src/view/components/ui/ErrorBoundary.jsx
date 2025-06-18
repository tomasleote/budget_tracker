import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faExclamationTriangle,
  faRefresh,
  faHome,
  faBug
} from '@fortawesome/free-solid-svg-icons';
import Button from '../ui/Button';
import Card from '../ui/Card';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error details
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log the error to an error reporting service here
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI
      const { fallback: CustomFallback, level = 'page' } = this.props;
      
      if (CustomFallback) {
        return (
          <CustomFallback 
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            onRetry={this.handleRetry}
            onReload={this.handleReload}
            onGoHome={this.handleGoHome}
          />
        );
      }

      // Default error UI based on level
      if (level === 'component') {
        return (
          <Card className="border-red-200 bg-red-50">
            <div className="p-6 text-center">
              <FontAwesomeIcon 
                icon={faExclamationTriangle} 
                className="text-red-500 text-3xl mb-4" 
              />
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Component Error
              </h3>
              <p className="text-red-700 mb-4">
                This component encountered an error and couldn't render properly.
              </p>
              <Button
                variant="outline"
                onClick={this.handleRetry}
                icon={faRefresh}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                Try Again
              </Button>
            </div>
          </Card>
        );
      }

      // Page-level error UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full mx-4">
            <Card>
              <div className="p-8 text-center">
                <FontAwesomeIcon 
                  icon={faBug} 
                  className="text-red-500 text-5xl mb-6" 
                />
                
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Oops! Something went wrong
                </h1>
                
                <p className="text-gray-600 mb-6">
                  We encountered an unexpected error. Don't worry, your data is safe.
                </p>

                {/* Error Details (Development Only) */}
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
                    <h4 className="font-semibold text-gray-900 mb-2">Error Details:</h4>
                    <p className="text-xs text-gray-700 mb-2">
                      <strong>Error:</strong> {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <p className="text-xs text-gray-700">
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Error ID: {this.state.errorId}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    variant="primary"
                    onClick={this.handleRetry}
                    icon={faRefresh}
                    fullWidth
                  >
                    Try Again
                  </Button>
                  
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={this.handleGoHome}
                      icon={faHome}
                      fullWidth
                    >
                      Go Home
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={this.handleReload}
                      icon={faRefresh}
                      fullWidth
                    >
                      Reload Page
                    </Button>
                  </div>
                </div>

                {/* Help Text */}
                <p className="text-xs text-gray-500 mt-6">
                  If this problem persists, please contact support with Error ID: {this.state.errorId}
                </p>
              </div>
            </Card>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;