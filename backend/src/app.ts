import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { logger } from './config/logger';
import { appConfig } from './config/app';
import { setupSwagger } from './config/swagger';
import categoryRoutes from './routes/categories';
import transactionRoutes from './routes/transactions';
import budgetRoutes from './routes/budgets';
import analyticsRoutes from './routes/analytics';
import importExportRoutes from './routes/import-export';

class Server {
  public app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = appConfig.port;
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS configuration
    this.app.use(cors({
      origin: appConfig.corsOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: appConfig.rateLimitWindowMs,
      max: appConfig.rateLimitMaxRequests,
      message: {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests from this IP, please try again later'
        }
      },
      standardHeaders: true,
      legacyHeaders: false
    });
    this.app.use(limiter);

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Compression middleware
    this.app.use(compression());

    // Logging middleware
    this.app.use(morgan('combined', {
      stream: {
        write: (message: string) => logger.info(message.trim())
      }
    }));

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Budget Tracker API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    });
  }

  private initializeRoutes(): void {
    // Setup Swagger documentation
    setupSwagger(this.app);

    // API routes
    this.app.use('/api/categories', categoryRoutes);
    this.app.use('/api/transactions', transactionRoutes);
    this.app.use('/api/budgets', budgetRoutes);
    this.app.use('/api/analytics', analyticsRoutes);
    this.app.use('/api/import-export', importExportRoutes);

    // API root endpoint
    this.app.use('/api', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Budget Tracker API v1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
          health: '/health',
          documentation: '/api-docs',
          categories: '/api/categories',
          transactions: '/api/transactions',
          budgets: '/api/budgets',
          analytics: '/api/analytics',
          'import-export': '/api/import-export'
        }
      });
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);
    
    // Global error handler
    this.app.use(errorHandler);
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      logger.info(`🚀 Budget Tracker API server is running on port ${this.port}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🔗 Health check: http://localhost:${this.port}/health`);
      logger.info(`📚 API base URL: http://localhost:${this.port}/api`);
    });
  }
}

export default Server;
