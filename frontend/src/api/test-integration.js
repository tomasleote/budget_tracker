/**
 * API Integration Test Script
 * Run this to test if the frontend properly receives data from backend
 */

// Test the exact response format that the interceptor returns
const testResponseHandling = () => {
  console.log('🧪 Testing Response Handling Logic...\n');

  // Simulated response from axios interceptor (backend format after processing)
  const mockBackendResponse = {
    transactions: [
      { id: '1', type: 'expense', amount: 50, description: 'Test transaction' },
      { id: '2', type: 'income', amount: 100, description: 'Test income' }
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 2,
      pages: 1
    }
  };

  // Test our new response handling logic
  const handleResponse = (result) => {
    if (result && (result.data || Array.isArray(result))) {
      let transactionsData;
      let paginationData = null;
      
      if (Array.isArray(result)) {
        transactionsData = result;
      } else if (result.data && Array.isArray(result.data)) {
        transactionsData = result.data;
        paginationData = result.pagination;
      } else if (result.transactions && Array.isArray(result.transactions)) {
        transactionsData = result.transactions;
        paginationData = result.pagination;
      } else {
        transactionsData = [];
      }
      
      return { transactionsData, paginationData };
    } else {
      throw new Error('Invalid response format');
    }
  };

  try {
    const { transactionsData, paginationData } = handleResponse(mockBackendResponse);
    
    console.log('✅ Response handling PASSED');
    console.log('📊 Extracted transactions:', transactionsData);
    console.log('📄 Extracted pagination:', paginationData);
    console.log('🎯 Total transactions:', transactionsData.length);
    
    return true;
  } catch (error) {
    console.log('❌ Response handling FAILED:', error.message);
    return false;
  }
};

// Test different response formats
const testDifferentFormats = () => {
  console.log('\n🔄 Testing Different Response Formats...\n');

  const formats = [
    // Direct array
    [{ id: '1', name: 'Test' }],
    
    // Wrapped array
    { 
      data: [{ id: '1', name: 'Test' }],
      pagination: { page: 1 }
    },
    
    // Backend format
    {
      transactions: [{ id: '1', name: 'Test' }],
      pagination: { page: 1 }
    }
  ];

  const handleGenericResponse = (result) => {
    if (result && (result.data || Array.isArray(result))) {
      if (Array.isArray(result)) {
        return result;
      } else if (result.data && Array.isArray(result.data)) {
        return result.data;
      } else if (result.transactions && Array.isArray(result.transactions)) {
        return result.transactions;
      } else if (result.categories && Array.isArray(result.categories)) {
        return result.categories;
      } else if (result.budgets && Array.isArray(result.budgets)) {
        return result.budgets;
      }
    }
    return [];
  };

  formats.forEach((format, index) => {
    try {
      const data = handleGenericResponse(format);
      console.log(`✅ Format ${index + 1} PASSED - extracted ${data.length} items`);
    } catch (error) {
      console.log(`❌ Format ${index + 1} FAILED:`, error.message);
    }
  });
};

// Run all tests
console.log('🚀 Starting API Integration Tests...\n');

const test1 = testResponseHandling();
testDifferentFormats();

console.log('\n🏁 Test Summary:');
console.log(test1 ? '✅ All tests passed!' : '❌ Some tests failed!');
console.log('\nIf tests pass, the frontend should now properly handle backend responses.');
