import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCode,
  faDatabase,
  faTrash,
  faDownload,
  faRefresh,
  faChartBar,
  faInfoCircle,
  faCheckCircle,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import Button from '../ui/Button';
import Card from '../ui/Card';
import mockDataGenerator from '../../../data/mockDataGenerator.js';

const {
  loadMockDataToStorage,
  clearMockData,
  hasMockData,
  getMockDataStats
} = mockDataGenerator;

const DeveloperPanel = ({ onDataLoaded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [mockStats, setMockStats] = useState(null);
  const [showPanel, setShowPanel] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState(4);

  // Check for existing mock data on mount
  useEffect(() => {
    updateMockStats();
  }, []);

  const updateMockStats = () => {
    const stats = getMockDataStats();
    setMockStats(stats);
  };

  const handleLoadMockData = async (months = selectedMonths) => {
    setIsLoading(true);
    try {
      console.log(`🎭 Loading ${months} months of mock data...`);
      
      const mockData = await loadMockDataToStorage(months);
      updateMockStats();
      
      // Trigger custom refresh event for same-tab updates
      window.dispatchEvent(new CustomEvent('refreshTransactions'));
      window.dispatchEvent(new CustomEvent('refreshBudgets'));
      
      // Small delay to ensure storage is written
      setTimeout(() => {
        if (onDataLoaded) {
          onDataLoaded(mockData);
        }
        console.log('✅ Mock data loaded successfully!');
      }, 100);
      
    } catch (error) {
      console.error('❌ Error loading mock data:', error);
      alert('Error loading mock data. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      setIsLoading(true);
      try {
        clearMockData();
        updateMockStats();
        
        console.log('🗑️ Data cleared successfully!');
        
        // Force page reload to refresh all components
        window.location.reload();
        
      } catch (error) {
        console.error('❌ Error clearing data:', error);
        alert('Error clearing data. Check console for details.');
        setIsLoading(false);
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Don't show in production
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-colors"
        title="Developer Panel"
      >
        <FontAwesomeIcon icon={faCode} className="w-5 h-5" />
      </button>

      {/* Developer Panel */}
      {showPanel && (
        <div className="absolute bottom-16 right-0 w-96 max-w-screen-sm">
          <Card
            title="🛠️ Developer Panel"
            className="shadow-xl border-2 border-purple-200"
            headerAction={
              <button
                onClick={() => setShowPanel(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            }
          >
            <div className="p-4 space-y-4">
              {/* Current Data Status */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <FontAwesomeIcon icon={faDatabase} className="mr-2 text-blue-600" />
                  Current Data Status
                </h4>
                
                {mockStats?.hasData ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-green-600">
                      <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                      <span>Mock data loaded</span>
                    </div>
                    <div className="text-gray-600">
                      📊 {mockStats.transactionCount} transactions
                    </div>
                    <div className="text-gray-600">
                      🎯 {mockStats.budgetCount} budgets
                    </div>
                    {mockStats.metadata?.generatedAt && (
                      <div className="text-gray-500 text-xs">
                        Generated: {new Date(mockStats.metadata.generatedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center text-orange-600 text-sm">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                    <span>No mock data loaded</span>
                  </div>
                )}
              </div>

              {/* Mock Data Controls */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <FontAwesomeIcon icon={faChartBar} className="mr-2 text-purple-600" />
                  Mock Data Generator
                </h4>
                
                {/* Month Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Months of Data:
                  </label>
                  <select
                    value={selectedMonths}
                    onChange={(e) => setSelectedMonths(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500"
                    disabled={isLoading}
                  >
                    <option value={1}>1 Month</option>
                    <option value={2}>2 Months</option>
                    <option value={3}>3 Months</option>
                    <option value={4}>4 Months (Default)</option>
                    <option value={6}>6 Months</option>
                    <option value={12}>12 Months</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleLoadMockData()}
                    disabled={isLoading}
                    icon={faDownload}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isLoading ? 'Loading...' : 'Load Data'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearData}
                    disabled={isLoading || !mockStats?.hasData}
                    icon={faTrash}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    Clear All
                  </Button>
                </div>

                {/* Quick Load Presets */}
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600 mb-2">Quick Load:</p>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={() => handleLoadMockData(3)}
                      disabled={isLoading}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                    >
                      3M Demo
                    </button>
                    <button
                      onClick={() => handleLoadMockData(6)}
                      disabled={isLoading}
                      className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                    >
                      6M Full
                    </button>
                    <button
                      onClick={() => handleLoadMockData(12)}
                      disabled={isLoading}
                      className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50"
                    >
                      1Y Max
                    </button>
                  </div>
                </div>
              </div>

              {/* Refresh Button */}
              <div className="pt-2 border-t border-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.reload()}
                  icon={faRefresh}
                  className="w-full text-gray-600 hover:text-gray-800"
                >
                  Refresh App
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DeveloperPanel;