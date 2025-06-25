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
  const baseClasses = 'rounded-lg transition-colors duration-300';
  
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

  const cardStyle = {
    backgroundColor: 'var(--bg-card)',
    borderColor: 'var(--border-primary)',
    borderWidth: '1px',
    color: 'var(--text-primary)',
    boxShadow: shadow !== 'none' ? 'var(--shadow-sm)' : 'none'
  };

  if (title) {
    return (
      <div className={cardClasses} style={cardStyle} {...props}>
        {/* Card Header */}
        <div className={`pb-4 ${paddingClasses[padding]}`} style={{
          borderBottom: '1px solid var(--border-primary)'
        }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold" style={{
                color: 'var(--text-primary)'
              }}>{title}</h3>
              {subtitle && (
                <p className="text-sm mt-1" style={{
                  color: 'var(--text-secondary)'
                }}>{subtitle}</p>
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
    <div className={cardClasses} style={cardStyle} {...props}>
      {children}
    </div>
  );
};

export default Card;