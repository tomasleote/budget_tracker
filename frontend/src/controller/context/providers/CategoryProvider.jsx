import { logger } from '../../utils/logger.js';
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { repositories } from '../../../model/repositories/RepositoryFactory.js';
import { initializeDefaultData, isAppInitialized } from '../../../model/services/DataInitializer.js';
import {
  defaultFilters,
  defaultErrors
} from './category/categoryState.js';
import {
  extractCategoriesData,
  computeStats,
  applyFiltersToCategories
} from './category/categoryHelpers.js';

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [stats, setStats] = useState({
    totalCategories: 0,
    activeCategories: 0,
    expenseCategories: 0,
    incomeCategories: 0
  });
  const [usage, setUsage] = useState({});
  const [filters, setFilters] = useState(defaultFilters);
  const [loadingStates, setLoadingStates] = useState({
    categories: false,
    creating: false,
    updating: false,
    deleting: false,
    stats: false
  });
  const [errors, setErrors] = useState(defaultErrors);

  const categoryRepository = useMemo(() => repositories.categories, []);

  const loadCategories = useCallback(async (queryParams = {}) => {
    setLoadingStates(prev => ({ ...prev, categories: true }));
    setErrors(prev => ({ ...prev, load: null }));

    try {
      logger.debug('🔄 Loading categories from backend...');
      const result = await categoryRepository.getAll(queryParams);

      const categoriesData = extractCategoriesData(result);
      if (categoriesData !== null) {
        setCategories(categoriesData);
        logger.debug('✅ Categories loaded:', categoriesData.length, 'categories');
        setStats(computeStats(categoriesData));
        return categoriesData;
      } else {
        throw new Error('Failed to load categories - invalid response format');
      }
    } catch (err) {
      logger.error('❌ Failed to load categories:', err);
      setErrors(prev => ({ ...prev, load: err.message || 'Failed to load categories' }));
      setCategories([]);
      return [];
    } finally {
      setLoadingStates(prev => ({ ...prev, categories: false }));
    }
  }, [categoryRepository]);

  const calculateStats = useCallback((categoriesData = categories) => {
    try {
      setStats(computeStats(categoriesData));
    } catch (err) {
      logger.error('❌ Failed to calculate category stats:', err);
    }
  }, [categories]);

  const loadUsage = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, stats: true }));
    try {
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
      logger.error('❌ Failed to load usage:', err);
      return {};
    } finally {
      setLoadingStates(prev => ({ ...prev, stats: false }));
    }
  }, [categories]);

  const loadStats = useCallback(async () => {
    calculateStats();
    return stats;
  }, [calculateStats, stats]);

  const createCategory = useCallback(async (categoryData) => {
    setLoadingStates(prev => ({ ...prev, creating: true }));
    setErrors(prev => ({ ...prev, create: null }));
    try {
      logger.debug('🔄 Creating category:', categoryData.name);
      const result = await categoryRepository.create({
        ...categoryData,
        isActive: categoryData.isActive !== false
      });

      if (result && result.success !== false) {
        const newCategory = result.data || result;
        setCategories(prev => [newCategory, ...prev]);
        logger.debug('✅ Category created:', newCategory.name || newCategory.id);
        calculateStats();
        window.dispatchEvent(new CustomEvent('categoryCreated', { detail: newCategory }));
        return { success: true, data: newCategory };
      } else {
        throw new Error(result?.error || 'Failed to create category');
      }
    } catch (err) {
      logger.error('❌ Failed to create category:', err);
      const errorMessage = err.message || 'Failed to create category';
      setErrors(prev => ({ ...prev, create: errorMessage }));
      return { success: false, error: errorMessage };
    } finally {
      setLoadingStates(prev => ({ ...prev, creating: false }));
    }
  }, [categoryRepository, calculateStats]);

  const updateCategory = useCallback(async (categoryId, updates) => {
    setLoadingStates(prev => ({ ...prev, updating: true }));
    setErrors(prev => ({ ...prev, update: null }));
    try {
      logger.debug('🔄 Updating category:', categoryId);
      const result = await categoryRepository.update(categoryId, updates);

      if (result && result.success !== false) {
        const updatedCategory = result.data || result;
        setCategories(prev => prev.map(c => c.id === categoryId ? updatedCategory : c));
        logger.debug('✅ Category updated:', updatedCategory.name || updatedCategory.id);
        calculateStats();
        window.dispatchEvent(new CustomEvent('categoryUpdated', { detail: updatedCategory }));
        return { success: true, data: updatedCategory };
      } else {
        throw new Error(result?.error || 'Failed to update category');
      }
    } catch (err) {
      logger.error('❌ Failed to update category:', err);
      const errorMessage = err.message || 'Failed to update category';
      setErrors(prev => ({ ...prev, update: errorMessage }));
      return { success: false, error: errorMessage };
    } finally {
      setLoadingStates(prev => ({ ...prev, updating: false }));
    }
  }, [categoryRepository, calculateStats]);

  const deleteCategory = useCallback(async (categoryId) => {
    setLoadingStates(prev => ({ ...prev, deleting: true }));
    setErrors(prev => ({ ...prev, delete: null }));
    try {
      logger.debug('🔄 Deleting category:', categoryId);
      const result = await categoryRepository.delete(categoryId);

      if (result && result.success !== false) {
        setCategories(prev => prev.filter(c => c.id !== categoryId));
        logger.debug('✅ Category deleted');
        calculateStats();
        window.dispatchEvent(new CustomEvent('categoryDeleted', { detail: { id: categoryId } }));
        return { success: true };
      } else {
        throw new Error(result?.error || 'Failed to delete category');
      }
    } catch (err) {
      logger.error('❌ Failed to delete category:', err);
      const errorMessage = err.message || 'Failed to delete category';
      setErrors(prev => ({ ...prev, delete: errorMessage }));
      return { success: false, error: errorMessage };
    } finally {
      setLoadingStates(prev => ({ ...prev, deleting: false }));
    }
  }, [categoryRepository, calculateStats]);

  const setCurrentCategoryAction = useCallback((category) => {
    setCurrentCategory(category);
  }, []);

  const clearCurrentCategory = useCallback(() => {
    setCurrentCategory(null);
  }, []);

  const activateCategory = useCallback(async (categoryId) => {
    return updateCategory(categoryId, { isActive: true });
  }, [updateCategory]);

  const deactivateCategory = useCallback(async (categoryId) => {
    return updateCategory(categoryId, { isActive: false });
  }, [updateCategory]);

  const getCategoryById = useCallback((categoryId) => {
    return categories.find(c => c.id === categoryId) || null;
  }, [categories]);

  const getCategoryByName = useCallback((name) => {
    return categories.find(c => c.name.toLowerCase() === name.toLowerCase()) || null;
  }, [categories]);

  const getCategoriesByType = useCallback((type) => {
    if (type === 'all') return categories;
    return categories.filter(c => c.type === type);
  }, [categories]);

  const getActiveCategories = useCallback(() => {
    return categories.filter(c => c.isActive !== false && c.is_active !== false);
  }, [categories]);

  const getDefaultCategories = useCallback(() => {
    return categories.filter(c => c.isDefault === true || c.is_default === true);
  }, [categories]);

  const initializeDefaultCategories = useCallback(async () => {
    if (categories.length === 0) {
      logger.debug('🔄 Initializing default categories...');
      await loadCategories();
    }
    return categories;
  }, [categories, loadCategories]);

  const getFilteredCategories = useCallback(() => {
    return applyFiltersToCategories(categories, filters, usage);
  }, [categories, filters, usage]);

  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const setFiltersAction = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const applyFilters = useCallback((newFilters) => {
    setFiltersAction(newFilters);
  }, [setFiltersAction]);

  const isLoading = useCallback((type) => {
    if (!type) return Object.values(loadingStates).some(state => state);
    return loadingStates[type] || false;
  }, [loadingStates]);

  const hasError = useCallback((type) => {
    if (!type) return Object.values(errors).some(error => error !== null);
    return errors[type] !== null;
  }, [errors]);

  const getError = useCallback((type) => {
    if (!type) return Object.values(errors).find(error => error !== null) || null;
    return errors[type];
  }, [errors]);

  const clearErrors = useCallback(() => {
    setErrors(defaultErrors);
  }, []);

  const refreshData = useCallback(async () => {
    return loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    const initializeAndLoad = async () => {
      if (!isAppInitialized()) {
        logger.debug('🌱 First time setup - initializing default categories...');
        await initializeDefaultData();
      }
      logger.debug('🔄 Loading categories on mount...');
      await loadCategories();
    };
    initializeAndLoad();
  }, []); // Empty dependency array for mount only

  useEffect(() => {
    if (categories.length > 0) {
      calculateStats();
    }
  }, [categories]); // Only depend on categories, not calculateStats

  useEffect(() => {
    if (categories.length > 0) {
      loadUsage();
    }
  }, [categories]); // Only depend on categories, not loadUsage

  const value = useMemo(() => ({
    categories,
    currentCategory,
    stats,
    usage,
    filters,
    getFilteredCategories,
    isLoading: isLoading(),
    hasError,
    getError,
    getCategoryById,
    getCategoryByName,
    actions: {
      loadCategories,
      createCategory,
      updateCategory,
      deleteCategory,
      setCurrentCategory: setCurrentCategoryAction,
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
      setFilters: setFiltersAction,
      resetFilters,
      applyFilters,
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
    loadingStates,
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

export const useCategoryContext = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategoryContext must be used within a CategoryProvider');
  }
  return context;
};

export default CategoryProvider;
