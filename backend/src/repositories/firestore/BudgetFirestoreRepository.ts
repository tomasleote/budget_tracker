/**
 * Firestore-backed Budget repository (users/{uid}/budgets).
 * Progress is computed against the user's expense transactions in memory.
 */
import { FirestoreBaseRepository } from './FirestoreBaseRepository';
import { Budget, CreateBudgetDto, UpdateBudgetDto, BudgetWithCategory, BudgetWithProgress } from '../../types/budget';
import { Transaction } from '../../types/transaction';
import { DatabaseResult, FilterOptions, SortOptions } from '../BaseRepository';
import { applyFilters, applySorting, errorMessage } from './helpers/queryHelpers';
import { loadCategoryMap, toCategoryInfo } from './helpers/categoryJoin';
import { computeBudgetProgress, aggregateBudgetSummary, daysRemaining, totalDaysBetween } from './helpers/budgetMath';
import { firestore } from '../../config/firebase';
import { getUid } from '../../context/requestContext';

const DEFAULT_SORT: SortOptions = { field: 'start_date', ascending: false };

export class BudgetFirestoreRepository extends FirestoreBaseRepository<Budget, CreateBudgetDto, UpdateBudgetDto> {
  protected collectionName = 'budgets';

  override async create(data: CreateBudgetDto): Promise<DatabaseResult<Budget>> {
    return super.create({ is_active: true, ...data } as CreateBudgetDto);
  }

  async findByCategoryAndDateRange(
    categoryId: string,
    startDate: string,
    endDate: string,
    excludeId?: string
  ): Promise<DatabaseResult<Budget[]>> {
    try {
      const items = (await this.getAllItems()).filter(b =>
        b.category_id === categoryId &&
        b.is_active &&
        b.start_date <= endDate &&
        b.end_date >= startDate &&
        (!excludeId || b.id !== excludeId)
      );
      return { data: applySorting(items, DEFAULT_SORT), error: null };
    } catch (err) {
      return { data: null, error: errorMessage(err) };
    }
  }

  async findWithCategory(filters: FilterOptions = {}, sort: SortOptions = DEFAULT_SORT): Promise<DatabaseResult<BudgetWithCategory[]>> {
    try {
      const items = applySorting(applyFilters(await this.getAllItems(), filters), sort);
      const categories = await loadCategoryMap();
      const data = items.map(b => ({ ...b, category: toCategoryInfo(categories.get(b.category_id)) }));
      return { data, error: null };
    } catch (err) {
      return { data: null, error: errorMessage(err) };
    }
  }

  async findWithProgress(filters: FilterOptions = {}, sort: SortOptions = DEFAULT_SORT): Promise<DatabaseResult<BudgetWithProgress[]>> {
    try {
      const budgets = await this.findWithCategory(filters, sort);
      if (budgets.error || !budgets.data) return { data: null, error: budgets.error };
      const withProgress: BudgetWithProgress[] = [];
      for (const budget of budgets.data) {
        withProgress.push(await this.calculateBudgetProgress(budget));
      }
      return { data: withProgress, error: null };
    } catch (err) {
      return { data: null, error: errorMessage(err) };
    }
  }

  async calculateBudgetProgress(budget: BudgetWithCategory): Promise<BudgetWithProgress> {
    const remaining = daysRemaining(budget.end_date);
    const zero: BudgetWithProgress = {
      ...budget,
      spent_amount: 0,
      remaining_amount: budget.budget_amount,
      progress_percentage: 0,
      is_overspent: false,
      days_remaining: remaining,
      average_daily_spending: 0,
      projected_total: 0,
    };

    try {
      const snapshot = await firestore.collection('users').doc(getUid()).collection('transactions').get();
      const amounts = snapshot.docs
        .map(doc => doc.data() as Transaction)
        .filter(t => t.category_id === budget.category_id && t.type === 'expense' && t.date >= budget.start_date && t.date <= budget.end_date)
        .map(t => t.amount);
      const metrics = computeBudgetProgress(budget, amounts, remaining, totalDaysBetween(budget.start_date, budget.end_date));
      return { ...budget, ...metrics };
    } catch {
      return zero;
    }
  }

  async getBudgetSummary(filters: FilterOptions = {}): Promise<DatabaseResult<ReturnType<typeof aggregateBudgetSummary>>> {
    try {
      const budgets = await this.findWithProgress(filters);
      if (budgets.error || !budgets.data) return { data: null, error: budgets.error };
      return { data: aggregateBudgetSummary(budgets.data), error: null };
    } catch (err) {
      return { data: null, error: errorMessage(err) };
    }
  }

  async findAllWithFilters(filters: {
    category_ids?: string[];
    period?: string | string[];
    start_date_from?: string;
    end_date_to?: string;
    is_active?: boolean;
  }): Promise<Budget[]> {
    const items = await this.getAllItems();
    const matches = items.filter(b => {
      if (filters.category_ids && !filters.category_ids.includes(b.category_id)) return false;
      if (filters.period) {
        const periods = Array.isArray(filters.period) ? filters.period : [filters.period];
        if (!periods.includes(b.period)) return false;
      }
      if (filters.start_date_from && b.start_date < filters.start_date_from) return false;
      if (filters.end_date_to && b.end_date > filters.end_date_to) return false;
      if (filters.is_active !== undefined && b.is_active !== filters.is_active) return false;
      return true;
    });
    return applySorting(matches, DEFAULT_SORT);
  }

  async findOverlapping(categoryId: string, startDate: string, endDate: string): Promise<Budget | null> {
    const items = await this.getAllItems();
    return items.find(b =>
      b.category_id === categoryId && b.is_active && b.start_date <= endDate && b.end_date >= startDate
    ) || null;
  }
}

export default new BudgetFirestoreRepository();
