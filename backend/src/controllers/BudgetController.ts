import { Request, Response, NextFunction } from 'express';
import BudgetService from '../services/BudgetService';
import { CreateBudgetDto, UpdateBudgetDto, BudgetQuery } from '../types/budget';
import { logger } from '../config/logger';

export class BudgetController {
  /**
   * @swagger
   * /api/budgets:
   *   get:
   *     summary: Get all budgets
   *     tags: [Budgets]
   *     responses:
   *       200:
   *         description: List of budgets with pagination
   */
  async getBudgets(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query: BudgetQuery = req.query;
      const result = await BudgetService.getBudgets(query);

      res.status(200).json({
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/budgets/{id}:
   *   get:
   *     summary: Get budget by ID
   *     tags: [Budgets]
   *     responses:
   *       200:
   *         description: Budget details
   *       404:
   *         description: Budget not found
   */
  async getBudgetById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const includeProgress = req.query.include_progress === 'true';
      // ID is validated by validateUUID middleware
      const budget = await BudgetService.getBudgetById(id!, includeProgress);

      if (!budget) {
        const error = new Error('Budget not found') as any;
        error.statusCode = 404;
        error.code = 'BUDGET_NOT_FOUND';
        return next(error);
      }

      res.status(200).json({
        success: true,
        data: budget,
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/budgets:
   *   post:
   *     summary: Create new budget
   *     tags: [Budgets]
   *     responses:
   *       201:
   *         description: Budget created successfully
   *       400:
   *         description: Validation error
   */
  async createBudget(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const budgetData: CreateBudgetDto = req.body;
      const budget = await BudgetService.createBudget(budgetData);

      res.status(201).json({
        success: true,
        data: budget,
        message: 'Budget created successfully',
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/budgets/{id}:
   *   put:
   *     summary: Update budget
   *     tags: [Budgets]
   *     responses:
   *       200:
   *         description: Budget updated successfully
   *       404:
   *         description: Budget not found
   */
  async updateBudget(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updates: UpdateBudgetDto = req.body;
      
      // ID is validated by validateUUID middleware
      const budget = await BudgetService.updateBudget(id!, updates);

      res.status(200).json({
        success: true,
        data: budget,
        message: 'Budget updated successfully',
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/budgets/{id}:
   *   delete:
   *     summary: Delete budget
   *     tags: [Budgets]
   *     responses:
   *       200:
   *         description: Budget deleted successfully
   *       404:
   *         description: Budget not found
   */
  async deleteBudget(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      // ID is validated by validateUUID middleware
      await BudgetService.deleteBudget(id!);

      res.status(200).json({
        success: true,
        data: { deleted_id: id },
        message: 'Budget deleted successfully',
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/budgets/alerts:
   *   get:
   *     summary: Get budget alerts for overspending and approaching limits
   *     tags: [Budgets]
   *     responses:
   *       200:
   *         description: List of budget alerts
   */
  async getBudgetAlerts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const approachingThreshold = Number(req.query.approaching_threshold) || 80;
      const highThreshold = Number(req.query.high_threshold) || 95;
      
      const alerts = await BudgetService.getBudgetAlerts({
        approaching: approachingThreshold,
        high: highThreshold
      });

      res.status(200).json({
        success: true,
        data: alerts,
        meta: {
          timestamp: new Date().toISOString(),
          count: alerts.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/budgets/summary:
   *   get:
   *     summary: Get budget summary and analytics
   *     tags: [Budgets]
   *     responses:
   *       200:
   *         description: Budget summary with analytics
   */
  async getBudgetSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters: any = {};
      if (req.query.period) filters.period = req.query.period;
      if (req.query.is_active !== undefined) filters.is_active = req.query.is_active === 'true';
      
      const summary = await BudgetService.getBudgetSummary(filters);

      res.status(200).json({
        success: true,
        data: summary,
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/budgets/bulk:
   *   post:
   *     summary: Bulk operations on budgets
   *     tags: [Budgets]
   *     responses:
   *       200:
   *         description: Bulk operation completed
   *       400:
   *         description: Invalid bulk action or validation error
   */
  async bulkOperations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { action, budgets } = req.body;
      
      let results: any[] = [];
      let successful = 0;
      let failed = 0;

      switch (action) {
        case 'create':
          try {
            results = await BudgetService.bulkCreateBudgets(budgets);
            successful = results.length;
          } catch (error) {
            failed = budgets.length;
            logger.error('Bulk create failed:', error);
            throw error;
          }
          break;

        case 'update':
          for (const budgetUpdate of budgets) {
            try {
              const updated = await BudgetService.updateBudget(budgetUpdate.id, budgetUpdate);
              results.push(updated);
              successful++;
            } catch (error) {
              logger.error(`Failed to update budget ${budgetUpdate.id}:`, error);
              failed++;
            }
          }
          break;

        case 'delete':
          for (const budgetDelete of budgets) {
            try {
              await BudgetService.deleteBudget(budgetDelete.id);
              results.push({ deleted_id: budgetDelete.id });
              successful++;
            } catch (error) {
              logger.error(`Failed to delete budget ${budgetDelete.id}:`, error);
              failed++;
            }
          }
          break;

        default:
          const error = new Error('Invalid bulk action') as any;
          error.statusCode = 400;
          error.code = 'INVALID_BULK_ACTION';
          return next(error);
      }

      res.status(200).json({
        success: true,
        data: {
          processed: budgets.length,
          successful,
          failed,
          results
        },
        message: `Bulk ${action} operation completed`,
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new BudgetController();
