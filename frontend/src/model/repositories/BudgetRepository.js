import { logger } from '../../controller/utils/logger.js';
import BaseRepository from './BaseRepository.js';
import { Budget } from '../entities/index.js';
import StorageService from '../services/StorageService.js';
import { applyBudgetFilters } from './budget/budgetFilters.js';
import {
  findOverlapping,
  sumBudgetAmount,
  sumSpentAmount,
  computeStatusCounts,
  computePeriodStats,
  computeUtilizationStats,
  validateBudgetDates,
  buildBudgetCSV,
} from './budget/budgetAggregations.js';

class BudgetRepository extends BaseRepository {
  constructor() {
    super('Budget', StorageService.storageKeys.BUDGETS, Budget);
  }

  // Budget-specific query methods
  async getByCategory(category) {
    try { return await this.findBy({ category }); } catch { return []; }
  }

  async getByPeriod(period) {
    try { return await this.findBy({ period }); } catch { return []; }
  }

  async getActive() {
    try { return await this.findBy({ isActive: true }); } catch { return []; }
  }

  async getInactive() {
    try { return await this.findBy({ isActive: false }); } catch { return []; }
  }

  async getCurrentBudgets() {
    try {
      const allBudgets = await this.getAll();
      return allBudgets.filter(bd => Budget.fromJSON(bd).isCurrentlyActive());
    } catch (error) {
      logger.error('Error getting current budgets:', error);
      return [];
    }
  }

  async getBudgetsByDateRange(startDate, endDate) {
    try {
      const allBudgets = await this.getAll();
      const start = new Date(startDate);
      const end = new Date(endDate);
      return allBudgets.filter(budget => {
        const budgetStart = new Date(budget.startDate);
        const budgetEnd = new Date(budget.endDate);
        return budgetStart <= end && budgetEnd >= start;
      });
    } catch { return []; }
  }

  // Budget-specific operations
  async activateBudget(budgetId) {
    try { return await this.update(budgetId, { isActive: true }); }
    catch (error) { logger.error('Error activating budget:', error); return { success: false, error: error.message }; }
  }

  async deactivateBudget(budgetId) {
    try { return await this.update(budgetId, { isActive: false }); }
    catch (error) { logger.error('Error deactivating budget:', error); return { success: false, error: error.message }; }
  }

  async updateSpentAmount(budgetId, newSpentAmount) {
    try { return await this.update(budgetId, { spent: parseFloat(newSpentAmount) || 0 }); }
    catch (error) { logger.error('Error updating spent amount:', error); return { success: false, error: error.message }; }
  }

  async addToSpentAmount(budgetId, additionalAmount) {
    try {
      const budget = await this.getById(budgetId);
      if (!budget) throw new Error('Budget not found');
      const newSpentAmount = (parseFloat(budget.spent) || 0) + (parseFloat(additionalAmount) || 0);
      return await this.updateSpentAmount(budgetId, newSpentAmount);
    } catch (error) {
      logger.error('Error adding to spent amount:', error);
      return { success: false, error: error.message };
    }
  }

  async subtractFromSpentAmount(budgetId, subtractAmount) {
    try {
      const budget = await this.getById(budgetId);
      if (!budget) throw new Error('Budget not found');
      const newSpentAmount = Math.max(0, (parseFloat(budget.spent) || 0) - (parseFloat(subtractAmount) || 0));
      return await this.updateSpentAmount(budgetId, newSpentAmount);
    } catch (error) {
      logger.error('Error subtracting from spent amount:', error);
      return { success: false, error: error.message };
    }
  }

  async getWithFilters(filters = {}) {
    try {
      const budgets = await this.getAll();
      return applyBudgetFilters(budgets, filters);
    } catch { return []; }
  }

  // Budget aggregations and statistics
  async getTotalBudgetAmount() {
    try { return sumBudgetAmount(await this.getAll()); } catch { return 0; }
  }

  async getTotalSpentAmount() {
    try { return sumSpentAmount(await this.getAll()); } catch { return 0; }
  }

  async getBudgetsByStatus() {
    try { return computeStatusCounts(await this.getAll()); }
    catch { return { total: 0, active: 0, inactive: 0, exceeded: 0, nearLimit: 0, healthy: 0 }; }
  }

  async getBudgetsByPeriodStats() {
    try { return computePeriodStats(await this.getAll()); } catch { return {}; }
  }

  async exportToCSV() {
    try { return buildBudgetCSV(await this.getAll()); } catch { return null; }
  }

  async findOverlappingBudgets(budget) {
    try { return findOverlapping(await this.getAll(), budget); } catch { return []; }
  }

  async validateBudgetDates() {
    try { return validateBudgetDates(await this.getAll()); }
    catch { return { total: 0, valid: 0, invalid: 0, errors: [] }; }
  }

  async archiveExpiredBudgets() {
    try {
      const budgets = await this.getAll();
      const now = new Date();
      let archivedCount = 0;
      const updatedBudgets = budgets.map(bd => {
        const budget = Budget.fromJSON(bd);
        if (new Date(budget.endDate) < now && budget.isActive) {
          budget.isActive = false;
          archivedCount++;
          return budget.toJSON();
        }
        return bd;
      });
      const saved = this.storageService.setItem(this.storageKey, updatedBudgets);
      return { success: saved, archivedCount, total: budgets.length };
    } catch (error) {
      logger.error('Error archiving expired budgets:', error);
      return { success: false, error: error.message, archivedCount: 0 };
    }
  }

  async getBudgetUtilizationStats() {
    try { return computeUtilizationStats(await this.getAll()); } catch { return null; }
  }
}

export default BudgetRepository;
