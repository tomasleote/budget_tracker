/**
 * Database Population Script - Fixed for Rate Limiting
 * Generates 6 months of realistic transaction data AND budgets
 * Uses bulk operations and proper rate limiting to avoid HTTP 429 errors
 */

const API_BASE_URL = 'http://localhost:3001/api';

// Transaction templates
const TRANSACTION_TEMPLATES = {
  expense: {
    'Food & Dining': [
      { description: 'Grocery shopping', amountRange: [45, 120], frequency: 'weekly' },
      { description: 'Coffee shop', amountRange: [4, 8], frequency: 'daily' },
      { description: 'Restaurant dinner', amountRange: [25, 65], frequency: 'weekly' },
      { description: 'Fast food lunch', amountRange: [8, 15], frequency: 'weekly' },
      { description: 'Takeout dinner', amountRange: [18, 35], frequency: 'weekly' }
    ],
    'Transportation': [
      { description: 'Gas station fill-up', amountRange: [35, 55], frequency: 'weekly' },
      { description: 'Public transport pass', amountRange: [8, 12], frequency: 'daily' },
      { description: 'Uber ride', amountRange: [12, 25], frequency: 'weekly' },
      { description: 'Parking fee', amountRange: [5, 15], frequency: 'weekly' },
      { description: 'Car maintenance', amountRange: [80, 300], frequency: 'monthly' }
    ],
    'Bills & Utilities': [
      { description: 'Electricity bill', amountRange: [120, 180], frequency: 'monthly' },
      { description: 'Internet bill', amountRange: [60, 95], frequency: 'monthly' },
      { description: 'Water bill', amountRange: [45, 75], frequency: 'monthly' },
      { description: 'Phone bill', amountRange: [35, 65], frequency: 'monthly' },
      { description: 'Streaming subscription', amountRange: [12, 25], frequency: 'monthly' }
    ],
    'Entertainment': [
      { description: 'Movie tickets', amountRange: [12, 25], frequency: 'weekly' },
      { description: 'Concert tickets', amountRange: [45, 120], frequency: 'monthly' },
      { description: 'Streaming service', amountRange: [9, 18], frequency: 'monthly' },
      { description: 'Gaming purchase', amountRange: [15, 60], frequency: 'monthly' },
      { description: 'Books/magazines', amountRange: [8, 25], frequency: 'monthly' }
    ],
    'Healthcare': [
      { description: 'Doctor visit', amountRange: [80, 150], frequency: 'monthly' },
      { description: 'Pharmacy prescription', amountRange: [25, 85], frequency: 'monthly' },
      { description: 'Dental cleaning', amountRange: [120, 200], frequency: 'monthly' },
      { description: 'Health supplements', amountRange: [20, 45], frequency: 'monthly' }
    ],
    'Personal Care': [
      { description: 'Haircut', amountRange: [25, 65], frequency: 'monthly' },
      { description: 'Gym membership', amountRange: [45, 85], frequency: 'monthly' },
      { description: 'Personal care products', amountRange: [15, 35], frequency: 'monthly' },
      { description: 'Skincare products', amountRange: [20, 55], frequency: 'monthly' }
    ],
    'Education': [
      { description: 'Course fees', amountRange: [50, 200], frequency: 'monthly' },
      { description: 'Books and materials', amountRange: [20, 80], frequency: 'monthly' },
      { description: 'Online learning subscription', amountRange: [15, 50], frequency: 'monthly' }
    ],
    'Shopping': [
      { description: 'Clothing purchase', amountRange: [30, 120], frequency: 'monthly' },
      { description: 'Electronics', amountRange: [50, 300], frequency: 'monthly' },
      { description: 'Online shopping', amountRange: [20, 80], frequency: 'weekly' }
    ],
    'Home': [
      { description: 'Home improvement', amountRange: [25, 150], frequency: 'monthly' },
      { description: 'Garden supplies', amountRange: [15, 75], frequency: 'monthly' },
      { description: 'Home maintenance', amountRange: [50, 200], frequency: 'monthly' }
    ],
    'Other': [
      { description: 'Miscellaneous expense', amountRange: [10, 50], frequency: 'weekly' },
      { description: 'Bank fees', amountRange: [5, 25], frequency: 'monthly' }
    ]
  },
  income: {
    'Salary': [
      { description: 'Monthly salary', amountRange: [3500, 4500], frequency: 'monthly' },
      { description: 'Bi-weekly paycheck', amountRange: [1750, 2250], frequency: 'biweekly' }
    ],
    'Freelance': [
      { description: 'Freelance project payment', amountRange: [250, 800], frequency: 'monthly' },
      { description: 'Consulting work', amountRange: [400, 1200], frequency: 'monthly' },
      { description: 'Side project income', amountRange: [150, 500], frequency: 'monthly' }
    ],
    'Investment': [
      { description: 'Dividend payment', amountRange: [45, 125], frequency: 'monthly' },
      { description: 'Interest income', amountRange: [25, 85], frequency: 'monthly' },
      { description: 'Rental income', amountRange: [800, 1200], frequency: 'monthly' }
    ],
    'Gift': [
      { description: 'Cash gift', amountRange: [50, 200], frequency: 'monthly' },
      { description: 'Birthday gift', amountRange: [100, 300], frequency: 'monthly' }
    ],
    'Business': [
      { description: 'Business income', amountRange: [200, 800], frequency: 'monthly' }
    ],
    'Other Income': [
      { description: 'Refund', amountRange: [25, 150], frequency: 'monthly' },
      { description: 'Bonus payment', amountRange: [500, 2000], frequency: 'monthly' }
    ]
  }
};

// Budget templates (only for expense categories)
// Names must match the default categories in CategoryService
const BUDGET_TEMPLATES = {
  'Food & Dining': { monthlyBudget: [400, 600] },
  'Transportation': { monthlyBudget: [200, 350] },
  'Bills & Utilities': { monthlyBudget: [250, 400] },
  'Entertainment': { monthlyBudget: [150, 300] },
  'Healthcare': { monthlyBudget: [200, 400] },
  'Personal Care': { monthlyBudget: [100, 200] },
  'Shopping': { monthlyBudget: [200, 400] },
  'Education': { monthlyBudget: [100, 300] },
  'Home': { monthlyBudget: [300, 500] },
  'Other': { monthlyBudget: [100, 250] }
};

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  maxRequestsPerWindow: 90, // Leave some buffer from the 100 limit
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayBetweenRequests: 1000, // 1 second between requests
  bulkBatchSize: 20, // Reduced batch size for bulk operations
  maxRetries: 3,
  retryDelay: 2000 // 2 seconds delay on retry
};

// Request tracking
let requestCount = 0;
let windowStart = Date.now();

// Helper functions
function getRandomAmount(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function shouldGenerateTransaction(frequency, daysFromStart) {
  const random = Math.random();
  switch (frequency) {
    case 'daily': return random < 0.4; // Reduced frequency
    case 'weekly': return random < 0.12;
    case 'biweekly': return random < 0.05;
    case 'monthly': return random < 0.025;
    default: return random < 0.08;
  }
}

// Rate limiting functions
async function checkRateLimit() {
  const now = Date.now();
  
  // Reset window if 15 minutes have passed
  if (now - windowStart > RATE_LIMIT_CONFIG.windowMs) {
    requestCount = 0;
    windowStart = now;
  }
  
  // If we're approaching the limit, wait for the window to reset
  if (requestCount >= RATE_LIMIT_CONFIG.maxRequestsPerWindow) {
    const timeToWait = RATE_LIMIT_CONFIG.windowMs - (now - windowStart);
    if (timeToWait > 0) {
      console.log(`⏰ Rate limit reached. Waiting ${Math.ceil(timeToWait / 1000)} seconds for window reset...`);
      await new Promise(resolve => setTimeout(resolve, timeToWait + 1000));
      requestCount = 0;
      windowStart = Date.now();
    }
  }
  
  requestCount++;
  await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_CONFIG.delayBetweenRequests));
}

// API functions with retry logic
async function fetchCategories() {
  try {
    await checkRateLimit();
    const response = await fetch(`${API_BASE_URL}/categories`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('🔍 Categories API response:', JSON.stringify(data, null, 2));
    
    // Extract categories array from response
    const categories = data.data || data;
    
    if (!Array.isArray(categories)) {
      console.error('❌ Categories is not an array:', categories);
      return [];
    }
    
    return categories;
  } catch (error) {
    console.error('❌ Error fetching categories:', error.message);
    console.error('🔧 Make sure your backend server is running on port 3001');
    return [];
  }
}

async function createTransactionsBulk(transactions, retryCount = 0) {
  try {
    await checkRateLimit();
    const response = await fetch(`${API_BASE_URL}/transactions/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'create',
        transactions: transactions 
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      
      if (response.status === 429 && retryCount < RATE_LIMIT_CONFIG.maxRetries) {
        console.log(`🔄 Rate limited, retrying in ${RATE_LIMIT_CONFIG.retryDelay / 1000}s... (attempt ${retryCount + 1})`);
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_CONFIG.retryDelay));
        return createTransactionsBulk(transactions, retryCount + 1);
      }
      
      throw new Error(`HTTP ${response.status}: ${errorData.message || 'Failed to create transactions'}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating transactions bulk:', error);
    throw error;
  }
}

async function createBudget(budgetData, retryCount = 0) {
  try {
    await checkRateLimit();
    const response = await fetch(`${API_BASE_URL}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(budgetData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      
      if (response.status === 429 && retryCount < RATE_LIMIT_CONFIG.maxRetries) {
        console.log(`🔄 Rate limited on budget, retrying in ${RATE_LIMIT_CONFIG.retryDelay / 1000}s... (attempt ${retryCount + 1})`);
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_CONFIG.retryDelay));
        return createBudget(budgetData, retryCount + 1);
      }
      
      throw new Error(`HTTP ${response.status}: ${errorData.message || 'Failed to create budget'}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating budget:', error);
    throw error;
  }
}

// Generate data functions
async function generateBudgets(categoryLookup, categories) {
  console.log('💰 Generating budgets...');
  const budgets = [];
  const currentDate = new Date();
  
  // Only create budgets for the current month (6 months back to now)
  for (let monthsBack = 0; monthsBack < 6; monthsBack++) {
    const budgetDate = new Date(currentDate);
    budgetDate.setMonth(currentDate.getMonth() - monthsBack);
    
    Object.keys(BUDGET_TEMPLATES).forEach(categoryName => {
      const categoryId = categoryLookup[categoryName];
      if (categoryId) {
        // Find the category to check if it's an expense category
        const category = categories.find(c => c.id === categoryId);
        if (category && category.type === 'expense') {
          const template = BUDGET_TEMPLATES[categoryName];
          const budgetAmount = getRandomAmount(template.monthlyBudget[0], template.monthlyBudget[1]);
          const startDate = new Date(budgetDate.getFullYear(), budgetDate.getMonth(), 1);
          const endDate = new Date(budgetDate.getFullYear(), budgetDate.getMonth() + 1, 0);
          
          budgets.push({
            category_id: categoryId,
            budget_amount: budgetAmount,
            period: 'monthly',
            start_date: startDate.toISOString().split('T')[0], // YYYY-MM-DD format
            end_date: endDate.toISOString().split('T')[0] // YYYY-MM-DD format
          });
        }
      }
    });
  }
  
  console.log(`📊 Generated ${budgets.length} budgets`);
  return budgets;
}

async function generateTransactions(categoryLookup) {
  console.log('📝 Generating transactions...');
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(endDate.getMonth() - 6);
  
  console.log(`📅 Generating transactions from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
  
  const transactions = [];
  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  
  for (let day = 0; day < totalDays; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + day);
    
    ['expense', 'income'].forEach(type => {
      const templates = TRANSACTION_TEMPLATES[type];
      Object.keys(templates).forEach(categoryName => {
        if (!categoryLookup[categoryName]) return;
        
        const categoryTemplates = templates[categoryName];
        categoryTemplates.forEach(template => {
          if (shouldGenerateTransaction(template.frequency, day)) {
            const amount = getRandomAmount(template.amountRange[0], template.amountRange[1]);
            const transactionDate = new Date(currentDate);
            transactionDate.setHours(
              Math.floor(Math.random() * 24),
              Math.floor(Math.random() * 60),
              Math.floor(Math.random() * 60)
            );
            
            transactions.push({
              type,
              amount,
              description: template.description,
              category_id: categoryLookup[categoryName],
              date: transactionDate.toISOString()
            });
          }
        });
      });
    });
  }
  
  console.log(`📊 Generated ${transactions.length} transactions`);
  return transactions;
}

// Health check function
async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    if (!response.ok) {
      throw new Error(`Backend health check failed: ${response.status}`);
    }
    const data = await response.json();
    console.log('✅ Backend is running:', data.message);
    return true;
  } catch (error) {
    console.error('❌ Backend health check failed:', error.message);
    console.error('🔧 Please start your backend server with: npm run dev');
    return false;
  }
}

// Main function
async function generateAllData() {
  console.log('🚀 Starting database population with transactions AND budgets...');
  console.log(`⚡ Rate limiting: ${RATE_LIMIT_CONFIG.maxRequestsPerWindow} requests per ${RATE_LIMIT_CONFIG.windowMs / 1000 / 60} minutes`);
  
  // Check if backend is running
  console.log('🏅 Checking backend health...');
  const isBackendHealthy = await checkBackendHealth();
  if (!isBackendHealthy) {
    console.error('❌ Cannot proceed without backend server. Exiting...');
    return;
  }
  
  console.log('📋 Fetching categories from backend...');
  let categories = await fetchCategories();
  
  if (categories.length === 0) {
    console.log('🌱 No categories found, seeding default categories...');
    try {
      await checkRateLimit();
      const response = await fetch(`${API_BASE_URL}/categories/seed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to seed categories: ${response.status}`);
      }
      
      const seedResult = await response.json();
      console.log(`✅ Seeded ${seedResult.data.created_count} default categories`);
      
      // Fetch categories again after seeding
      categories = await fetchCategories();
    } catch (error) {
      console.error('❌ Failed to seed default categories:', error.message);
      console.log('💡 Try manually running: npm run seed');
      return;
    }
  }
  
  if (categories.length === 0) {
    console.error('❌ Still no categories found after seeding attempt. Exiting...');
    return;
  }
  
  console.log(`✅ Found ${categories.length} categories:`, categories.map(c => c.name));
  
  const categoryLookup = {};
  categories.forEach(cat => {
    categoryLookup[cat.name] = cat.id;
  });
  
  const transactions = await generateTransactions(categoryLookup);
  const budgets = await generateBudgets(categoryLookup, categories);
  
  // Shuffle transactions for more realistic insertion
  transactions.sort(() => Math.random() - 0.5);
  
  // Insert transactions using bulk operations
  let transactionsCreated = 0;
  let transactionsFailed = 0;
  
  console.log('💾 Inserting transactions into database using bulk operations...');
  
  const batchSize = RATE_LIMIT_CONFIG.bulkBatchSize;
  const totalBatches = Math.ceil(transactions.length / batchSize);
  
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    
    console.log(`📦 Processing bulk transaction batch ${batchNumber}/${totalBatches} (${batch.length} transactions)`);
    
    try {
      const result = await createTransactionsBulk(batch);
      const successCount = result.data?.created?.length || batch.length;
      const failCount = batch.length - successCount;
      
      transactionsCreated += successCount;
      transactionsFailed += failCount;
      
      if (result.data?.errors?.length > 0) {
        console.log(`⚠️  Batch had ${result.data.errors.length} errors`);
      }
      
    } catch (error) {
      console.error(`❌ Failed to create transaction batch ${batchNumber}:`, error.message);
      transactionsFailed += batch.length;
    }
    
    const progress = Math.round((i + batchSize) / transactions.length * 100);
    console.log(`📈 Transaction progress: ${Math.min(progress, 100)}% (${transactionsCreated} created, ${transactionsFailed} failed)`);
  }
  
  // Insert budgets
  let budgetsCreated = 0;
  let budgetsFailed = 0;
  
  console.log('💰 Inserting budgets into database...');
  
  for (let i = 0; i < budgets.length; i++) {
    const budget = budgets[i];
    const category = categories.find(c => c.id === budget.category_id);
    const categoryName = category ? category.name : 'Unknown';
    
    console.log(`💰 Creating budget ${i + 1}/${budgets.length}: ${categoryName} - $${budget.budget_amount}`);
    
    try {
      await createBudget(budget);
      budgetsCreated++;
    } catch (error) {
      console.error(`❌ Failed to create budget:`, {
        category: categoryName,
        budget_amount: budget.budget_amount,
        error: error.message
      });
      budgetsFailed++;
    }
    
    const progress = Math.round((i + 1) / budgets.length * 100);
    console.log(`💰 Budget progress: ${progress}% (${budgetsCreated} created, ${budgetsFailed} failed)`);
  }
  
  console.log('\n🎉 Database population complete!');
  console.log(`✅ Successfully created: ${transactionsCreated} transactions, ${budgetsCreated} budgets`);
  console.log(`❌ Failed to create: ${transactionsFailed} transactions, ${budgetsFailed} budgets`);
  console.log(`📊 Success rate: ${Math.round((transactionsCreated + budgetsCreated) / (transactions.length + budgets.length) * 100)}%`);
  
  // Summary
  const expenseCount = transactions.filter(t => t.type === 'expense').length;
  const incomeCount = transactions.filter(t => t.type === 'income').length;
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalBudgetAmount = budgets.reduce((sum, b) => sum + b.budget_amount, 0);
  
  console.log('\n📊 Summary:');
  console.log(`💸 Expenses: ${expenseCount} transactions, $${totalExpenses.toFixed(2)} total`);
  console.log(`💰 Income: ${incomeCount} transactions, $${totalIncome.toFixed(2)} total`);
  console.log(`💳 Net: $${(totalIncome - totalExpenses).toFixed(2)}`);
  console.log(`🎯 Budgets: ${budgets.length} budgets, $${totalBudgetAmount.toFixed(2)} total budget amount`);
  console.log('\n🔄 Refresh your dashboard to see the new data!');
}

// Run the script
generateAllData().catch(console.error);
