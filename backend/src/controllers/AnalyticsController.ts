import { Request, Response, NextFunction } from 'express';
import AnalyticsService from '../services/AnalyticsService';
import { AnalyticsQuery } from '../types/analytics';
import { logger } from '../config/logger';

export class AnalyticsController {
  /**
   * @swagger
   * /api/analytics/dashboard:
   *   get:
   *     summary: Get comprehensive dashboard summary
   *     tags: [Analytics]
   *     responses:
   *       200:
   *         description: Dashboard summary with overview stats and alerts
   */
  async getDashboardSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await AnalyticsService.getDashboardSummary();

      res.status(200).json({
        success: true,
        data: summary,
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
   * /api/analytics/spending-insights:
   *   get:
   *     summary: Get detailed spending insights and analysis
   *     tags: [Analytics]
   *     responses:
   *       200:
   *         description: Detailed spending insights with category breakdown
   */
  async getSpendingInsights(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query: AnalyticsQuery = req.query;
      const insights = await AnalyticsService.getSpendingInsights(query);

      res.status(200).json({
        success: true,
        data: insights,
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
   * /api/analytics/budget-performance:
   *   get:
   *     summary: Get budget performance analysis
   *     tags: [Analytics]
   *     responses:
   *       200:
   *         description: Budget performance analysis with utilization metrics
   */
  async getBudgetPerformance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query: AnalyticsQuery = req.query;
      const performance = await AnalyticsService.getBudgetPerformance(query);

      res.status(200).json({
        success: true,
        data: performance,
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
   * /api/analytics/trends:
   *   get:
   *     summary: Get trends analysis for income, expenses, and predictions
   *     tags: [Analytics]
   *     responses:
   *       200:
   *         description: Trends analysis with income/expense patterns
   */
  async getTrendsAnalysis(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query: AnalyticsQuery = req.query;
      const trends = await AnalyticsService.getTrendsAnalysis(query);

      res.status(200).json({
        success: true,
        data: trends,
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
   * /api/analytics/health-score:
   *   get:
   *     summary: Get financial health score and recommendations
   *     tags: [Analytics]
   *     responses:
   *       200:
   *         description: Financial health score with breakdown and recommendations
   */
  async getFinancialHealthScore(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const healthScore = await AnalyticsService.getFinancialHealthScore();

      res.status(200).json({
        success: true,
        data: healthScore,
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
   * /api/analytics/comparison:
   *   get:
   *     summary: Get comparison analysis between current and previous period
   *     tags: [Analytics]
   *     responses:
   *       200:
   *         description: Comparison analysis between two periods
   */
  async getComparisonAnalysis(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query: AnalyticsQuery = req.query;
      const comparison = await AnalyticsService.getComparisonAnalysis(query);

      res.status(200).json({
        success: true,
        data: comparison,
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
   * /api/analytics/overview:
   *   get:
   *     summary: Get comprehensive analytics overview combining multiple insights
   *     tags: [Analytics]
   *     responses:
   *       200:
   *         description: Comprehensive analytics overview
   */
  async getAnalyticsOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query: AnalyticsQuery = req.query;
      
      // Get all analytics data in parallel for better performance
      const [dashboard, spendingInsights, budgetPerformance, healthScore] = await Promise.all([
        AnalyticsService.getDashboardSummary(),
        AnalyticsService.getSpendingInsights(query),
        AnalyticsService.getBudgetPerformance(query),
        AnalyticsService.getFinancialHealthScore()
      ]);

      res.status(200).json({
        success: true,
        data: {
          dashboard,
          spending_insights: spendingInsights,
          budget_performance: budgetPerformance,
          health_score: healthScore
        },
        meta: {
          timestamp: new Date().toISOString(),
          period: query.period || 'month'
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AnalyticsController();
