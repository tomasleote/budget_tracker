/**
 * Loads the current user's transactions (with category attached) and active
 * budgets, shaped for the analytics aggregation helpers.
 */
import { firestore } from '../../../config/firebase';
import { getUid } from '../../../context/requestContext';
import { Transaction } from '../../../types/transaction';
import { Budget } from '../../../types/budget';
import { loadCategoryMap } from './categoryJoin';

export interface AnalyticsTransaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  created_at: string;
  category: { id: string; name: string; color: string; icon: string };
}

function userCollection(name: string) {
  return firestore.collection('users').doc(getUid()).collection(name);
}

export async function loadTransactionsWithCategory(): Promise<AnalyticsTransaction[]> {
  const [snapshot, categories] = await Promise.all([userCollection('transactions').get(), loadCategoryMap()]);
  return snapshot.docs.map(doc => {
    const t = doc.data() as Transaction;
    const c = categories.get(t.category_id);
    return {
      id: t.id,
      type: t.type,
      amount: t.amount,
      description: t.description,
      date: t.date,
      created_at: t.created_at,
      category: c
        ? { id: c.id, name: c.name, color: c.color, icon: c.icon }
        : { id: t.category_id, name: '', color: '', icon: '' },
    };
  });
}

export async function loadActiveBudgets(): Promise<Budget[]> {
  const snapshot = await userCollection('budgets').get();
  return snapshot.docs.map(doc => doc.data() as Budget).filter(b => b.is_active);
}
