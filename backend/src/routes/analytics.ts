import { Router } from 'express';
import AnalyticsController from '../controllers/AnalyticsController';
import { validateRequest } from '../middleware/validation';
import { analyticsQuerySchema } from '../utils/validation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Analytics and insights endpoints
 */

// GET /api/analytics/dashboard - Get comprehensive dashboard summary
router.get(
  '/dashboard',
  AnalyticsController.getDashboardSummary
);

// GET /api/analytics/spending-insights - Get detailed spending insights
router.get(
  '/spending-insights',
  validateRequest(analyticsQuerySchema, 'query'),
  AnalyticsController.getSpendingInsights
);

// GET /api/analytics/budget-performance - Get budget performance analysis
router.get(
  '/budget-performance',
  validateRequest(analyticsQuerySchema, 'query'),
  AnalyticsController.getBudgetPerformance
);

// GET /api/analytics/trends - Get trends analysis
router.get(
  '/trends',
  validateRequest(analyticsQuerySchema, 'query'),
  AnalyticsController.getTrendsAnalysis
);

// GET /api/analytics/health-score - Get financial health score
router.get(
  '/health-score',
  AnalyticsController.getFinancialHealthScore
);

// GET /api/analytics/comparison - Get comparison analysis
router.get(
  '/comparison',
  validateRequest(analyticsQuerySchema, 'query'),
  AnalyticsController.getComparisonAnalysis
);

// GET /api/analytics/overview - Get comprehensive analytics overview
router.get(
  '/overview',
  validateRequest(analyticsQuerySchema, 'query'),
  AnalyticsController.getAnalyticsOverview
);

export default router;
