import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon = null, 
  iconPosition = 'left',
  fullWidth = false,
  disabled = false,
  isLoading = false,
  className = '',
  onClick,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const getVariantStyle = (variant) => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'var(--accent-primary)',
          color: 'var(--text-inverse)',
          borderColor: 'var(--accent-primary)',
          borderWidth: '1px'
        };
      case 'secondary':
        return {
          backgroundColor: 'var(--accent-secondary)',
          color: 'var(--text-inverse)',
          borderColor: 'var(--accent-secondary)',
          borderWidth: '1px'
        };
      case 'outline':
        return {
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          borderColor: 'var(--border-primary)',
          borderWidth: '1px'
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-primary)',
          borderColor: 'transparent',
          borderWidth: '1px'
        };
      case 'danger':
        return {
          backgroundColor: 'var(--error)',
          color: 'var(--text-inverse)',
          borderColor: 'var(--error)',
          borderWidth: '1px'
        };
      case 'warning':
        return {
          backgroundColor: 'var(--warning)',
          color: 'var(--text-inverse)',
          borderColor: 'var(--warning)',
          borderWidth: '1px'
        };
      case 'success':
        return {
          backgroundColor: 'var(--success)',
          color: 'var(--text-inverse)',
          borderColor: 'var(--success)',
          borderWidth: '1px'
        };
      default:
        return {
          backgroundColor: 'var(--accent-primary)',
          color: 'var(--text-inverse)',
          borderColor: 'var(--accent-primary)',
          borderWidth: '1px'
        };
    }
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const disabledClasses = disabled || isLoading ? 'opacity-50 cursor-not-allowed' : '';
  const widthClasses = fullWidth ? 'w-full' : '';

  const buttonClasses = `
    ${baseClasses}
    ${sizes[size]}
    ${widthClasses}
    ${disabledClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const buttonStyle = getVariantStyle(variant);

  const handleClick = (e) => {
    if (disabled || isLoading) return;
    if (onClick) onClick(e);
  };

  return (
    <button
      className={buttonClasses}
      style={buttonStyle}
      disabled={disabled || isLoading}
      onClick={handleClick}
      onMouseEnter={(e) => {
        if (disabled || isLoading) return;
        
        // Apply hover effect
        switch (variant) {
          case 'primary':
            e.target.style.backgroundColor = 'var(--accent-primary-hover)';
            break;
          case 'secondary':
            e.target.style.backgroundColor = 'var(--accent-secondary-hover)';
            break;
          case 'outline':
            e.target.style.backgroundColor = 'var(--bg-hover)';
            break;
          case 'ghost':
            e.target.style.backgroundColor = 'var(--bg-hover)';
            break;
          case 'danger':
            e.target.style.backgroundColor = 'var(--accent-tertiary-hover)';
            break;
        }
      }}
      onMouseLeave={(e) => {
        if (disabled || isLoading) return;
        
        // Reset to original style
        const originalStyle = getVariantStyle(variant);
        e.target.style.backgroundColor = originalStyle.backgroundColor;
      }}
      {...props}
    >
      {isLoading && (
        <FontAwesomeIcon 
          icon={faSpinner} 
          className="w-4 h-4 mr-2 animate-spin" 
        />
      )}
      {icon && iconPosition === 'left' && !isLoading && (
        <FontAwesomeIcon icon={icon} className="w-4 h-4 mr-2" />
      )}
      {children}
      {icon && iconPosition === 'right' && !isLoading && (
        <FontAwesomeIcon icon={icon} className="w-4 h-4 ml-2" />
      )}
    </button>
  );
};

export default Button;