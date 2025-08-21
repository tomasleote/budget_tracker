import { CategoryService } from '../../../src/services/CategoryService';
import CategoryRepository from '../../../src/repositories/CategoryRepository';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../../../src/types/category';

// Mock the repositories
jest.mock('../../../src/repositories/CategoryRepository');
jest.mock('../../../src/repositories/TransactionRepository');
jest.mock('../../../src/config/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

describe('CategoryService', () => {
  let categoryService: CategoryService;
  let mockCategoryRepository: jest.Mocked<typeof CategoryRepository>;

  const mockCategory: Category = {
    id: '1',
    name: 'Food',
    type: 'expense',
    color: '#FF6B6B',
    icon: 'utensils',
    parent_id: null,
    is_active: true,
    is_default: false,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  };

  const mockChildCategory: Category = {
    id: '2',
    name: 'Restaurants',
    type: 'expense',
    color: '#FF8E8E',
    icon: 'restaurant',
    parent_id: '1',
    is_active: true,
    is_default: false,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  };

  beforeEach(() => {
    categoryService = new CategoryService();
    mockCategoryRepository = CategoryRepository as jest.Mocked<typeof CategoryRepository>;
    jest.clearAllMocks();
  });

  describe('getCategories', () => {
    it('should return all categories when no query is provided', async () => {
      const mockCategories = [mockCategory, mockChildCategory];
      mockCategoryRepository.findAll.mockResolvedValue({ data: mockCategories, error: null });

      const result = await categoryService.getCategories();

      expect(result).toEqual(mockCategories);
      expect(mockCategoryRepository.findAll).toHaveBeenCalledWith({}, { field: 'created_at', ascending: true });
    });

    it('should filter categories by type', async () => {
      const query = { type: 'expense' as const };
      mockCategoryRepository.findAll.mockResolvedValue({ data: [mockCategory], error: null });

      const result = await categoryService.getCategories(query);

      expect(result).toEqual([mockCategory]);
      expect(mockCategoryRepository.findAll).toHaveBeenCalledWith(
        { type: 'expense' },
        { field: 'created_at', ascending: true }
      );
    });

    it('should filter categories by parent_id', async () => {
      const query = { parent_id: '1' };
      mockCategoryRepository.findAll.mockResolvedValue({ data: [mockChildCategory], error: null });

      const result = await categoryService.getCategories(query);

      expect(result).toEqual([mockChildCategory]);
      expect(mockCategoryRepository.findAll).toHaveBeenCalledWith(
        { parent_id: '1' },
        { field: 'created_at', ascending: true }
      );
    });

    it('should filter categories with null parent_id', async () => {
      const query = { parent_id: null };
      mockCategoryRepository.findAll.mockResolvedValue({ data: [mockCategory], error: null });

      const result = await categoryService.getCategories(query);

      expect(result).toEqual([mockCategory]);
      expect(mockCategoryRepository.findAll).toHaveBeenCalledWith(
        { is_null_parent_id: true },
        { field: 'created_at', ascending: true }
      );
    });

    it('should throw error when repository fails', async () => {
      const errorMessage = 'Database error';
      mockCategoryRepository.findAll.mockResolvedValue({ data: null, error: errorMessage });

      await expect(categoryService.getCategories()).rejects.toThrow(`Failed to fetch categories: ${errorMessage}`);
    });
  });

  describe('getCategoriesWithHierarchy', () => {
    it('should return categories with hierarchy', async () => {
      const mockHierarchy = [{ ...mockCategory, children: [mockChildCategory] }];
      mockCategoryRepository.getCategoryHierarchy.mockResolvedValue({ data: mockHierarchy, error: null });

      const result = await categoryService.getCategoriesWithHierarchy();

      expect(result).toEqual(mockHierarchy);
      expect(mockCategoryRepository.getCategoryHierarchy).toHaveBeenCalledWith(undefined);
    });

    it('should filter hierarchy by type', async () => {
      const query = { type: 'expense' as const };
      const mockHierarchy = [{ ...mockCategory, children: [mockChildCategory] }];
      mockCategoryRepository.getCategoryHierarchy.mockResolvedValue({ data: mockHierarchy, error: null });

      const result = await categoryService.getCategoriesWithHierarchy(query);

      expect(result).toEqual(mockHierarchy);
      expect(mockCategoryRepository.getCategoryHierarchy).toHaveBeenCalledWith('expense');
    });

    it('should throw error when repository fails', async () => {
      const errorMessage = 'Database error';
      mockCategoryRepository.getCategoryHierarchy.mockResolvedValue({ data: null, error: errorMessage });

      await expect(categoryService.getCategoriesWithHierarchy()).rejects.toThrow(`Failed to fetch category hierarchy: ${errorMessage}`);
    });
  });

  describe('getCategoryById', () => {
    it('should return category by id', async () => {
      mockCategoryRepository.findById.mockResolvedValue({ data: mockCategory, error: null });

      const result = await categoryService.getCategoryById('1');

      expect(result).toEqual(mockCategory);
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should return null when category not found', async () => {
      mockCategoryRepository.findById.mockResolvedValue({ data: null, error: null });

      const result = await categoryService.getCategoryById('999');

      expect(result).toBeNull();
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith('999');
    });

    it('should throw error when repository fails', async () => {
      const errorMessage = 'Database error';
      mockCategoryRepository.findById.mockResolvedValue({ data: null, error: errorMessage });

      await expect(categoryService.getCategoryById('1')).rejects.toThrow(`Failed to fetch category: ${errorMessage}`);
    });
  });

  describe('createCategory', () => {
    const createCategoryDto: CreateCategoryDto = {
      name: 'New Category',
      type: 'expense',
      color: '#FF0000',
      icon: 'test',
      parent_id: null
    };

    it('should create a category successfully', async () => {
      mockCategoryRepository.findByNameAndType.mockResolvedValue({ data: null, error: null });
      mockCategoryRepository.create.mockResolvedValue({ data: mockCategory, error: null });

      const result = await categoryService.createCategory(createCategoryDto);

      expect(result).toEqual(mockCategory);
      expect(mockCategoryRepository.findByNameAndType).toHaveBeenCalledWith(createCategoryDto.name, createCategoryDto.type);
      expect(mockCategoryRepository.create).toHaveBeenCalledWith({
        ...createCategoryDto,
        is_default: false,
        is_active: true
      });
    });

    it('should validate parent category exists', async () => {
      const createWithParent = { ...createCategoryDto, parent_id: '1' };
      
      // Mock getCategoryById to return parent category
      mockCategoryRepository.findById.mockResolvedValue({ data: mockCategory, error: null });
      mockCategoryRepository.findByNameAndType.mockResolvedValue({ data: null, error: null });
      mockCategoryRepository.create.mockResolvedValue({ data: mockChildCategory, error: null });

      const result = await categoryService.createCategory(createWithParent);

      expect(result).toEqual(mockChildCategory);
    });

    it('should throw error if parent category not found', async () => {
      const createWithParent = { ...createCategoryDto, parent_id: '999' };
      
      mockCategoryRepository.findById.mockResolvedValue({ data: null, error: null });
      mockCategoryRepository.findByNameAndType.mockResolvedValue({ data: null, error: null });

      await expect(categoryService.createCategory(createWithParent)).rejects.toThrow('Parent category not found');
    });

    it('should throw error if parent and child types dont match', async () => {
      const incomeParent = { ...mockCategory, type: 'income' as const };
      const createWithParent = { ...createCategoryDto, parent_id: '1', type: 'expense' as const };
      
      mockCategoryRepository.findById.mockResolvedValue({ data: incomeParent, error: null });
      mockCategoryRepository.findByNameAndType.mockResolvedValue({ data: null, error: null });

      await expect(categoryService.createCategory(createWithParent)).rejects.toThrow('Parent category type "income" does not match child type "expense"');
    });

    it('should throw error if category name already exists', async () => {
      mockCategoryRepository.findByNameAndType.mockResolvedValue({ data: mockCategory, error: null });

      await expect(categoryService.createCategory(createCategoryDto)).rejects.toThrow(`Category with name "${createCategoryDto.name}" already exists for type "${createCategoryDto.type}"`);
    });

    it('should throw error when repository create fails', async () => {
      const errorMessage = 'Database error';
      mockCategoryRepository.findByNameAndType.mockResolvedValue({ data: null, error: null });
      mockCategoryRepository.create.mockResolvedValue({ data: null, error: errorMessage });

      await expect(categoryService.createCategory(createCategoryDto)).rejects.toThrow(`Failed to create category: ${errorMessage}`);
    });
  });

  describe('updateCategory', () => {
    const updateDto: UpdateCategoryDto = {
      name: 'Updated Category',
      color: '#00FF00'
    };

    it('should update category successfully', async () => {
      const updatedCategory = { ...mockCategory, ...updateDto };
      mockCategoryRepository.findById.mockResolvedValue({ data: mockCategory, error: null });
      mockCategoryRepository.findByNameAndType.mockResolvedValue({ data: null, error: null });
      mockCategoryRepository.update.mockResolvedValue({ data: updatedCategory, error: null });

      const result = await categoryService.updateCategory('1', updateDto);

      expect(result).toEqual(updatedCategory);
      expect(mockCategoryRepository.update).toHaveBeenCalledWith('1', updateDto);
    });

    it('should throw error if category not found', async () => {
      mockCategoryRepository.findById.mockResolvedValue({ data: null, error: null });

      await expect(categoryService.updateCategory('999', updateDto)).rejects.toThrow('Category not found');
    });

    it('should prevent modifying default categories structure', async () => {
      const defaultCategory = { ...mockCategory, is_default: true };
      const structuralUpdate = { name: 'New Name', type: 'income' as const };
      
      mockCategoryRepository.findById.mockResolvedValue({ data: defaultCategory, error: null });

      await expect(categoryService.updateCategory('1', structuralUpdate)).rejects.toThrow('Cannot modify name, type, or parent of default categories');
    });

    it('should prevent category from being its own parent', async () => {
      const updateWithSelfParent = { parent_id: '1' };
      mockCategoryRepository.findById.mockResolvedValue({ data: mockCategory, error: null });

      await expect(categoryService.updateCategory('1', updateWithSelfParent)).rejects.toThrow('Category cannot be its own parent');
    });

    it('should throw error when repository update fails', async () => {
      const errorMessage = 'Database error';
      mockCategoryRepository.findById.mockResolvedValue({ data: mockCategory, error: null });
      mockCategoryRepository.findByNameAndType.mockResolvedValue({ data: null, error: null });
      mockCategoryRepository.update.mockResolvedValue({ data: null, error: errorMessage });

      await expect(categoryService.updateCategory('1', updateDto)).rejects.toThrow(`Failed to update category: ${errorMessage}`);
    });
  });

  describe('deleteCategory', () => {
    let mockTransactionRepository: any;

    beforeEach(() => {
      // Get the auto-mocked TransactionRepository
      mockTransactionRepository = require('../../../src/repositories/TransactionRepository').default;
      // Clear any previous mock calls
      jest.clearAllMocks();
    });

    it('should delete category successfully', async () => {
      mockCategoryRepository.findById.mockResolvedValue({ data: mockCategory, error: null });
      mockCategoryRepository.hasChildren.mockResolvedValue({ data: false, error: null });
      mockTransactionRepository.isCategoryUsed.mockResolvedValue({ data: false, error: null });
      mockCategoryRepository.delete.mockResolvedValue({ data: true, error: null });

      await categoryService.deleteCategory('1');

      expect(mockCategoryRepository.delete).toHaveBeenCalledWith('1');
      expect(mockTransactionRepository.isCategoryUsed).toHaveBeenCalledWith('1');
    });

    it('should throw error if category not found', async () => {
      mockCategoryRepository.findById.mockResolvedValue({ data: null, error: null });

      await expect(categoryService.deleteCategory('999')).rejects.toThrow('Category not found');
    });

    it('should prevent deletion of default categories', async () => {
      const defaultCategory = { ...mockCategory, is_default: true };
      mockCategoryRepository.findById.mockResolvedValue({ data: defaultCategory, error: null });

      await expect(categoryService.deleteCategory('1')).rejects.toThrow('Cannot delete default category');
    });

    it('should prevent deletion of categories with children', async () => {
      mockCategoryRepository.findById.mockResolvedValue({ data: mockCategory, error: null });
      mockCategoryRepository.hasChildren.mockResolvedValue({ data: true, error: null });
      mockTransactionRepository.isCategoryUsed.mockResolvedValue({ data: false, error: null });

      await expect(categoryService.deleteCategory('1')).rejects.toThrow('Cannot delete category with child categories');
    });

    it('should prevent deletion of categories used in transactions', async () => {
      mockCategoryRepository.findById.mockResolvedValue({ data: mockCategory, error: null });
      mockCategoryRepository.hasChildren.mockResolvedValue({ data: false, error: null });
      mockTransactionRepository.isCategoryUsed.mockResolvedValue({ data: true, error: null });

      await expect(categoryService.deleteCategory('1')).rejects.toThrow('Cannot delete category that is used in transactions');
    });
  });

  describe('bulkCreateCategories', () => {
    const bulkCreateData: CreateCategoryDto[] = [
      {
        name: 'Category 1',
        type: 'expense',
        color: '#FF0000',
        icon: 'icon1'
      },
      {
        name: 'Category 2',
        type: 'income',
        color: '#00FF00',
        icon: 'icon2'
      }
    ];

    it('should bulk create categories successfully', async () => {
      const mockCreatedCategories = [mockCategory, { ...mockCategory, id: '2', name: 'Category 2' }];
      
      mockCategoryRepository.validateCategoriesBatch.mockResolvedValue({ data: [], error: null });
      mockCategoryRepository.validateParentsBatch.mockResolvedValue({ data: {}, error: null });
      mockCategoryRepository.bulkCreate.mockResolvedValue({ data: mockCreatedCategories, error: null });

      const result = await categoryService.bulkCreateCategories(bulkCreateData);

      expect(result).toEqual(mockCreatedCategories);
      expect(mockCategoryRepository.bulkCreate).toHaveBeenCalledWith(
        bulkCreateData.map(cat => ({ ...cat, is_default: false, is_active: true }))
      );
    });

    it('should throw error for duplicate category names', async () => {
      mockCategoryRepository.validateCategoriesBatch.mockResolvedValue({ 
        data: ['Category 1:expense'], 
        error: null 
      });

      await expect(categoryService.bulkCreateCategories(bulkCreateData)).rejects.toThrow('Category with name "Category 1" already exists for type "expense"');
    });

    it('should throw error when repository bulk create fails', async () => {
      const errorMessage = 'Bulk create failed';
      mockCategoryRepository.validateCategoriesBatch.mockResolvedValue({ data: [], error: null });
      mockCategoryRepository.validateParentsBatch.mockResolvedValue({ data: {}, error: null });
      mockCategoryRepository.bulkCreate.mockResolvedValue({ data: null, error: errorMessage });

      await expect(categoryService.bulkCreateCategories(bulkCreateData)).rejects.toThrow(`Failed to bulk create categories: ${errorMessage}`);
    });
  });

  describe('validateCategoriesExist', () => {
    it('should validate categories exist', async () => {
      const categoryIds = ['1', '2'];
      const existingIds = ['1', '2'];
      mockCategoryRepository.checkCategoriesExistBatch.mockResolvedValue({ data: existingIds, error: null });

      const result = await categoryService.validateCategoriesExist(categoryIds);

      expect(result).toEqual(existingIds);
      expect(mockCategoryRepository.checkCategoriesExistBatch).toHaveBeenCalledWith(categoryIds);
    });

    it('should throw error when repository fails', async () => {
      const errorMessage = 'Database error';
      mockCategoryRepository.checkCategoriesExistBatch.mockResolvedValue({ data: null, error: errorMessage });

      await expect(categoryService.validateCategoriesExist(['1'])).rejects.toThrow(`Failed to validate category existence: ${errorMessage}`);
    });
  });

  describe('clearCache', () => {
    it('should call repository clearCache', () => {
      mockCategoryRepository.clearCache = jest.fn();
      
      categoryService.clearCache();

      expect(mockCategoryRepository.clearCache).toHaveBeenCalled();
    });
  });
});