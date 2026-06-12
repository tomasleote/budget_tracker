/**
 * Pure helper functions for CategoryProvider.
 * No React hooks — safe to call from within callbacks.
 */

/**
 * Extracts a categories array from the varied response shapes the repository may return.
 */
export function extractCategoriesData(result) {
  if (Array.isArray(result)) return result;
  if (result?.data && Array.isArray(result.data)) return result.data;
  if (result?.categories && Array.isArray(result.categories)) return result.categories;
  return null;
}

/**
 * Computes category statistics from a categories array.
 */
export function computeStats(categoriesData) {
  return {
    totalCategories: categoriesData.length,
    activeCategories: categoriesData.filter(c => c.isActive !== false && c.is_active !== false).length,
    expenseCategories: categoriesData.filter(c => c.type === 'expense').length,
    incomeCategories: categoriesData.filter(c => c.type === 'income').length
  };
}

/**
 * Returns a filtered and sorted copy of the categories array based on filters and usage map.
 */
export function applyFiltersToCategories(categories, filters, usage) {
  let filtered = [...categories];

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(c =>
      c.name.toLowerCase().includes(searchLower) ||
      (c.description && c.description.toLowerCase().includes(searchLower))
    );
  }

  if (filters.type !== 'all') {
    filtered = filtered.filter(c => c.type === filters.type);
  }

  if (filters.status !== 'all') {
    const isActive = filters.status === 'active';
    filtered = filtered.filter(c =>
      (c.isActive !== false && c.is_active !== false) === isActive
    );
  }

  filtered.sort((a, b) => {
    let compareValue = 0;
    switch (filters.sortBy) {
      case 'name':
        compareValue = a.name.localeCompare(b.name);
        break;
      case 'type':
        compareValue = a.type.localeCompare(b.type);
        break;
      case 'usage': {
        const aUsage = usage[a.id]?.count || 0;
        const bUsage = usage[b.id]?.count || 0;
        compareValue = aUsage - bUsage;
        break;
      }
      default:
        compareValue = 0;
    }
    return filters.sortOrder === 'asc' ? compareValue : -compareValue;
  });

  return filtered;
}
