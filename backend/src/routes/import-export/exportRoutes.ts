import { Router } from 'express';
import { ImportExportController } from '../../controllers/ImportExportController';
import { validateRequestSingle } from '../../middleware/validation';
import { rateLimitMiddleware } from '../../middleware/rateLimit';
import { exportQuerySchema } from './schemas';

export function registerExportRoutes(router: Router, ctrl: ImportExportController): void {
  /**
   * @swagger
   * /api/import-export/export:
   *   get:
   *     summary: Export data to file
   *     tags: [Import/Export]
   *     parameters:
   *       - in: query
   *         name: format
   *         schema:
   *           type: string
   *           enum: [csv, xlsx]
   *           default: xlsx
   *         description: Export file format
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [transactions, categories, budgets, full]
   *           default: full
   *         description: Type of data to export
   *       - in: query
   *         name: start_date
   *         schema:
   *           type: string
   *           format: date
   *         description: Start date for filtering (YYYY-MM-DD)
   *       - in: query
   *         name: end_date
   *         schema:
   *           type: string
   *           format: date
   *         description: End date for filtering (YYYY-MM-DD)
   *       - in: query
   *         name: category_ids
   *         schema:
   *           type: string
   *         description: Comma-separated category IDs to filter
   *       - in: query
   *         name: transaction_types
   *         schema:
   *           type: string
   *         description: Comma-separated transaction types (income,expense)
   *       - in: query
   *         name: includeHeaders
   *         schema:
   *           type: string
   *           enum: [true, false]
   *           default: true
   *         description: Include column headers
   *       - in: query
   *         name: includeMetadata
   *         schema:
   *           type: string
   *           enum: [true, false]
   *           default: false
   *         description: Include metadata sheet (Excel only)
   *     responses:
   *       200:
   *         description: File download
   *         content:
   *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
   *             schema:
   *               type: string
   *               format: binary
   *           text/csv:
   *             schema:
   *               type: string
   *               format: binary
   *       400:
   *         description: Invalid parameters
   *       500:
   *         description: Export failed
   */
  router.get('/export',
    rateLimitMiddleware({ windowMs: 60000, max: 10 }),
    validateRequestSingle(exportQuerySchema, 'query'),
    ctrl.exportData.bind(ctrl)
  );

  /**
   * @swagger
   * /api/import-export/export/info:
   *   get:
   *     summary: Get export information without downloading
   *     tags: [Import/Export]
   *     parameters:
   *       - in: query
   *         name: format
   *         schema:
   *           type: string
   *           enum: [csv, xlsx]
   *           default: xlsx
   *         description: Export file format
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [transactions, categories, budgets, full]
   *           default: full
   *         description: Type of data to export
   *       - in: query
   *         name: start_date
   *         schema:
   *           type: string
   *           format: date
   *         description: Start date for filtering (YYYY-MM-DD)
   *       - in: query
   *         name: end_date
   *         schema:
   *           type: string
   *           format: date
   *         description: End date for filtering (YYYY-MM-DD)
   *     responses:
   *       200:
   *         description: Export information
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 file_name:
   *                   type: string
   *                 file_size:
   *                   type: integer
   *                 format:
   *                   type: string
   *                 summary:
   *                   type: object
   *                   properties:
   *                     total_records:
   *                       type: integer
   *                     transactions:
   *                       type: integer
   *                     categories:
   *                       type: integer
   *                     budgets:
   *                       type: integer
   *                 execution_time_ms:
   *                   type: integer
   */
  router.get('/export/info',
    validateRequestSingle(exportQuerySchema, 'query'),
    ctrl.getExportInfo.bind(ctrl)
  );
}
