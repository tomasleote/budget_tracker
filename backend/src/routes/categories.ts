import { Router } from 'express';
import CategoryController from '../controllers/CategoryController';
import { validateRequest, validateUUID } from '../middleware/validation';
import { 
  createCategorySchema, 
  updateCategorySchema, 
  categoryQuerySchema,
  bulkCategorySchema 
} from '../utils/validation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management endpoints
 */

// GET /api/categories - Get all categories with filtering
router.get(
  '/',
  validateRequest({ query: categoryQuerySchema }),
  CategoryController.getCategories
);

// GET /api/categories/defaults - Get default categories
router.get(
  '/defaults',
  CategoryController.getDefaultCategories
);

// POST /api/categories/seed - Seed default categories
router.post(
  '/seed',
  CategoryController.seedDefaultCategories
);

// POST /api/categories/bulk - Bulk operations
router.post(
  '/bulk',
  validateRequest({ body: bulkCategorySchema }),
  CategoryController.bulkOperations
);

// GET /api/categories/:id - Get category by ID
router.get(
  '/:id',
  validateUUID('id'),
  CategoryController.getCategoryById
);

// POST /api/categories - Create new category
router.post(
  '/',
  validateRequest({ body: createCategorySchema }),
  CategoryController.createCategory
);

// PUT /api/categories/:id - Update category
router.put(
  '/:id',
  validateUUID('id'),
  validateRequest({ body: updateCategorySchema }),
  CategoryController.updateCategory
);

// DELETE /api/categories/:id - Delete category
router.delete(
  '/:id',
  validateUUID('id'),
  CategoryController.deleteCategory
);

export default router;
