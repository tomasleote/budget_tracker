import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faExclamationTriangle,
  faTimesCircle,
  faCheckCircle,
  faInfoCircle,
  faTimes,
  faEllipsisV,
  faTrash,
  faEye,
  faBullhorn
} from '@fortawesome/free-solid-svg-icons';

const NotificationDropdown = ({ 
  notifications = [], 
  unreadCount = 0,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
  onDismissAll,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectedNotification(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get notification icon based on severity
  const getNotificationIcon = (severity, type) => {
    if (type === 'budget-alert' || severity === 'error') return faTimesCircle;
    if (type === 'budget-warning' || severity === 'warning') return faExclamationTriangle;
    if (severity === 'success') return faCheckCircle;
    return faInfoCircle;
  };

  // Get notification styling based on severity
  const getNotificationStyling = (severity, type) => {
    if (type === 'budget-alert' || severity === 'error') {
      return {
        iconColor: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    }
    if (type === 'budget-warning' || severity === 'warning') {
      return {
        iconColor: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      };
    }
    if (severity === 'success') {
      return {
        iconColor: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    }
    return {
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    };
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        className={`relative p-2 rounded-lg transition-colors ${
          isOpen 
            ? 'text-blue-600 bg-blue-50' 
            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
        }`}
        title="Notifications"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FontAwesomeIcon icon={faBell} className="w-5 h-5" />
        
        {/* Notification Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faBell} className="text-gray-600" />
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center space-x-2">
              {notifications.length > 0 && (
                <>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => {
                        onMarkAllAsRead();
                        console.log('Marked all notifications as read');
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      title="Mark all as read"
                    >
                      <FontAwesomeIcon icon={faEye} className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onDismissAll();
                      console.log('Dismissed all notifications');
                    }}
                    className="text-xs text-gray-400 hover:text-red-600 font-medium transition-colors"
                    title="Dismiss all"
                  >
                    <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <FontAwesomeIcon 
                  icon={faBell} 
                  className="text-4xl text-gray-300 mb-3" 
                />
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  No notifications
                </h4>
                <p className="text-xs text-gray-500">
                  You're all caught up! 🎉
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => {
                  const styling = getNotificationStyling(notification.severity, notification.type);
                  const icon = getNotificationIcon(notification.severity, notification.type);
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer relative ${
                        !notification.isRead ? 'bg-blue-50/30' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Notification Icon */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${styling.bgColor} ${styling.borderColor} border`}>
                          <FontAwesomeIcon 
                            icon={icon}
                            className={`text-sm ${styling.iconColor}`}
                          />
                        </div>
                        
                        {/* Notification Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <h4 className={`text-sm font-medium text-gray-900 truncate ${
                                  !notification.isRead ? 'font-semibold' : ''
                                }`}>
                                  {notification.title}
                                </h4>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                  <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                                    {notification.category}
                                  </span>
                                  <span>{formatTimestamp(notification.timestamp)}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Dismiss Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDismiss(notification.id);
                                console.log('Dismissed notification:', notification.id);
                              }}
                              className="flex-shrink-0 ml-2 p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                              title="Dismiss notification"
                            >
                              <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 5 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div className="text-center">
                <span className="text-xs text-gray-500">
                  Showing {Math.min(notifications.length, 20)} of {notifications.length} notifications
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;