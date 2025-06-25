import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';

// Initial state for the app
const initialState = {
  // Loading states
  loading: {
    global: false,
    transactions: false,
    budgets: false,
    categories: false
  },
  
  // Error states
  errors: {
    global: null,
    transactions: null,
    budgets: null,
    categories: null
  },
  
  // Notifications
  notifications: [],
  
  // UI state
  ui: {
    theme: 'light',
    sidebarCollapsed: false,
    currentPage: 'dashboard',
    modals: {
      addTransaction: false,
      addBudget: false,
      settings: false
    }
  },
  
  // App metadata
  meta: {
    initialized: false,
    version: '1.0.0',
    lastUpdated: null
  }
};

// Action types
const APP_ACTIONS = {
  // Loading actions
  SET_LOADING: 'SET_LOADING',
  SET_GLOBAL_LOADING: 'SET_GLOBAL_LOADING',
  
  // Error actions
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  CLEAR_ALL_ERRORS: 'CLEAR_ALL_ERRORS',
  
  // Notification actions
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS',
  
  // UI actions
  SET_THEME: 'SET_THEME',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_CURRENT_PAGE: 'SET_CURRENT_PAGE',
  TOGGLE_MODAL: 'TOGGLE_MODAL',
  
  // App actions
  SET_INITIALIZED: 'SET_INITIALIZED',
  UPDATE_METADATA: 'UPDATE_METADATA'
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case APP_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.type]: action.payload.value
        }
      };
      
    case APP_ACTIONS.SET_GLOBAL_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          global: action.payload
        }
      };
      
    case APP_ACTIONS.SET_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.type]: action.payload.error
        }
      };
      
    case APP_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload]: null
        }
      };
      
    case APP_ACTIONS.CLEAR_ALL_ERRORS:
      return {
        ...state,
        errors: {
          global: null,
          transactions: null,
          budgets: null,
          categories: null
        }
      };
      
    case APP_ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...action.payload
          }
        ]
      };
      
    case APP_ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload
        )
      };
      
    case APP_ACTIONS.CLEAR_NOTIFICATIONS:
      return {
        ...state,
        notifications: []
      };
      
    case APP_ACTIONS.SET_THEME:
      return {
        ...state,
        ui: {
          ...state.ui,
          theme: action.payload
        }
      };
      
    case APP_ACTIONS.TOGGLE_SIDEBAR:
      return {
        ...state,
        ui: {
          ...state.ui,
          sidebarCollapsed: !state.ui.sidebarCollapsed
        }
      };
      
    case APP_ACTIONS.SET_CURRENT_PAGE:
      return {
        ...state,
        ui: {
          ...state.ui,
          currentPage: action.payload
        }
      };
      
    case APP_ACTIONS.TOGGLE_MODAL:
      return {
        ...state,
        ui: {
          ...state.ui,
          modals: {
            ...state.ui.modals,
            [action.payload.modal]: action.payload.isOpen
          }
        }
      };
      
    case APP_ACTIONS.SET_INITIALIZED:
      return {
        ...state,
        meta: {
          ...state.meta,
          initialized: action.payload
        }
      };
      
    case APP_ACTIONS.UPDATE_METADATA:
      return {
        ...state,
        meta: {
          ...state.meta,
          ...action.payload,
          lastUpdated: new Date().toISOString()
        }
      };
      
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Custom hook to use the app context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// App Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Memoized action creators to prevent recreation on every render
  const actions = useMemo(() => ({
    // Loading actions
    setLoading: (type, value) => {
      dispatch({
        type: APP_ACTIONS.SET_LOADING,
        payload: { type, value }
      });
    },
    
    setGlobalLoading: (value) => {
      dispatch({
        type: APP_ACTIONS.SET_GLOBAL_LOADING,
        payload: value
      });
    },
    
    // Error actions
    setError: (type, error) => {
      dispatch({
        type: APP_ACTIONS.SET_ERROR,
        payload: { type, error }
      });
    },
    
    clearError: (type) => {
      dispatch({
        type: APP_ACTIONS.CLEAR_ERROR,
        payload: type
      });
    },
    
    clearAllErrors: () => {
      dispatch({
        type: APP_ACTIONS.CLEAR_ALL_ERRORS
      });
    },
    
    // Notification actions
    addNotification: (notification) => {
      const notificationId = notification.id || Date.now();
      dispatch({
        type: APP_ACTIONS.ADD_NOTIFICATION,
        payload: { ...notification, id: notificationId }
      });
      
      // Auto-remove notification after 5 seconds if not persistent
      if (!notification.persistent) {
        setTimeout(() => {
          dispatch({
            type: APP_ACTIONS.REMOVE_NOTIFICATION,
            payload: notificationId
          });
        }, notification.duration || 5000);
      }
    },
    
    removeNotification: (id) => {
      dispatch({
        type: APP_ACTIONS.REMOVE_NOTIFICATION,
        payload: id
      });
    },
    
    clearNotifications: () => {
      dispatch({
        type: APP_ACTIONS.CLEAR_NOTIFICATIONS
      });
    },
    
    // UI actions
    setTheme: (theme) => {
      dispatch({
        type: APP_ACTIONS.SET_THEME,
        payload: theme
      });
    },
    
    toggleSidebar: () => {
      dispatch({
        type: APP_ACTIONS.TOGGLE_SIDEBAR
      });
    },
    
    setCurrentPage: (page) => {
      dispatch({
        type: APP_ACTIONS.SET_CURRENT_PAGE,
        payload: page
      });
    },
    
    toggleModal: (modal, isOpen) => {
      dispatch({
        type: APP_ACTIONS.TOGGLE_MODAL,
        payload: { modal, isOpen }
      });
    },
    
    // App actions
    setInitialized: (value) => {
      dispatch({
        type: APP_ACTIONS.SET_INITIALIZED,
        payload: value
      });
    },
    
    updateMetadata: (metadata) => {
      dispatch({
        type: APP_ACTIONS.UPDATE_METADATA,
        payload: metadata
      });
    },
    
    // Helper methods
    showSuccess: (message, options = {}) => {
      actions.addNotification({
        type: 'success',
        message,
        ...options
      });
    },
    
    showError: (message, options = {}) => {
      actions.addNotification({
        type: 'error',
        message,
        ...options
      });
    },
    
    showInfo: (message, options = {}) => {
      actions.addNotification({
        type: 'info',
        message,
        ...options
      });
    },
    
    showWarning: (message, options = {}) => {
      actions.addNotification({
        type: 'warning',
        message,
        ...options
      });
    }
  }), []); // Empty dependency array since actions only use dispatch which is stable

  // Initialize app on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        actions.setGlobalLoading(true);
        
        // Initialize storage if needed
        // Load user preferences
        // Set up the app
        
        actions.setInitialized(true);
        actions.updateMetadata({ version: '1.0.0' });
      } catch (error) {
        actions.setError('global', error.message);
      } finally {
        actions.setGlobalLoading(false);
      }
    };

    if (!state.meta.initialized) {
      initializeApp();
    }
  }, [state.meta.initialized]);

  // Memoized convenience getters to prevent recreation
  const isLoading = useCallback((type) => type ? state.loading[type] : state.loading.global, [state.loading]);
  const hasError = useCallback((type) => type ? !!state.errors[type] : !!state.errors.global, [state.errors]);
  const getError = useCallback((type) => type ? state.errors[type] : state.errors.global, [state.errors]);
  const isModalOpen = useCallback((modal) => state.ui.modals[modal] || false, [state.ui.modals]);

  // Memoized context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    state,
    actions,
    // Convenience getters
    isLoading,
    hasError,
    getError,
    isModalOpen,
    currentTheme: state.ui.theme,
    currentPage: state.ui.currentPage,
    notifications: state.notifications
  }), [state, actions, isLoading, hasError, getError, isModalOpen]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;