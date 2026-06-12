import { Category, CategoryWithChildren, CreateCategoryDto } from '../../types/category';
import { logger } from '../../config/logger';

export function filterCategoriesRecursive(
  categories: CategoryWithChildren[],
  predicate: (cat: Category) => boolean
): CategoryWithChildren[] {
  return categories
    .filter(predicate)
    .map(cat => ({
      ...cat,
      children: cat.children ? filterCategoriesRecursive(cat.children, predicate) : []
    }));
}

export async function wouldCreateCircularReference(
  categoryId: string,
  newParentId: string,
  getById: (id: string) => Promise<Category | null>
): Promise<boolean> {
  let currentParentId: string | null = newParentId;
  const visited = new Set<string>();
  const maxDepth = 10;
  let depth = 0;

  while (currentParentId && !visited.has(currentParentId) && depth < maxDepth) {
    if (currentParentId === categoryId) {
      return true;
    }
    visited.add(currentParentId);
    const parent = await getById(currentParentId);
    currentParentId = parent?.parent_id || null;
    depth++;
  }

  return false;
}

export const DEFAULT_CATEGORIES: Array<{
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
}> = [
  { name: 'Food & Dining',     type: 'expense', color: '#FF6B6B', icon: 'utensils' },
  { name: 'Transportation',    type: 'expense', color: '#4ECDC4', icon: 'car' },
  { name: 'Shopping',          type: 'expense', color: '#95E1D3', icon: 'shopping-bag' },
  { name: 'Entertainment',     type: 'expense', color: '#F6D55C', icon: 'gamepad' },
  { name: 'Bills & Utilities', type: 'expense', color: '#ED553B', icon: 'file-invoice-dollar' },
  { name: 'Healthcare',        type: 'expense', color: '#20639B', icon: 'heartbeat' },
  { name: 'Education',         type: 'expense', color: '#173F5F', icon: 'graduation-cap' },
  { name: 'Personal Care',     type: 'expense', color: '#3CAEA3', icon: 'spa' },
  { name: 'Home',              type: 'expense', color: '#F6D55C', icon: 'home' },
  { name: 'Other',             type: 'expense', color: '#95A5A6', icon: 'ellipsis-h' },
  { name: 'Salary',            type: 'income',  color: '#2ECC71', icon: 'briefcase' },
  { name: 'Freelance',         type: 'income',  color: '#3498DB', icon: 'laptop' },
  { name: 'Investment',        type: 'income',  color: '#9B59B6', icon: 'chart-line' },
  { name: 'Business',          type: 'income',  color: '#E74C3C', icon: 'store' },
  { name: 'Gift',              type: 'income',  color: '#F39C12', icon: 'gift' },
  { name: 'Other Income',      type: 'income',  color: '#95A5A6', icon: 'plus-circle' }
];

export async function runSeedDefaultCategories(
  getCategories: () => Promise<Category[]>,
  bulkCreateCategories: (cats: CreateCategoryDto[]) => Promise<Category[]>
): Promise<{ created_count: number; skipped_count: number; categories: Category[] }> {
  const existingCategories = await getCategories();

  if (existingCategories.length > 0) {
    logger.info('Default categories already exist, skipping seed');
    return {
      created_count: 0,
      skipped_count: existingCategories.length,
      categories: existingCategories
    };
  }

  logger.info('Seeding default categories...');

  const created = await bulkCreateCategories(
    DEFAULT_CATEGORIES.map(cat => ({ ...cat, is_default: true, is_active: true }))
  );

  logger.info(`Default categories seeding completed: ${created.length} categories created`);

  return { created_count: created.length, skipped_count: 0, categories: created };
}
