/**
 * Pure serialization helpers for CategoryRepository export operations.
 */

const CSV_HEADERS = ['ID', 'Name', 'Type', 'Color', 'Icon', 'Description', 'Is Default', 'Is Active', 'Parent ID', 'Created At'];

export function toCSV(categories) {
  if (categories.length === 0) {
    return '';
  }

  const rows = [CSV_HEADERS.join(',')];

  categories.forEach(category => {
    const row = [
      category.id,
      `"${category.name}"`,
      category.type,
      category.color,
      category.icon,
      `"${category.description || ''}"`,
      category.isDefault,
      category.isActive,
      category.parentId || '',
      category.createdAt
    ];
    rows.push(row.join(','));
  });

  return rows.join('\n');
}
