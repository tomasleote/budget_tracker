/**
 * Repository Factory
 * Provides the Firestore-backed repositories. All repositories are scoped to
 * the authenticated user via the request context, so the singletons are safe
 * to share across requests.
 */
import { logger } from '../config/logger';

import CategoryRepository from './firestore/CategoryFirestoreRepository';
import TransactionRepository from './firestore/TransactionFirestoreRepository';
import BudgetRepository from './firestore/BudgetFirestoreRepository';
import AnalyticsRepository from './firestore/AnalyticsFirestoreRepository';

const DEFAULT_CATEGORIES: Array<{ name: string; type: 'income' | 'expense'; color: string; icon: string; is_default: true; is_active: true }> = [
  { name: 'Food & Dining', type: 'expense', color: '#FF6B6B', icon: 'utensils', is_default: true, is_active: true },
  { name: 'Transportation', type: 'expense', color: '#4ECDC4', icon: 'car', is_default: true, is_active: true },
  { name: 'Shopping', type: 'expense', color: '#95E1D3', icon: 'shopping-bag', is_default: true, is_active: true },
  { name: 'Entertainment', type: 'expense', color: '#F6D55C', icon: 'gamepad', is_default: true, is_active: true },
  { name: 'Bills & Utilities', type: 'expense', color: '#ED553B', icon: 'file-invoice-dollar', is_default: true, is_active: true },
  { name: 'Healthcare', type: 'expense', color: '#20639B', icon: 'heartbeat', is_default: true, is_active: true },
  { name: 'Education', type: 'expense', color: '#173F5F', icon: 'graduation-cap', is_default: true, is_active: true },
  { name: 'Personal Care', type: 'expense', color: '#3CAEA3', icon: 'spa', is_default: true, is_active: true },
  { name: 'Home', type: 'expense', color: '#F6D55C', icon: 'home', is_default: true, is_active: true },
  { name: 'Other', type: 'expense', color: '#95A5A6', icon: 'ellipsis-h', is_default: true, is_active: true },
  { name: 'Salary', type: 'income', color: '#2ECC71', icon: 'briefcase', is_default: true, is_active: true },
  { name: 'Freelance', type: 'income', color: '#3498DB', icon: 'laptop', is_default: true, is_active: true },
  { name: 'Investment', type: 'income', color: '#9B59B6', icon: 'chart-line', is_default: true, is_active: true },
  { name: 'Business', type: 'income', color: '#E74C3C', icon: 'store', is_default: true, is_active: true },
  { name: 'Gift', type: 'income', color: '#F39C12', icon: 'gift', is_default: true, is_active: true },
  { name: 'Other Income', type: 'income', color: '#95A5A6', icon: 'plus-circle', is_default: true, is_active: true },
];

export class RepositoryFactory {
  private static instance: RepositoryFactory;

  static getInstance(): RepositoryFactory {
    if (!RepositoryFactory.instance) {
      RepositoryFactory.instance = new RepositoryFactory();
    }
    return RepositoryFactory.instance;
  }

  getCategoryRepository() {
    return CategoryRepository;
  }

  getTransactionRepository() {
    return TransactionRepository;
  }

  getBudgetRepository() {
    return BudgetRepository;
  }

  getAnalyticsRepository() {
    return AnalyticsRepository;
  }

  /** Seed default categories for the current user when none exist yet. */
  async seedDefaultData(): Promise<void> {
    const existing = await CategoryRepository.findAll();
    if (existing.data && existing.data.length > 0) {
      logger.info(`Categories already exist (${existing.data.length}), skipping seed`);
      return;
    }

    let created = 0;
    for (const category of DEFAULT_CATEGORIES) {
      const result = await CategoryRepository.create(category);
      if (result.data) created++;
    }
    logger.info(`Seeded ${created} default categories`);
  }
}

const repositoryFactory = RepositoryFactory.getInstance();

export const getCategoryRepository = () => repositoryFactory.getCategoryRepository();
export const getTransactionRepository = () => repositoryFactory.getTransactionRepository();
export const getBudgetRepository = () => repositoryFactory.getBudgetRepository();
export const getAnalyticsRepository = () => repositoryFactory.getAnalyticsRepository();

export default repositoryFactory;
