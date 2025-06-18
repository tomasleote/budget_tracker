import React from 'react';

const Card = ({ 
  children, 
  title = null,
  subtitle = null,
  padding = 'default',
  shadow = 'default',
  className = '',
  headerAction = null,
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-lg border border-gray-200';
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    default: 'shadow-sm hover:shadow-md transition-shadow',
    lg: 'shadow-lg'
  };

  const cardClasses = `
    ${baseClasses}
    ${shadowClasses[shadow]}
    ${!title ? paddingClasses[padding] : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  if (title) {
    return (
      <div className={cardClasses} {...props}>
        {/* Card Header */}
        <div className={`border-b border-gray-200 ${paddingClasses[padding]} pb-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
            {headerAction && (
              <div>{headerAction}</div>
            )}
          </div>
        </div>
        
        {/* Card Body */}
        <div className={`${paddingClasses[padding]} pt-4`}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

export default Card;