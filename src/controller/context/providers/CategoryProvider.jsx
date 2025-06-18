import React from 'react';
import CategoryContext from '../CategoryContext.jsx';

// Simple mock CategoryProvider for now
export const CategoryProvider = ({ children }) => {
  const value = {
    categories: [],
    filteredCategories: [],
    currentCategory: null,
    stats: {
      totalCategories: 0,
      activeCategories: 0,
      expenseCategories: 0,
      incomeCategories: 0
    },
    usage: {},
    filters: {
      search: '',
      type: 'all',
      status: 'all',
      sortBy: 'name',
      sortOrder: 'asc'
    },
    isLoading: () => false,
    hasError: () => false,
    getError: () => null,
    getCategoryById: () => null,
    getCategoryByName: () => null,
    getFilteredCategories: () => [],
    actions: {
      loadCategories: async () => {},
      createCategory: async () => {},
      updateCategory: async () => {},
      deleteCategory: async () => {},
      setCurrentCategory: () => {},
      clearCurrentCategory: () => {},
      activateCategory: async () => {},
      deactivateCategory: async () => {},
      loadStats: async () => {},
      loadUsage: async () => {},
      getCategoriesByType: () => [],
      getActiveCategories: () => [],
      getDefaultCategories: () => [],
      initializeDefaultCategories: async () => {},
      setFilter: () => {},
      setFilters: () => {},
      resetFilters: () => {},
      refreshData: async () => {},
      clearErrors: () => {}
    }
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};

export default CategoryProvider;
