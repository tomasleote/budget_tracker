import React from 'react';

const ProgressBar = ({ 
  value = 0,
  max = 100,
  size = 'md',
  color = 'blue',
  showLabel = false,
  label = '',
  showPercentage = false,
  className = '',
  animated = false
}) => {
  // Calculate percentage
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const sizes = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const colors = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600',
    gray: 'bg-gray-600',
    // Dynamic colors based on percentage
    dynamic: percentage >= 100 ? 'bg-red-600' : percentage >= 75 ? 'bg-yellow-600' : 'bg-green-600'
  };

  const animatedClasses = animated ? 'transition-all duration-300 ease-in-out' : '';

  return (
    <div className={`w-full ${className}`}>
      {/* Label and Percentage */}
      {(showLabel || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {showLabel && (
            <span className="text-sm font-medium text-gray-700">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm text-gray-600">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      
      {/* Progress Bar Container */}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizes[size]}`}>
        {/* Progress Bar Fill */}
        <div
          className={`
            ${colors[color]}
            ${sizes[size]}
            ${animatedClasses}
            rounded-full
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {/* Value Display */}
      {value !== undefined && max !== undefined && !showPercentage && (
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;