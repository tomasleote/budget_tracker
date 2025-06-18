import React, { createContext, useContext } from 'react';

// Mock Category Context Hook
const CategoryContext = createContext();

export const useCategoryContext = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    // Return mock data structure
    return {
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
  }
  return context;
};

export default CategoryContext;
