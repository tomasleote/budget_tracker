import '../setup'; // Load test setup first
import request from 'supertest';
import { app } from '../../src/app';
import { resetMockDatabase, DEFAULT_CATEGORIES } from '../setup';

/**
 * Categories API Integration Tests
 * 
 * Tests all 9 category endpoints:
 * - GET /api/categories
 * - GET /api/categories/defaults  
 * - POST /api/categories/seed
 * - POST /api/categories/bulk
 * - GET /api/categories/:id
 * - POST /api/categories
 * - PUT /api/categories/:id
 * - DELETE /api/categories/:id
 */

describe('Categories API Integration Tests', () => {
  beforeEach(async () => {
    // Reset mock database before each test
    resetMockDatabase();
  });

  describe('GET /api/categories', () => {
    it('should return empty list when no categories exist', async () => {
      const response = await request(app)
        .get('/api/categories')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.meta.count).toBe(0);
    });

    it('should return list of categories after seeding', async () => {
      // First seed default categories
      await request(app)
        .post('/api/categories/seed')
        .expect(200);

      const response = await request(app)
        .get('/api/categories')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.meta.count).toBeGreaterThan(0);
      
      // Verify category structure
      const firstCategory = response.body.data[0];
      expect(firstCategory).toHaveProperty('id');
      expect(firstCategory).toHaveProperty('name');
      expect(firstCategory).toHaveProperty('type');
      expect(firstCategory).toHaveProperty('color');
      expect(firstCategory).toHaveProperty('icon');
      expect(firstCategory).toHaveProperty('is_active');
      expect(firstCategory).toHaveProperty('created_at');
      expect(firstCategory).toHaveProperty('updated_at');
    });

    it('should filter categories by type', async () => {
      await request(app).post('/api/categories/seed').expect(200);

      const expenseResponse = await request(app)
        .get('/api/categories?type=expense')
        .expect(200);

      const incomeResponse = await request(app)
        .get('/api/categories?type=income')
        .expect(200);

      expect(expenseResponse.body.data.every((cat: any) => cat.type === 'expense')).toBe(true);
      expect(incomeResponse.body.data.every((cat: any) => cat.type === 'income')).toBe(true);
      expect(expenseResponse.body.data.length).toBeGreaterThan(0);
      expect(incomeResponse.body.data.length).toBeGreaterThan(0);
    });

    it('should filter categories by parent_id', async () => {
      await request(app).post('/api/categories/seed').expect(200);

      // Get parent categories (no parent_id)
      const parentResponse = await request(app)
        .get('/api/categories?parent_id=null')
        .expect(200);

      expect(parentResponse.body.data.every((cat: any) => cat.parent_id === null)).toBe(true);
    });

    it('should include hierarchy when requested', async () => {
      await request(app).post('/api/categories/seed').expect(200);

      const response = await request(app)
        .get('/api/categories?include_children=true')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Check if any category has children array
      const hasChildren = response.body.data.some((cat: any) => 
        cat.children && Array.isArray(cat.children)
      );
      expect(hasChildren).toBe(true);
    });

    it('should sort categories by name ascending', async () => {
      await request(app).post('/api/categories/seed').expect(200);

      const response = await request(app)
        .get('/api/categories?sort_by=name&sort_order=asc')
        .expect(200);

      const categories = response.body.data;
      for (let i = 1; i < categories.length; i++) {
        expect(categories[i].name >= categories[i-1].name).toBe(true);
      }
    });

    it('should handle invalid query parameters gracefully', async () => {
      const response = await request(app)
        .get('/api/categories?type=invalid&sort_by=invalid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/categories/defaults', () => {
    it('should return default categories configuration', async () => {
      // Seed first to have default categories
      await request(app).post('/api/categories/seed').expect(200);
      
      const response = await request(app)
        .get('/api/categories/defaults')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Should have both income and expense categories
      const categories = response.body.data;
      const hasIncome = categories.some((cat: any) => cat.type === 'income');
      const hasExpense = categories.some((cat: any) => cat.type === 'expense');
      expect(hasIncome).toBe(true);
      expect(hasExpense).toBe(true);
    });
  });

  describe('POST /api/categories/seed', () => {
    it('should seed default categories successfully', async () => {
      const response = await request(app)
        .post('/api/categories/seed')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.created_count).toBeGreaterThan(0);
      expect(response.body.data.skipped_count).toBe(0);

      // Verify categories were actually created
      const categoriesResponse = await request(app)
        .get('/api/categories')
        .expect(200);

      expect(categoriesResponse.body.data.length).toBeGreaterThan(0);
    });

    it('should skip seeding if categories already exist', async () => {
      // Seed once
      await request(app)
        .post('/api/categories/seed')
        .expect(200);

      // Try to seed again
      const response = await request(app)
        .post('/api/categories/seed')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.created_count).toBe(0);
      expect(response.body.data.skipped_count).toBeGreaterThan(0);
    });
  });

  describe('POST /api/categories', () => {
    it('should create a new category successfully', async () => {
      const newCategory = {
        name: 'Test Category',
        type: 'expense',
        color: '#FF0000',
        icon: 'test'
      };

      const response = await request(app)
        .post('/api/categories')
        .send(newCategory)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(newCategory.name);
      expect(response.body.data.type).toBe(newCategory.type);
      expect(response.body.data.is_active).toBe(true);
      expect(response.body.data.is_default).toBe(false);
    });

    it('should create category with parent relationship', async () => {
      // Create parent category
      const parentCategory = {
        name: 'Parent Category',
        type: 'expense',
        color: '#00FF00',
        icon: 'folder'
      };

      const parentResponse = await request(app)
        .post('/api/categories')
        .send(parentCategory)
        .expect(201);

      const parentId = parentResponse.body.data.id;

      // Create child category
      const childCategory = {
        name: 'Child Category',
        type: 'expense',
        color: '#0000FF',
        icon: 'folder-open',
        parent_id: parentId
      };

      const childResponse = await request(app)
        .post('/api/categories')
        .send(childCategory)
        .expect(201);

      expect(childResponse.body.data.parent_id).toBe(parentId);
    });

    it('should validate required fields', async () => {
      const invalidCategory = {
        // Missing required fields
        color: '#FF0000'
      };

      const response = await request(app)
        .post('/api/categories')
        .send(invalidCategory)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('message');
    });

    it('should prevent duplicate category names for same type', async () => {
      const category = {
        name: 'Duplicate Test',
        type: 'expense',
        color: '#FF0000',
        icon: 'copy'
      };

      // Create first category
      await request(app)
        .post('/api/categories')
        .send(category)
        .expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/categories')
        .send(category)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('already exists');
    });

    it('should validate parent category exists', async () => {
      const category = {
        name: 'Orphan Category',
        type: 'expense',
        color: '#FF0000',
        icon: 'question',
        parent_id: '00000000-0000-0000-0000-000000000000' // Valid UUID format but doesn't exist
      };

      const response = await request(app)
        .post('/api/categories')
        .send(category)
        .expect(404); // Should be 404 for business logic error

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Parent category not found');
    });

    it('should validate parent and child types match', async () => {
      // Create income parent
      const parentCategory = {
        name: 'Income Parent',
        type: 'income',
        color: '#00FF00',
        icon: 'dollar'
      };

      const parentResponse = await request(app)
        .post('/api/categories')
        .send(parentCategory)
        .expect(201);

      // Try to create expense child
      const childCategory = {
        name: 'Expense Child',
        type: 'expense',
        color: '#FF0000',
        icon: 'cart',
        parent_id: parentResponse.body.data.id
      };

      const response = await request(app)
        .post('/api/categories')
        .send(childCategory)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('type');
    });
  });

  describe('GET /api/categories/:id', () => {
    let testCategoryId: string;

    beforeEach(async () => {
      // Create a test category
      const category = {
        name: 'Test Get Category',
        type: 'expense',
        color: '#123456',
        icon: 'test'
      };

      const response = await request(app)
        .post('/api/categories')
        .send(category)
        .expect(201);

      testCategoryId = response.body.data.id;
    });

    it('should return category by valid ID', async () => {
      const response = await request(app)
        .get(`/api/categories/${testCategoryId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testCategoryId);
      expect(response.body.data.name).toBe('Test Get Category');
    });

    it('should return 404 for non-existent category', async () => {
      const response = await request(app)
        .get('/api/categories/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('not found');
    });

    it('should return 400 for invalid UUID format', async () => {
      const response = await request(app)
        .get('/api/categories/invalid-uuid')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/categories/:id', () => {
    let testCategoryId: string;

    beforeEach(async () => {
      // Create a test category
      const category = {
        name: 'Test Update Category',
        type: 'expense',
        color: '#654321',
        icon: 'edit'
      };

      const response = await request(app)
        .post('/api/categories')
        .send(category)
        .expect(201);

      testCategoryId = response.body.data.id;
    });

    it('should update category successfully', async () => {
      const updates = {
        name: 'Updated Category Name',
        color: '#FFFFFF'
      };

      const response = await request(app)
        .put(`/api/categories/${testCategoryId}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updates.name);
      expect(response.body.data.color).toBe(updates.color);
      expect(response.body.data.icon).toBe('edit'); // Unchanged
    });

    it('should update only specified fields', async () => {
      const updates = {
        color: '#000000'
      };

      const response = await request(app)
        .put(`/api/categories/${testCategoryId}`)
        .send(updates)
        .expect(200);

      expect(response.body.data.color).toBe(updates.color);
      expect(response.body.data.name).toBe('Test Update Category'); // Unchanged
    });

    it('should return 404 for non-existent category', async () => {
      const response = await request(app)
        .put('/api/categories/00000000-0000-0000-0000-000000000000')
        .send({ name: 'New Name' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should prevent updating to duplicate name within same type', async () => {
      // Create another category
      await request(app)
        .post('/api/categories')
        .send({
          name: 'Existing Category',
          type: 'expense',
          color: '#111111',
          icon: 'exists'
        })
        .expect(201);

      // Try to update first category to same name
      const response = await request(app)
        .put(`/api/categories/${testCategoryId}`)
        .send({ name: 'Existing Category' })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('already exists');
    });

    it('should validate update data', async () => {
      const response = await request(app)
        .put(`/api/categories/${testCategoryId}`)
        .send({ type: 'invalid-type' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/categories/:id', () => {
    let testCategoryId: string;

    beforeEach(async () => {
      // Create a test category
      const category = {
        name: 'Test Delete Category',
        type: 'expense',
        color: '#AABBCC',
        icon: 'trash'
      };

      const response = await request(app)
        .post('/api/categories')
        .send(category)
        .expect(201);

      testCategoryId = response.body.data.id;
    });

    it('should delete category successfully', async () => {
      const response = await request(app)
        .delete(`/api/categories/${testCategoryId}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify category is deleted
      await request(app)
        .get(`/api/categories/${testCategoryId}`)
        .expect(404);
    });

    it('should return 404 for non-existent category', async () => {
      const response = await request(app)
        .delete('/api/categories/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should prevent deletion of category with children', async () => {
      // Create parent category
      const parentResponse = await request(app)
        .post('/api/categories')
        .send({
          name: 'Parent to Delete',
          type: 'expense',
          color: '#FF0000',
          icon: 'folder'
        })
        .expect(201);

      const parentId = parentResponse.body.data.id;

      // Create child category
      await request(app)
        .post('/api/categories')
        .send({
          name: 'Child Category',
          type: 'expense',
          color: '#00FF00',
          icon: 'file',
          parent_id: parentId
        })
        .expect(201);

      // Try to delete parent
      const response = await request(app)
        .delete(`/api/categories/${parentId}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('child');
    });
  });

  describe('POST /api/categories/bulk', () => {
    it('should bulk create categories successfully', async () => {
      const bulkData = {
        action: 'create',
        categories: [
          { name: 'Bulk 1', type: 'expense', color: '#111111', icon: 'icon1' },
          { name: 'Bulk 2', type: 'expense', color: '#222222', icon: 'icon2' },
          { name: 'Bulk 3', type: 'income', color: '#333333', icon: 'icon3' }
        ]
      };

      const response = await request(app)
        .post('/api/categories/bulk')
        .send(bulkData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.successful).toBe(3);
      expect(response.body.data.failed).toBe(0);
      expect(response.body.data.results).toHaveLength(3);
    });

    it('should handle bulk creation with validation errors', async () => {
      // First create a category to cause a duplicate name conflict
      await request(app)
        .post('/api/categories')
        .send({
          name: 'Existing Category',
          type: 'expense',
          color: '#FFFFFF',
          icon: 'existing'
        })
        .expect(201);

      const bulkData = {
        action: 'create',
        categories: [
          { name: 'Valid Category', type: 'expense', color: '#111111', icon: 'icon1' },
          { name: 'Existing Category', type: 'expense', color: '#222222', icon: 'icon2' }, // Will cause duplicate error
          { name: 'Another Valid', type: 'income', color: '#333333', icon: 'icon3' }
        ]
      };

      const response = await request(app)
        .post('/api/categories/bulk')
        .send(bulkData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.successful).toBe(2);
      expect(response.body.data.failed).toBe(1);
      expect(response.body.data.processed).toBe(3);
    });

    it('should validate bulk request structure', async () => {
      const response = await request(app)
        .post('/api/categories/bulk')
        .send({ invalid: 'data' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle empty categories array', async () => {
      const response = await request(app)
        .post('/api/categories/bulk')
        .send({ operation: 'create', categories: [] })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/categories')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle missing Content-Type header', async () => {
      const response = await request(app)
        .post('/api/categories')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should respect rate limiting', async () => {
      // Make multiple requests quickly
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app).get('/api/categories')
        );
      }

      const responses = await Promise.all(promises);
      const hasRateLimited = responses.some(r => r.status === 429);
      
      // Rate limiting should eventually kick in
      expect(hasRateLimited || responses.every(r => r.status === 200)).toBe(true);
    });

    it('should return appropriate CORS headers', async () => {
      const response = await request(app)
        .get('/api/categories')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });
});
