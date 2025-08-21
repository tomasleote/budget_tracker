// Manual localStorage cleanup script
// Run this in browser console to completely clear all app data

console.log('🧹 Clearing ALL localStorage data...');

// List all budget tracker keys
const keys = Object.keys(localStorage).filter(key => key.startsWith('budget_tracker'));
console.log('📋 Found keys:', keys);

// Clear each key
keys.forEach(key => {
  console.log(`🗑️ Removing: ${key}`);
  localStorage.removeItem(key);
});

// Also clear any other potential storage
localStorage.removeItem('budget_tracker_transactions');
localStorage.removeItem('budget_tracker_budgets');
localStorage.removeItem('budget_tracker_mock_metadata');
localStorage.removeItem('budget_tracker_categories');
localStorage.removeItem('budget_tracker_user');
localStorage.removeItem('budget_tracker_settings');
localStorage.removeItem('budget_tracker_app_data');
localStorage.removeItem('budget_tracker_preferences');
localStorage.removeItem('budget_tracker_cache');

console.log('✅ All localStorage data cleared!');
console.log('🔄 Please refresh the page to start fresh.');

// Verify cleanup
const remainingKeys = Object.keys(localStorage).filter(key => key.startsWith('budget_tracker'));
if (remainingKeys.length > 0) {
  console.warn('⚠️ Some keys still remain:', remainingKeys);
} else {
  console.log('✅ Complete cleanup verified!');
}
