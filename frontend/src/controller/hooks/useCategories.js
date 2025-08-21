import { useCategoryContext } from '../context/providers/CategoryProvider.jsx';

/**
 * Custom hook for category operations
 * Provides easy access to category data and operations
 */
export const useCategories = () => {
  const context = useCategoryContext();
  
  if (!context) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }

  return {
    // Category data
    categories: context.categories,
    filteredCategories: context.getFilteredCategories(),
    currentCategory: context.currentCategory,
    
    // Statistics data
    stats: context.stats,
    usage: context.usage,
    
    // State helpers
    isLoading: context.isLoading,
    hasError: context.hasError,
    getError: context.getError,
    
    // Quick state checks
    isLoadingCategories: context.isLoading('categories'),
    isCreatingCategory: context.isLoading('creating'),
    isUpdatingCategory: context.isLoading('updating'),
    isDeletingCategory: context.isLoading('deleting'),
    isLoadingStats: context.isLoading('stats'),
    
    // Error checks
    hasLoadError: context.hasError('load'),
    hasCreateError: context.hasError('create'),
    hasUpdateError: context.hasError('update'),
    hasDeleteError: context.hasError('delete'),
    
    // Filter state
    filters: context.filters,
    
    // Core operations
    createCategory: context.actions.createCategory,
    updateCategory: context.actions.updateCategory,
    deleteCategory: context.actions.deleteCategory,
    loadCategories: context.actions.loadCategories,
    
    // Category management
    setCurrentCategory: context.actions.setCurrentCategory,
    clearCurrentCategory: context.actions.clearCurrentCategory,
    activateCategory: context.actions.activateCategory,
    deactivateCategory: context.actions.deactivateCategory,
    
    // Statistics operations
    loadStats: context.actions.loadStats,
    loadUsage: context.actions.loadUsage,
    
    // Data operations
    getCategoriesByType: context.actions.getCategoriesByType,
    getActiveCategories: context.actions.getActiveCategories,
    getDefaultCategories: context.actions.getDefaultCategories,
    initializeDefaultCategories: context.actions.initializeDefaultCategories,
    
    // Filter operations
    setFilter: context.actions.setFilter,
    setFilters: context.actions.setFilters,
    resetFilters: context.actions.resetFilters,
    
    // Utility operations
    refreshCategories: context.actions.refreshData,
    clearErrors: context.actions.clearErrors,
    
    // Category helpers
    getCategoryById: context.getCategoryById,
    getCategoryByName: context.getCategoryByName,
    
    getExpenseCategories: () => {
      return context.categories.filter(c => c.type === 'expense');
    },
    
    getIncomeCategories: () => {
      return context.categories.filter(c => c.type === 'income');
    },
    
    getActiveExpenseCategories: () => {
      return context.categories.filter(c => c.type === 'expense' && c.isActive);
    },
    
    getActiveIncomeCategories: () => {
      return context.categories.filter(c => c.type === 'income' && c.isActive);
    },
    
    // Quick actions
    createExpenseCategory: (name, description = '', icon = '💰', color = '#4ECDC4') => {
      return context.actions.createCategory({
        name,
        description,
        type: 'expense',
        icon,
        color,
        isActive: true,
        isDefault: false
      });
    },
    
    createIncomeCategory: (name, description = '', icon = '💵', color = '#96CEB4') => {
      return context.actions.createCategory({
        name,
        description,
        type: 'income',
        icon,
        color,
        isActive: true,
        isDefault: false
      });
    },
    
    // Search and filter operations
    searchCategories: (searchTerm) => {
      context.actions.setFilter('search', searchTerm);
    },
    
    filterByType: (type) => {
      context.actions.setFilter('type', type);
    },
    
    filterByStatus: (status) => {
      context.actions.setFilter('status', status);
    },
    
    // Sort operations
    sortByName: (order = 'asc') => {
      context.actions.setFilters({
        sortBy: 'name',
        sortOrder: order
      });
    },
    
    sortByUsage: (order = 'desc') => {
      context.actions.setFilters({
        sortBy: 'usage',
        sortOrder: order
      });
    },
    
    sortByType: (order = 'asc') => {
      context.actions.setFilters({
        sortBy: 'type',
        sortOrder: order
      });
    },
    
    // Statistics helpers
    totalCategories: context.stats.totalCategories || 0,
    activeCategories: context.stats.activeCategories || 0,
    expenseCategories: context.stats.expenseCategories || 0,
    incomeCategories: context.stats.incomeCategories || 0,
    
    // Usage helpers
    getMostUsedCategories: (limit = 5) => {
      return Object.entries(context.usage)
        .sort(([,a], [,b]) => b.count - a.count)
        .slice(0, limit)
        .map(([categoryId, usage]) => ({
          category: context.getCategoryById(categoryId),
          usage
        }));
    },
    
    getLeastUsedCategories: (limit = 5) => {
      return Object.entries(context.usage)
        .sort(([,a], [,b]) => a.count - b.count)
        .slice(0, limit)
        .map(([categoryId, usage]) => ({
          category: context.getCategoryById(categoryId),
          usage
        }));
    },
    
    getCategoryUsage: (categoryId) => {
      return context.usage[categoryId] || { count: 0, amount: 0 };
    },
    
    // Validation helpers
    isCategoryNameUnique: (name, excludeId = null) => {
      return !context.categories.some(c => 
        c.name.toLowerCase() === name.toLowerCase() && c.id !== excludeId
      );
    },
    
    hasActiveCategories: () => {
      return context.categories.some(c => c.isActive);
    },
    
    hasDefaultCategories: () => {
      return context.categories.some(c => c.isDefault);
    },
    
    // Category options for forms
    getExpenseCategoryOptions: () => {
      return context.categories
        .filter(c => c.type === 'expense' && c.isActive)
        .map(c => ({ value: c.id, label: c.name, icon: c.icon, color: c.color }));
    },
    
    getIncomeCategoryOptions: () => {
      return context.categories
        .filter(c => c.type === 'income' && c.isActive)
        .map(c => ({ value: c.id, label: c.name, icon: c.icon, color: c.color }));
    },
    
    getAllCategoryOptions: () => {
      return context.categories
        .filter(c => c.isActive)
        .map(c => ({ value: c.id, label: c.name, icon: c.icon, color: c.color, type: c.type }));
    }
  };
};

export default useCategories;