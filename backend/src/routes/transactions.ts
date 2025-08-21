import { Router } from 'express';
import TransactionController from '../controllers/TransactionController';
import { validateRequest, validateUUID } from '../middleware/validation';
import { 
  createTransactionSchema, 
  updateTransactionSchema, 
  transactionQuerySchema,
  bulkTransactionSchema 
} from '../utils/validation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Transaction management endpoints
 */

// GET /api/transactions - Get all transactions with filtering and pagination
router.get(
  '/',
  validateRequest({ query: transactionQuerySchema }),
  TransactionController.getTransactions
);

// GET /api/transactions/summary - Get transaction summary
router.get(
  '/summary',
  TransactionController.getTransactionSummary
);

// GET /api/transactions/search - Search transactions
router.get(
  '/search',
  TransactionController.searchTransactions
);

// POST /api/transactions/bulk - Bulk operations
router.post(
  '/bulk',
  validateRequest({ body: bulkTransactionSchema }),
  TransactionController.bulkOperations
);

// GET /api/transactions/:id - Get transaction by ID
router.get(
  '/:id',
  validateUUID('id'),
  TransactionController.getTransactionById
);

// POST /api/transactions - Create new transaction
router.post(
  '/',
  validateRequest({ body: createTransactionSchema }),
  TransactionController.createTransaction
);

// PUT /api/transactions/:id - Update transaction
router.put(
  '/:id',
  validateUUID('id'),
  validateRequest({ body: updateTransactionSchema }),
  TransactionController.updateTransaction
);

// DELETE /api/transactions/:id - Delete transaction
router.delete(
  '/:id',
  validateUUID('id'),
  TransactionController.deleteTransaction
);

export default router;
