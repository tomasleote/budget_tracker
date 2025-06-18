import BaseRepository from './BaseRepository.js';
import { Budget } from '../entities/index.js';
import StorageService from '../services/StorageService.js';

class BudgetRepository extends BaseRepository {
  constructor() {
    super('Budget', StorageService.storageKeys.BUDGETS, Budget);
  }

  // Budget-specific query methods
  async getByCategory(category) {
    try {
      return await this.findBy({ category });
    } catch (error) {
      console.error('Error getting budgets by category:', error);
      return [];
    }
  }

  async getByPeriod(period) {
    try {
      return await this.findBy({ period });
    } catch (error) {
      console.error('Error getting budgets by period:', error);
      return [];
    }
  }

  async getActive() {
    try {
      return await this.findBy({ isActive: true });
    } catch (error) {
      console.error('Error getting active budgets:', error);
      return [];
    }
  }

  async getInactive() {
    try {
      return await this.findBy({ isActive: false });
    } catch (error) {
      console.error('Error getting inactive budgets:', error);
      return [];
    }
  }

  async getCurrentBudgets() {
    try {
      const allBudgets = await this.getAll();
      console.log('📊 BudgetRepository.getCurrentBudgets - Found budgets:', allBudgets.length);
      const now = new Date();
      
      const currentBudgets = allBudgets.filter(budgetData => {
        const budget = Budget.fromJSON(budgetData);
        const isCurrent = budget.isCurrentlyActive();
        return isCurrent;
      });
      
      console.log('✅ Active budgets found:', currentBudgets.length);
      return currentBudgets;
    } catch (error) {
      console.error('Error getting current budgets:', error);
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
        
        // Check if budget period overlaps with requested range
        return budgetStart <= end && budgetEnd >= start;
      });
    } catch (error) {
      console.error('Error getting budgets by date range:', error);
      return [];
    }
  }

  // Budget-specific operations
  async activateBudget(budgetId) {
    try {
      return await this.update(budgetId, { isActive: true });
    } catch (error) {
      console.error('Error activating budget:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async deactivateBudget(budgetId) {
    try {
      return await this.update(budgetId, { isActive: false });
    } catch (error) {
      console.error('Error deactivating budget:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async updateSpentAmount(budgetId, newSpentAmount) {
    try {
      return await this.update(budgetId, { 
        spent: parseFloat(newSpentAmount) || 0 
      });
    } catch (error) {
      console.error('Error updating spent amount:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async addToSpentAmount(budgetId, additionalAmount) {
    try {
      const budget = await this.getById(budgetId);
      if (!budget) {
        throw new Error('Budget not found');
      }

      const newSpentAmount = (parseFloat(budget.spent) || 0) + (parseFloat(additionalAmount) || 0);
      return await this.updateSpentAmount(budgetId, newSpentAmount);
    } catch (error) {
      console.error('Error adding to spent amount:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async subtractFromSpentAmount(budgetId, subtractAmount) {
    try {
      const budget = await this.getById(budgetId);
      if (!budget) {
        throw new Error('Budget not found');
      }

      const newSpentAmount = Math.max(0, (parseFloat(budget.spent) || 0) - (parseFloat(subtractAmount) || 0));
      return await this.updateSpentAmount(budgetId, newSpentAmount);
    } catch (error) {
      console.error('Error subtracting from spent amount:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Budget filtering and searching
  async getWithFilters(filters = {}) {
    try {
      let budgets = await this.getAll();

      // Apply category filter
      if (filters.category && filters.category !== 'all') {
        budgets = budgets.filter(b => b.category === filters.category);
      }

      // Apply period filter
      if (filters.period && filters.period !== 'all') {
        budgets = budgets.filter(b => b.period === filters.period);
      }

      // Apply status filter
      if (filters.status) {
        switch (filters.status) {
          case 'active':
            budgets = budgets.filter(b => b.isActive);
            break;
          case 'inactive':
            budgets = budgets.filter(b => !b.isActive);
            break;
          case 'current':
            budgets = budgets.filter(budgetData => {
              const budget = Budget.fromJSON(budgetData);
              return budget.isCurrentlyActive();
            });
            break;
        }
      }

      // Apply exceeded filter
      if (filters.exceeded !== undefined) {
        budgets = budgets.filter(b => {
          const isExceeded = parseFloat(b.spent) > parseFloat(b.budgetAmount);
          return filters.exceeded ? isExceeded : !isExceeded;
        });
      }

      // Apply amount range filters
      if (filters.minBudgetAmount !== undefined) {
        budgets = budgets.filter(b => parseFloat(b.budgetAmount) >= parseFloat(filters.minBudgetAmount));
      }

      if (filters.maxBudgetAmount !== undefined) {
        budgets = budgets.filter(b => parseFloat(b.budgetAmount) <= parseFloat(filters.maxBudgetAmount));
      }

      // Apply date range filter
      if (filters.dateFrom || filters.dateTo) {
        const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : new Date('1900-01-01');
        const toDate = filters.dateTo ? new Date(filters.dateTo) : new Date('2100-12-31');
        
        budgets = budgets.filter(b => {
          const budgetStart = new Date(b.startDate);
          const budgetEnd = new Date(b.endDate);
          return budgetStart <= toDate && budgetEnd >= fromDate;
        });
      }

      // Apply search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        budgets = budgets.filter(b => 
          b.category.toLowerCase().includes(searchTerm)
        );
      }

      // Apply sorting
      if (filters.sortBy) {
        budgets = this.sortData(budgets, filters.sortBy, filters.sortOrder || 'desc');
      }

      // Apply pagination
      if (filters.limit) {
        const offset = filters.offset || 0;
        budgets = budgets.slice(offset, offset + filters.limit);
      }

      return budgets;
    } catch (error) {
      console.error('Error getting budgets with filters:', error);
      return [];
    }
  }

  // Budget aggregations and statistics
  async getTotalBudgetAmount() {
    try {
      const budgets = await this.getAll();
      return budgets.reduce((total, budget) => {
        return total + (parseFloat(budget.budgetAmount) || 0);
      }, 0);
    } catch (error) {
      console.error('Error getting total budget amount:', error);
      return 0;
    }
  }

  async getTotalSpentAmount() {
    try {
      const budgets = await this.getAll();
      return budgets.reduce((total, budget) => {
        return total + (parseFloat(budget.spent) || 0);
      }, 0);
    } catch (error) {
      console.error('Error getting total spent amount:', error);
      return 0;
    }
  }

  async getBudgetsByStatus() {
    try {
      const budgets = await this.getAll();
      const statusCounts = {
        total: budgets.length,
        active: 0,
        inactive: 0,
        exceeded: 0,
        nearLimit: 0,
        healthy: 0
      };

      budgets.forEach(budgetData => {
        const budget = Budget.fromJSON(budgetData);
        
        if (budget.isActive) {
          statusCounts.active++;
        } else {
          statusCounts.inactive++;
        }

        if (budget.isExceeded()) {
          statusCounts.exceeded++;
        } else if (budget.isNearLimit()) {
          statusCounts.nearLimit++;
        } else {
          statusCounts.healthy++;
        }
      });

      return statusCounts;
    } catch (error) {
      console.error('Error getting budgets by status:', error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        exceeded: 0,
        nearLimit: 0,
        healthy: 0
      };
    }
  }

  async getBudgetsByPeriodStats() {
    try {
      const budgets = await this.getAll();
      const periodStats = {};

      budgets.forEach(budget => {
        const period = budget.period;
        if (!periodStats[period]) {
          periodStats[period] = {
            count: 0,
            totalBudget: 0,
            totalSpent: 0,
            averageBudget: 0,
            averageSpent: 0
          };
        }

        periodStats[period].count++;
        periodStats[period].totalBudget += parseFloat(budget.budgetAmount) || 0;
        periodStats[period].totalSpent += parseFloat(budget.spent) || 0;
      });

      // Calculate averages
      Object.keys(periodStats).forEach(period => {
        const stats = periodStats[period];
        stats.averageBudget = stats.count > 0 ? stats.totalBudget / stats.count : 0;
        stats.averageSpent = stats.count > 0 ? stats.totalSpent / stats.count : 0;
      });

      return periodStats;
    } catch (error) {
      console.error('Error getting budgets by period stats:', error);
      return {};
    }
  }

  // Budget validation and cleanup
  async findOverlappingBudgets(budget) {
    try {
      const allBudgets = await this.getAll();
      const budgetStart = new Date(budget.startDate);
      const budgetEnd = new Date(budget.endDate);

      return allBudgets.filter(existingBudget => {
        if (existingBudget.id === budget.id) return false; // Exclude self
        if (existingBudget.category !== budget.category) return false; // Different category
        if (!existingBudget.isActive) return false; // Inactive budgets don't overlap

        const existingStart = new Date(existingBudget.startDate);
        const existingEnd = new Date(existingBudget.endDate);

        // Check for date overlap
        return budgetStart <= existingEnd && budgetEnd >= existingStart;
      });
    } catch (error) {
      console.error('Error finding overlapping budgets:', error);
      return [];
    }
  }

  async validateBudgetDates() {
    try {
      const budgets = await this.getAll();
      const invalidBudgets = [];

      budgets.forEach(budget => {
        const startDate = new Date(budget.startDate);
        const endDate = new Date(budget.endDate);

        if (startDate >= endDate) {
          invalidBudgets.push({
            id: budget.id,
            category: budget.category,
            error: 'Start date must be before end date'
          });
        }

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          invalidBudgets.push({
            id: budget.id,
            category: budget.category,
            error: 'Invalid date format'
          });
        }
      });

      return {
        total: budgets.length,
        valid: budgets.length - invalidBudgets.length,
        invalid: invalidBudgets.length,
        errors: invalidBudgets
      };
    } catch (error) {
      console.error('Error validating budget dates:', error);
      return {
        total: 0,
        valid: 0,
        invalid: 0,
        errors: []
      };
    }
  }

  // Budget archiving
  async archiveExpiredBudgets() {
    try {
      const budgets = await this.getAll();
      const now = new Date();
      let archivedCount = 0;

      const updatedBudgets = budgets.map(budgetData => {
        const budget = Budget.fromJSON(budgetData);
        const endDate = new Date(budget.endDate);

        // Archive if budget has ended and is still active
        if (endDate < now && budget.isActive) {
          budget.isActive = false;
          archivedCount++;
          return budget.toJSON();
        }

        return budgetData;
      });

      // Save updated budgets
      const saved = this.storageService.setItem(this.storageKey, updatedBudgets);

      return {
        success: saved,
        archivedCount,
        total: budgets.length
      };
    } catch (error) {
      console.error('Error archiving expired budgets:', error);
      return {
        success: false,
        error: error.message,
        archivedCount: 0
      };
    }
  }

  // Export functionality specific to budgets
  async exportToCSV() {
    try {
      const budgets = await this.getAll();
      
      if (budgets.length === 0) {
        return '';
      }

      const headers = ['ID', 'Category', 'Budget Amount', 'Spent', 'Period', 'Start Date', 'End Date', 'Is Active', 'Created At'];
      const csvRows = [headers.join(',')];

      budgets.forEach(budget => {
        const row = [
          budget.id,
          `"${budget.category}"`,
          budget.budgetAmount,
          budget.spent,
          budget.period,
          budget.startDate,
          budget.endDate,
          budget.isActive,
          budget.createdAt
        ];
        csvRows.push(row.join(','));
      });

      return csvRows.join('\n');
    } catch (error) {
      console.error('Error exporting budgets to CSV:', error);
      return null;
    }
  }

  // Budget analytics helpers
  async getBudgetUtilizationStats() {
    try {
      const budgets = await this.getAll();
      const utilizationStats = {
        totalBudgets: budgets.length,
        utilizationRanges: {
          underUtilized: 0,    // < 50%
          healthy: 0,          // 50-79%
          nearLimit: 0,        // 80-99%
          exceeded: 0          // >= 100%
        }
      };

      budgets.forEach(budgetData => {
        const budget = Budget.fromJSON(budgetData);
        const percentage = budget.getSpentPercentage();

        if (percentage < 50) {
          utilizationStats.utilizationRanges.underUtilized++;
        } else if (percentage < 80) {
          utilizationStats.utilizationRanges.healthy++;
        } else if (percentage < 100) {
          utilizationStats.utilizationRanges.nearLimit++;
        } else {
          utilizationStats.utilizationRanges.exceeded++;
        }
      });

      return utilizationStats;
    } catch (error) {
      console.error('Error getting budget utilization stats:', error);
      return null;
    }
  }
}

export default BudgetRepository;