import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import { initialState } from './app/appState.js';
import { APP_ACTIONS } from './app/appActions.js';
import { appReducer } from './app/appReducer.js';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const actions = useMemo(() => ({
    setLoading: (type, value) => {
      dispatch({ type: APP_ACTIONS.SET_LOADING, payload: { type, value } });
    },

    setGlobalLoading: (value) => {
      dispatch({ type: APP_ACTIONS.SET_GLOBAL_LOADING, payload: value });
    },

    setError: (type, error) => {
      dispatch({ type: APP_ACTIONS.SET_ERROR, payload: { type, error } });
    },

    clearError: (type) => {
      dispatch({ type: APP_ACTIONS.CLEAR_ERROR, payload: type });
    },

    clearAllErrors: () => {
      dispatch({ type: APP_ACTIONS.CLEAR_ALL_ERRORS });
    },

    addNotification: (notification) => {
      const notificationId = notification.id || Date.now();
      dispatch({ type: APP_ACTIONS.ADD_NOTIFICATION, payload: { ...notification, id: notificationId } });

      if (!notification.persistent) {
        setTimeout(() => {
          dispatch({ type: APP_ACTIONS.REMOVE_NOTIFICATION, payload: notificationId });
        }, notification.duration || 5000);
      }
    },

    removeNotification: (id) => {
      dispatch({ type: APP_ACTIONS.REMOVE_NOTIFICATION, payload: id });
    },

    clearNotifications: () => {
      dispatch({ type: APP_ACTIONS.CLEAR_NOTIFICATIONS });
    },

    setTheme: (theme) => {
      dispatch({ type: APP_ACTIONS.SET_THEME, payload: theme });
    },

    toggleSidebar: () => {
      dispatch({ type: APP_ACTIONS.TOGGLE_SIDEBAR });
    },

    setCurrentPage: (page) => {
      dispatch({ type: APP_ACTIONS.SET_CURRENT_PAGE, payload: page });
    },

    toggleModal: (modal, isOpen) => {
      dispatch({ type: APP_ACTIONS.TOGGLE_MODAL, payload: { modal, isOpen } });
    },

    setInitialized: (value) => {
      dispatch({ type: APP_ACTIONS.SET_INITIALIZED, payload: value });
    },

    updateMetadata: (metadata) => {
      dispatch({ type: APP_ACTIONS.UPDATE_METADATA, payload: metadata });
    },

    showSuccess: (message, options = {}) => {
      actions.addNotification({ type: 'success', message, ...options });
    },

    showError: (message, options = {}) => {
      actions.addNotification({ type: 'error', message, ...options });
    },

    showInfo: (message, options = {}) => {
      actions.addNotification({ type: 'info', message, ...options });
    },

    showWarning: (message, options = {}) => {
      actions.addNotification({ type: 'warning', message, ...options });
    }
  }), []); // Empty dependency array since actions only use dispatch which is stable

  useEffect(() => {
    const initializeApp = async () => {
      try {
        actions.setGlobalLoading(true);
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

  const isLoading = useCallback((type) => type ? state.loading[type] : state.loading.global, [state.loading]);
  const hasError = useCallback((type) => type ? !!state.errors[type] : !!state.errors.global, [state.errors]);
  const getError = useCallback((type) => type ? state.errors[type] : state.errors.global, [state.errors]);
  const isModalOpen = useCallback((modal) => state.ui.modals[modal] || false, [state.ui.modals]);

  const value = useMemo(() => ({
    state,
    actions,
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
