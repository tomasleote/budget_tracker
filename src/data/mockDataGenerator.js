/**
 * Mock Data Generator for Budget Tracker
 * Generates realistic financial data for testing Phase 6 charts
 */

// Categories with realistic spending patterns
const EXPENSE_CATEGORIES = [
  { name: 'Food & Dining', avgAmount: 120, variance: 40, frequency: 0.8 },
  { name: 'Transportation', avgAmount: 45, variance: 25, frequency: 0.4 },
  { name: 'Shopping', avgAmount: 60, variance: 40, frequency: 0.15 },
  { name: 'Bills & Utilities', avgAmount: 150, variance: 30, frequency: 0.05 }, // Few times per month
  { name: 'Entertainment', avgAmount: 25, variance: 20, frequency: 0.2 },
  { name: 'Healthcare', avgAmount: 75, variance: 50, frequency: 0.1 },
  { name: 'Personal Care', avgAmount: 40, variance: 20, frequency: 0.12 },
  { name: 'Home & Garden', avgAmount: 80, variance: 60, frequency: 0.08 }
];

const INCOME_CATEGORIES = [
  { name: 'Salary', avgAmount: 3500, variance: 0, frequency: 0.04 }, // Twice per month
  { name: 'Freelance', avgAmount: 250, variance: 150, frequency: 0.1 },
  { name: 'Investment', avgAmount: 100, variance: 80, frequency: 0.05 },
  { name: 'Side Business', avgAmount: 180, variance: 100, frequency: 0.08 }
];

// Helper function to generate random amount with variance
const generateAmount = (baseAmount, variance) => {
  const randomFactor = (Math.random() - 0.5) * 2; // -1 to 1
  return Math.max(1, Math.round(baseAmount + (randomFactor * variance)));
};

// Helper function to generate random date within a range
const generateRandomDate = (startDate, endDate) => {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const randomTime = start + Math.random() * (end - start);
  return new Date(randomTime);
};

// Generate description based on category
const generateDescription = (category, type) => {
  const descriptions = {
    // Expense descriptions
    'Food & Dining': ['Weekly grocery shopping', 'Supermarket run', 'Fresh produce', 'Restaurant dinner', 'Coffee shop'],
    'Transportation': ['Gas station fill-up', 'Uber ride', 'Public transit', 'Parking fee', 'Car maintenance'],
    'Shopping': ['Clothing purchase', 'Amazon order', 'Home supplies', 'Electronics', 'Personal items'],
    'Bills & Utilities': ['Electricity bill', 'Internet bill', 'Water bill', 'Phone bill', 'Cable TV'],
    'Entertainment': ['Movie tickets', 'Concert tickets', 'Streaming service', 'Gaming', 'Books'],
    'Healthcare': ['Doctor visit', 'Pharmacy', 'Dental cleaning', 'Insurance copay', 'Medication'],
    'Personal Care': ['Gym membership', 'Haircut', 'Cosmetics', 'Spa treatment', 'Personal trainer'],
    'Home & Garden': ['Furniture', 'Home repairs', 'Gardening supplies', 'Appliances', 'Home improvement'],
    
    // Income descriptions
    'Salary': ['Bi-weekly paycheck', 'Monthly salary', 'Salary deposit'],
    'Freelance': ['Web design project', 'Consulting work', 'Freelance writing', 'Photography gig'],
    'Investment': ['Dividend payment', 'Stock profit', 'Bond interest', 'Crypto gains'],
    'Side Business': ['Online sales', 'Tutoring session', 'Product sales', 'Service revenue']
  };
  
  const categoryDescriptions = descriptions[category] || ['Transaction'];
  const randomIndex = Math.floor(Math.random() * categoryDescriptions.length);
  return categoryDescriptions[randomIndex];
};

/**
 * Generate comprehensive mock data for testing
 * @param {number} months - Number of months to generate (default: 4)
 * @returns {Object} - Generated mock data
 */
export const generateMockData = (months = 4) => {
  console.log(`🎭 Generating ${months} months of mock financial data...`);
  
  const transactions = [];
  const budgets = [];
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  
  console.log(`📅 Data generation period: ${startDate.toISOString()} to ${new Date().toISOString()}`);
  
  // Generate transactions for each month INCLUDING current month
  let transactionIdCounter = 0; // Add counter for unique IDs
  const endMonth = new Date(); // Current month
  const totalMonthsToGenerate = months + 1; // +1 to include current month
  
  for (let monthOffset = 0; monthOffset < totalMonthsToGenerate; monthOffset++) {
    const monthStart = new Date(startDate);
    monthStart.setMonth(monthStart.getMonth() + monthOffset);
    monthStart.setDate(1);
    
    // For current month, only generate up to today
    const monthEnd = new Date(monthStart);
    if (monthOffset === totalMonthsToGenerate - 1) {
      // Current month - generate up to today
      monthEnd.setTime(Math.min(endMonth.getTime(), new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getTime()));
    } else {
      // Past months - generate full month
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0);
    }
    
    const daysInPeriod = Math.ceil((monthEnd - monthStart) / (1000 * 60 * 60 * 24));
    console.log(`📅 Processing month ${monthOffset + 1}/${totalMonthsToGenerate}: ${monthStart.toLocaleDateString()} to ${monthEnd.toLocaleDateString()} (${daysInPeriod} days)`);
    
    let monthTransactionCount = 0;
    
    // Generate income transactions
    INCOME_CATEGORIES.forEach(category => {
      const expectedTransactions = Math.round(daysInPeriod * category.frequency);
      for (let i = 0; i < expectedTransactions; i++) {
        const amount = generateAmount(category.avgAmount, category.variance);
        const date = generateRandomDate(monthStart, monthEnd);
        
        transactions.push({
          id: `income-${Date.now()}-${transactionIdCounter++}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'income',
          amount: amount,
          category: category.name,
          description: generateDescription(category.name, 'income'),
          date: date.toISOString(),
          createdAt: date.toISOString(),
          updatedAt: date.toISOString()
        });
        monthTransactionCount++;
      }
    });
    
    // Generate expense transactions
    EXPENSE_CATEGORIES.forEach(category => {
      const expectedTransactions = Math.round(daysInPeriod * category.frequency);
      for (let i = 0; i < expectedTransactions; i++) {
        const amount = generateAmount(category.avgAmount, category.variance);
        const date = generateRandomDate(monthStart, monthEnd);
        
        transactions.push({
          id: `expense-${Date.now()}-${transactionIdCounter++}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'expense',
          amount: amount,
          category: category.name,
          description: generateDescription(category.name, 'expense'),
          date: date.toISOString(),
          createdAt: date.toISOString(),
          updatedAt: date.toISOString()
        });
        monthTransactionCount++;
      }
    });
    
    console.log(`✅ Month ${monthOffset + 1} complete: ${monthTransactionCount} transactions generated`);
  }
  
  // Generate budgets for major expense categories
  const budgetCategories = ['Food & Dining', 'Transportation', 'Shopping', 'Bills & Utilities', 'Entertainment', 'Healthcare'];
  budgetCategories.forEach(category => {
    const categoryData = EXPENSE_CATEGORIES.find(c => c.name === category);
    if (categoryData) {
      // Set budget 20-30% higher than average expected spending
      const avgMonthlySpending = categoryData.avgAmount * (categoryData.frequency * 30);
      const budgetAmount = Math.round(avgMonthlySpending * (1.2 + Math.random() * 0.1));
      
      // Calculate actual spending for this category
      const categoryTransactions = transactions.filter(t => 
        t.type === 'expense' && t.category === category
      );
      const totalSpent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
      const avgMonthlySpent = totalSpent / months;
      
      // Create budget for current month that's currently active
      const currentMonth = new Date();
      const budgetStartDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const budgetEndDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      // Calculate spending in the CURRENT month (not historical average)
      const currentMonthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'expense' && 
               t.category === category &&
               tDate >= budgetStartDate && 
               tDate <= budgetEndDate;
      });
      
      const currentMonthSpent = currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      console.log(`🎯 Creating budget for ${category}: ${budgetAmount} budget, ${currentMonthSpent} spent this month from ${currentMonthTransactions.length} transactions`);
      
      budgets.push({
        id: `budget-${category.toLowerCase().replace(' ', '-')}-${Date.now()}`,
        category: category,
        budgetAmount: budgetAmount,
        period: 'monthly',
        isActive: true,
        startDate: budgetStartDate.toISOString(),
        endDate: budgetEndDate.toISOString(),
        description: `Monthly budget for ${category}`,
        // Don't include pre-calculated spent - let it be calculated from current month transactions
        createdAt: startDate.toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  });
  
  // Sort transactions by date (newest first)
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  console.log(`📋 Transaction generation complete: ${transactions.length} transactions generated`);
  console.log(`🎯 Budget generation complete: ${budgets.length} budgets generated`);
  
  // Calculate summary statistics
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const summary = {
    totalTransactions: transactions.length,
    totalIncome,
    totalExpenses,
    netAmount: totalIncome - totalExpenses,
    avgMonthlyIncome: Math.round(totalIncome / months),
    avgMonthlyExpenses: Math.round(totalExpenses / months),
    savingsRate: totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0
  };
  
  console.log('📊 Mock Data Generated:', summary);
  
  return {
    transactions,
    budgets,
    summary,
    metadata: {
      generatedAt: new Date().toISOString(),
      monthsGenerated: months,
      categories: {
        income: INCOME_CATEGORIES.map(c => c.name),
        expense: EXPENSE_CATEGORIES.map(c => c.name)
      }
    }
  };
};

/**
 * Load mock data into localStorage
 * @param {number} months - Number of months to generate
 */
export const loadMockDataToStorage = async (months = 4) => {
  // Clear old data first
  console.log('🧼 Clearing old mock data...');
  clearMockData();
  
  // Small delay to ensure data is cleared
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const mockData = generateMockData(months);
  
  try {
    console.log('📋 About to save mock data:');
    console.log(`- ${mockData.transactions.length} transactions`);
    console.log(`- ${mockData.budgets.length} budgets`);
    
    // Save transactions first
    localStorage.setItem('budget_tracker_transactions', JSON.stringify(mockData.transactions));
    
    // Small delay between saves
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Save budgets
    localStorage.setItem('budget_tracker_budgets', JSON.stringify(mockData.budgets));
    
    // Save metadata
    localStorage.setItem('budget_tracker_mock_metadata', JSON.stringify(mockData.metadata));
    
    // Verify data was saved
    const savedTransactions = JSON.parse(localStorage.getItem('budget_tracker_transactions') || '[]');
    const savedBudgets = JSON.parse(localStorage.getItem('budget_tracker_budgets') || '[]');
    console.log(`✅ Verified: ${savedTransactions.length} transactions saved to localStorage`);
    console.log(`✅ Verified: ${savedBudgets.length} budgets saved to localStorage`);
    
    // Debug: Log first few transactions to verify structure
    if (savedTransactions.length > 0) {
      console.log('🔍 Sample saved transactions:', savedTransactions.slice(0, 3));
    }
    
    if (savedTransactions.length === 0) {
      throw new Error('Transaction data was not saved properly!');
    }
    
    if (savedBudgets.length === 0) {
      throw new Error('Budget data was not saved properly!');
    }
    
    console.log('✅ Mock data loaded to localStorage!');
    console.log(`📈 Generated ${mockData.transactions.length} transactions`);
    console.log(`🎯 Generated ${mockData.budgets.length} budgets`);
    
    return mockData;
  } catch (error) {
    console.error('❌ Error loading mock data:', error);
    throw error;
  }
};

/**
 * Clear all mock data from localStorage
 */
export const clearMockData = () => {
  try {
    // Clear all budget tracker related keys
    const keysToRemove = [
      'budget_tracker_transactions',
      'budget_tracker_budgets', 
      'budget_tracker_mock_metadata',
      'budget_tracker_categories',
      'budget_tracker_user',
      'budget_tracker_settings',
      'budget_tracker_app_data',
      'budget_tracker_preferences',
      'budget_tracker_cache'
    ];
    
    keysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        console.log(`🗞️ Removing: ${key}`);
        localStorage.removeItem(key);
      }
    });
    
    // Also check for any other budget_tracker keys that might exist
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('budget_tracker_')) {
        console.log(`🗞️ Removing additional key: ${key}`);
        localStorage.removeItem(key);
      }
    });
    
    console.log('🗑️ Mock data cleared from localStorage');
  } catch (error) {
    console.error('❌ Error clearing mock data:', error);
    throw error;
  }
};

/**
 * Check if mock data exists in storage
 */
export const hasMockData = () => {
  try {
    const metadata = localStorage.getItem('budget_tracker_mock_metadata');
    return Boolean(metadata);
  } catch {
    return false;
  }
};

/**
 * Get mock data statistics
 */
export const getMockDataStats = () => {
  try {
    const transactions = JSON.parse(localStorage.getItem('budget_tracker_transactions') || '[]');
    const budgets = JSON.parse(localStorage.getItem('budget_tracker_budgets') || '[]');
    const metadata = JSON.parse(localStorage.getItem('budget_tracker_mock_metadata') || '{}');
    
    return {
      transactionCount: transactions.length,
      budgetCount: budgets.length,
      metadata,
      hasData: transactions.length > 0
    };
  } catch {
    return {
      transactionCount: 0,
      budgetCount: 0,
      metadata: {},
      hasData: false
    };
  }
};

export default {
  generateMockData,
  loadMockDataToStorage,
  clearMockData,
  hasMockData,
  getMockDataStats
};