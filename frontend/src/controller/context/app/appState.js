export const initialState = {
  loading: {
    global: false,
    transactions: false,
    budgets: false,
    categories: false
  },
  errors: {
    global: null,
    transactions: null,
    budgets: null,
    categories: null
  },
  notifications: [],
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
  meta: {
    initialized: false,
    version: '1.0.0',
    lastUpdated: null
  }
};
