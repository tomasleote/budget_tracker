/**
 * Mock Data Generator for Budget Tracker
 * Generates realistic financial data for testing Phase 6 charts
 */
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from './mock/categories';
import { generateAmount, generateRandomDate, generateDescription } from './mock/helpers';

/**
 * Generate comprehensive mock data for testing
 * @param {number} months - Number of months to generate (default: 4)
 * @returns {Object} - Generated mock data
 */
export const generateMockData = (months = 4) => {
  const transactions = [];
  const budgets = [];
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  
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
  clearMockData();
  
  // Small delay to ensure data is cleared
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const mockData = generateMockData(months);
  
  try {
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

    if (savedTransactions.length === 0) {
      throw new Error('Transaction data was not saved properly!');
    }
    
    if (savedBudgets.length === 0) {
      throw new Error('Budget data was not saved properly!');
    }
    
    return mockData;
  } catch (error) {
    console.error('Error loading mock data:', error);
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
        localStorage.removeItem(key);
      }
    });

    // Also check for any other budget_tracker keys that might exist
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('budget_tracker_')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing mock data:', error);
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