import { BudgetService } from '../../../src/services/BudgetService';
import BudgetRepository from '../../../src/repositories/BudgetRepository';
import CategoryRepository from '../../../src/repositories/CategoryRepository';
import { 
  Budget, 
  CreateBudgetDto, 
  UpdateBudgetDto, 
  BudgetQuery
} from '../../../src/types/budget';
import { Category } from '../../../src/types/category';

// Mock dependencies
jest.mock('../../../src/repositories/BudgetRepository');
jest.mock('../../../src/repositories/CategoryRepository');
jest.mock('../../../src/config/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

describe('BudgetService', () => {
  let budgetService: BudgetService;
  let mockBudgetRepository: jest.Mocked<typeof BudgetRepository>;
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

  const mockBudget: Budget = {
    id: '1',
    category_id: '1',
    budget_amount: 500.00,
    period: 'monthly',
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    is_active: true,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  };

  beforeEach(() => {
    budgetService = new BudgetService();
    mockBudgetRepository = BudgetRepository as jest.Mocked<typeof BudgetRepository>;
    mockCategoryRepository = CategoryRepository as jest.Mocked<typeof CategoryRepository>;
    jest.clearAllMocks();
  });

  describe('getBudgets', () => {
    it('should return paginated budgets with default parameters', async () => {
      const mockResponse = {
        data: [mockBudget],
        count: 1,
        error: null
      };
      mockBudgetRepository.findAll.mockResolvedValue(mockResponse);

      const result = await budgetService.getBudgets();

      expect(result).toEqual({
        budgets: [mockBudget],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          pages: 1,
          has_next: false,
          has_prev: false
        }
      });
    });

    it('should throw error when repository fails', async () => {
      const errorMessage = 'Database error';
      mockBudgetRepository.findAll.mockResolvedValue({ data: null, count: 0, error: errorMessage });

      await expect(budgetService.getBudgets()).rejects.toThrow(`Failed to fetch budgets: ${errorMessage}`);
    });
  });

  describe('createBudget', () => {
    const createBudgetDto: CreateBudgetDto = {
      category_id: '1',
      budget_amount: 500.00,
      period: 'monthly',
      start_date: '2024-01-01'
    };

    it('should create budget successfully', async () => {
      mockCategoryRepository.findById.mockResolvedValue({ data: mockCategory, error: null });
      mockBudgetRepository.findByCategoryAndDateRange.mockResolvedValue({ data: [], error: null });
      mockBudgetRepository.create.mockResolvedValue({ data: mockBudget, error: null });

      const result = await budgetService.createBudget(createBudgetDto);

      expect(result).toEqual(mockBudget);
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should throw error if category not found', async () => {
      mockCategoryRepository.findById.mockResolvedValue({ data: null, error: null });

      await expect(budgetService.createBudget(createBudgetDto))
        .rejects.toThrow('Category not found');
    });
  });
});