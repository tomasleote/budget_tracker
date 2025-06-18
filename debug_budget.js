// Debug script to test budget loading
console.log('🔍 Debug: Testing budget data loading...');

// Test localStorage data
const budgetData = localStorage.getItem('budget_tracker_budgets');
console.log('📊 Raw budget data from localStorage:', budgetData);

if (budgetData) {
  try {
    const budgets = JSON.parse(budgetData);
    console.log('📋 Parsed budgets:', budgets.length, budgets);
    
    budgets.forEach((budget, index) => {
      console.log(`\n🎯 Budget ${index + 1}: ${budget.category}`);
      console.log(`  - ID: ${budget.id}`);
      console.log(`  - Amount: $${budget.budgetAmount}`);
      console.log(`  - Spent: $${budget.spent || 0}`);
      console.log(`  - Period: ${budget.period}`);
      console.log(`  - Active: ${budget.isActive}`);
      console.log(`  - Start: ${budget.startDate}`);
      console.log(`  - End: ${budget.endDate}`);
      
      // Check if dates are valid and current
      const now = new Date();
      const start = new Date(budget.startDate);
      const end = new Date(budget.endDate);
      const isWithinRange = now >= start && now <= end;
      
      console.log(`  - Current time: ${now.toISOString()}`);
      console.log(`  - Date range valid: ${isWithinRange}`);
      console.log(`  - Should be active: ${budget.isActive && isWithinRange}`);
    });
  } catch (error) {
    console.error('❌ Error parsing budget data:', error);
  }
} else {
  console.log('❌ No budget data found in localStorage');
}

// Test transaction data too
const transactionData = localStorage.getItem('budget_tracker_transactions');
if (transactionData) {
  try {
    const transactions = JSON.parse(transactionData);
    console.log(`\n💳 Transactions found: ${transactions.length}`);
    
    // Group by category to see spending
    const categorySpending = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const cat = t.category;
      if (!categorySpending[cat]) categorySpending[cat] = 0;
      categorySpending[cat] += t.amount;
    });
    
    console.log('\n💰 Spending by category:');
    Object.entries(categorySpending).forEach(([cat, amount]) => {
      console.log(`  - ${cat}: $${amount.toFixed(2)}`);
    });
  } catch (error) {
    console.error('❌ Error parsing transaction data:', error);
  }
} else {
  console.log('❌ No transaction data found in localStorage');
}
