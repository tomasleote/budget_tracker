import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner,
  faCircleNotch,
  faHourglass,
  faCog
} from '@fortawesome/free-solid-svg-icons';

const LoadingSpinner = ({ 
  size = 'md',
  variant = 'spinner',
  color = 'blue',
  text = '',
  fullScreen = false,
  overlay = false,
  className = ''
}) => {
  const sizes = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6', 
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colors = {
    blue: 'text-blue-600',
    gray: 'text-gray-600',
    white: 'text-white',
    green: 'text-green-600',
    red: 'text-red-600'
  };

  const variants = {
    spinner: faSpinner,
    circle: faCircleNotch,
    hourglass: faHourglass,
    cog: faCog
  };

  const spinnerClasses = `
    ${sizes[size]}
    ${colors[color]}
    animate-spin
    ${className}
  `.trim();

  const LoadingContent = () => (
    <div className="flex flex-col items-center justify-center space-y-3">
      <FontAwesomeIcon 
        icon={variants[variant]} 
        className={spinnerClasses}
      />
      {text && (
        <p className={`text-sm font-medium ${colors[color]}`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <LoadingContent />
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
        <LoadingContent />
      </div>
    );
  }

  return <LoadingContent />;
};

// Page Loading Component
const PageLoading = ({ 
  title = 'Loading...',
  description = 'Please wait while we load your data',
  variant = 'spinner'
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-4">
        <LoadingSpinner 
          size="xl" 
          variant={variant}
          color="blue"
          className="mb-6"
        />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {title}
        </h2>
        <p className="text-gray-600">
          {description}
        </p>
      </div>
    </div>
  );
};

// Section Loading Component
const SectionLoading = ({ 
  rows = 3,
  height = 'h-4',
  className = ''
}) => {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="space-y-2">
          <div className={`bg-gray-200 rounded ${height} w-full`}></div>
          {index === 0 && <div className={`bg-gray-200 rounded ${height} w-3/4`}></div>}
          {index === 1 && <div className={`bg-gray-200 rounded ${height} w-1/2`}></div>}
        </div>
      ))}
    </div>
  );
};

// Card Loading Component
const CardLoading = ({ 
  title = true,
  content = true,
  footer = false,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-lg shadow border border-gray-200 ${className}`}>
      <div className="p-6">
        {title && (
          <div className="animate-pulse mb-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </div>
        )}
        
        {content && (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        )}
        
        {footer && (
          <div className="animate-pulse mt-6 pt-4 border-t border-gray-200">
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
        )}
      </div>
    </div>
  );
};

// Table Loading Component
const TableLoading = ({ 
  rows = 5,
  columns = 4,
  showHeader = true,
  className = ''
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {showHeader && (
        <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, index) => (
            <div key={index} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      )}
      
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div 
            key={rowIndex} 
            className="grid gap-4" 
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// Chart Loading Component
const ChartLoading = ({ 
  height = 'h-64',
  showLegend = true,
  className = ''
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {showLegend && (
        <div className="flex space-x-4 mb-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      )}
      <div className={`bg-gray-200 rounded ${height} w-full`}></div>
    </div>
  );
};

export default LoadingSpinner;
export {
  PageLoading,
  SectionLoading,
  CardLoading,
  TableLoading,
  ChartLoading
};