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
  // Color/surface + hover come from the `btn-theme-*` classes (see themes.css).
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    primary: 'btn-theme-primary',
    secondary: 'btn-theme-secondary',
    outline: 'btn-theme-outline',
    ghost: 'btn-theme-ghost',
    danger: 'btn-theme-danger',
    warning: 'btn-theme-warning',
    success: 'btn-theme-success'
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
    ${variantClasses[variant] || variantClasses.primary}
    ${sizes[size]}
    ${widthClasses}
    ${disabledClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const handleClick = (e) => {
    if (disabled || isLoading) return;
    if (onClick) onClick(e);
  };

  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      onClick={handleClick}
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
