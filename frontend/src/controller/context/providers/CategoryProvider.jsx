import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { repositories } from '../../../model/repositories/RepositoryFactory.js';
import { initializeDefaultData, isAppInitialized } from '../../../model/services/DataInitializer.js';

// Create CategoryContext
const CategoryContext = createContext();

/**
 * CategoryProvider - Real API Implementation
 * Connects to backend database through repository pattern
 */
export const CategoryProvider = ({ children }) => {
  // State management
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [stats, setStats] = useState({
    totalCategories: 0,
    activeCategories: 0,
    expenseCategories: 0,
    incomeCategories: 0
  });
  const [usage, setUsage] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    type: 'all', // 'all', 'income', 'expense'
    status: 'all', // 'all', 'active', 'inactive'
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [loadingStates, setLoadingStates] = useState({
    categories: false,
    creating: false,
    updating: false,
    deleting: false,
    stats: false
  });
  const [errors, setErrors] = useState({
    load: null,
    create: null,
    update: null,
    delete: null
  });

  // Get repository instance
  const categoryRepository = useMemo(() => repositories.categories, []);

  // ============= Core Loading Functions =============
  
  // Load categories from API/database
  const loadCategories = useCallback(async (queryParams = {}) => {
    setLoadingStates(prev => ({ ...prev, categories: true }));
    setErrors(prev => ({ ...prev, load: null }));
    
    try {
      console.log('🔄 Loading categories from backend...');
      const result = await categoryRepository.getAll(queryParams);
      
      // Handle the response from the interceptor consistently
      if (result && (result.data || Array.isArray(result))) {
        let categoriesData;
        
        if (Array.isArray(result)) {
          // Direct array response
          categoriesData = result;
        } else if (result.data && Array.isArray(result.data)) {
          // Wrapped array response
          categoriesData = result.data;
        } else if (result.categories && Array.isArray(result.categories)) {
          // Backend format: { categories: [...] }
          categoriesData = result.categories;
        } else {
          categoriesData = [];
        }
        
        setCategories(categoriesData);
        console.log('✅ Categories loaded:', categoriesData.length, 'categories');
        
        // Calculate stats
        calculateStats(categoriesData);
        
        return categoriesData;
      } else {
        throw new Error('Failed to load categories - invalid response format');
      }
    } catch (err) {
      console.error('❌ Failed to load categories:', err);
      const errorMessage = err.message || 'Failed to load categories';
      setErrors(prev => ({ ...prev, load: errorMessage }));
      setCategories([]); // Fallback to empty array
      return [];
    } finally {
      setLoadingStates(prev => ({ ...prev, categories: false }));
    }
  }, [categoryRepository]);

  // Calculate category statistics
  const calculateStats = useCallback((categoriesData = categories) => {
    try {
      const stats = {
        totalCategories: categoriesData.length,
        activeCategories: categoriesData.filter(c => c.isActive !== false && c.is_active !== false).length,
        expenseCategories: categoriesData.filter(c => c.type === 'expense').length,
        incomeCategories: categoriesData.filter(c => c.type === 'income').length
      };
      
      setStats(stats);
    } catch (err) {
      console.error('❌ Failed to calculate category stats:', err);
    }
  }, [categories]);

  // Load category usage statistics
  const loadUsage = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, stats: true }));
    
    try {
      // This would typically fetch from an analytics endpoint
      // For now, return mock usage data
      const usageData = {};
      categories.forEach(category => {
        usageData[category.id] = {
          count: Math.floor(Math.random() * 100),
          amount: Math.random() * 10000
        };
      });
      
      setUsage(usageData);
      return usageData;
    } catch (err) {
      console.error('❌ Failed to load usage:', err);
      return {};
    } finally {
      setLoadingStates(prev => ({ ...prev, stats: false }));
    }
  }, [categories]);

  // Load statistics (alias for calculateStats)
  const loadStats = useCallback(async () => {
    calculateStats();
    return stats;
  }, [calculateStats, stats]);

  // ============= CRUD Operations =============

  // Create new category
  const createCategory = useCallback(async (categoryData) => {
    setLoadingStates(prev => ({ ...prev, creating: true }));
    setErrors(prev => ({ ...prev, create: null }));
    
    try {
      console.log('🔄 Creating category:', categoryData.name);
      const result = await categoryRepository.create({
        ...categoryData,
        isActive: categoryData.isActive !== false // Default to active
      });
      
      // Handle response format consistently
      if (result && (result.success !== false)) {
        const newCategory = result.data || result;
        
        // Add to local state
        setCategories(prev => [newCategory, ...prev]);
        console.log('✅ Category created:', newCategory.name || newCategory.id);
        
        // Recalculate stats
        calculateStats();
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('categoryCreated', { 
          detail: newCategory 
        }));
        
        return { success: true, data: newCategory };
      } else {
        throw new Error(result?.error || 'Failed to create category');
      }
    } catch (err) {
      console.error('❌ Failed to create category:', err);
      const errorMessage = err.message || 'Failed to create category';
      setErrors(prev => ({ ...prev, create: errorMessage }));
      return { success: false, error: errorMessage };
    } finally {
      setLoadingStates(prev => ({ ...prev, creating: false }));
    }
  }, [categoryRepository, calculateStats]);

  // Update existing category
  const updateCategory = useCallback(async (categoryId, updates) => {
    setLoadingStates(prev => ({ ...prev, updating: true }));
    setErrors(prev => ({ ...prev, update: null }));
    
    try {
      console.log('🔄 Updating category:', categoryId);
      const result = await categoryRepository.update(categoryId, updates);
      
      // Handle response format consistently
      if (result && (result.success !== false)) {
        const updatedCategory = result.data || result;
        
        // Update local state
        setCategories(prev => 
          prev.map(c => c.id === categoryId ? updatedCategory : c)
        );
        console.log('✅ Category updated:', updatedCategory.name || updatedCategory.id);
        
        // Recalculate stats
        calculateStats();
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('categoryUpdated', { 
          detail: updatedCategory 
        }));
        
        return { success: true, data: updatedCategory };
      } else {
        throw new Error(result?.error || 'Failed to update category');
      }
    } catch (err) {
      console.error('❌ Failed to update category:', err);
      const errorMessage = err.message || 'Failed to update category';
      setErrors(prev => ({ ...prev, update: errorMessage }));
      return { success: false, error: errorMessage };
    } finally {
      setLoadingStates(prev => ({ ...prev, updating: false }));
    }
  }, [categoryRepository, calculateStats]);

  // Delete category
  const deleteCategory = useCallback(async (categoryId) => {
    setLoadingStates(prev => ({ ...prev, deleting: true }));
    setErrors(prev => ({ ...prev, delete: null }));
    
    try {
      console.log('🔄 Deleting category:', categoryId);
      const result = await categoryRepository.delete(categoryId);
      
      // Handle response format consistently
      if (result && (result.success !== false)) {
        // Remove from local state
        setCategories(prev => prev.filter(c => c.id !== categoryId));
        console.log('✅ Category deleted');
        
        // Recalculate stats
        calculateStats();
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('categoryDeleted', { 
          detail: { id: categoryId } 
        }));
        
        return { success: true };
      } else {
        throw new Error(result?.error || 'Failed to delete category');
      }
    } catch (err) {
      console.error('❌ Failed to delete category:', err);
      const errorMessage = err.message || 'Failed to delete category';
      setErrors(prev => ({ ...prev, delete: errorMessage }));
      return { success: false, error: errorMessage };
    } finally {
      setLoadingStates(prev => ({ ...prev, deleting: false }));
    }
  }, [categoryRepository, calculateStats]);

  // ============= Category Management Functions =============

  // Set current category
  const setCurrentCategoryAction = useCallback((category) => {
    setCurrentCategory(category);
  }, []);

  // Clear current category
  const clearCurrentCategory = useCallback(() => {
    setCurrentCategory(null);
  }, []);

  // Activate category
  const activateCategory = useCallback(async (categoryId) => {
    return updateCategory(categoryId, { isActive: true });
  }, [updateCategory]);

  // Deactivate category
  const deactivateCategory = useCallback(async (categoryId) => {
    return updateCategory(categoryId, { isActive: false });
  }, [updateCategory]);

  // ============= Data Retrieval Functions =============

  // Get category by ID
  const getCategoryById = useCallback((categoryId) => {
    return categories.find(c => c.id === categoryId) || null;
  }, [categories]);

  // Get category by name
  const getCategoryByName = useCallback((name) => {
    return categories.find(c => c.name.toLowerCase() === name.toLowerCase()) || null;
  }, [categories]);

  // Get categories by type
  const getCategoriesByType = useCallback((type) => {
    if (type === 'all') return categories;
    return categories.filter(c => c.type === type);
  }, [categories]);

  // Get active categories
  const getActiveCategories = useCallback(() => {
    return categories.filter(c => c.isActive !== false && c.is_active !== false);
  }, [categories]);

  // Get default categories
  const getDefaultCategories = useCallback(() => {
    return categories.filter(c => c.isDefault === true || c.is_default === true);
  }, [categories]);

  // Initialize default categories
  const initializeDefaultCategories = useCallback(async () => {
    if (categories.length === 0) {
      // Load default categories from backend
      console.log('🔄 Initializing default categories...');
      await loadCategories();
    }
    return categories;
  }, [categories, loadCategories]);

  // ============= Filter Functions =============

  // Get filtered categories based on current filters
  const getFilteredCategories = useCallback(() => {
    let filtered = [...categories];
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchLower) ||
        (c.description && c.description.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(c => c.type === filters.type);
    }
    
    // Apply status filter
    if (filters.status !== 'all') {
      const isActive = filters.status === 'active';
      filtered = filtered.filter(c => 
        (c.isActive !== false && c.is_active !== false) === isActive
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      switch (filters.sortBy) {
        case 'name':
          compareValue = a.name.localeCompare(b.name);
          break;
        case 'type':
          compareValue = a.type.localeCompare(b.type);
          break;
        case 'usage':
          const aUsage = usage[a.id]?.count || 0;
          const bUsage = usage[b.id]?.count || 0;
          compareValue = aUsage - bUsage;
          break;
        default:
          compareValue = 0;
      }
      
      return filters.sortOrder === 'asc' ? compareValue : -compareValue;
    });
    
    return filtered;
  }, [categories, filters, usage]);

  // Set single filter
  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Set multiple filters
  const setFiltersAction = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      type: 'all',
      status: 'all',
      sortBy: 'name',
      sortOrder: 'asc'
    });
  }, []);

  // Apply filters (alias for setFiltersAction)
  const applyFilters = useCallback((newFilters) => {
    setFiltersAction(newFilters);
  }, [setFiltersAction]);

  // ============= Helper Functions =============

  // Check if loading
  const isLoading = useCallback((type) => {
    if (!type) {
      return Object.values(loadingStates).some(state => state);
    }
    return loadingStates[type] || false;
  }, [loadingStates]);

  // Check if has error
  const hasError = useCallback((type) => {
    if (!type) {
      return Object.values(errors).some(error => error !== null);
    }
    return errors[type] !== null;
  }, [errors]);

  // Get error
  const getError = useCallback((type) => {
    if (!type) {
      return Object.values(errors).find(error => error !== null) || null;
    }
    return errors[type];
  }, [errors]);

  // Clear errors
  const clearErrors = useCallback(() => {
    setErrors({
      load: null,
      create: null,
      update: null,
      delete: null
    });
  }, []);

  // Refresh data (alias for loadCategories)
  const refreshData = useCallback(async () => {
    return loadCategories();
  }, [loadCategories]);

  // ============= Effects =============

  // Initialize default categories and load on component mount
  useEffect(() => {
    const initializeAndLoad = async () => {
      // Check if app needs initialization
      if (!isAppInitialized()) {
        console.log('🌱 First time setup - initializing default categories...');
        await initializeDefaultData();
      }
      
      // Load categories after initialization
      console.log('🔄 Loading categories on mount...');
      await loadCategories();
    };
    
    initializeAndLoad();
  }, []); // Empty dependency array for mount only

  // Recalculate stats when categories change
  useEffect(() => {
    if (categories.length > 0) {
      calculateStats();
    }
  }, [categories]); // Only depend on categories, not calculateStats

  // Load usage data when categories change
  useEffect(() => {
    if (categories.length > 0) {
      loadUsage();
    }
  }, [categories]); // Only depend on categories, not loadUsage

  // ============= Context Value =============

  // Memoized context value
  const value = useMemo(() => ({
    // State
    categories,
    currentCategory,
    stats,
    usage,
    filters,
    
    // Computed values
    getFilteredCategories,
    
    // Loading and error states - FIXED: isLoading as boolean, not function
    isLoading: isLoading(), // Call the function to get boolean value
    hasError,
    getError,
    
    // Category retrieval
    getCategoryById,
    getCategoryByName,
    
    // Actions object for all operations
    actions: {
      // Core CRUD
      loadCategories,
      createCategory,
      updateCategory,
      deleteCategory,
      
      // Category management
      setCurrentCategory: setCurrentCategoryAction,
      clearCurrentCategory,
      activateCategory,
      deactivateCategory,
      
      // Statistics
      loadStats,
      loadUsage,
      calculateStats,
      
      // Data retrieval
      getCategoriesByType,
      getActiveCategories,
      getDefaultCategories,
      initializeDefaultCategories,
      
      // Filters
      setFilter,
      setFilters: setFiltersAction,
      resetFilters,
      applyFilters,
      
      // Utility
      refreshData,
      clearErrors
    }
  }), [
    categories,
    currentCategory,
    stats,
    usage,
    filters,
    getFilteredCategories,
    loadingStates, // Changed from isLoading function to loadingStates object
    hasError,
    getError,
    getCategoryById,
    getCategoryByName,
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    setCurrentCategoryAction,
    clearCurrentCategory,
    activateCategory,
    deactivateCategory,
    loadStats,
    loadUsage,
    calculateStats,
    getCategoriesByType,
    getActiveCategories,
    getDefaultCategories,
    initializeDefaultCategories,
    setFilter,
    setFiltersAction,
    resetFilters,
    applyFilters,
    refreshData,
    clearErrors
  ]);

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};

// Hook to use CategoryContext
export const useCategoryContext = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategoryContext must be used within a CategoryProvider');
  }
  return context;
};

export default CategoryProvider;
