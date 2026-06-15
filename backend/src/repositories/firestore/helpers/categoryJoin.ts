/**
 * Loads the current user's categories for in-memory joins onto transactions
 * and budgets (Firestore has no server-side joins).
 */
import { firestore } from '../../../config/firebase';
import { getUid } from '../../../context/requestContext';
import { Category } from '../../../types/category';

export interface CategoryInfo {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
}

export async function loadCategoryMap(): Promise<Map<string, Category>> {
  const snapshot = await firestore
    .collection('users')
    .doc(getUid())
    .collection('categories')
    .get();

  const map = new Map<string, Category>();
  snapshot.docs.forEach(doc => {
    const category = doc.data() as Category;
    map.set(category.id, category);
  });
  return map;
}

export function toCategoryInfo(category?: Category): CategoryInfo {
  if (!category) {
    return { id: '', name: '', type: 'expense', color: '', icon: '' };
  }
  return {
    id: category.id,
    name: category.name,
    type: category.type,
    color: category.color,
    icon: category.icon,
  };
}
