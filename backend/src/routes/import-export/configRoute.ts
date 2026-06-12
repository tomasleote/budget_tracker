import { Router } from 'express';
import { ImportExportController } from '../../controllers/ImportExportController';

export function registerConfigRoute(router: Router, ctrl: ImportExportController): void {
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
  router.get('/config', ctrl.getConfig.bind(ctrl));
}
