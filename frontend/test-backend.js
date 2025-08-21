#!/usr/bin/env node

/**
 * Backend Test Script
 * Tests backend API endpoints to verify they're working
 */

const http = require('http');
const https = require('https');

const API_BASE = 'http://localhost:3001';

console.log('🚀 Backend API Test Script\n');

/**
 * Make HTTP request
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, { timeout: 5000 }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: parsed,
            success: res.statusCode >= 200 && res.statusCode < 300
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data,
            success: res.statusCode >= 200 && res.statusCode < 300
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Test endpoint
 */
async function testEndpoint(name, url) {
  try {
    console.log(`Testing ${name}...`);
    const result = await makeRequest(url);
    
    if (result.success) {
      console.log(`✅ ${name}: Status ${result.status}`);
      if (result.data?.data && Array.isArray(result.data.data)) {
        console.log(`   📊 Found ${result.data.data.length} items`);
      } else if (result.data?.data?.transactions && Array.isArray(result.data.data.transactions)) {
        console.log(`   📊 Found ${result.data.data.transactions.length} transactions`);
      } else if (result.data?.data?.budgets && Array.isArray(result.data.data.budgets)) {
        console.log(`   📊 Found ${result.data.data.budgets.length} budgets`);
      }
    } else {
      console.log(`❌ ${name}: Status ${result.status}`);
      console.log(`   Error: ${result.data.error || result.data}`);
    }
    
    return result.success;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log(`Backend URL: ${API_BASE}\n`);
  
  const tests = [
    { name: 'Health Check', url: `${API_BASE}/health` },
    { name: 'Categories API', url: `${API_BASE}/api/categories` },
    { name: 'Transactions API', url: `${API_BASE}/api/transactions` },
    { name: 'Budgets API', url: `${API_BASE}/api/budgets` },
  ];
  
  const results = [];
  
  for (const test of tests) {
    const success = await testEndpoint(test.name, test.url);
    results.push({ ...test, success });
    console.log(''); // Empty line
  }
  
  // Summary
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log('📊 Test Summary:');
  console.log(`   Total tests: ${total}`);
  console.log(`   Successful: ${successful}`);
  console.log(`   Failed: ${total - successful}`);
  
  if (successful === total) {
    console.log('\n✅ All tests passed! Backend is ready for frontend integration.');
  } else {
    console.log('\n❌ Some tests failed. Please check backend server status.');
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure backend server is running: cd ../backend && npm run dev');
    console.log('2. Check backend logs for errors');
    console.log('3. Verify database connection (Supabase)');
    console.log('4. Check backend .env configuration');
  }
  
  return successful === total;
}

// Run tests
runTests().catch(console.error);
