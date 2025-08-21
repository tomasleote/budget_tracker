/**
 * Simple test to verify imports are working
 */

// Test environment configuration
import { config, configHelpers } from './config/environment.js';

// Test API imports  
import api from './api/client.js';
import API_CONFIG from './api/config.js';

// Test repository factory
import { RepositoryFactory } from './model/repositories/RepositoryFactory.js';

console.log('🧪 Frontend Integration Test');
console.log('✅ Environment config loaded:', configHelpers.isApiEnabled());
console.log('✅ API client loaded:', !!api);
console.log('✅ Repository factory loaded:', !!RepositoryFactory);

// Test repository creation
try {
  const repositories = {
    categories: RepositoryFactory.createCategoryRepository(),
    transactions: RepositoryFactory.createTransactionRepository(),
    budgets: RepositoryFactory.createBudgetRepository()
  };
  console.log('✅ Repositories created successfully');
  console.log('📊 Repository types:', {
    categories: repositories.categories.constructor.name,
    transactions: repositories.transactions.constructor.name,
    budgets: repositories.budgets.constructor.name
  });
} catch (error) {
  console.error('❌ Repository creation failed:', error);
}

// Test configuration
const configSummary = RepositoryFactory.getConfiguration();
console.log('📋 Configuration:', configSummary);

if (configHelpers.isApiEnabled()) {
  console.log('🌐 API mode enabled - backend connection will be tested');
} else {
  console.log('💾 localStorage mode - no backend required');
}

export default { config, api, RepositoryFactory };
