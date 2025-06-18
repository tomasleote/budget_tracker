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
  const baseClasses = 'border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors';
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-4 py-4 text-base'
  };

  const errorClasses = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '';
  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white';
  const widthClasses = fullWidth ? 'w-full' : '';
  const iconPaddingClasses = icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : '';

  const inputClasses = `
    ${baseClasses}
    ${sizes[size]}
    ${errorClasses}
    ${disabledClasses}
    ${widthClasses}
    ${iconPaddingClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Input Container */}
      <div className="relative">
        {/* Icon */}
        {icon && (
          <div className={`absolute inset-y-0 ${iconPosition === 'left' ? 'left-0' : 'right-0'} flex items-center ${iconPosition === 'left' ? 'pl-3' : 'pr-3'}`}>
            <FontAwesomeIcon icon={icon} className="w-4 h-4 text-gray-400" />
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
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;