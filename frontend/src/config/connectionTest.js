/**
 * Backend Connection Test Utility
 * Tests and verifies backend API connectivity
 */

import { config, configHelpers } from './environment.js';

/**
 * Backend Connection Tester
 */
class BackendConnectionTester {
  /**
   * Test basic backend health
   * @returns {Promise<Object>} Test result
   */
  static async testHealth() {
    try {
      console.log('🔍 Testing backend health...');
      
      const response = await fetch(config.api.healthEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('✅ Backend health check passed:', data);
      
      return {
        success: true,
        status: response.status,
        data,
        message: 'Backend is healthy and responding',
      };
    } catch (error) {
      console.error('❌ Backend health check failed:', error);
      
      return {
        success: false,
        error: error.message,
        message: 'Backend is not responding or unavailable',
      };
    }
  }

  /**
   * Test API endpoints
   * @returns {Promise<Object>} Test results
   */
  static async testApiEndpoints() {
    const results = {
      health: null,
      categories: null,
      transactions: null,
      budgets: null,
    };

    try {
      // Test health endpoint
      results.health = await this.testHealth();

      // Test categories endpoint
      console.log('🔍 Testing categories endpoint...');
      try {
        const categoriesResponse = await fetch(`${config.api.baseUrl}/categories`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        });

        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          results.categories = {
            success: true,
            status: categoriesResponse.status,
            count: categoriesData.data?.length || 0,
            message: 'Categories endpoint is working',
          };
          console.log('✅ Categories endpoint test passed');
        } else {
          throw new Error(`HTTP ${categoriesResponse.status}`);
        }
      } catch (error) {
        results.categories = {
          success: false,
          error: error.message,
          message: 'Categories endpoint failed',
        };
        console.error('❌ Categories endpoint test failed:', error);
      }

      // Test transactions endpoint
      console.log('🔍 Testing transactions endpoint...');
      try {
        const transactionsResponse = await fetch(`${config.api.baseUrl}/transactions`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        });

        if (transactionsResponse.ok) {
          const transactionsData = await transactionsResponse.json();
          results.transactions = {
            success: true,
            status: transactionsResponse.status,
            count: transactionsData.data?.transactions?.length || 0,
            message: 'Transactions endpoint is working',
          };
          console.log('✅ Transactions endpoint test passed');
        } else {
          throw new Error(`HTTP ${transactionsResponse.status}`);
        }
      } catch (error) {
        results.transactions = {
          success: false,
          error: error.message,
          message: 'Transactions endpoint failed',
        };
        console.error('❌ Transactions endpoint test failed:', error);
      }

      // Test budgets endpoint
      console.log('🔍 Testing budgets endpoint...');
      try {
        const budgetsResponse = await fetch(`${config.api.baseUrl}/budgets`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        });

        if (budgetsResponse.ok) {
          const budgetsData = await budgetsResponse.json();
          results.budgets = {
            success: true,
            status: budgetsResponse.status,
            count: budgetsData.data?.budgets?.length || 0,
            message: 'Budgets endpoint is working',
          };
          console.log('✅ Budgets endpoint test passed');
        } else {
          throw new Error(`HTTP ${budgetsResponse.status}`);
        }
      } catch (error) {
        results.budgets = {
          success: false,
          error: error.message,
          message: 'Budgets endpoint failed',
        };
        console.error('❌ Budgets endpoint test failed:', error);
      }

      return results;
    } catch (error) {
      console.error('❌ API endpoints test failed:', error);
      return results;
    }
  }

  /**
   * Run comprehensive backend tests
   * @returns {Promise<Object>} Complete test results
   */
  static async runFullTest() {
    console.group('🚀 Backend Connection Test');
    
    const startTime = Date.now();
    
    // Log current configuration
    console.log('Configuration:', configHelpers.getConfigSummary());
    
    // Run tests
    const results = await this.testApiEndpoints();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Calculate overall success
    const allEndpoints = Object.values(results);
    const successfulEndpoints = allEndpoints.filter(r => r?.success);
    const overallSuccess = successfulEndpoints.length === allEndpoints.length;
    
    const summary = {
      success: overallSuccess,
      duration: `${duration}ms`,
      results,
      summary: {
        total: allEndpoints.length,
        successful: successfulEndpoints.length,
        failed: allEndpoints.length - successfulEndpoints.length,
      },
    };
    
    console.log('📊 Test Summary:', summary);
    
    if (overallSuccess) {
      console.log('✅ All backend tests passed! Frontend can connect to backend.');
    } else {
      console.warn('⚠️ Some backend tests failed. Check backend server status.');
    }
    
    console.groupEnd();
    
    return summary;
  }

  /**
   * Test repository factory configuration
   * @returns {Object} Repository configuration test
   */
  static testRepositoryFactory() {
    try {
      // Import RepositoryFactory
      import('../model/repositories/RepositoryFactory.js').then(({ RepositoryFactory }) => {
        console.group('🏭 Repository Factory Test');
        
        const factoryConfig = RepositoryFactory.getConfiguration();
        console.log('Factory Configuration:', factoryConfig);
        
        // Test repository creation
        console.log('Testing repository creation...');
        
        const categories = RepositoryFactory.createCategoryRepository();
        const transactions = RepositoryFactory.createTransactionRepository();
        const budgets = RepositoryFactory.createBudgetRepository();
        
        console.log('Category Repository:', categories.constructor.name);
        console.log('Transaction Repository:', transactions.constructor.name);
        console.log('Budget Repository:', budgets.constructor.name);
        
        const expectedType = factoryConfig.apiEnabled ? 'Api' : 'localStorage';
        const actualTypes = {
          categories: categories.constructor.name.includes('Api') ? 'Api' : 'localStorage',
          transactions: transactions.constructor.name.includes('Api') ? 'Api' : 'localStorage',
          budgets: budgets.constructor.name.includes('Api') ? 'Api' : 'localStorage',
        };
        
        const repositoryTest = {
          success: Object.values(actualTypes).every(type => 
            type === expectedType || (expectedType === 'Api' && type === 'localStorage')
          ),
          expected: expectedType,
          actual: actualTypes,
          config: factoryConfig,
        };
        
        console.log('Repository Test Result:', repositoryTest);
        console.groupEnd();
        
        return repositoryTest;
      }).catch(error => {
        console.error('❌ Repository Factory test failed:', error);
        return { success: false, error: error.message };
      });
    } catch (error) {
      console.error('❌ Repository Factory test failed:', error);
      return { success: false, error: error.message };
    }
  }
}

/**
 * Auto-run tests in development mode
 */
if (config.development.isDevelopment && config.development.isDebug) {
  // Run tests after a short delay to allow other modules to load
  setTimeout(() => {
    BackendConnectionTester.runFullTest();
    BackendConnectionTester.testRepositoryFactory();
  }, 1000);
}

export default BackendConnectionTester;
export { BackendConnectionTester };
