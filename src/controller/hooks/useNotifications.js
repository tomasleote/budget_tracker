import { useState, useEffect, useCallback } from 'react';
import { useBudgets } from './useBudgets';

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState(new Set());
  const { overview: budgetOverview } = useBudgets();

  // Generate notifications from budget alerts
  const generateBudgetNotifications = useCallback(() => {
    if (!budgetOverview || budgetOverview.length === 0) {
      console.log('📢 No budget data available for notifications');
      return [];
    }

    const budgetNotifications = [];
    console.log('📢 Generating notifications from', budgetOverview.length, 'budgets');

    budgetOverview.forEach(budget => {
      if (budget.isExceeded) {
        const notification = {
          id: `budget-exceeded-${budget.id}`,
          type: 'budget-alert',
          severity: 'error',
          title: `${budget.category} Budget Exceeded`,
          message: `You've spent ${budget.formattedSpent} of your ${budget.formattedBudget} budget.`,
          timestamp: new Date().toISOString(),
          isRead: false,
          category: 'Budget',
          data: {
            budgetId: budget.id,
            category: budget.category,
            spent: budget.spent,
            budget: budget.budget,
            percentage: budget.progressPercentage
          }
        };
        budgetNotifications.push(notification);
        console.log('📢 Created exceeded notification for', budget.category);
      } else if (budget.isNearLimit) {
        const notification = {
          id: `budget-warning-${budget.id}`,
          type: 'budget-warning',
          severity: 'warning',
          title: `${budget.category} Budget Near Limit`,
          message: `You have ${budget.formattedRemaining} remaining in your ${budget.category} budget.`,
          timestamp: new Date().toISOString(),
          isRead: false,
          category: 'Budget',
          data: {
            budgetId: budget.id,
            category: budget.category,
            spent: budget.spent,
            budget: budget.budget,
            remaining: budget.remaining,
            percentage: budget.progressPercentage
          }
        };
        budgetNotifications.push(notification);
        console.log('📢 Created near-limit notification for', budget.category);
      }
    });

    console.log('📢 Generated', budgetNotifications.length, 'budget notifications');
    
    // Filter out dismissed notifications
    const filteredNotifications = budgetNotifications.filter(n => !dismissedNotificationIds.has(n.id));
    console.log('📢 After filtering dismissed:', filteredNotifications.length, 'notifications');
    
    return filteredNotifications;
  }, [budgetOverview, dismissedNotificationIds]);

  // Update notifications when budget data changes
  useEffect(() => {
    console.log('📢 useEffect triggered - budget data changed');
    const budgetNotifications = generateBudgetNotifications();
    
    // Get existing non-budget notifications
    const nonBudgetNotifications = notifications.filter(n => !n.type.startsWith('budget'));
    console.log('📢 Existing non-budget notifications:', nonBudgetNotifications.length);
    
    // Only add budget notifications that don't already exist (check by ID)
    const existingBudgetIds = new Set(notifications.filter(n => n.type.startsWith('budget')).map(n => n.id));
    const newBudgetNotifications = budgetNotifications.filter(n => !existingBudgetIds.has(n.id));
    
    console.log('📢 Existing budget notification IDs:', Array.from(existingBudgetIds));
    console.log('📢 New budget notifications to add:', newBudgetNotifications.length);
    
    // If there are new budget notifications, add them
    if (newBudgetNotifications.length > 0) {
      console.log('📢 Adding', newBudgetNotifications.length, 'new notifications');
      const allNotifications = [...nonBudgetNotifications, ...notifications.filter(n => n.type.startsWith('budget')), ...newBudgetNotifications]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      setNotifications(allNotifications);
    }
    
    // Remove budget notifications that no longer exist in the budget data
    const currentBudgetIds = new Set(budgetNotifications.map(n => n.id));
    const shouldUpdate = notifications.some(n => n.type.startsWith('budget') && !currentBudgetIds.has(n.id));
    
    if (shouldUpdate) {
      console.log('📢 Removing outdated budget notifications');
      const filteredNotifications = notifications.filter(n => 
        !n.type.startsWith('budget') || currentBudgetIds.has(n.id)
      );
      setNotifications([...filteredNotifications, ...newBudgetNotifications]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    }
  }, [budgetOverview]);

  // Calculate unread count
  useEffect(() => {
    const unread = notifications.filter(n => !n.isRead).length;
    setUnreadCount(unread);
  }, [notifications]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  }, []);

  // Dismiss notification (remove it)
  const dismissNotification = useCallback((notificationId) => {
    console.log('📢 Dismissing notification:', notificationId);
    
    // Add to dismissed set
    setDismissedNotificationIds(prev => new Set([...prev, notificationId]));
    
    // Remove from current notifications
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  }, []);

  // Dismiss all notifications
  const dismissAll = useCallback(() => {
    console.log('📢 Dismissing all notifications');
    
    // Add all current notification IDs to dismissed set
    const currentNotificationIds = notifications.map(n => n.id);
    setDismissedNotificationIds(prev => new Set([...prev, ...currentNotificationIds]));
    
    // Clear all notifications
    setNotifications([]);
  }, [notifications]);

  // Add custom notification
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: `custom-${Date.now()}-${Math.random()}`,
      type: 'custom',
      severity: 'info',
      timestamp: new Date().toISOString(),
      isRead: false,
      category: 'System',
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev]);
    return newNotification.id;
  }, []);

  // Clear dismissed notifications (for testing or when budget conditions change)
  const clearDismissedNotifications = useCallback(() => {
    console.log('📢 Clearing dismissed notifications list');
    setDismissedNotificationIds(new Set());
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    dismissAll,
    addNotification,
    clearDismissedNotifications
  };
};

export default useNotifications;