import { Router } from 'express';
import { ImportExportController } from '../controllers/ImportExportController';
import { validateRequestSingle } from '../middleware/validation';
import { rateLimitMiddleware } from '../middleware/rateLimit';
import Joi from 'joi';

const router = Router();
const importExportController = new ImportExportController();

/**
 * @swagger
 * tags:
 *   name: Import/Export
 *   description: Data import and export functionality
 */

// Validation schemas
const importOptionsSchema = Joi.object({
  format: Joi.string().valid('csv', 'xlsx').optional(),
  type: Joi.string().valid('transactions', 'categories', 'budgets', 'full').default('transactions'),
  validateData: Joi.string().valid('true', 'false').default('true'),
  skipDuplicates: Joi.string().valid('true', 'false').default('false'),
  updateExisting: Joi.string().valid('true', 'false').default('false'),
  dateFormat: Joi.string().optional(),
  delimiter: Joi.string().optional(),
  encoding: Joi.string().valid('utf8', 'latin1', 'ascii').default('utf8')
});

const exportQuerySchema = Joi.object({
  format: Joi.string().valid('csv', 'xlsx').default('xlsx'),
  type: Joi.string().valid('transactions', 'categories', 'budgets', 'full').default('full'),
  includeHeaders: Joi.string().valid('true', 'false').default('true'),
  includeMetadata: Joi.string().valid('true', 'false').default('false'),
  start_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
  category_ids: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ).optional(),
  transaction_types: Joi.alternatives().try(
    Joi.string().valid('income', 'expense'),
    Joi.array().items(Joi.string().valid('income', 'expense'))
  ).optional(),
  budget_periods: Joi.alternatives().try(
    Joi.string().valid('weekly', 'monthly', 'yearly'),
    Joi.array().items(Joi.string().valid('weekly', 'monthly', 'yearly'))
  ).optional(),
  fields: Joi.string().optional()
});

const templateParamsSchema = Joi.object({
  type: Joi.string().valid('transactions', 'categories', 'budgets').required()
});

const templateQuerySchema = Joi.object({
  format: Joi.string().valid('csv', 'xlsx').default('xlsx'),
  includeExamples: Joi.string().valid('true', 'false').default('true'),
  includeInstructions: Joi.string().valid('true', 'false').default('true')
});

/**
 * @swagger
 * /api/import-export/config:
 *   get:
 *     summary: Get import/export configuration
 *     tags: [Import/Export]
 *     responses:
 *       200:
 *         description: Configuration retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 limits:
 *                   type: object
 *                   description: File size and processing limits
 *                 supported_formats:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Supported file formats
 *                 supported_types:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Supported data types
 *                 examples:
 *                   type: object
 *                   description: Field examples for each data type
 */
router.get('/config', importExportController.getConfig.bind(importExportController));

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
  importExportController.uploadMiddleware,
  validateRequestSingle(importOptionsSchema, 'body'),
  importExportController.importData.bind(importExportController)
);

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
  importExportController.exportData.bind(importExportController)
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
  importExportController.getExportInfo.bind(importExportController)
);

/**
 * @swagger
 * /api/import-export/template/{type}:
 *   get:
 *     summary: Download import template
 *     tags: [Import/Export]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [transactions, categories, budgets]
 *         description: Type of template to download
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, xlsx]
 *           default: xlsx
 *         description: Template file format
 *       - in: query
 *         name: includeExamples
 *         schema:
 *           type: string
 *           enum: [true, false]
 *           default: true
 *         description: Include example data
 *       - in: query
 *         name: includeInstructions
 *         schema:
 *           type: string
 *           enum: [true, false]
 *           default: true
 *         description: Include instructions
 *     responses:
 *       200:
 *         description: Template file download
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
 *         description: Invalid template type
 *       500:
 *         description: Template generation failed
 */
router.get('/template/:type',
  validateRequestSingle(templateParamsSchema, 'params'),
  validateRequestSingle(templateQuerySchema, 'query'),
  importExportController.downloadTemplate.bind(importExportController)
);

/**
 * @swagger
 * /api/import-export/template/{type}/info:
 *   get:
 *     summary: Get template information without downloading
 *     tags: [Import/Export]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [transactions, categories, budgets]
 *         description: Type of template
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, xlsx]
 *           default: csv
 *         description: Template file format
 *     responses:
 *       200:
 *         description: Template information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 file_name:
 *                   type: string
 *                 format:
 *                   type: string
 *                 headers:
 *                   type: array
 *                   items:
 *                     type: string
 *                 example_data:
 *                   type: array
 *                 instructions:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.get('/template/:type/info',
  validateRequestSingle(templateParamsSchema, 'params'),
  validateRequestSingle(templateQuerySchema, 'query'),
  importExportController.getTemplateInfo.bind(importExportController)
);

/**
 * @swagger
 * /api/import-export/validate:
 *   post:
 *     summary: Validate uploaded file structure
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
 *                 description: File to validate
 *     responses:
 *       200:
 *         description: File validation result
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
 *                 issues:
 *                   type: array
 *                   items:
 *                     type: string
 *                 suggestions:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: No file uploaded or invalid file
 */
router.post('/validate',
  importExportController.uploadMiddleware,
  importExportController.validateFile.bind(importExportController)
);

export default router;
