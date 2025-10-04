import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

import Server from './app';
import { logger } from './config/logger';
import { storageConfig } from './config/storage';
import repositoryFactory from './repositories/RepositoryFactory';

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception thrown:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Initialize storage and seed data
async function initialize() {
  try {
    // Log storage configuration
    logger.info(`📦 Storage Mode: ${storageConfig.mode.toUpperCase()}`);
    
    if (storageConfig.isLocalStorage()) {
      logger.info('   Using localStorage for data persistence');
      logger.info(`   Data Path: ${storageConfig.localStorage.dataPath}`);
      
      // Seed default categories if using localStorage
      logger.info('🌱 Seeding default data...');
      await repositoryFactory.seedDefaultData();
    } else {
      logger.info('   Using Supabase database for data persistence');
      
      // Check database connection
      const categoryRepo = repositoryFactory.getCategoryRepository();
      const result = await categoryRepo.count();
      if (result.error) {
        logger.error('❌ Database connection failed:', result.error);
        logger.warn('💡 Falling back to localStorage mode');
        
        // Update storage mode to localStorage
        process.env.STORAGE_MODE = 'localStorage';
        
        // Reinitialize repositories with localStorage
        const { RepositoryFactory } = await import('./repositories/RepositoryFactory');
        const newFactory = RepositoryFactory.getInstance();
        
        // Seed default data
        await newFactory.seedDefaultData();
      } else {
        logger.info(`✅ Database connected successfully (${result.data} categories found)`);
      }
    }

    // Start the server
    const server = new Server();
    server.listen();
  } catch (error) {
    logger.error('Failed to initialize application:', error);
    process.exit(1);
  }
}

// Start initialization
initialize();
