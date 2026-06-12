import { APP_ACTIONS } from './appActions.js';

export const appReducer = (state, action) => {
  switch (action.type) {
    case APP_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: { ...state.loading, [action.payload.type]: action.payload.value }
      };

    case APP_ACTIONS.SET_GLOBAL_LOADING:
      return {
        ...state,
        loading: { ...state.loading, global: action.payload }
      };

    case APP_ACTIONS.SET_ERROR:
      return {
        ...state,
        errors: { ...state.errors, [action.payload.type]: action.payload.error }
      };

    case APP_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        errors: { ...state.errors, [action.payload]: null }
      };

    case APP_ACTIONS.CLEAR_ALL_ERRORS:
      return {
        ...state,
        errors: { global: null, transactions: null, budgets: null, categories: null }
      };

    case APP_ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [
          ...state.notifications,
          { id: Date.now(), timestamp: new Date().toISOString(), ...action.payload }
        ]
      };

    case APP_ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };

    case APP_ACTIONS.CLEAR_NOTIFICATIONS:
      return { ...state, notifications: [] };

    case APP_ACTIONS.SET_THEME:
      return { ...state, ui: { ...state.ui, theme: action.payload } };

    case APP_ACTIONS.TOGGLE_SIDEBAR:
      return { ...state, ui: { ...state.ui, sidebarCollapsed: !state.ui.sidebarCollapsed } };

    case APP_ACTIONS.SET_CURRENT_PAGE:
      return { ...state, ui: { ...state.ui, currentPage: action.payload } };

    case APP_ACTIONS.TOGGLE_MODAL:
      return {
        ...state,
        ui: {
          ...state.ui,
          modals: { ...state.ui.modals, [action.payload.modal]: action.payload.isOpen }
        }
      };

    case APP_ACTIONS.SET_INITIALIZED:
      return { ...state, meta: { ...state.meta, initialized: action.payload } };

    case APP_ACTIONS.UPDATE_METADATA:
      return {
        ...state,
        meta: { ...state.meta, ...action.payload, lastUpdated: new Date().toISOString() }
      };

    default:
      return state;
  }
};
