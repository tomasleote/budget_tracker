/**
 * Default Data Initializer
 * Seeds localStorage with default categories and sample data
 * Only runs once on first app load
 */

import { repositories } from '../repositories/RepositoryFactory.js';

// Default expense categories
const DEFAULT_EXPENSE_CATEGORIES = [
  {
    id: 'expense-food',
    name: 'Food & Dining',
    type: 'expense',
    color: '#FF6384',
    icon: 'utensils',
    description: 'Groceries, restaurants, and food delivery',
    isDefault: true,
    isActive: true,
    parentId: null
  },
  {
    id: 'expense-transport',
    name: 'Transportation',
    type: 'expense',
    color: '#36A2EB',
    icon: 'car',
    description: 'Gas, public transit, ride-sharing',
    isDefault: true,
    isActive: true,
    parentId: null
  },
  {
    id: 'expense-shopping',
    name: 'Shopping',
    type: 'expense',
    color: '#FFCE56',
    icon: 'shopping-cart',
    description: 'Clothing, electronics, and general shopping',
    isDefault: true,
    isActive: true,
    parentId: null
  },
  {
    id: 'expense-bills',
    name: 'Bills & Utilities',
    type: 'expense',
    color: '#4BC0C0',
    icon: 'file-invoice-dollar',
    description: 'Rent, electricity, water, internet',
    isDefault: true,
    isActive: true,
    parentId: null
  },
  {
    id: 'expense-entertainment',
    name: 'Entertainment',
    type: 'expense',
    color: '#9966FF',
    icon: 'film',
    description: 'Movies, games, streaming services',
    isDefault: true,
    isActive: true,
    parentId: null
  },
  {
    id: 'expense-healthcare',
    name: 'Healthcare',
    type: 'expense',
    color: '#FF9F40',
    icon: 'heartbeat',
    description: 'Medical expenses, pharmacy, insurance',
    isDefault: true,
    isActive: true,
    parentId: null
  },
  {
    id: 'expense-personal',
    name: 'Personal Care',
    type: 'expense',
    color: '#E7E9ED',
    icon: 'user',
    description: 'Gym, haircuts, beauty products',
    isDefault: true,
    isActive: true,
    parentId: null
  },
  {
    id: 'expense-home',
    name: 'Home & Garden',
    type: 'expense',
    color: '#71B37C',
    icon: 'home',
    description: 'Furniture, repairs, gardening',
    isDefault: true,
    isActive: true,
    parentId: null
  },
  {
    id: 'expense-education',
    name: 'Education',
    type: 'expense',
    color: '#3E95CD',
    icon: 'graduation-cap',
    description: 'Courses, books, training',
    isDefault: true,
    isActive: true,
    parentId: null
  },
  {
    id: 'expense-other',
    name: 'Other Expenses',
    type: 'expense',
    color: '#95A5A6',
    icon: 'ellipsis-h',
    description: 'Miscellaneous expenses',
    isDefault: true,
    isActive: true,
    parentId: null
  }
];

// Default income categories
const DEFAULT_INCOME_CATEGORIES = [
  {
    id: 'income-salary',
    name: 'Salary',
    type: 'income',
    color: '#4CAF50',
    icon: 'money-bill-wave',
    description: 'Primary employment income',
    isDefault: true,
    isActive: true,
    parentId: null
  },
  {
    id: 'income-freelance',
    name: 'Freelance',
    type: 'income',
    color: '#8BC34A',
    icon: 'laptop-code',
    description: 'Freelance and contract work',
    isDefault: true,
    isActive: true,
    parentId: null
  },
  {
    id: 'income-investment',
    name: 'Investment',
    type: 'income',
    color: '#CDDC39',
    icon: 'chart-line',
    description: 'Dividends, interest, capital gains',
    isDefault: true,
    isActive: true,
    parentId: null
  },
  {
    id: 'income-business',
    name: 'Side Business',
    type: 'income',
    color: '#FFEB3B',
    icon: 'briefcase',
    description: 'Side business and entrepreneurship',
    isDefault: true,
    isActive: true,
    parentId: null
  },
  {
    id: 'income-gifts',
    name: 'Gifts & Bonuses',
    type: 'income',
    color: '#FFC107',
    icon: 'gift',
    description: 'Monetary gifts and bonuses',
    isDefault: true,
    isActive: true,
    parentId: null
  },
  {
    id: 'income-other',
    name: 'Other Income',
    type: 'income',
    color: '#FF9800',
    icon: 'plus-circle',
    description: 'Miscellaneous income',
    isDefault: true,
    isActive: true,
    parentId: null
  }
];

/**
 * Initialize default data in localStorage
 * @returns {Promise<boolean>} Success status
 */
export const initializeDefaultData = async () => {
  try {
    console.log('🔄 Checking if default data needs to be initialized...');
    
    // Check if categories already exist
    const categoryRepo = repositories.categories;
    const existingCategories = await categoryRepo.getAll();
    
    if (existingCategories && existingCategories.length > 0) {
      console.log('✅ Categories already exist. Skipping initialization.');
      return true;
    }
    
    console.log('🌱 Seeding default categories...');
    
    // Create all default categories
    const allDefaultCategories = [
      ...DEFAULT_EXPENSE_CATEGORIES,
      ...DEFAULT_INCOME_CATEGORIES
    ];
    
    let successCount = 0;
    let failCount = 0;
    
    for (const categoryData of allDefaultCategories) {
      try {
        await categoryRepo.create(categoryData);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to create category ${categoryData.name}:`, error);
        failCount++;
      }
    }
    
    console.log(`✅ Default data initialization complete: ${successCount} categories created, ${failCount} failed`);
    
    // Mark initialization as complete in localStorage
    localStorage.setItem('budget_tracker_initialized', 'true');
    localStorage.setItem('budget_tracker_init_date', new Date().toISOString());
    
    return failCount === 0;
  } catch (error) {
    console.error('❌ Failed to initialize default data:', error);
    return false;
  }
};

/**
 * Check if app has been initialized
 * @returns {boolean} Initialization status
 */
export const isAppInitialized = () => {
  return localStorage.getItem('budget_tracker_initialized') === 'true';
};

/**
 * Reset all data (for testing or reset functionality)
 * @returns {Promise<boolean>} Success status
 */
export const resetAllData = async () => {
  try {
    console.log('🔄 Resetting all data...');
    
    // Clear all repositories
    const categoryRepo = repositories.categories;
    const transactionRepo = repositories.transactions;
    const budgetRepo = repositories.budgets;
    
    const allCategories = await categoryRepo.getAll();
    const allTransactions = await transactionRepo.getAll();
    const allBudgets = await budgetRepo.getAll();
    
    // Delete all items
    for (const category of allCategories) {
      await categoryRepo.delete(category.id);
    }
    
    for (const transaction of allTransactions) {
      await transactionRepo.delete(transaction.id);
    }
    
    for (const budget of allBudgets) {
      await budgetRepo.delete(budget.id);
    }
    
    // Clear initialization flags
    localStorage.removeItem('budget_tracker_initialized');
    localStorage.removeItem('budget_tracker_init_date');
    
    console.log('✅ All data reset successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to reset data:', error);
    return false;
  }
};

export default {
  initializeDefaultData,
  isAppInitialized,
  resetAllData,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES
};
