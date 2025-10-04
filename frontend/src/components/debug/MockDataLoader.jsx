/**
 * Mock Data Loader Component
 * Provides buttons to generate test data for development and demos
 */
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDatabase,
  faSpinner,
  faCheck,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { repositories } from '../../model/repositories/RepositoryFactory.js';
import { useCategoryContext } from '../../controller/context/providers/CategoryProvider.jsx';
import { useTransactionContext } from '../../controller/context/providers/TransactionProvider.jsx';
import { useBudgetContext } from '../../controller/context/providers/BudgetProvider.jsx';

// Mock transaction data
const generateMockTransactions = (categories, count = 20) => {
  const transactions = [];
  const now = new Date();
  
  // Helper to get random category of specific type
  const getRandomCategory = (type) => {
    const filtered = categories.filter(c => c.type === type);
    return filtered[Math.floor(Math.random() * filtered.length)];
  };
  
  // Generate transactions
  for (let i = 0; i < count; i++) {
    const type = Math.random() > 0.7 ? 'income' : 'expense';
    const category = getRandomCategory(type);
    
    if (!category) continue;
    
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    
    const amount = type === 'income' 
      ? Math.floor(Math.random() * 3000) + 500
      : Math.floor(Math.random() * 200) + 10;
    
    const descriptions = {
      'expense': ['Grocery shopping', 'Coffee', 'Dinner out', 'Gas', 'Shopping', 'Utilities'],
      'income': ['Salary', 'Freelance project', 'Bonus', 'Investment return']
    };
    
    const descList = descriptions[type];
    const description = descList[Math.floor(Math.random() * descList.length)];
    
    transactions.push({
      id: `mock-${type}-${Date.now()}-${i}`,
      type,
      amount,
      category: category.name,
      categoryId: category.id,
      description,
      date: date.toISOString(),
      createdAt: date.toISOString(),
      updatedAt: date.toISOString()
    });
  }
  
  return transactions;
};

// Mock budget data
const generateMockBudgets = (categories) => {
  const budgets = [];
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  // Create budgets for major expense categories
  const expenseCategories = categories.filter(c => c.type === 'expense').slice(0, 5);
  
  expenseCategories.forEach((category, i) => {
    const amount = Math.floor(Math.random() * 500) + 200;
    const spent = Math.floor(Math.random() * amount);
    
    budgets.push({
      id: `mock-budget-${Date.now()}-${i}`,
      name: `${category.name} Budget`,
      amount,
      categoryId: category.id,
      category: category.name,
      period: 'monthly',
      startDate: firstOfMonth.toISOString(),
      endDate: lastOfMonth.toISOString(),
      spentAmount: spent,
      isActive: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    });
  });
  
  return budgets;
};

const MockDataLoader = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  
  const categoryContext = useCategoryContext();
  const transactionContext = useTransactionContext();
  const budgetContext = useBudgetContext();

  const showMessage = (msg, isError = false) => {
    if (isError) {
      setError(msg);
      setMessage(null);
    } else {
      setMessage(msg);
      setError(null);
    }
    setTimeout(() => {
      setMessage(null);
      setError(null);
    }, 5000);
  };

  const handleGenerateMockData = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      console.log('🎭 Starting mock data generation...');
      
      // Get categories
      const categories = categoryContext.categories;
      if (!categories || categories.length === 0) {
        throw new Error('No categories found. Categories must be initialized first.');
      }
      
      console.log(`📂 Found ${categories.length} categories`);
      
      // Generate and save transactions
      const transactions = generateMockTransactions(categories, 20);
      console.log(`💰 Generated ${transactions.length} transactions`);
      
      const transactionRepo = repositories.transactions;
      for (const transaction of transactions) {
        await transactionRepo.create(transaction);
      }
      console.log('✅ Transactions saved');
      
      // Generate and save budgets
      const budgets = generateMockBudgets(categories);
      console.log(`🎯 Generated ${budgets.length} budgets`);
      
      const budgetRepo = repositories.budgets;
      for (const budget of budgets) {
        await budgetRepo.create(budget);
      }
      console.log('✅ Budgets saved');
      
      // Reload all contexts
      if (transactionContext.actions?.loadAllTransactionsForDashboard) {
        await transactionContext.actions.loadAllTransactionsForDashboard();
      }
      if (budgetContext.actions?.loadBudgets) {
        await budgetContext.actions.loadBudgets();
      }
      
      showMessage(`✅ Success! Generated ${transactions.length} transactions and ${budgets.length} budgets`);
      console.log('🎉 Mock data generation complete!');
      
      // Refresh page to show new data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (err) {
      console.error('❌ Mock data generation failed:', err);
      showMessage(err.message || 'Failed to generate mock data', true);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllData = async () => {
    if (!window.confirm('Are you sure you want to delete ALL data? This cannot be undone!')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      console.log('🗑️ Clearing all data...');
      
      const transactionRepo = repositories.transactions;
      const budgetRepo = repositories.budgets;
      
      const allTransactions = await transactionRepo.getAll();
      const allBudgets = await budgetRepo.getAll();
      
      // Delete all transactions
      for (const transaction of allTransactions) {
        await transactionRepo.delete(transaction.id);
      }
      
      // Delete all budgets
      for (const budget of allBudgets) {
        await budgetRepo.delete(budget.id);
      }
      
      console.log('✅ All data cleared');
      showMessage('✅ All data has been deleted');
      
      // Refresh page
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (err) {
      console.error('❌ Clear data failed:', err);
      showMessage(err.message || 'Failed to clear data', true);
    } finally {
      setLoading(false);
    }
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="rounded-lg p-6 border-2 border-dashed border-purple-300 bg-purple-50">
      <div className="flex items-center space-x-3 mb-4">
        <FontAwesomeIcon icon={faDatabase} className="text-2xl text-purple-600" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Development Tools
          </h3>
          <p className="text-sm text-gray-600">
            Generate test data for development and demos
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleGenerateMockData}
          disabled={loading}
          className="w-full px-4 py-3 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          <FontAwesomeIcon 
            icon={loading ? faSpinner : faDatabase} 
            className={loading ? 'animate-spin' : ''}
          />
          <span>{loading ? 'Generating...' : 'Generate Mock Data (20 transactions + 5 budgets)'}</span>
        </button>

        <button
          onClick={handleClearAllData}
          disabled={loading}
          className="w-full px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Clearing...' : 'Clear All Data'}
        </button>
      </div>

      {message && (
        <div className="mt-4 p-3 rounded-lg bg-green-100 border border-green-300 flex items-center space-x-2">
          <FontAwesomeIcon icon={faCheck} className="text-green-600" />
          <span className="text-sm text-green-800">{message}</span>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-100 border border-red-300 flex items-center space-x-2">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600" />
          <span className="text-sm text-red-800">{error}</span>
        </div>
      )}
    </div>
  );
};

export default MockDataLoader;
