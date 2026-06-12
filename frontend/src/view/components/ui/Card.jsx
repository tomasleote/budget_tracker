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
  // Surface/color/border come from the `card-theme` class (see themes.css).
  // Tailwind handles layout (radius/padding) only.
  const baseClasses = 'card-theme border rounded-lg transition-colors duration-300';

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8'
  };

  // `card-theme` already provides shadow-sm + hover shadow-md (the "default").
  // Only override when the variant differs.
  const shadowOverride = {
    none: { boxShadow: 'none' },
    sm: undefined,
    default: undefined,
    lg: { boxShadow: 'var(--shadow-lg)' }
  };

  const cardClasses = `
    ${baseClasses}
    ${!title ? paddingClasses[padding] : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  if (title) {
    return (
      <div className={cardClasses} style={shadowOverride[shadow]} {...props}>
        {/* Card Header */}
        <div className={`border-b border-theme-primary pb-4 ${paddingClasses[padding]}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-theme-primary">{title}</h3>
              {subtitle && (
                <p className="text-sm mt-1 text-theme-secondary">{subtitle}</p>
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
    <div className={cardClasses} style={shadowOverride[shadow]} {...props}>
      {children}
    </div>
  );
};

export default Card;
