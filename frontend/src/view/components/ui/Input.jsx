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
  const baseClasses = 'rounded-lg transition-colors';
  
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
    ${className}
  `.trim().replace(/\s+/g, ' ');
  
  // Theme-aware styles
  const inputStyle = {
    backgroundColor: disabled ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
    borderColor: error ? 'var(--error)' : 'var(--border-primary)',
    borderWidth: '1px',
    color: 'var(--text-primary)',
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'text'
  };
  
  const labelStyle = {
    color: 'var(--text-primary)'
  };
  
  const iconStyle = {
    color: 'var(--text-tertiary)'
  };
  
  const errorStyle = {
    color: 'var(--error)'
  };

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium mb-2" style={labelStyle}>
          {label}
          {required && <span style={errorStyle} className="ml-1">*</span>}
        </label>
      )}
      
      {/* Input Container */}
      <div className="relative">
        {/* Icon */}
        {icon && (
          <div className={`absolute inset-y-0 ${iconPosition === 'left' ? 'left-0' : 'right-0'} flex items-center ${iconPosition === 'left' ? 'pl-3' : 'pr-3'}`}>
            <FontAwesomeIcon icon={icon} className="w-4 h-4" style={iconStyle} />
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
          style={inputStyle}
          onFocus={(e) => {
            e.target.style.borderColor = error ? 'var(--error)' : 'var(--border-focus)';
            e.target.style.outline = 'none';
            e.target.style.boxShadow = error 
              ? '0 0 0 3px rgba(239, 68, 68, 0.1)' 
              : '0 0 0 3px rgba(59, 130, 246, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? 'var(--error)' : 'var(--border-primary)';
            e.target.style.boxShadow = 'none';
          }}
          {...props}
        />
      </div>
      
      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm" style={errorStyle}>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;