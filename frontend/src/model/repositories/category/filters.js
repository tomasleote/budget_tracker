/**
 * Pure filter, sort, and paginate logic for CategoryRepository.getWithFilters.
 * sortFn must match the signature of BaseRepository.sortData(data, sortBy, sortOrder).
 */
export function applyFilters(categories, filters, sortFn) {
  let result = categories;

  if (filters.type && filters.type !== 'all') {
    result = result.filter(c => c.type === filters.type);
  }

  if (filters.status) {
    switch (filters.status) {
      case 'active':
        result = result.filter(c => c.isActive);
        break;
      case 'inactive':
        result = result.filter(c => !c.isActive);
        break;
      case 'default':
        result = result.filter(c => c.isDefault);
        break;
      case 'custom':
        result = result.filter(c => !c.isDefault);
        break;
    }
  }

  if (filters.parentOnly) {
    result = result.filter(c => c.parentId === null);
  }

  if (filters.parentId) {
    result = result.filter(c => c.parentId === filters.parentId);
  }

  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    result = result.filter(c =>
      c.name.toLowerCase().includes(searchTerm) ||
      (c.description && c.description.toLowerCase().includes(searchTerm))
    );
  }

  if (filters.color) {
    result = result.filter(c => c.color === filters.color);
  }

  if (filters.sortBy) {
    result = sortFn(result, filters.sortBy, filters.sortOrder || 'asc');
  } else {
    result = sortFn(result, 'name', 'asc');
  }

  if (filters.limit) {
    const offset = filters.offset || 0;
    result = result.slice(offset, offset + filters.limit);
  }

  return result;
}
