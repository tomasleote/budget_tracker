// Utility to regenerate mock data with fixed budget dates
// Run this in browser console to regenerate data

import { loadMockDataToStorage, clearMockData } from './src/data/mockDataGenerator.js';

// Create global function for easy access
window.regenerateMockData = function() {
  console.log('🔄 Regenerating mock data with fixed budget dates...');
  try {
    const result = loadMockDataToStorage(4);
    console.log('✅ Mock data regenerated successfully!');
    console.log('🔄 Please refresh the page to see the updated data.');
    return result;
  } catch (error) {
    console.error('❌ Error regenerating mock data:', error);
    return null;
  }
};

window.clearAllMockData = function() {
  console.log('🧼 Clearing all mock data...');
  try {
    clearMockData();
    console.log('✅ All mock data cleared!');
    console.log('🔄 Please refresh the page.');
  } catch (error) {
    console.error('❌ Error clearing mock data:', error);
  }
};

console.log('🛠️ Mock data utilities loaded!');
console.log('📞 Available functions:');
console.log('  - regenerateMockData() - Clears and regenerates all mock data');
console.log('  - clearAllMockData() - Clears all mock data');
