import { Category } from '../../types/category';

/** Build the OR-condition string for batch category name/type validation. */
export function buildCategoryValidationOrConditions(
  categories: { name: string; type: 'income' | 'expense' }[]
): string {
  return categories
    .map(cat => `(name.eq.${cat.name},type.eq.${cat.type})`)
    .join(',');
}

/** Build the category hierarchy from a flat list in O(n). */
export function buildCategoryHierarchy(
  flatCategories: Category[]
): (Category & { children?: Category[] })[] {
  const categoryMap = new Map<string, Category & { children?: Category[] }>();
  const rootCategories: (Category & { children?: Category[] })[] = [];

  flatCategories.forEach(category => {
    categoryMap.set(category.id, { ...category, children: [] });
  });

  flatCategories.forEach(category => {
    const node = categoryMap.get(category.id)!;
    if (!category.parent_id) {
      rootCategories.push(node);
    } else {
      const parent = categoryMap.get(category.parent_id);
      if (parent) {
        parent.children!.push(node);
      }
    }
  });

  return rootCategories;
}
