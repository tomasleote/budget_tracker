import { Request, Response, NextFunction } from 'express';
import CategoryService from '../services/CategoryService';
import { CreateCategoryDto, UpdateCategoryDto, CategoryQuery } from '../types/category';
import { logger } from '../config/logger';

export class CategoryController {
  /**
   * @swagger
   * /api/categories:
   *   get:
   *     summary: Get all categories
   *     tags: [Categories]
   *     responses:
   *       200:
   *         description: List of categories
   */
  async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query: CategoryQuery = req.query;
      
      let categories;
      if (query.include_children) {
        categories = await CategoryService.getCategoriesWithHierarchy(query);
      } else {
        categories = await CategoryService.getCategories(query);
      }

      res.status(200).json({
        success: true,
        data: categories,
        meta: {
          timestamp: new Date().toISOString(),
          count: categories.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/categories/{id}:
   *   get:
   *     summary: Get category by ID
   *     tags: [Categories]
   *     responses:
   *       200:
   *         description: Category details
   *       404:
   *         description: Category not found
   */
  async getCategoryById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const category = await CategoryService.getCategoryById(id as string);

      if (!category) {
        const error = new Error('Category not found') as any;
        error.statusCode = 404;
        error.code = 'CATEGORY_NOT_FOUND';
        return next(error);
      }

      res.status(200).json({
        success: true,
        data: category,
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
   * /api/categories:
   *   post:
   *     summary: Create new category
   *     tags: [Categories]
   *     responses:
   *       201:
   *         description: Category created successfully
   *       400:
   *         description: Validation error
   */
  async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoryData: CreateCategoryDto = req.body;
      const category = await CategoryService.createCategory(categoryData);

      res.status(201).json({
        success: true,
        data: category,
        message: 'Category created successfully',
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
   * /api/categories/{id}:
   *   put:
   *     summary: Update category
   *     tags: [Categories]
   *     responses:
   *       200:
   *         description: Category updated successfully
   *       404:
   *         description: Category not found
   */
  async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updates: UpdateCategoryDto = req.body;
      
      const category = await CategoryService.updateCategory(id as string, updates);

      res.status(200).json({
        success: true,
        data: category,
        message: 'Category updated successfully',
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
   * /api/categories/{id}:
   *   delete:
   *     summary: Delete category
   *     tags: [Categories]
   *     responses:
   *       200:
   *         description: Category deleted successfully
   *       400:
   *         description: Cannot delete category (has children or transactions)
   *       404:
   *         description: Category not found
   */
  async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await CategoryService.deleteCategory(id as string);

      res.status(200).json({
        success: true,
        data: { deleted_id: id },
        message: 'Category deleted successfully',
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
   * /api/categories/bulk:
   *   post:
   *     summary: Bulk operations on categories
   *     tags: [Categories]
   *     responses:
   *       200:
   *         description: Bulk operation completed
   *       400:
   *         description: Invalid bulk action or validation error
   */
  async bulkOperations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { action, categories } = req.body;
      
      let results: any[] = [];
      let successful = 0;
      let failed = 0;

      switch (action) {
        case 'create':
          results = await CategoryService.bulkCreateCategories(categories);
          successful = results.length;
          failed = categories.length - successful;
          break;

        case 'update':
          for (const categoryUpdate of categories) {
            try {
              const updated = await CategoryService.updateCategory(categoryUpdate.id, categoryUpdate);
              results.push(updated);
              successful++;
            } catch (error) {
              logger.error(`Failed to update category ${categoryUpdate.id}:`, error);
              failed++;
            }
          }
          break;

        case 'delete':
          for (const categoryDelete of categories) {
            try {
              await CategoryService.deleteCategory(categoryDelete.id);
              results.push({ deleted_id: categoryDelete.id });
              successful++;
            } catch (error) {
              logger.error(`Failed to delete category ${categoryDelete.id}:`, error);
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
          processed: categories.length,
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
   * /api/categories/defaults:
   *   get:
   *     summary: Get default categories
   *     tags: [Categories]
   *     responses:
   *       200:
   *         description: List of default categories
   */
  async getDefaultCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await CategoryService.getDefaultCategories();

      res.status(200).json({
        success: true,
        data: categories,
        meta: {
          timestamp: new Date().toISOString(),
          count: categories.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/categories/seed:
   *   post:
   *     summary: Seed default categories
   *     tags: [Categories]
   *     responses:
   *       200:
   *         description: Default categories seeded successfully
   */
  async seedDefaultCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await CategoryService.seedDefaultCategories();

      res.status(200).json({
        success: true,
        message: 'Default categories seeded successfully',
        data: {
          created_count: result.created_count,
          skipped_count: result.skipped_count,
          categories: result.categories
        },
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CategoryController();
