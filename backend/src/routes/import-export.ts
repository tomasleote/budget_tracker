import { Router } from 'express';
import { ImportExportController } from '../controllers/ImportExportController';
import { registerConfigRoute } from './import-export/configRoute';
import { registerImportRoute } from './import-export/importRoute';
import { registerExportRoutes } from './import-export/exportRoutes';
import { registerTemplateRoutes } from './import-export/templateRoutes';
import { registerValidateRoute } from './import-export/validateRoute';

/**
 * @swagger
 * tags:
 *   name: Import/Export
 *   description: Data import and export functionality
 */

const router = Router();
const importExportController = new ImportExportController();

registerConfigRoute(router, importExportController);
registerImportRoute(router, importExportController);
registerExportRoutes(router, importExportController);
registerTemplateRoutes(router, importExportController);
registerValidateRoute(router, importExportController);

export default router;
