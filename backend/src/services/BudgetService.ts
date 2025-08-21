import { 
  Budget, 
  CreateBudgetDto, 
  UpdateBudgetDto, 
  BudgetQuery, 
  BudgetWithCategory, 
  BudgetWithProgress,
  BudgetAlert,
  PaginatedBudgets
} from '../types/budget';
import { logger } from '../config/logger';
import BudgetRepository from '../repositories/BudgetRepository';
import CategoryRepository from '../repositories/CategoryRepository';

export class BudgetService {
  /**
   * Get all budgets with optional filtering and pagination
   */
  async getBudgets(query: BudgetQuery = {}): Promise<PaginatedBudgets> {
    try {
      const {
        page = 1,
        limit = 20,
        category_id,
        period,
        is_active,
        start_date,
        end_date,
        include_category = false,
        include_progress = false,
        overspent_only = false,
        sort = 'start_date',
        order = 'desc'
      } = query;

      // Build filters
      const filters: any = {};
      if (category_id) filters.category_id = category_id;
      if (period) filters.period = period;
      if (is_active !== undefined) filters.is_active = is_active;
      if (start_date) filters['gte_start_date'] = start_date;
      if (end_date) filters['lte_end_date'] = end_date;

      // Calculate pagination
      const offset = (page - 1) * limit;
      const pagination = { page, limit, offset };

      let budgets: Budget[] | BudgetWithCategory[] | BudgetWithProgress[] = [];
      let totalCount = 0;

      if (include_progress) {
        // Get budgets with progress calculation
        const result = await BudgetRepository.findWithProgress(
          filters,
          { field: sort, ascending: order === 'asc' }
        );
        
        if (result.error) {
          throw new Error(`Failed to fetch budgets with progress: ${result.error}`);
        }

        let allBudgets = result.data || [];

        // Filter overspent if requested
        if (overspent_only) {
          allBudgets = allBudgets.filter(budget => budget.is_overspent);
        }

        totalCount = allBudgets.length;
        budgets = allBudgets.slice(offset, offset + limit);

      } else if (include_category) {
        // Get budgets with category information
        const result = await BudgetRepository.findWithCategory(
          filters,
          { field: sort, ascending: order === 'asc' }
        );
        
        if (result.error) {
          throw new Error(`Failed to fetch budgets with category: ${result.error}`);
        }

        const allBudgets = result.data || [];
        totalCount = allBudgets.length;
        budgets = allBudgets.slice(offset, offset + limit);

      } else {
        // Get basic budgets with pagination
        const result = await BudgetRepository.findAll(
          filters,
          { field: sort, ascending: order === 'asc' },
          pagination
        );
        
        if (result.error) {
          throw new Error(`Failed to fetch budgets: ${result.error}`);
        }

        budgets = result.data || [];
        totalCount = result.count || 0;
      }

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limit);

      return {
        budgets,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: totalPages,
          has_next: page < totalPages,
          has_prev: page > 1
        }
      };
    } catch (error) {
      logger.error('BudgetService.getBudgets error:', error);
      throw error;
    }
  }

  /**
   * Get budget by ID
   */
  async getBudgetById(id: string, includeProgress = false): Promise<Budget | BudgetWithProgress | null> {
    try {
      if (includeProgress) {
        // Get budget with category first
        const result = await BudgetRepository.findWithCategory({ id });
        if (result.error) {
          throw new Error(`Failed to fetch budget with category: ${result.error}`);
        }
        
        if (!result.data || result.data.length === 0) {
          return null;
        }

        // Calculate progress
        const budgetWithCategory = result.data[0];
        if (!budgetWithCategory) {
          return null;
        }
        const budgetWithProgress = await BudgetRepository.calculateBudgetProgress(budgetWithCategory);
        return budgetWithProgress;
      } else {
        const result = await BudgetRepository.findById(id);
        if (result.error) {
          throw new Error(`Failed to fetch budget: ${result.error}`);
        }
        return result.data;
      }
    } catch (error) {
      logger.error('BudgetService.getBudgetById error:', error);
      throw error;
    }
  }

  /**
   * Create new budget with business logic validation
   */
  async createBudget(budgetData: CreateBudgetDto): Promise<Budget> {
    try {
      // Business Rule: Validate category exists and is expense type
      const categoryResult = await CategoryRepository.findById(budgetData.category_id);
      if (categoryResult.error) {
        throw new Error(`Failed to validate category: ${categoryResult.error}`);
      }
      if (!categoryResult.data) {
        throw new Error('Category not found');
      }
      if (categoryResult.data.type !== 'expense') {
        throw new Error('Budgets can only be created for expense categories');
      }
      if (!categoryResult.data.is_active) {
        throw new Error('Cannot create budget for inactive category');
      }

      // Calculate end date if not provided
      let endDate = budgetData.end_date;
      if (!endDate) {
        endDate = this.calculateEndDate(budgetData.start_date, budgetData.period);
      }

      // Business Rule: Validate date range
      const startDate = new Date(budgetData.start_date);
      const calculatedEndDate = new Date(endDate);
      
      if (calculatedEndDate <= startDate) {
        throw new Error('End date must be after start date');
      }

      // Business Rule: Check for overlapping budgets
      const overlappingResult = await BudgetRepository.findByCategoryAndDateRange(
        budgetData.category_id,
        budgetData.start_date,
        endDate
      );
      
      if (overlappingResult.error) {
        throw new Error(`Failed to check for overlapping budgets: ${overlappingResult.error}`);
      }
      
      if (overlappingResult.data && overlappingResult.data.length > 0) {
        throw new Error('A budget already exists for this category in the specified date range');
      }

      // Business Rule: Validate budget amount
      if (budgetData.budget_amount <= 0) {
        throw new Error('Budget amount must be greater than 0');
      }

      // Create budget with calculated end date
      const createData = {
        ...budgetData,
        end_date: endDate,
        is_active: true
      };

      const result = await BudgetRepository.create(createData);
      
      if (result.error || !result.data) {
        throw new Error(`Failed to create budget: ${result.error}`);
      }

      logger.info(`Budget created for category ${categoryResult.data.name}: ${result.data.budget_amount} (${result.data.id})`);
      return result.data;
    } catch (error) {
      logger.error('BudgetService.createBudget error:', error);
      throw error;
    }
  }

  /**
   * Update budget with business logic validation
   */
  async updateBudget(id: string, updates: UpdateBudgetDto): Promise<Budget> {
    try {
      // Business Rule: Check if budget exists
      const existing = await this.getBudgetById(id);
      if (!existing) {
        throw new Error('Budget not found');
      }

      // Business Rule: Validate category if being updated
      if (updates.category_id && updates.category_id !== existing.category_id) {
        const categoryResult = await CategoryRepository.findById(updates.category_id);
        if (categoryResult.error) {
          throw new Error(`Failed to validate category: ${categoryResult.error}`);
        }
        if (!categoryResult.data) {
          throw new Error('Category not found');
        }
        if (categoryResult.data.type !== 'expense') {
          throw new Error('Budgets can only be created for expense categories');
        }
        if (!categoryResult.data.is_active) {
          throw new Error('Cannot assign budget to inactive category');
        }
      }

      // Calculate new end date if period or start date is being updated
      let newEndDate = updates.end_date;
      if ((updates.period || updates.start_date) && !updates.end_date) {
        const startDate = updates.start_date || existing.start_date;
        const period = updates.period || existing.period;
        newEndDate = this.calculateEndDate(startDate, period);
      }

      // Business Rule: Validate date range if dates are being updated
      if (updates.start_date || newEndDate) {
        const startDate = new Date(updates.start_date || existing.start_date);
        const endDate = new Date(newEndDate || existing.end_date);
        
        if (endDate <= startDate) {
          throw new Error('End date must be after start date');
        }
      }

      // Business Rule: Check for overlapping budgets if category or dates are changing
      if (updates.category_id || updates.start_date || newEndDate) {
        const categoryId = updates.category_id || existing.category_id;
        const startDate = updates.start_date || existing.start_date;
        const endDate = newEndDate || existing.end_date;
        
        const overlappingResult = await BudgetRepository.findByCategoryAndDateRange(
          categoryId,
          startDate,
          endDate,
          id // Exclude current budget from check
        );
        
        if (overlappingResult.error) {
          throw new Error(`Failed to check for overlapping budgets: ${overlappingResult.error}`);
        }
        
        if (overlappingResult.data && overlappingResult.data.length > 0) {
          throw new Error('Update would create overlapping budget period for this category');
        }
      }

      // Business Rule: Validate budget amount
      if (updates.budget_amount !== undefined && updates.budget_amount <= 0) {
        throw new Error('Budget amount must be greater than 0');
      }

      // Add calculated end date to updates if needed
      const finalUpdates = newEndDate ? { ...updates, end_date: newEndDate } : updates;

      const result = await BudgetRepository.update(id, finalUpdates);
      
      if (result.error || !result.data) {
        throw new Error(`Failed to update budget: ${result.error}`);
      }

      logger.info(`Budget updated: ${result.data.id}`);
      return result.data;
    } catch (error) {
      logger.error('BudgetService.updateBudget error:', error);
      throw error;
    }
  }

  /**
   * Delete budget
   */
  async deleteBudget(id: string): Promise<void> {
    try {
      // Business Rule: Check if budget exists
      const existing = await this.getBudgetById(id);
      if (!existing) {
        throw new Error('Budget not found');
      }

      const result = await BudgetRepository.delete(id);
      
      if (result.error) {
        throw new Error(`Failed to delete budget: ${result.error}`);
      }

      logger.info(`Budget deleted: ${id}`);
    } catch (error) {
      logger.error('BudgetService.deleteBudget error:', error);
      throw error;
    }
  }

  /**
   * Get budget alerts for overspending and approaching limits
   */
  async getBudgetAlerts(thresholds = { approaching: 80, high: 95 }): Promise<BudgetAlert[]> {
    try {
      // Get all active budgets with progress
      const result = await BudgetRepository.findWithProgress(
        { is_active: true },
        { field: 'progress_percentage', ascending: false }
      );
      
      if (result.error) {
        throw new Error(`Failed to fetch budgets for alerts: ${result.error}`);
      }

      const budgets = result.data || [];
      const alerts: BudgetAlert[] = [];

      for (const budget of budgets) {
        const progress = budget.progress_percentage;
        
        if (budget.is_overspent) {
          alerts.push({
            budget_id: budget.id,
            category_name: budget.category.name,
            alert_type: 'overspent',
            message: `Budget exceeded! Spent $${budget.spent_amount.toFixed(2)} of $${budget.budget_amount.toFixed(2)} budget.`,
            severity: 'high',
            current_amount: budget.spent_amount,
            budget_amount: budget.budget_amount,
            progress_percentage: progress
          });
        } else if (budget.projected_total > budget.budget_amount) {
          alerts.push({
            budget_id: budget.id,
            category_name: budget.category.name,
            alert_type: 'exceeded_projection',
            message: `On track to exceed budget! Projected total: $${budget.projected_total.toFixed(2)} (Budget: $${budget.budget_amount.toFixed(2)}).`,
            severity: 'medium',
            current_amount: budget.spent_amount,
            budget_amount: budget.budget_amount,
            progress_percentage: progress
          });
        } else if (progress >= thresholds.high) {
          alerts.push({
            budget_id: budget.id,
            category_name: budget.category.name,
            alert_type: 'approaching_limit',
            message: `${progress.toFixed(1)}% of budget used. $${budget.remaining_amount.toFixed(2)} remaining.`,
            severity: 'high',
            current_amount: budget.spent_amount,
            budget_amount: budget.budget_amount,
            progress_percentage: progress
          });
        } else if (progress >= thresholds.approaching) {
          alerts.push({
            budget_id: budget.id,
            category_name: budget.category.name,
            alert_type: 'approaching_limit',
            message: `${progress.toFixed(1)}% of budget used. $${budget.remaining_amount.toFixed(2)} remaining.`,
            severity: 'medium',
            current_amount: budget.spent_amount,
            budget_amount: budget.budget_amount,
            progress_percentage: progress
          });
        }
      }

      return alerts;
    } catch (error) {
      logger.error('BudgetService.getBudgetAlerts error:', error);
      throw error;
    }
  }

  /**
   * Get budget summary with analytics
   */
  async getBudgetSummary(filters: any = {}): Promise<any> {
    try {
      const result = await BudgetRepository.getBudgetSummary(filters);
      
      if (result.error) {
        throw new Error(`Failed to get budget summary: ${result.error}`);
      }

      return result.data;
    } catch (error) {
      logger.error('BudgetService.getBudgetSummary error:', error);
      throw error;
    }
  }

  /**
   * Bulk create budgets
   */
  async bulkCreateBudgets(budgets: CreateBudgetDto[]): Promise<Budget[]> {
    try {
      // Business Rule: Validate all budgets before creating any
      for (const budgetData of budgets) {
        // Validate category exists and is expense type
        const categoryResult = await CategoryRepository.findById(budgetData.category_id);
        if (categoryResult.error || !categoryResult.data) {
          throw new Error(`Category not found for budget: ${budgetData.category_id}`);
        }
        if (categoryResult.data.type !== 'expense') {
          throw new Error(`Budget can only be created for expense category: ${categoryResult.data.name}`);
        }
        if (!categoryResult.data.is_active) {
          throw new Error(`Cannot create budget for inactive category: ${categoryResult.data.name}`);
        }

        // Calculate end date if not provided
        const endDate = budgetData.end_date || this.calculateEndDate(budgetData.start_date, budgetData.period);
        
        // Check for overlaps
        const overlappingResult = await BudgetRepository.findByCategoryAndDateRange(
          budgetData.category_id,
          budgetData.start_date,
          endDate
        );
        
        if (overlappingResult.error) {
          throw new Error(`Failed to validate budget for category ${categoryResult.data.name}: ${overlappingResult.error}`);
        }
        
        if (overlappingResult.data && overlappingResult.data.length > 0) {
          throw new Error(`Overlapping budget found for category: ${categoryResult.data.name}`);
        }
      }

      // Add calculated end dates and default values
      const budgetsWithDefaults = budgets.map(budget => ({
        ...budget,
        end_date: budget.end_date || this.calculateEndDate(budget.start_date, budget.period),
        is_active: true
      }));

      const result = await BudgetRepository.bulkCreate(budgetsWithDefaults);
      
      if (result.error || !result.data) {
        throw new Error(`Failed to bulk create budgets: ${result.error}`);
      }

      logger.info(`Bulk created ${result.data.length} budgets`);
      return result.data;
    } catch (error) {
      logger.error('BudgetService.bulkCreateBudgets error:', error);
      throw error;
    }
  }

  /**
   * Helper method to calculate end date based on period
   */
  private calculateEndDate(startDate: string, period: 'weekly' | 'monthly' | 'yearly'): string {
    const start = new Date(startDate);
    const end = new Date(start);

    switch (period) {
      case 'weekly':
        end.setDate(start.getDate() + 6); // 7 days total (start day + 6)
        break;
      case 'monthly':
        end.setMonth(start.getMonth() + 1);
        end.setDate(end.getDate() - 1); // Last day of the month
        break;
      case 'yearly':
        end.setFullYear(start.getFullYear() + 1);
        end.setDate(end.getDate() - 1); // Last day of the year
        break;
      default:
        throw new Error(`Invalid period: ${period}`);
    }

    const dateString = end.toISOString().split('T')[0];
    if (!dateString) {
      throw new Error('Failed to format end date');
    }
    return dateString; // Return YYYY-MM-DD format
  }
}

export default new BudgetService();
