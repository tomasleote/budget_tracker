/**
 * LocalStorage implementation of BudgetRepository
 * Provides the same interface as the database BudgetRepository
 */

import { BaseLocalStorageRepository } from './BaseLocalStorageRepository';
import { Budget, CreateBudgetDto, UpdateBudgetDto, BudgetPeriod, BudgetStatus } from '../../types/budget';
import { DatabaseResult, FilterOptions } from '../BaseRepository';
import { logger } from '../../config/logger';

export class BudgetLocalStorageRepository extends BaseLocalStorageRepository<Budget, CreateBudgetDto, UpdateBudgetDto> {
  protected storageKey = 'budgets';

  /**
   * Find budgets by category ID
   */
  async findByCategoryId(categoryId: string): Promise<DatabaseResult<Budget[]>> {
    const filters: FilterOptions = { category_id: categoryId };
    return this.findAll(filters, { field: 'start_date', ascending: false });
  }

  /**
   * Find budgets by period
   */
  async findByPeriod(period: BudgetPeriod): Promise<DatabaseResult<Budget[]>> {
    const filters: FilterOptions = { period };
    return this.findAll(filters, { field: 'start_date', ascending: false });
  }

  /**
   * Find active budgets for a specific date
   */
  async findActiveForDate(date: string): Promise<DatabaseResult<Budget[]>> {
    try {
      const items = this.getAllItems();
      const targetDate = new Date(date);
      
      const activeBudgets = items.filter(budget => {
        const startDate = new Date(budget.start_date);
        const endDate = new Date(budget.end_date);
        return targetDate >= startDate && targetDate <= endDate;
      });

      return { data: activeBudgets, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('BudgetLocalStorageRepository.findActiveForDate error:', err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Find overlapping budgets for the same category and period
   */
  async findOverlapping(
    categoryId: string,
    period: BudgetPeriod,
    startDate: string,
    endDate: string,
    excludeId?: string
  ): Promise<DatabaseResult<Budget[]>> {
    try {
      const items = this.getAllItems();
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const overlapping = items.filter(budget => {
        // Skip if it's the budget being updated
        if (excludeId && budget.id === excludeId) return false;
        
        // Check same category and period
        if (budget.category_id !== categoryId || budget.period !== period) return false;
        
        // Check for date overlap
        const budgetStart = new Date(budget.start_date);
        const budgetEnd = new Date(budget.end_date);
        
        // Check if date ranges overlap
        return !(end < budgetStart || start > budgetEnd);
      });

      return { data: overlapping, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('BudgetLocalStorageRepository.findOverlapping error:', err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Update budget spent amount
   */
  async updateSpentAmount(budgetId: string, spentAmount: number): Promise<DatabaseResult<Budget>> {
    try {
      const items = this.getAllItems();
      const index = items.findIndex(item => item.id === budgetId);
      
      if (index === -1) {
        return { data: null, error: 'Budget not found' };
      }

      const budget = items[index];
      const updatedBudget: Budget = {
        ...budget,
        spent_amount: spentAmount,
        remaining_amount: budget.amount - spentAmount,
        percentage_used: (spentAmount / budget.amount) * 100,
        status: this.calculateStatus(budget.amount, spentAmount),
        updated_at: new Date().toISOString()
      };

      items[index] = updatedBudget;
      this.saveAllItems(items);

      logger.debug(`Updated budget spent amount for ${budgetId}: ${spentAmount}`);
      return { data: updatedBudget, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('BudgetLocalStorageRepository.updateSpentAmount error:', err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Get budget summary for a period
   */
  async getBudgetSummary(startDate: string, endDate: string): Promise<DatabaseResult<any>> {
    try {
      const result = await this.findActiveForDate(startDate);
      if (result.error || !result.data) {
        return result;
      }

      const summary = {
        total_budgeted: 0,
        total_spent: 0,
        total_remaining: 0,
        budget_count: result.data.length,
        budgets_on_track: 0,
        budgets_warning: 0,
        budgets_exceeded: 0
      };

      result.data.forEach(budget => {
        summary.total_budgeted += budget.amount;
        summary.total_spent += budget.spent_amount || 0;
        summary.total_remaining += budget.remaining_amount || budget.amount;

        switch (budget.status) {
          case 'on_track':
            summary.budgets_on_track++;
            break;
          case 'warning':
            summary.budgets_warning++;
            break;
          case 'exceeded':
            summary.budgets_exceeded++;
            break;
        }
      });

      return { data: summary, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('BudgetLocalStorageRepository.getBudgetSummary error:', err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Find budgets by status
   */
  async findByStatus(status: BudgetStatus): Promise<DatabaseResult<Budget[]>> {
    const filters: FilterOptions = { status };
    return this.findAll(filters, { field: 'percentage_used', ascending: false });
  }

  /**
   * Check if category has any budgets
   */
  async isCategoryUsed(categoryId: string): Promise<DatabaseResult<boolean>> {
    try {
      const items = this.getAllItems();
      const isUsed = items.some(item => item.category_id === categoryId);
      return { data: isUsed, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('BudgetLocalStorageRepository.isCategoryUsed error:', err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Calculate budget status based on spent amount
   */
  private calculateStatus(budgetAmount: number, spentAmount: number): BudgetStatus {
    const percentage = (spentAmount / budgetAmount) * 100;
    
    if (percentage >= 100) {
      return 'exceeded';
    } else if (percentage >= 80) {
      return 'warning';
    } else {
      return 'on_track';
    }
  }

  /**
   * Recalculate all budget statuses (useful after bulk transaction changes)
   */
  async recalculateAllStatuses(): Promise<DatabaseResult<number>> {
    try {
      const items = this.getAllItems();
      let updateCount = 0;

      const updatedItems = items.map(budget => {
        const newStatus = this.calculateStatus(budget.amount, budget.spent_amount || 0);
        const newPercentage = ((budget.spent_amount || 0) / budget.amount) * 100;
        const newRemaining = budget.amount - (budget.spent_amount || 0);

        if (budget.status !== newStatus || 
            budget.percentage_used !== newPercentage ||
            budget.remaining_amount !== newRemaining) {
          updateCount++;
          return {
            ...budget,
            status: newStatus,
            percentage_used: newPercentage,
            remaining_amount: newRemaining,
            updated_at: new Date().toISOString()
          };
        }
        return budget;
      });

      if (updateCount > 0) {
        this.saveAllItems(updatedItems);
        logger.debug(`Recalculated status for ${updateCount} budgets`);
      }

      return { data: updateCount, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('BudgetLocalStorageRepository.recalculateAllStatuses error:', err);
      return { data: null, error: errorMessage };
    }
  }
}

// Export singleton instance
export default new BudgetLocalStorageRepository();
