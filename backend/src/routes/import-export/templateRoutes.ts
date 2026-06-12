import { Router } from 'express';
import { ImportExportController } from '../../controllers/ImportExportController';
import { validateRequestSingle } from '../../middleware/validation';
import { templateParamsSchema, templateQuerySchema } from './schemas';

export function registerTemplateRoutes(router: Router, ctrl: ImportExportController): void {
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
    ctrl.downloadTemplate.bind(ctrl)
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
    ctrl.getTemplateInfo.bind(ctrl)
  );
}
