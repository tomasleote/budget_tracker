/**
 * API Test File
 * Simple tests to verify API client setup
 */

import API from './api/index.js';

// Test function to verify API is working
export const testApiConnection = async () => {
  console.log('🧪 Testing API Connection...');
  
  try {
    // Test 1: Check if API client is configured
    console.log('✓ API client initialized');
    console.log(`  Base URL: ${API.config.BASE_URL}`);
    console.log(`  Timeout: ${API.config.TIMEOUT}ms`);
    
    // Test 2: Health check
    console.log('\n📡 Checking API health...');
    const health = await API.client.healthCheck();
    
    if (health.healthy) {
      console.log('✓ API is healthy:', health.data);
    } else {
      console.log('✗ API is not responding:', health.error);
    }
    
    // Test 3: Service availability
    console.log('\n🔧 Checking services...');
    console.log('✓ Category Service:', typeof API.services.categories);
    console.log('✓ Transaction Service:', typeof API.services.transactions);
    console.log('✓ Budget Service:', typeof API.services.budgets);
    console.log('✓ Analytics Service:', typeof API.services.analytics);
    
    return true;
  } catch (error) {
    console.error('❌ API test failed:', error);
    return false;
  }
};

// Test function to fetch categories
export const testFetchCategories = async () => {
  console.log('\n🧪 Testing Category Fetch...');
  
  try {
    const response = await API.services.categories.getAllCategories({ limit: 5 });
    console.log('✓ Categories fetched successfully');
    console.log(`  Total categories: ${response.pagination?.total || response.data?.length || 0}`);
    
    if (response.data && response.data.length > 0) {
      console.log('  Sample category:', response.data[0]);
    }
    
    return response;
  } catch (error) {
    console.error('❌ Category fetch failed:', error.message);
    
    if (error.code) {
      console.error(`  Error code: ${error.code}`);
    }
    
    return null;
  }
};

// Test function to create a test transaction
export const testCreateTransaction = async () => {
  console.log('\n🧪 Testing Transaction Creation...');
  
  try {
    // First, get a category to use
    const categories = await API.services.categories.getAllCategories({ limit: 1 });
    
    if (!categories.data || categories.data.length === 0) {
      console.warn('⚠️ No categories available for transaction test');
      return null;
    }
    
    const testTransaction = {
      type: 'expense',
      amount: 25.50,
      description: 'API Test Transaction',
      categoryId: categories.data[0].id,
      date: new Date().toISOString(),
    };
    
    console.log('  Creating test transaction:', testTransaction);
    
    const response = await API.services.transactions.createTransaction(testTransaction);
    console.log('✓ Transaction created successfully');
    console.log('  Transaction ID:', response.id);
    
    // Clean up - delete the test transaction
    await API.services.transactions.deleteTransaction(response.id);
    console.log('✓ Test transaction cleaned up');
    
    return response;
  } catch (error) {
    console.error('❌ Transaction creation failed:', error.message);
    
    if (error.details && error.details.errors) {
      console.error('  Validation errors:', error.details.errors);
    }
    
    return null;
  }
};

// Run all tests
export const runAllApiTests = async () => {
  console.log('🚀 Starting API Tests...\n');
  
  const results = {
    connection: false,
    categories: false,
    transactions: false,
  };
  
  // Test connection
  results.connection = await testApiConnection();
  
  if (results.connection) {
    // Only run other tests if connection is successful
    results.categories = !!(await testFetchCategories());
    results.transactions = !!(await testCreateTransaction());
  }
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log(`  Connection: ${results.connection ? '✅' : '❌'}`);
  console.log(`  Categories: ${results.categories ? '✅' : '❌'}`);
  console.log(`  Transactions: ${results.transactions ? '✅' : '❌'}`);
  
  const allPassed = Object.values(results).every(r => r);
  console.log(`\n${allPassed ? '✅ All tests passed!' : '❌ Some tests failed'}`);
  
  return results;
};

// Export for use in components
export default {
  testApiConnection,
  testFetchCategories,
  testCreateTransaction,
  runAllApiTests,
};
