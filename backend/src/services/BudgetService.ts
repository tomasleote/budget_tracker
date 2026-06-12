import {
  Budget,
  CreateBudgetDto,
  UpdateBudgetDto,
  BudgetQuery,
  BudgetWithProgress,
  BudgetAlert,
  PaginatedBudgets
} from '../types/budget';
import { logger } from '../config/logger';
import BudgetRepository from '../repositories/BudgetRepository';
import CategoryRepository from '../repositories/CategoryRepository';
import { calculateEndDate, fetchBudgetsForQuery, buildBudgetAlerts } from './budget/budgetHelpers';

export class BudgetService {
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

      const filters: any = {};
      if (category_id) filters.category_id = category_id;
      if (period) filters.period = period;
      if (is_active !== undefined) filters.is_active = is_active;
      if (start_date) filters['gte_start_date'] = start_date;
      if (end_date) filters['lte_end_date'] = end_date;

      const offset = (page - 1) * limit;
      const { budgets, totalCount } = await fetchBudgetsForQuery(
        filters, sort, order, { page, limit, offset },
        include_progress, include_category, overspent_only
      );

      const totalPages = Math.ceil(totalCount / limit);

      return {
        budgets,
        pagination: {
          page, limit,
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

  async getBudgetById(id: string, includeProgress = false): Promise<Budget | BudgetWithProgress | null> {
    try {
      if (includeProgress) {
        const result = await BudgetRepository.findWithCategory({ id });
        if (result.error) {
          throw new Error(`Failed to fetch budget with category: ${result.error}`);
        }

        if (!result.data || result.data.length === 0) {
          return null;
        }

        const budgetWithCategory = result.data[0];
        if (!budgetWithCategory) {
          return null;
        }
        return await BudgetRepository.calculateBudgetProgress(budgetWithCategory);
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

  async createBudget(budgetData: CreateBudgetDto): Promise<Budget> {
    try {
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

      const endDate = budgetData.end_date ?? calculateEndDate(budgetData.start_date, budgetData.period);

      if (new Date(endDate) <= new Date(budgetData.start_date)) {
        throw new Error('End date must be after start date');
      }

      const overlappingResult = await BudgetRepository.findByCategoryAndDateRange(
        budgetData.category_id, budgetData.start_date, endDate
      );
      if (overlappingResult.error) {
        throw new Error(`Failed to check for overlapping budgets: ${overlappingResult.error}`);
      }
      if (overlappingResult.data && overlappingResult.data.length > 0) {
        throw new Error('A budget already exists for this category in the specified date range');
      }

      if (budgetData.budget_amount <= 0) {
        throw new Error('Budget amount must be greater than 0');
      }

      const createData: any = { ...budgetData, end_date: endDate, is_active: true };
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

  async updateBudget(id: string, updates: UpdateBudgetDto): Promise<Budget> {
    try {
      const existing = await this.getBudgetById(id);
      if (!existing) {
        throw new Error('Budget not found');
      }

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

      let newEndDate = updates.end_date;
      if ((updates.period || updates.start_date) && !updates.end_date) {
        const startDate = updates.start_date || existing.start_date;
        const period = updates.period || existing.period;
        newEndDate = calculateEndDate(startDate, period);
      }

      if (updates.start_date || newEndDate) {
        const startDate = new Date(updates.start_date || existing.start_date);
        const endDate = new Date(newEndDate || existing.end_date);
        if (endDate <= startDate) {
          throw new Error('End date must be after start date');
        }
      }

      if (updates.category_id || updates.start_date || newEndDate) {
        const overlappingResult = await BudgetRepository.findByCategoryAndDateRange(
          updates.category_id || existing.category_id,
          updates.start_date || existing.start_date,
          newEndDate || existing.end_date,
          id
        );
        if (overlappingResult.error) {
          throw new Error(`Failed to check for overlapping budgets: ${overlappingResult.error}`);
        }
        if (overlappingResult.data && overlappingResult.data.length > 0) {
          throw new Error('Update would create overlapping budget period for this category');
        }
      }

      if (updates.budget_amount !== undefined && updates.budget_amount <= 0) {
        throw new Error('Budget amount must be greater than 0');
      }

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

  async deleteBudget(id: string): Promise<void> {
    try {
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

  async getBudgetAlerts(thresholds = { approaching: 80, high: 95 }): Promise<BudgetAlert[]> {
    try {
      const result = await BudgetRepository.findWithProgress(
        { is_active: true },
        { field: 'progress_percentage', ascending: false }
      );

      if (result.error) {
        throw new Error(`Failed to fetch budgets for alerts: ${result.error}`);
      }

      return buildBudgetAlerts(result.data || [], thresholds);
    } catch (error) {
      logger.error('BudgetService.getBudgetAlerts error:', error);
      throw error;
    }
  }

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

  async bulkCreateBudgets(budgets: CreateBudgetDto[]): Promise<Budget[]> {
    try {
      for (const budgetData of budgets) {
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

        const endDate = budgetData.end_date ?? calculateEndDate(budgetData.start_date, budgetData.period);
        const overlappingResult = await BudgetRepository.findByCategoryAndDateRange(
          budgetData.category_id, budgetData.start_date, endDate
        );
        if (overlappingResult.error) {
          throw new Error(`Failed to validate budget for category ${categoryResult.data.name}: ${overlappingResult.error}`);
        }
        if (overlappingResult.data && overlappingResult.data.length > 0) {
          throw new Error(`Overlapping budget found for category: ${categoryResult.data.name}`);
        }
      }

      const budgetsWithDefaults = budgets.map(budget => ({
        ...budget,
        end_date: budget.end_date ?? calculateEndDate(budget.start_date, budget.period),
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
}

export default new BudgetService();
