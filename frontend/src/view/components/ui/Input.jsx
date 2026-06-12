import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Input = ({
  label = null,
  type = 'text',
  placeholder = '',
  value = '',
  onChange,
  error = null,
  required = false,
  disabled = false,
  icon = null,
  iconPosition = 'left',
  size = 'md',
  fullWidth = true,
  className = '',
  ...props
}) => {
  // Color/surface/border + focus ring come from `input-theme` (see themes.css).
  const baseClasses = 'input-theme border rounded-lg transition-colors';

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-4 py-4 text-base'
  };

  const widthClasses = fullWidth ? 'w-full' : '';
  const iconPaddingClasses = icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : '';

  const inputClasses = `
    ${baseClasses}
    ${sizes[size]}
    ${widthClasses}
    ${iconPaddingClasses}
    ${error ? 'input-error' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium mb-2 text-theme-primary">
          {label}
          {required && <span className="ml-1 text-theme-error">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Icon */}
        {icon && (
          <div className={`absolute inset-y-0 ${iconPosition === 'left' ? 'left-0' : 'right-0'} flex items-center ${iconPosition === 'left' ? 'pl-3' : 'pr-3'}`}>
            <FontAwesomeIcon icon={icon} className="w-4 h-4 text-theme-tertiary" />
          </div>
        )}

        {/* Input Field */}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={inputClasses}
          {...props}
        />
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-theme-error">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
