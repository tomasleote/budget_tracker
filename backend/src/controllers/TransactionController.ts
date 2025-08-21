import { Request, Response, NextFunction } from 'express';
import TransactionService from '../services/TransactionService';
import { CreateTransactionDto, UpdateTransactionDto, TransactionQuery } from '../types/transaction';
import { logger } from '../config/logger';

export class TransactionController {
  /**
   * @swagger
   * /api/transactions:
   *   get:
   *     summary: Get all transactions with filtering and pagination
   *     tags: [Transactions]
   *     responses:
   *       200:
   *         description: Paginated list of transactions
   */
  async getTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query: TransactionQuery = req.query;
      const result = await TransactionService.getTransactions(query);

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
   * /api/transactions/{id}:
   *   get:
   *     summary: Get transaction by ID
   *     tags: [Transactions]
   *     responses:
   *       200:
   *         description: Transaction details
   *       404:
   *         description: Transaction not found
   */
  async getTransactionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const includeCategory = req.query.include_category === 'true';
      
      // ID is validated by validateUUID middleware
      const transaction = await TransactionService.getTransactionById(id!, includeCategory);

      if (!transaction) {
        const error = new Error('Transaction not found') as any;
        error.statusCode = 404;
        error.code = 'TRANSACTION_NOT_FOUND';
        return next(error);
      }

      res.status(200).json({
        success: true,
        data: transaction,
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
   * /api/transactions:
   *   post:
   *     summary: Create new transaction
   *     tags: [Transactions]
   *     responses:
   *       201:
   *         description: Transaction created successfully
   *       400:
   *         description: Validation error
   */
  async createTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const transactionData: CreateTransactionDto = req.body;
      const transaction = await TransactionService.createTransaction(transactionData);

      res.status(201).json({
        success: true,
        data: transaction,
        message: 'Transaction created successfully',
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
   * /api/transactions/{id}:
   *   put:
   *     summary: Update transaction
   *     tags: [Transactions]
   *     responses:
   *       200:
   *         description: Transaction updated successfully
   *       404:
   *         description: Transaction not found
   */
  async updateTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updates: UpdateTransactionDto = req.body;
      
      // ID is validated by validateUUID middleware
      const transaction = await TransactionService.updateTransaction(id!, updates);

      res.status(200).json({
        success: true,
        data: transaction,
        message: 'Transaction updated successfully',
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
   * /api/transactions/{id}:
   *   delete:
   *     summary: Delete transaction
   *     tags: [Transactions]
   *     responses:
   *       200:
   *         description: Transaction deleted successfully
   *       404:
   *         description: Transaction not found
   */
  async deleteTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      // ID is validated by validateUUID middleware
      await TransactionService.deleteTransaction(id!);

      res.status(200).json({
        success: true,
        data: { deleted_id: id },
        message: 'Transaction deleted successfully',
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
   * /api/transactions/bulk:
   *   post:
   *     summary: Bulk operations on transactions
   *     tags: [Transactions]
   *     responses:
   *       200:
   *         description: Bulk operation completed
   *       400:
   *         description: Invalid bulk action or validation error
   */
  async bulkOperations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { action, transactions } = req.body;
      
      let results: any[] = [];
      let successful = 0;
      let failed = 0;

      switch (action) {
        case 'create':
          try {
            results = await TransactionService.bulkCreateTransactions(transactions);
            successful = results.length;
          } catch (error) {
            failed = transactions.length;
            logger.error('Bulk create failed:', error);
            throw error;
          }
          break;

        case 'update':
          for (const transactionUpdate of transactions) {
            try {
              const updated = await TransactionService.updateTransaction(transactionUpdate.id, transactionUpdate);
              results.push(updated);
              successful++;
            } catch (error) {
              logger.error(`Failed to update transaction ${transactionUpdate.id}:`, error);
              failed++;
            }
          }
          break;

        case 'delete':
          for (const transactionDelete of transactions) {
            try {
              await TransactionService.deleteTransaction(transactionDelete.id);
              results.push({ deleted_id: transactionDelete.id });
              successful++;
            } catch (error) {
              logger.error(`Failed to delete transaction ${transactionDelete.id}:`, error);
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
          processed: transactions.length,
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

  /**
   * @swagger
   * /api/transactions/summary:
   *   get:
   *     summary: Get transaction summary
   *     tags: [Transactions]
   *     responses:
   *       200:
   *         description: Transaction summary with totals and statistics
   */
  async getTransactionSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { start_date, end_date } = req.query;
      const summary = await TransactionService.getTransactionSummary(
        start_date as string | undefined,
        end_date as string | undefined
      );

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
   * /api/transactions/search:
   *   get:
   *     summary: Search transactions by description
   *     tags: [Transactions]
   *     responses:
   *       200:
   *         description: Search results
   *       400:
   *         description: Missing or invalid search term
   */
  async searchTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q, limit = 10 } = req.query;
      
      if (!q || typeof q !== 'string' || q.trim().length === 0) {
        const error = new Error('Search term is required') as any;
        error.statusCode = 400;
        error.code = 'MISSING_SEARCH_TERM';
        return next(error);
      }

      const results = await TransactionService.searchTransactions(
        q.trim(),
        Math.min(Number(limit), 50)
      );

      res.status(200).json({
        success: true,
        data: results,
        meta: {
          timestamp: new Date().toISOString(),
          count: results.length,
          search_term: q.trim()
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new TransactionController();
