import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import Button from './Button';

const Modal = ({ 
  isOpen = false,
  onClose,
  title = '',
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  footer = null,
  className = ''
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 transition-opacity"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={handleOverlayClick}
      />
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div 
          className={`
            relative transform overflow-hidden rounded-lg text-left transition-all w-full
            ${sizes[size]}
            ${className}
          `}
          style={{
            backgroundColor: 'var(--bg-modal)',
            boxShadow: 'var(--shadow-xl)',
            color: 'var(--text-primary)'
          }}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid var(--border-primary)' }}>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {title}
              </h3>
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="transition-colors"
                  style={{
                    color: 'var(--text-tertiary)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = 'var(--text-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = 'var(--text-tertiary)';
                  }}
                >
                  <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
          
          {/* Body */}
          <div className="p-6">
            {children}
          </div>
          
          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end space-x-3 p-6" style={{
              borderTop: '1px solid var(--border-primary)',
              backgroundColor: 'var(--bg-tertiary)'
            }}>
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;