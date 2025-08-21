import { AnalyticsService } from '../../../src/services/AnalyticsService';
import AnalyticsRepository from '../../../src/repositories/AnalyticsRepository';
import BudgetRepository from '../../../src/repositories/BudgetRepository';
import { 
  DashboardSummary, 
  SpendingInsights, 
  AnalyticsQuery,
  FinancialHealthScore 
} from '../../../src/types/analytics';

// Mock dependencies
jest.mock('../../../src/repositories/AnalyticsRepository');
jest.mock('../../../src/repositories/BudgetRepository');

// Mock logger to avoid import issues
jest.mock('../../../src/config/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;
  let mockAnalyticsRepository: jest.Mocked<typeof AnalyticsRepository>;
  let mockBudgetRepository: jest.Mocked<typeof BudgetRepository>;

  const mockDashboardSummary: DashboardSummary = {
    overview: {
      total_income: 5000,
      total_expenses: 3500,
      net_amount: 1500,
      active_budgets: 8,
      overspent_budgets: 2,
      transactions_count: 45
    },
    current_month: {
      income: 2000,
      expenses: 1500,
      net_amount: 500,
      budget_utilization: 75,
      top_expense_category: {
        name: 'Food',
        amount: 800,
        color: '#FF6B6B'
      }
    },
    recent_transactions: [],
    alerts: {
      budget_alerts: 3,
      overspent_budgets: ['Food', 'Transport'],
      approaching_budgets: ['Entertainment']
    }
  };

  const mockSpendingInsights: SpendingInsights = {
    period: {
      start_date: '2024-01-01',
      end_date: '2024-01-31'
    },
    category_breakdown: [
      {
        category_id: '1',
        category_name: 'Food',
        category_color: '#FF6B6B',
        total_amount: 800,
        transaction_count: 8,
        percentage_of_total: 53.3,
        average_transaction: 100
      }
    ],
    spending_trends: [
      {
        date: '2024-01-01',
        total_income: 100,
        total_expenses: 75,
        net_amount: 25
      }
    ],
    top_categories: {
      highest_spending: [
        {
          category_name: 'Food',
          amount: 800,
          color: '#FF6B6B'
        }
      ],
      most_transactions: [
        {
          category_name: 'Food',
          count: 8,
          color: '#FF6B6B'
        }
      ],
      budget_performance: [
        {
          category_name: 'Food',
          budget_amount: 1000,
          spent_amount: 800,
          utilization_percentage: 80,
          color: '#FF6B6B'
        }
      ]
    }
  };

  const mockHealthScore: FinancialHealthScore = {
    overall_score: 75,
    score_breakdown: {
      budget_adherence: {
        score: 80,
        description: 'Good budget adherence',
        factors: ['Most budgets on track']
      },
      spending_consistency: {
        score: 70,
        description: 'Moderate spending consistency',
        factors: ['Some irregular spending']
      },
      income_stability: {
        score: 85,
        description: 'Stable income',
        factors: ['Consistent monthly income']
      },
      emergency_fund: {
        score: 60,
        description: 'Adequate emergency fund',
        factors: ['Could increase savings']
      }
    },
    recommendations: [
      {
        priority: 'high',
        category: 'spending',
        title: 'Reduce dining expenses',
        description: 'Consider reducing dining out expenses',
        action_items: ['Cook more meals at home', 'Set dining budget']
      }
    ],
    historical_scores: [
      {
        month: '2024-01',
        score: 75
      }
    ]
  };

  beforeEach(() => {
    analyticsService = new AnalyticsService();
    mockAnalyticsRepository = AnalyticsRepository as jest.Mocked<typeof AnalyticsRepository>;
    mockBudgetRepository = BudgetRepository as jest.Mocked<typeof BudgetRepository>;
    jest.clearAllMocks();
  });

  describe('getDashboardSummary', () => {
    it('should return dashboard summary', async () => {
      mockAnalyticsRepository.getDashboardSummary.mockResolvedValue({ 
        data: mockDashboardSummary, 
        error: null 
      });

      const result = await analyticsService.getDashboardSummary();

      expect(result).toEqual(mockDashboardSummary);
      expect(mockAnalyticsRepository.getDashboardSummary).toHaveBeenCalled();
    });

    it('should throw error when repository fails', async () => {
      const errorMessage = 'Database error';
      mockAnalyticsRepository.getDashboardSummary.mockResolvedValue({ 
        data: null, 
        error: errorMessage 
      });

      await expect(analyticsService.getDashboardSummary())
        .rejects.toThrow(`Failed to get dashboard summary: ${errorMessage}`);
    });
  });

  describe('getSpendingInsights', () => {
    it('should return spending insights with default period', async () => {
      mockAnalyticsRepository.getSpendingInsights.mockResolvedValue({ 
        data: mockSpendingInsights, 
        error: null 
      });

      const result = await analyticsService.getSpendingInsights();

      expect(result).toEqual(mockSpendingInsights);
      expect(mockAnalyticsRepository.getSpendingInsights).toHaveBeenCalledWith({ period: 'month' });
    });

    it('should return spending insights with custom query', async () => {
      const query: AnalyticsQuery = {
        start_date: '2024-01-01',
        end_date: '2024-01-31'
      };

      mockAnalyticsRepository.getSpendingInsights.mockResolvedValue({ 
        data: mockSpendingInsights, 
        error: null 
      });

      const result = await analyticsService.getSpendingInsights(query);

      expect(result).toEqual(mockSpendingInsights);
      expect(mockAnalyticsRepository.getSpendingInsights).toHaveBeenCalledWith(query);
    });

    it('should throw error when repository fails', async () => {
      const errorMessage = 'Database error';
      mockAnalyticsRepository.getSpendingInsights.mockResolvedValue({ 
        data: null, 
        error: errorMessage 
      });

      await expect(analyticsService.getSpendingInsights())
        .rejects.toThrow(`Failed to get spending insights: ${errorMessage}`);
    });
  });

  describe('getFinancialHealthScore', () => {
    it('should return financial health score', async () => {
      mockAnalyticsRepository.getFinancialHealthScore.mockResolvedValue({ 
        data: mockHealthScore, 
        error: null 
      });

      const result = await analyticsService.getFinancialHealthScore();

      expect(result).toEqual(mockHealthScore);
      expect(mockAnalyticsRepository.getFinancialHealthScore).toHaveBeenCalled();
    });

    it('should throw error when repository fails', async () => {
      const errorMessage = 'Database error';
      mockAnalyticsRepository.getFinancialHealthScore.mockResolvedValue({ 
        data: null, 
        error: errorMessage 
      });

      await expect(analyticsService.getFinancialHealthScore())
        .rejects.toThrow(`Failed to get financial health score: ${errorMessage}`);
    });
  });

  describe('getBudgetPerformance', () => {
    const mockBudgetWithProgress = {
      id: '1',
      category_id: '1',
      budget_amount: 500,
      period: 'monthly' as const,
      start_date: '2024-01-01',
      end_date: '2024-01-31',
      is_active: true,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
      category: {
        id: '1',
        name: 'Food',
        type: 'expense' as const,
        color: '#FF6B6B',
        icon: 'utensils'
      },
      spent_amount: 300,
      remaining_amount: 200,
      progress_percentage: 60,
      is_overspent: false,
      days_remaining: 10,
      average_daily_spending: 30,
      projected_total: 450
    };

    it('should return budget performance analysis', async () => {
      mockBudgetRepository.findWithProgress.mockResolvedValue({ 
        data: [mockBudgetWithProgress], 
        error: null 
      });

      const result = await analyticsService.getBudgetPerformance();

      expect(result.overall_performance).toEqual({
        total_budgets: 1,
        total_budget_amount: 500,
        total_spent: 300,
        overall_utilization: 60,
        budgets_on_track: 1,
        budgets_overspent: 0,
        budgets_approaching_limit: 0
      });

      expect(result.budget_details).toHaveLength(1);
      expect(result.budget_details[0]).toEqual({
        budget_id: '1',
        category_name: 'Food',
        category_color: '#FF6B6B',
        budget_amount: 500,
        spent_amount: 300,
        remaining_amount: 200,
        utilization_percentage: 60,
        days_remaining: 10,
        daily_average: 30,
        projected_total: 450,
        status: 'on_track',
        period: 'monthly'
      });
    });

    it('should throw error when repository fails', async () => {
      const errorMessage = 'Database error';
      mockBudgetRepository.findWithProgress.mockResolvedValue({ 
        data: null, 
        error: errorMessage 
      });

      await expect(analyticsService.getBudgetPerformance())
        .rejects.toThrow(`Failed to get budget performance: ${errorMessage}`);
    });
  });
});