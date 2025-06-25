import React, { useMemo } from 'react';
import CategoryContext from '../CategoryContext.jsx';

/**
 * CategoryProvider - Clean Mock Implementation
 * 
 * LOGGING CLEANUP:
 * - Removed all debug logs that were causing performance issues
 * - Simple mock provider with stable memoized values
 * - No localStorage operations or excessive logging
 */
export const CategoryProvider = ({ children }) => {
  // Memoized context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
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
  }), []); // Empty dependency array since this is a static mock

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};

export default CategoryProvider;
