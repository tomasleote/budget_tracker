import { BaseRepository, DatabaseResult, FilterOptions } from './BaseRepository';
import { Budget, CreateBudgetDto, UpdateBudgetDto, BudgetWithCategory, BudgetWithProgress } from '../types/budget';
import { supabaseAdmin } from '../config/database';
import { logger } from '../config/logger';

export class BudgetRepository extends BaseRepository<Budget, CreateBudgetDto, UpdateBudgetDto> {
  protected tableName = 'budgets';
  protected selectFields = '*';

  /**
   * Find budget by category and date range (for overlap checking)
   */
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

  /**
   * Find budgets by category ID
   */
  async findByCategoryId(categoryId: string, activeOnly = true): Promise<DatabaseResult<Budget[]>> {
    const filters: FilterOptions = { category_id: categoryId };
    if (activeOnly) {
      filters.is_active = true;
    }
    return this.findAll(filters, { field: 'start_date', ascending: false });
  }

  /**
   * Find budgets by period
   */
  async findByPeriod(period: 'weekly' | 'monthly' | 'yearly', activeOnly = true): Promise<DatabaseResult<Budget[]>> {
    const filters: FilterOptions = { period };
    if (activeOnly) {
      filters.is_active = true;
    }
    return this.findAll(filters, { field: 'start_date', ascending: false });
  }

  /**
   * Find active budgets within date range
   */
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

  /**
   * Find budgets with category information
   */
  async findWithCategory(
    filters: FilterOptions = {},
    sort: { field: string; ascending: boolean } = { field: 'start_date', ascending: false }
  ): Promise<DatabaseResult<BudgetWithCategory[]>> {
    try {
      let query = supabaseAdmin
        .from(this.tableName)
        .select(`
          *,
          category:categories!inner (
            id,
            name,
            type,
            color,
            icon
          )
        `);

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key.includes('gte_')) {
            query = query.gte(key.replace('gte_', ''), value);
          } else if (key.includes('lte_')) {
            query = query.lte(key.replace('lte_', ''), value);
          } else {
            query = query.eq(key, value);
          }
        }
      });

      // Apply sorting
      query = query.order(sort.field, { ascending: sort.ascending });

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

  /**
   * Find budgets with progress calculation
   */
  async findWithProgress(
    filters: FilterOptions = {},
    sort: { field: string; ascending: boolean } = { field: 'start_date', ascending: false }
  ): Promise<DatabaseResult<BudgetWithProgress[]>> {
    try {
      // First get budgets with categories
      const budgetsResult = await this.findWithCategory(filters, sort);
      
      if (budgetsResult.error || !budgetsResult.data) {
        return { data: null, error: budgetsResult.error };
      }

      // Calculate progress for each budget
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

  /**
   * Calculate budget progress by querying transactions
   */
  async calculateBudgetProgress(budget: BudgetWithCategory): Promise<BudgetWithProgress> {
    try {
      // Query transactions within the budget period for the category
      const { data: transactions, error } = await supabaseAdmin
        .from('transactions')
        .select('amount')
        .eq('category_id', budget.category_id)
        .eq('type', 'expense') // Only expense transactions count against budget
        .gte('date', budget.start_date)
        .lte('date', budget.end_date);

      if (error) {
        logger.error('Error calculating budget progress:', error);
        // Return budget with zero progress if error
        return {
          ...budget,
          spent_amount: 0,
          remaining_amount: budget.budget_amount,
          progress_percentage: 0,
          is_overspent: false,
          days_remaining: this.calculateDaysRemaining(budget.end_date),
          average_daily_spending: 0,
          projected_total: 0
        };
      }

      // Calculate spent amount
      const spentAmount = transactions?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0;
      const remainingAmount = budget.budget_amount - spentAmount;
      const progressPercentage = budget.budget_amount > 0 ? (spentAmount / budget.budget_amount) * 100 : 0;
      const isOverspent = spentAmount > budget.budget_amount;

      // Calculate time-based metrics
      const daysRemaining = this.calculateDaysRemaining(budget.end_date);
      const totalDays = this.calculateTotalDays(budget.start_date, budget.end_date);
      const daysElapsed = totalDays - daysRemaining;
      const averageDailySpending = daysElapsed > 0 ? spentAmount / daysElapsed : 0;
      const projectedTotal = totalDays > 0 ? averageDailySpending * totalDays : spentAmount;

      return {
        ...budget,
        spent_amount: Number(spentAmount.toFixed(2)),
        remaining_amount: Number(remainingAmount.toFixed(2)),
        progress_percentage: Number(progressPercentage.toFixed(2)),
        is_overspent: isOverspent,
        days_remaining: daysRemaining,
        average_daily_spending: Number(averageDailySpending.toFixed(2)),
        projected_total: Number(projectedTotal.toFixed(2))
      };
    } catch (err) {
      logger.error('Error in calculateBudgetProgress:', err);
      // Return budget with zero progress if error
      return {
        ...budget,
        spent_amount: 0,
        remaining_amount: budget.budget_amount,
        progress_percentage: 0,
        is_overspent: false,
        days_remaining: this.calculateDaysRemaining(budget.end_date),
        average_daily_spending: 0,
        projected_total: 0
      };
    }
  }

  /**
   * Calculate days remaining until budget end date
   */
  private calculateDaysRemaining(endDate: string): number {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  /**
   * Calculate total days in budget period
   */
  private calculateTotalDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  }

  /**
   * Check if category is used in any active budgets
   */
  async isCategoryUsedInActiveBudgets(categoryId: string): Promise<DatabaseResult<boolean>> {
    try {
      const { count, error } = await supabaseAdmin
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('category_id', categoryId)
        .eq('is_active', true);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: (count || 0) > 0, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Get budget summary statistics
   */
  async getBudgetSummary(filters: FilterOptions = {}): Promise<DatabaseResult<any>> {
    try {
      // Get budgets with progress
      const budgetsResult = await this.findWithProgress(filters);
      
      if (budgetsResult.error || !budgetsResult.data) {
        return { data: null, error: budgetsResult.error };
      }

      const budgets = budgetsResult.data;
      const activeBudgets = budgets.filter(b => b.is_active);
      const overspentBudgets = budgets.filter(b => b.is_overspent);

      const totalBudgetAmount = budgets.reduce((sum, b) => sum + b.budget_amount, 0);
      const totalSpentAmount = budgets.reduce((sum, b) => sum + b.spent_amount, 0);
      const totalRemainingAmount = budgets.reduce((sum, b) => sum + b.remaining_amount, 0);
      const averageProgress = budgets.length > 0 
        ? budgets.reduce((sum, b) => sum + b.progress_percentage, 0) / budgets.length 
        : 0;

      // Calculate date range
      const startDates = budgets.map(b => b.start_date).sort();
      const endDates = budgets.map(b => b.end_date).sort();

      const summary = {
        total_budgets: budgets.length,
        active_budgets: activeBudgets.length,
        total_budget_amount: Number(totalBudgetAmount.toFixed(2)),
        total_spent_amount: Number(totalSpentAmount.toFixed(2)),
        total_remaining_amount: Number(totalRemainingAmount.toFixed(2)),
        overspent_budgets: overspentBudgets.length,
        average_progress_percentage: Number(averageProgress.toFixed(2)),
        date_range: {
          start: startDates[0] || (new Date().toISOString().split('T')[0] || ''),
          end: endDates[endDates.length - 1] || (new Date().toISOString().split('T')[0] || '')
        }
      };

      return { data: summary, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Repository getBudgetSummary error:', err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Find all budgets with advanced filters for import/export
   */
  async findAllWithFilters(filters: any): Promise<Budget[]> {
    try {
      let query = supabaseAdmin
        .from(this.tableName)
        .select(`
          *,
          categories (
            id,
            name,
            type,
            color,
            icon
          )
        `);

      // Apply filters
      if (filters.category_ids) {
        query = query.in('category_id', filters.category_ids);
      }

      if (filters.period) {
        if (Array.isArray(filters.period)) {
          query = query.in('period', filters.period);
        } else {
          query = query.eq('period', filters.period);
        }
      }

      if (filters.start_date_from) {
        query = query.gte('start_date', filters.start_date_from);
      }

      if (filters.end_date_to) {
        query = query.lte('end_date', filters.end_date_to);
      }

      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      // Sort by start date descending
      query = query.order('start_date', { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      throw new Error(errorMessage);
    }
  }

  /**
   * Find overlapping budget for import validation
   */
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

      if (error && error.code !== 'PGRST116') {
        throw new Error(error.message);
      }

      return data || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      throw new Error(errorMessage);
    }
  }
}

export default new BudgetRepository();
