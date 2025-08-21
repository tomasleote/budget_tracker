import { TransactionService } from '../../../src/services/TransactionService';
import TransactionRepository from '../../../src/repositories/TransactionRepository';
import CategoryService from '../../../src/services/CategoryService';
import { 
  Transaction, 
  CreateTransactionDto, 
  UpdateTransactionDto, 
  TransactionQuery 
} from '../../../src/types/transaction';
import { Category } from '../../../src/types/category';

// Mock dependencies
jest.mock('../../../src/repositories/TransactionRepository');
jest.mock('../../../src/services/CategoryService');
jest.mock('../../../src/config/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

describe('TransactionService', () => {
  let transactionService: TransactionService;
  let mockTransactionRepository: jest.Mocked<typeof TransactionRepository>;
  let mockCategoryService: jest.Mocked<typeof CategoryService>;

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

  const mockTransaction: Transaction = {
    id: '1',
    description: 'Grocery shopping',
    amount: 50.00,
    type: 'expense',
    category_id: '1',
    date: '2024-01-15',
    created_at: '2024-01-15T10:00:00.000Z',
    updated_at: '2024-01-15T10:00:00.000Z'
  };

  const mockIncomeCategory: Category = {
    ...mockCategory,
    id: '2',
    name: 'Salary',
    type: 'income',
    icon: 'money-bill'
  };

  const mockIncomeTransaction: Transaction = {
    ...mockTransaction,
    id: '2',
    description: 'Monthly salary',
    type: 'income',
    category_id: '2',
    amount: 3000.00
  };

  beforeEach(() => {
    transactionService = new TransactionService();
    mockTransactionRepository = TransactionRepository as jest.Mocked<typeof TransactionRepository>;
    mockCategoryService = CategoryService as jest.Mocked<typeof CategoryService>;
    jest.clearAllMocks();
  });

  describe('getTransactions', () => {
    it('should return paginated transactions with default parameters', async () => {
      const mockResponse = {
        data: [mockTransaction],
        count: 1,
        error: null
      };
      mockTransactionRepository.findAll.mockResolvedValue(mockResponse);

      const result = await transactionService.getTransactions();

      expect(result).toEqual({
        transactions: [mockTransaction],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          pages: 1,
          has_next: false,
          has_prev: false
        }
      });
      expect(mockTransactionRepository.findAll).toHaveBeenCalledWith(
        {},
        { field: 'date', ascending: false },
        { page: 1, limit: 20, offset: 0 }
      );
    });

    it('should apply filters correctly', async () => {
      const query: TransactionQuery = {
        type: 'expense',
        category_id: '1',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        min_amount: 10,
        max_amount: 100,
        search: 'grocery'
      };

      mockTransactionRepository.findAll.mockResolvedValue({
        data: [mockTransaction],
        count: 1,
        error: null
      });

      await transactionService.getTransactions(query);

      expect(mockTransactionRepository.findAll).toHaveBeenCalledWith(
        {
          type: 'expense',
          category_id: '1',
          'gte_date': '2024-01-01',
          'lte_date': '2024-01-31',
          'gte_amount': 10,
          'lte_amount': 100,
          'ilike_description': '%grocery%'
        },
        { field: 'date', ascending: false },
        { page: 1, limit: 20, offset: 0 }
      );
    });

    it('should include categories when requested', async () => {
      const query: TransactionQuery = { include_category: true };
      
      mockTransactionRepository.findWithCategories.mockResolvedValue({
        data: [{ ...mockTransaction, category: mockCategory }],
        count: 1,
        error: null
      });

      const result = await transactionService.getTransactions(query);

      expect(mockTransactionRepository.findWithCategories).toHaveBeenCalled();
      expect(mockTransactionRepository.findAll).not.toHaveBeenCalled();
    });

    it('should throw error when repository fails', async () => {
      mockTransactionRepository.findAll.mockResolvedValue({
        data: null,
        error: 'Database error'
      });

      await expect(transactionService.getTransactions()).rejects.toThrow('Failed to fetch transactions: Database error');
    });
  });

  describe('getTransactionById', () => {
    it('should return transaction by id', async () => {
      mockTransactionRepository.findById.mockResolvedValue({
        data: mockTransaction,
        error: null
      });

      const result = await transactionService.getTransactionById('1');

      expect(result).toEqual(mockTransaction);
      expect(mockTransactionRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should include category when requested', async () => {
      const transactionWithCategory = { ...mockTransaction, category: mockCategory };
      mockTransactionRepository.findByIdWithCategory.mockResolvedValue({
        data: transactionWithCategory,
        error: null
      });

      const result = await transactionService.getTransactionById('1', true);

      expect(result).toEqual(transactionWithCategory);
      expect(mockTransactionRepository.findByIdWithCategory).toHaveBeenCalledWith('1');
    });

    it('should return null when transaction not found', async () => {
      mockTransactionRepository.findById.mockResolvedValue({
        data: null,
        error: null
      });

      const result = await transactionService.getTransactionById('999');

      expect(result).toBeNull();
    });

    it('should throw error when repository fails', async () => {
      mockTransactionRepository.findById.mockResolvedValue({
        data: null,
        error: 'Database error'
      });

      await expect(transactionService.getTransactionById('1')).rejects.toThrow('Failed to fetch transaction: Database error');
    });
  });

  describe('createTransaction', () => {
    const createDto: CreateTransactionDto = {
      description: 'Test transaction',
      amount: 50.00,
      type: 'expense',
      category_id: '1',
      date: '2024-01-15'
    };

    it('should create transaction successfully', async () => {
      mockCategoryService.getCategoryById.mockResolvedValue(mockCategory);
      mockTransactionRepository.create.mockResolvedValue({
        data: mockTransaction,
        error: null
      });

      const result = await transactionService.createTransaction(createDto);

      expect(result).toEqual(mockTransaction);
      expect(mockCategoryService.getCategoryById).toHaveBeenCalledWith('1');
      expect(mockTransactionRepository.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw error if category not found', async () => {
      mockCategoryService.getCategoryById.mockResolvedValue(null);

      await expect(transactionService.createTransaction(createDto)).rejects.toThrow('Category not found');
    });

    it('should throw error if category is inactive', async () => {
      mockCategoryService.getCategoryById.mockResolvedValue({
        ...mockCategory,
        is_active: false
      });

      await expect(transactionService.createTransaction(createDto)).rejects.toThrow('Cannot create transaction with inactive category');
    });

    it('should throw error if transaction type does not match category type', async () => {
      mockCategoryService.getCategoryById.mockResolvedValue(mockIncomeCategory);

      await expect(transactionService.createTransaction(createDto)).rejects.toThrow(
        'Transaction type "expense" does not match category type "income"'
      );
    });

    it('should throw error if amount is not positive', async () => {
      mockCategoryService.getCategoryById.mockResolvedValue(mockCategory);

      await expect(transactionService.createTransaction({
        ...createDto,
        amount: 0
      })).rejects.toThrow('Transaction amount must be positive');

      await expect(transactionService.createTransaction({
        ...createDto,
        amount: -10
      })).rejects.toThrow('Transaction amount must be positive');
    });

    it('should throw error if date is more than 1 day in future', async () => {
      mockCategoryService.getCategoryById.mockResolvedValue(mockCategory);
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);
      const futureDateString = futureDate.toISOString().split('T')[0];
      if (!futureDateString) {
        throw new Error('Failed to format date');
      }

      await expect(transactionService.createTransaction({
        ...createDto,
        date: futureDateString
      })).rejects.toThrow('Transaction date cannot be more than 1 day in the future');
    });

    it('should format amount to 2 decimal places', async () => {
      mockCategoryService.getCategoryById.mockResolvedValue(mockCategory);
      mockTransactionRepository.create.mockResolvedValue({
        data: { ...mockTransaction, amount: 50.12 },
        error: null
      });

      await transactionService.createTransaction({
        ...createDto,
        amount: 50.123456
      });

      expect(mockTransactionRepository.create).toHaveBeenCalledWith({
        ...createDto,
        amount: 50.12
      });
    });
  });

  describe('updateTransaction', () => {
    const updateDto: UpdateTransactionDto = {
      description: 'Updated transaction',
      amount: 75.00
    };

    it('should update transaction successfully', async () => {
      const updatedTransaction = { ...mockTransaction, ...updateDto };
      jest.spyOn(transactionService, 'getTransactionById').mockResolvedValue(mockTransaction);
      mockTransactionRepository.update.mockResolvedValue({
        data: updatedTransaction,
        error: null
      });

      const result = await transactionService.updateTransaction('1', updateDto);

      expect(result).toEqual(updatedTransaction);
      expect(mockTransactionRepository.update).toHaveBeenCalledWith('1', updateDto);
    });

    it('should throw error if transaction not found', async () => {
      jest.spyOn(transactionService, 'getTransactionById').mockResolvedValue(null);

      await expect(transactionService.updateTransaction('999', updateDto)).rejects.toThrow('Transaction not found');
    });

    it('should validate new category if category is being updated', async () => {
      jest.spyOn(transactionService, 'getTransactionById').mockResolvedValue(mockTransaction);
      mockCategoryService.getCategoryById.mockResolvedValue(mockIncomeCategory);

      await expect(transactionService.updateTransaction('1', {
        category_id: '2'
      })).rejects.toThrow('Transaction type "expense" does not match category type "income"');
    });

    it('should validate type matches existing category if type is being updated', async () => {
      jest.spyOn(transactionService, 'getTransactionById').mockResolvedValue(mockTransaction);
      mockCategoryService.getCategoryById.mockResolvedValue(mockCategory);

      await expect(transactionService.updateTransaction('1', {
        type: 'income'
      })).rejects.toThrow('Transaction type "income" does not match category type "expense"');
    });

    it('should validate amount is positive if being updated', async () => {
      jest.spyOn(transactionService, 'getTransactionById').mockResolvedValue(mockTransaction);

      await expect(transactionService.updateTransaction('1', {
        amount: -10
      })).rejects.toThrow('Transaction amount must be positive');
    });

    it('should format amount to 2 decimal places if being updated', async () => {
      jest.spyOn(transactionService, 'getTransactionById').mockResolvedValue(mockTransaction);
      mockTransactionRepository.update.mockResolvedValue({
        data: { ...mockTransaction, amount: 75.55 },
        error: null
      });

      await transactionService.updateTransaction('1', {
        amount: 75.5555
      });

      expect(mockTransactionRepository.update).toHaveBeenCalledWith('1', {
        amount: 75.56
      });
    });
  });

  describe('deleteTransaction', () => {
    it('should delete transaction successfully', async () => {
      jest.spyOn(transactionService, 'getTransactionById').mockResolvedValue(mockTransaction);
      mockTransactionRepository.delete.mockResolvedValue({
        data: true,
        error: null
      });

      await transactionService.deleteTransaction('1');

      expect(mockTransactionRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw error if transaction not found', async () => {
      jest.spyOn(transactionService, 'getTransactionById').mockResolvedValue(null);

      await expect(transactionService.deleteTransaction('999')).rejects.toThrow('Transaction not found');
    });

    it('should throw error when repository fails', async () => {
      jest.spyOn(transactionService, 'getTransactionById').mockResolvedValue(mockTransaction);
      mockTransactionRepository.delete.mockResolvedValue({
        data: null,
        error: 'Database error'
      });

      await expect(transactionService.deleteTransaction('1')).rejects.toThrow('Failed to delete transaction: Database error');
    });
  });

  describe('bulkCreateTransactions', () => {
    const bulkCreateDto: CreateTransactionDto[] = [
      {
        description: 'Transaction 1',
        amount: 50.00,
        type: 'expense',
        category_id: '1',
        date: '2024-01-15'
      },
      {
        description: 'Transaction 2',
        amount: 100.00,
        type: 'income',
        category_id: '2',
        date: '2024-01-16'
      }
    ];

    it('should bulk create transactions successfully', async () => {
      mockCategoryService.getCategoryById
        .mockResolvedValueOnce(mockCategory)
        .mockResolvedValueOnce(mockIncomeCategory);
      
      mockTransactionRepository.bulkCreate.mockResolvedValue({
        data: [mockTransaction, mockIncomeTransaction],
        error: null
      });

      const result = await transactionService.bulkCreateTransactions(bulkCreateDto);

      expect(result).toEqual([mockTransaction, mockIncomeTransaction]);
      expect(mockCategoryService.getCategoryById).toHaveBeenCalledTimes(2);
      expect(mockTransactionRepository.bulkCreate).toHaveBeenCalled();
    });

    it('should throw error if any category not found', async () => {
      mockCategoryService.getCategoryById
        .mockResolvedValueOnce(mockCategory)
        .mockResolvedValueOnce(null); // Second category not found

      await expect(transactionService.bulkCreateTransactions(bulkCreateDto))
        .rejects.toThrow('Category not found: 2');
    });

    it('should throw error if any category type mismatches', async () => {
      // First category is expense (matches first transaction)
      // Second category is also expense (doesn't match income transaction)
      mockCategoryService.getCategoryById
        .mockResolvedValueOnce(mockCategory) // expense category for expense transaction
        .mockResolvedValueOnce(mockCategory); // expense category for income transaction (mismatch)

      await expect(transactionService.bulkCreateTransactions(bulkCreateDto))
        .rejects.toThrow('Transaction type "income" does not match category type "expense"');
    });

    it('should throw error if any amount is not positive', async () => {
      mockCategoryService.getCategoryById.mockResolvedValue(mockCategory);
      
      const invalidTransaction = bulkCreateDto[0];
      if (!invalidTransaction) {
        throw new Error('Test data not properly initialized');
      }

      await expect(transactionService.bulkCreateTransactions([
        { 
          description: invalidTransaction.description,
          amount: 0,
          type: invalidTransaction.type,
          category_id: invalidTransaction.category_id,
          date: invalidTransaction.date
        }
      ])).rejects.toThrow('All transaction amounts must be positive');
    });
  });

  describe('bulkDeleteTransactions', () => {
    it('should bulk delete transactions successfully', async () => {
      mockTransactionRepository.bulkDelete.mockResolvedValue({
        data: true,
        error: null
      });

      await transactionService.bulkDeleteTransactions(['1', '2', '3']);

      expect(mockTransactionRepository.bulkDelete).toHaveBeenCalledWith(['1', '2', '3']);
    });

    it('should throw error when repository fails', async () => {
      mockTransactionRepository.bulkDelete.mockResolvedValue({
        data: null,
        error: 'Database error'
      });

      await expect(transactionService.bulkDeleteTransactions(['1', '2']))
        .rejects.toThrow('Failed to bulk delete transactions: Database error');
    });
  });

  describe('getTransactionSummary', () => {
    it('should return transaction summary for date range', async () => {
      const mockData = [
        { type: 'income', amount: 1000, date: '2024-01-10' },
        { type: 'income', amount: 2000, date: '2024-01-15' },
        { type: 'expense', amount: 500, date: '2024-01-12' },
        { type: 'expense', amount: 300, date: '2024-01-20' }
      ];

      mockTransactionRepository.getSummaryByDateRange.mockResolvedValue({
        data: mockData,
        error: null
      });

      const result = await transactionService.getTransactionSummary('2024-01-01', '2024-01-31');

      expect(result).toEqual({
        total_transactions: 4,
        total_income: 3000.00,
        total_expenses: 800.00,
        net_amount: 2200.00,
        average_transaction: 950.00,
        date_range: {
          start: '2024-01-10',
          end: '2024-01-20'
        }
      });
    });

    it('should handle empty transactions', async () => {
      mockTransactionRepository.getSummaryByDateRange.mockResolvedValue({
        data: [],
        error: null
      });

      const result = await transactionService.getTransactionSummary('2024-01-01', '2024-01-31');

      expect(result).toEqual({
        total_transactions: 0,
        total_income: 0,
        total_expenses: 0,
        net_amount: 0,
        average_transaction: 0,
        date_range: {
          start: '2024-01-01',
          end: '2024-01-31'
        }
      });
    });

    it('should throw error when repository fails', async () => {
      mockTransactionRepository.getSummaryByDateRange.mockResolvedValue({
        data: null,
        error: 'Database error'
      });

      await expect(transactionService.getTransactionSummary())
        .rejects.toThrow('Failed to get transaction summary: Database error');
    });
  });

  describe('searchTransactions', () => {
    it('should search transactions by description', async () => {
      mockTransactionRepository.searchByDescription.mockResolvedValue({
        data: [mockTransaction],
        error: null
      });

      const result = await transactionService.searchTransactions('grocery');

      expect(result).toEqual([mockTransaction]);
      expect(mockTransactionRepository.searchByDescription).toHaveBeenCalledWith('grocery', 10);
    });

    it('should throw error for empty search term', async () => {
      await expect(transactionService.searchTransactions(''))
        .rejects.toThrow('Search term must be at least 1 character long');

      await expect(transactionService.searchTransactions('   '))
        .rejects.toThrow('Search term must be at least 1 character long');
    });

    it('should use custom limit', async () => {
      mockTransactionRepository.searchByDescription.mockResolvedValue({
        data: [],
        error: null
      });

      await transactionService.searchTransactions('test', 5);

      expect(mockTransactionRepository.searchByDescription).toHaveBeenCalledWith('test', 5);
    });

    it('should throw error when repository fails', async () => {
      mockTransactionRepository.searchByDescription.mockResolvedValue({
        data: null,
        error: 'Database error'
      });

      await expect(transactionService.searchTransactions('test'))
        .rejects.toThrow('Failed to search transactions: Database error');
    });
  });

  describe('getTransactionsByCategory', () => {
    it('should return transactions for a category', async () => {
      mockCategoryService.getCategoryById.mockResolvedValue(mockCategory);
      mockTransactionRepository.findByCategoryId.mockResolvedValue({
        data: [mockTransaction],
        error: null
      });

      const result = await transactionService.getTransactionsByCategory('1');

      expect(result).toEqual([mockTransaction]);
      expect(mockCategoryService.getCategoryById).toHaveBeenCalledWith('1');
      expect(mockTransactionRepository.findByCategoryId).toHaveBeenCalledWith('1', undefined);
    });

    it('should use custom limit', async () => {
      mockCategoryService.getCategoryById.mockResolvedValue(mockCategory);
      mockTransactionRepository.findByCategoryId.mockResolvedValue({
        data: [],
        error: null
      });

      await transactionService.getTransactionsByCategory('1', 5);

      expect(mockTransactionRepository.findByCategoryId).toHaveBeenCalledWith('1', 5);
    });

    it('should throw error if category not found', async () => {
      mockCategoryService.getCategoryById.mockResolvedValue(null);

      await expect(transactionService.getTransactionsByCategory('999'))
        .rejects.toThrow('Category not found');
    });

    it('should throw error when repository fails', async () => {
      mockCategoryService.getCategoryById.mockResolvedValue(mockCategory);
      mockTransactionRepository.findByCategoryId.mockResolvedValue({
        data: null,
        error: 'Database error'
      });

      await expect(transactionService.getTransactionsByCategory('1'))
        .rejects.toThrow('Failed to get transactions by category: Database error');
    });
  });
});
