import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Environment Configuration Checker
 * Verify that all required environment variables are set
 */

function checkEnvironment(): boolean {
  console.log('🔍 Checking environment configuration...');
  console.log('');

  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  const optionalVars = [
    'SUPABASE_ANON_KEY',
    'NODE_ENV',
    'PORT'
  ];

  let allGood = true;

  // Check required variables
  console.log('📋 Required Environment Variables:');
  for (const varName of requiredVars) {
    const value = process.env[varName];
    const status = value ? '✅' : '❌';
    const display = value ? `${value.substring(0, 20)}...` : 'NOT SET';
    
    console.log(`   ${status} ${varName}: ${display}`);
    
    if (!value) {
      allGood = false;
    }
  }

  console.log('');

  // Check optional variables
  console.log('📝 Optional Environment Variables:');
  for (const varName of optionalVars) {
    const value = process.env[varName];
    const status = value ? '✅' : '⚠️ ';
    const display = value || 'not set (using default)';
    
    console.log(`   ${status} ${varName}: ${display}`);
  }

  console.log('');

  if (allGood) {
    console.log('🎉 Environment configuration looks good!');
    console.log('✅ You can now run the optimization scripts');
  } else {
    console.log('❌ Environment configuration issues found!');
    console.log('');
    console.log('🔧 To fix this:');
    console.log('   1. Copy .env.example to .env');
    console.log('   2. Fill in your Supabase credentials');
    console.log('   3. Get credentials from: https://supabase.com/dashboard');
    console.log('');
    console.log('📋 Required values:');
    console.log('   • SUPABASE_URL: Your project URL');
    console.log('   • SUPABASE_SERVICE_ROLE_KEY: Service role key (for admin operations)');
  }

  return allGood;
}

/**
 * Test database connection
 */
async function testDatabaseConnection(): Promise<boolean> {
  if (!checkEnvironment()) {
    return false;
  }

  try {
    console.log('🔌 Testing database connection...');
    
    // Import after environment check
    const { supabaseAdmin } = await import('../src/config/database');
    
    // Simple query to test connection
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('count(*)')
      .limit(1);

    if (error) {
      console.log('❌ Database connection failed:', error.message);
      return false;
    }

    console.log('✅ Database connection successful!');
    console.log(`📊 Found categories table with data`);
    return true;

  } catch (error) {
    console.log('❌ Database connection error:', error);
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Budget Tracker - Environment Check');
  console.log('=====================================');
  console.log('');

  const envOk = checkEnvironment();
  
  if (envOk) {
    console.log('');
    const dbOk = await testDatabaseConnection();
    
    if (dbOk) {
      console.log('');
      console.log('🎯 Everything looks good! You can now run:');
      console.log('   npm run optimize:test-performance');
      console.log('   npm run optimize:apply-indexes');
    }
  }
}

// Execute if called directly
if (require.main === module) {
  main();
}