/**
 * Backend Status Component
 * Shows current backend connection status and allows manual testing
 */

import React, { useState, useEffect } from 'react';
import { BackendConnectionTester } from '../config/connectionTest.js';
import { config, configHelpers } from '../config/environment.js';

const BackendStatus = () => {
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [testResults, setTestResults] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isRunningTest, setIsRunningTest] = useState(false);

  useEffect(() => {
    // Run initial connection test
    runConnectionTest();
  }, []);

  const runConnectionTest = async () => {
    setIsRunningTest(true);
    setConnectionStatus('checking');
    
    try {
      const results = await BackendConnectionTester.runFullTest();
      setTestResults(results);
      setConnectionStatus(results.success ? 'connected' : 'disconnected');
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus('error');
      setTestResults({ 
        success: false, 
        error: error.message,
        message: 'Failed to run connection test'
      });
    } finally {
      setIsRunningTest(false);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'disconnected': return 'text-red-600 bg-red-100';
      case 'checking': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return '✅';
      case 'disconnected': return '❌';
      case 'checking': return '🔄';
      case 'error': return '⚠️';
      default: return '❓';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Backend Connected';
      case 'disconnected': return 'Backend Disconnected';
      case 'checking': return 'Checking Connection...';
      case 'error': return 'Connection Error';
      default: return 'Unknown Status';
    }
  };

  if (!configHelpers.isDevelopment()) {
    return null; // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`px-4 py-2 rounded-lg shadow-lg border ${getStatusColor()}`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{getStatusIcon()}</span>
          <span className="font-medium">{getStatusText()}</span>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="ml-2 text-sm underline hover:no-underline"
          >
            {showDetails ? 'Hide' : 'Details'}
          </button>
          
          <button
            onClick={runConnectionTest}
            disabled={isRunningTest}
            className="ml-2 px-2 py-1 text-xs bg-white rounded border hover:bg-gray-50 disabled:opacity-50"
          >
            {isRunningTest ? 'Testing...' : 'Test'}
          </button>
        </div>

        {showDetails && (
          <div className="mt-3 p-3 bg-white rounded border text-xs text-gray-800 max-w-md">
            <div className="space-y-2">
              <div>
                <strong>Configuration:</strong>
                <div className="ml-2">
                  <div>API Mode: {config.api.enabled ? '✅ Enabled' : '❌ Disabled'}</div>
                  <div>API URL: {config.api.baseUrl}</div>
                  <div>Debug: {config.development.isDebug ? '✅ On' : '❌ Off'}</div>
                </div>
              </div>

              {testResults && (
                <div>
                  <strong>Test Results:</strong>
                  <div className="ml-2">
                    <div>Duration: {testResults.duration}</div>
                    <div>Success: {testResults.success ? '✅' : '❌'}</div>
                    
                    {testResults.results && (
                      <div className="mt-1">
                        <div>Health: {testResults.results.health?.success ? '✅' : '❌'}</div>
                        <div>Categories: {testResults.results.categories?.success ? '✅' : '❌'}</div>
                        <div>Transactions: {testResults.results.transactions?.success ? '✅' : '❌'}</div>
                        <div>Budgets: {testResults.results.budgets?.success ? '✅' : '❌'}</div>
                      </div>
                    )}

                    {testResults.error && (
                      <div className="mt-1 text-red-600">
                        Error: {testResults.error}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t">
                <div className="text-xs text-gray-500">
                  Backend should be running on localhost:3001
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackendStatus;
