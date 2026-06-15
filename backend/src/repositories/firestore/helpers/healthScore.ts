/**
 * Static financial health score placeholder (unchanged from the prior data
 * layer). Real scoring is out of scope for the Firestore migration.
 */
import { FinancialHealthScore } from '../../../types/analytics';

export function staticFinancialHealthScore(): FinancialHealthScore {
  return {
    overall_score: 75,
    score_breakdown: {
      budget_adherence: {
        score: 80,
        description: 'Good budget adherence',
        factors: ['80% of budgets stayed within limits', 'Minor overspending in 2 categories'],
      },
      spending_consistency: {
        score: 70,
        description: 'Moderate spending consistency',
        factors: ['Some variation in monthly spending', 'Large purchases affect consistency'],
      },
      income_stability: {
        score: 85,
        description: 'Stable income pattern',
        factors: ['Consistent monthly income', 'Multiple income sources'],
      },
      emergency_fund: {
        score: 60,
        description: 'Emergency fund needs improvement',
        factors: ['Current savings cover 2 months', 'Recommended: 6 months coverage'],
      },
    },
    recommendations: [
      {
        priority: 'high',
        category: 'savings',
        title: 'Build Emergency Fund',
        description: 'Increase emergency savings to cover 6 months of expenses',
        action_items: [
          'Set up automatic savings transfer',
          'Reduce discretionary spending by 10%',
          'Consider high-yield savings account',
        ],
      },
      {
        priority: 'medium',
        category: 'budgeting',
        title: 'Optimize Budget Categories',
        description: 'Fine-tune budget allocations based on spending patterns',
        action_items: [
          'Review overspent categories',
          'Adjust budget amounts realistically',
          'Set up spending alerts',
        ],
      },
    ],
    historical_scores: [
      { month: '2025-01', score: 72 },
      { month: '2025-02', score: 74 },
      { month: '2025-03', score: 75 },
    ],
  };
}
