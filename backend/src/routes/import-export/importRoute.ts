import { Router } from 'express';
import { ImportExportController } from '../../controllers/ImportExportController';
import { validateRequestSingle } from '../../middleware/validation';
import { rateLimitMiddleware } from '../../middleware/rateLimit';
import { importOptionsSchema } from './schemas';

export function registerImportRoute(router: Router, ctrl: ImportExportController): void {
  /**
   * @swagger
   * /api/import-export/import:
   *   post:
   *     summary: Import data from file
   *     tags: [Import/Export]
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required:
   *               - file
   *             properties:
   *               file:
   *                 type: string
   *                 format: binary
   *                 description: CSV or Excel file to import
   *               type:
   *                 type: string
   *                 enum: [transactions, categories, budgets, full]
   *                 default: transactions
   *                 description: Type of data to import
   *               format:
   *                 type: string
   *                 enum: [csv, xlsx]
   *                 description: File format (auto-detected if not specified)
   *               validateData:
   *                 type: string
   *                 enum: [true, false]
   *                 default: true
   *                 description: Whether to validate data before import
   *               skipDuplicates:
   *                 type: string
   *                 enum: [true, false]
   *                 default: false
   *                 description: Skip duplicate entries
   *               updateExisting:
   *                 type: string
   *                 enum: [true, false]
   *                 default: false
   *                 description: Update existing entries
   *     responses:
   *       200:
   *         description: Import completed successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 summary:
   *                   type: object
   *                   properties:
   *                     total_rows:
   *                       type: integer
   *                     imported:
   *                       type: integer
   *                     updated:
   *                       type: integer
   *                     skipped:
   *                       type: integer
   *                     errors:
   *                       type: integer
   *                 execution_time_ms:
   *                   type: integer
   *       422:
   *         description: Import completed with validation errors
   *       400:
   *         description: Bad request (no file, invalid parameters)
   *       500:
   *         description: Server error
   */
  router.post('/import',
    rateLimitMiddleware({ windowMs: 60000, max: 5 }),
    ctrl.uploadMiddleware,
    validateRequestSingle(importOptionsSchema, 'body'),
    ctrl.importData.bind(ctrl)
  );
}
