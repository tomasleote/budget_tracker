// Export all services

export { default as TransactionService } from './TransactionService.js';
export { default as BudgetService } from './BudgetService.js';
export { default as CalculationService } from './CalculationService.js';
export { default as StorageService } from './StorageService.js';
export { default as ValidationService } from './ValidationService.js';

// Create service instances for easy importing
import TransactionService from './TransactionService.js';
import BudgetService from './BudgetService.js';
import CalculationService from './CalculationService.js';
import StorageService from './StorageService.js';
import ValidationService from './ValidationService.js';

// Export service instances
export const transactionService = TransactionService;
export const budgetService = BudgetService;
export const calculationService = CalculationService;
export const storageService = StorageService;
export const validationService = ValidationService;

// Export service registry for dependency injection
export const serviceRegistry = {
  transaction: TransactionService,
  budget: BudgetService,
  calculation: CalculationService,
  storage: StorageService,
  validation: ValidationService
};

// Service initialization
export const initializeServices = async () => {
  try {
    // Initialize storage service first
    const storageInitialized = await StorageService.initialize();
    
    if (!storageInitialized) {
      console.warn('Storage service failed to initialize');
    }

    console.log('Services initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize services:', error);
    return false;
  }
};

// Service health check
export const checkServiceHealth = async () => {
  const healthChecks = {
    storage: StorageService.isStorageAvailable(),
    timestamp: new Date().toISOString()
  };

  try {
    const storageInfo = await StorageService.getStorageInfo();
    healthChecks.storageInfo = storageInfo;
  } catch (error) {
    healthChecks.storageError = error.message;
  }

  return healthChecks;
};

export default {
  // Services
  TransactionService,
  BudgetService,
  CalculationService,
  StorageService,
  ValidationService,
  
  // Instances
  transactionService,
  budgetService,
  calculationService,
  storageService,
  validationService,
  
  // Utilities
  serviceRegistry,
  initializeServices,
  checkServiceHealth
};
