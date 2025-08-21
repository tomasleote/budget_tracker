// Backend API Test Script
// Run this script to test if the backend API is working correctly

const testBackendAPI = async () => {
  const API_BASE_URL = 'http://localhost:3001/api';
  
  console.log('🧪 Testing Backend API Connection...\n');
  
  // Test 1: Health Check
  console.log('1️⃣ Testing Health Endpoint...');
  try {
    const healthResponse = await fetch('http://localhost:3001/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData);
  } catch (error) {
    console.error('❌ Health Check Failed:', error.message);
  }
  
  // Test 2: Categories Endpoint
  console.log('\n2️⃣ Testing Categories Endpoint...');
  try {
    const categoriesResponse = await fetch(`${API_BASE_URL}/categories`);
    const categoriesData = await categoriesResponse.json();
    console.log('✅ Categories Response:', {
      success: categoriesData.success,
      count: categoriesData.data?.length || 0,
      sample: categoriesData.data?.[0] || 'No categories'
    });
  } catch (error) {
    console.error('❌ Categories Endpoint Failed:', error.message);
  }
  
  // Test 3: Transactions Endpoint
  console.log('\n3️⃣ Testing Transactions Endpoint...');
  try {
    const transactionsResponse = await fetch(`${API_BASE_URL}/transactions?limit=5`);
    const transactionsData = await transactionsResponse.json();
    console.log('✅ Transactions Response:', {
      success: transactionsData.success,
      count: transactionsData.data?.transactions?.length || 0,
      hasPageination: !!transactionsData.data?.pagination
    });
  } catch (error) {
    console.error('❌ Transactions Endpoint Failed:', error.message);
  }
  
  // Test 4: Budgets Endpoint
  console.log('\n4️⃣ Testing Budgets Endpoint...');
  try {
    const budgetsResponse = await fetch(`${API_BASE_URL}/budgets`);
    const budgetsData = await budgetsResponse.json();
    console.log('✅ Budgets Response:', {
      success: budgetsData.success,
      count: budgetsData.data?.length || 0
    });
  } catch (error) {
    console.error('❌ Budgets Endpoint Failed:', error.message);
  }
  
  console.log('\n✨ Backend API Test Complete!\n');
};

// Run the test
testBackendAPI();
