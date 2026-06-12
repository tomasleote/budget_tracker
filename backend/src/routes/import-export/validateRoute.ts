import { Router } from 'express';
import { ImportExportController } from '../../controllers/ImportExportController';

export function registerValidateRoute(router: Router, ctrl: ImportExportController): void {
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
    ctrl.uploadMiddleware,
    ctrl.validateFile.bind(ctrl)
  );
}
