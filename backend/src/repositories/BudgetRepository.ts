import { BaseRepository, DatabaseResult, FilterOptions } from './BaseRepository';
import { Budget, CreateBudgetDto, UpdateBudgetDto, BudgetWithCategory, BudgetWithProgress } from '../types/budget';
import { supabaseAdmin } from '../config/database';
import { logger } from '../config/logger';
import {
  buildFindWithCategoryQuery,
  buildBudgetFindAllWithFiltersQuery,
  computeBudgetProgress,
  aggregateBudgetSummary
} from './queries/budgetQueries';

export class BudgetRepository extends BaseRepository<Budget, CreateBudgetDto, UpdateBudgetDto> {
  protected tableName = 'budgets';
  protected selectFields = '*';

  async findByCategoryAndDateRange(
    categoryId: string,
    startDate: string,
    endDate: string,
    excludeId?: string
  ): Promise<DatabaseResult<Budget[]>> {
    try {
      let query = supabaseAdmin
        .from(this.tableName)
        .select(this.selectFields)
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .or(`start_date.lte.${endDate},end_date.gte.${startDate}`);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;
      if (error) {
        logger.error('Error finding overlapping budgets:', error);
        return { data: null, error: error.message };
      }

      return { data: (data as unknown as Budget[]) || [], error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Repository findByCategoryAndDateRange error:', err);
      return { data: null, error: errorMessage };
    }
  }

  async findByCategoryId(categoryId: string, activeOnly = true): Promise<DatabaseResult<Budget[]>> {
    const filters: FilterOptions = { category_id: categoryId };
    if (activeOnly) filters.is_active = true;
    return this.findAll(filters, { field: 'start_date', ascending: false });
  }

  async findByPeriod(period: 'weekly' | 'monthly' | 'yearly', activeOnly = true): Promise<DatabaseResult<Budget[]>> {
    const filters: FilterOptions = { period };
    if (activeOnly) filters.is_active = true;
    return this.findAll(filters, { field: 'start_date', ascending: false });
  }

  async findActiveBudgetsInDateRange(startDate: string, endDate: string): Promise<DatabaseResult<Budget[]>> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select(this.selectFields)
        .eq('is_active', true)
        .lte('start_date', endDate)
        .gte('end_date', startDate)
        .order('start_date', { ascending: false });

      if (error) {
        logger.error('Error finding active budgets in date range:', error);
        return { data: null, error: error.message };
      }

      return { data: (data as unknown as Budget[]) || [], error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Repository findActiveBudgetsInDateRange error:', err);
      return { data: null, error: errorMessage };
    }
  }

  async findWithCategory(
    filters: FilterOptions = {},
    sort: { field: string; ascending: boolean } = { field: 'start_date', ascending: false }
  ): Promise<DatabaseResult<BudgetWithCategory[]>> {
    try {
      const query = await buildFindWithCategoryQuery(this.tableName, filters, sort);
      const { data, error } = await query;

      if (error) {
        logger.error('Error finding budgets with category:', error);
        return { data: null, error: error.message };
      }

      return { data: (data as unknown as BudgetWithCategory[]) || [], error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Repository findWithCategory error:', err);
      return { data: null, error: errorMessage };
    }
  }

  async findWithProgress(
    filters: FilterOptions = {},
    sort: { field: string; ascending: boolean } = { field: 'start_date', ascending: false }
  ): Promise<DatabaseResult<BudgetWithProgress[]>> {
    try {
      const budgetsResult = await this.findWithCategory(filters, sort);
      if (budgetsResult.error || !budgetsResult.data) {
        return { data: null, error: budgetsResult.error };
      }

      const budgetsWithProgress: BudgetWithProgress[] = [];
      for (const budget of budgetsResult.data) {
        const progress = await this.calculateBudgetProgress(budget);
        budgetsWithProgress.push(progress);
      }

      return { data: budgetsWithProgress, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Repository findWithProgress error:', err);
      return { data: null, error: errorMessage };
    }
  }

  async calculateBudgetProgress(budget: BudgetWithCategory): Promise<BudgetWithProgress> {
    const zeroProgress = {
      ...budget,
      spent_amount: 0,
      remaining_amount: budget.budget_amount,
      progress_percentage: 0,
      is_overspent: false,
      days_remaining: this.calculateDaysRemaining(budget.end_date),
      average_daily_spending: 0,
      projected_total: 0
    };

    try {
      const { data: transactions, error } = await supabaseAdmin
        .from('transactions')
        .select('amount')
        .eq('category_id', budget.category_id)
        .eq('type', 'expense')
        .gte('date', budget.start_date)
        .lte('date', budget.end_date);

      if (error) {
        logger.error('Error calculating budget progress:', error);
        return zeroProgress;
      }

      const daysRemaining = this.calculateDaysRemaining(budget.end_date);
      const totalDays = this.calculateTotalDays(budget.start_date, budget.end_date);
      const amounts = (transactions || []).map(t => t.amount);
      const metrics = computeBudgetProgress(budget, amounts, daysRemaining, totalDays);

      return { ...budget, ...metrics };
    } catch (err) {
      logger.error('Error in calculateBudgetProgress:', err);
      return zeroProgress;
    }
  }

  private calculateDaysRemaining(endDate: string): number {
    const diffTime = new Date(endDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  private calculateTotalDays(startDate: string, endDate: string): number {
    const diffTime = new Date(endDate).getTime() - new Date(startDate).getTime();
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  async isCategoryUsedInActiveBudgets(categoryId: string): Promise<DatabaseResult<boolean>> {
    try {
      const { count, error } = await supabaseAdmin
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('category_id', categoryId)
        .eq('is_active', true);

      if (error) return { data: null, error: error.message };
      return { data: (count || 0) > 0, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: errorMessage };
    }
  }

  async getBudgetSummary(filters: FilterOptions = {}): Promise<DatabaseResult<any>> {
    try {
      const budgetsResult = await this.findWithProgress(filters);
      if (budgetsResult.error || !budgetsResult.data) {
        return { data: null, error: budgetsResult.error };
      }

      return { data: aggregateBudgetSummary(budgetsResult.data), error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Repository getBudgetSummary error:', err);
      return { data: null, error: errorMessage };
    }
  }

  async findAllWithFilters(filters: any): Promise<Budget[]> {
    try {
      const query = await buildBudgetFindAllWithFiltersQuery(this.tableName, filters);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      throw new Error(errorMessage);
    }
  }

  async findOverlapping(
    categoryId: string,
    startDate: string,
    endDate: string
  ): Promise<Budget | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select('*')
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .or(`start_date.lte.${endDate},end_date.gte.${startDate}`)
        .single();

      if (error && error.code !== 'PGRST116') throw new Error(error.message);
      return data || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      throw new Error(errorMessage);
    }
  }
}

export default new BudgetRepository();
