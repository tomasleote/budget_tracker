import { Router } from 'express';
import BudgetController from '../controllers/BudgetController';
import { validateRequest, validateUUID } from '../middleware/validation';
import { 
  createBudgetSchema, 
  updateBudgetSchema, 
  budgetQuerySchema,
  bulkBudgetSchema 
} from '../utils/validation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Budgets
 *   description: Budget management endpoints
 */

// GET /api/budgets - Get all budgets with filtering and pagination
router.get(
  '/',
  validateRequest({ query: budgetQuerySchema }),
  BudgetController.getBudgets
);

// GET /api/budgets/alerts - Get budget alerts
router.get(
  '/alerts',
  BudgetController.getBudgetAlerts
);

// GET /api/budgets/summary - Get budget summary
router.get(
  '/summary',
  BudgetController.getBudgetSummary
);

// POST /api/budgets/bulk - Bulk operations
router.post(
  '/bulk',
  validateRequest({ body: bulkBudgetSchema }),
  BudgetController.bulkOperations
);

// GET /api/budgets/:id - Get budget by ID
router.get(
  '/:id',
  validateUUID('id'),
  BudgetController.getBudgetById
);

// POST /api/budgets - Create new budget
router.post(
  '/',
  validateRequest({ body: createBudgetSchema }),
  BudgetController.createBudget
);

// PUT /api/budgets/:id - Update budget
router.put(
  '/:id',
  validateUUID('id'),
  validateRequest({ body: updateBudgetSchema }),
  BudgetController.updateBudget
);

// DELETE /api/budgets/:id - Delete budget
router.delete(
  '/:id',
  validateUUID('id'),
  BudgetController.deleteBudget
);

export default router;
