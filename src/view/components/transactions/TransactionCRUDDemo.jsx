import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle,
  faDatabase,
  faPlug,
  faCode,
  faRocket
} from '@fortawesome/free-solid-svg-icons';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { 
  EnhancedTransactionList,
  TransactionCRUDManager,
  EnhancedTransactionForm,
  useTransactionOperations
} from '../transactions';

const TransactionCRUDDemo = ({ className = '' }) => {
  const [activeDemo, setActiveDemo] = useState('list');
  const [showTestForm, setShowTestForm] = useState(false);

  // Test the operations hook
  const {
    transactions,
    summary,
    isCreating,
    isUpdating,
    isDeleting,
    getOperationStatus
  } = useTransactionOperations({
    onSuccess: (operation, result) => {
      console.log(`✅ ${operation} successful:`, result);
    },
    onError: (operation, error) => {
      console.error(`❌ ${operation} failed:`, error);
    }
  });

  const operationStatus = getOperationStatus();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* CRUD Implementation Status */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <FontAwesomeIcon icon={faRocket} className="text-green-600 text-xl" />
            <h2 className="text-xl font-bold text-gray-900">
              ✅ Transaction CRUD Operations - Complete!
            </h2>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-3">Implementation Summary:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                  <span className="text-green-800">✅ Enhanced Form Validation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                  <span className="text-green-800">✅ Real-time Error Handling</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                  <span className="text-green-800">✅ Loading States & Feedback</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                  <span className="text-green-800">✅ Success Notifications</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                  <span className="text-green-800">✅ Bulk Operations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                  <span className="text-green-800">✅ Advanced Filtering</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                  <span className="text-green-800">✅ Smart Form Features</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                  <span className="text-green-800">✅ Backend-Ready Architecture</span>
                </div>
              </div>
            </div>
          </div>

          {/* Backend Migration Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <FontAwesomeIcon icon={faDatabase} className="text-blue-600" />
              <h4 className="font-semibold text-blue-900">Backend Migration Ready</h4>
            </div>
            <div className="space-y-2 text-blue-800 text-sm">
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faPlug} className="text-blue-600" />
                <span>✅ Repository Pattern - Easy to swap localStorage for API calls</span>
              </div>
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faCode} className="text-blue-600" />
                <span>✅ Service Layer - Business logic separated from data access</span>
              </div>
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faPlug} className="text-blue-600" />
                <span>✅ Hook Abstraction - UI doesn't know about storage implementation</span>
              </div>
            </div>
          </div>

          {/* Current Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{transactions.length}</div>
              <div className="text-sm text-gray-600">Total Transactions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.formattedIncome}</div>
              <div className="text-sm text-gray-600">Total Income</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{summary.formattedExpenses}</div>
              <div className="text-sm text-gray-600">Total Expenses</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                summary.isPositiveBalance ? 'text-green-600' : 'text-red-600'
              }`}>
                {summary.formattedBalance}
              </div>
              <div className="text-sm text-gray-600">Balance</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Demo Controls */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Live Demo Controls</h3>
          <div className="flex flex-wrap gap-3">
            <Button
              variant={activeDemo === 'list' ? 'primary' : 'outline'}
              onClick={() => setActiveDemo('list')}
            >
              Enhanced List View
            </Button>
            <Button
              variant={activeDemo === 'crud' ? 'primary' : 'outline'}
              onClick={() => setActiveDemo('crud')}
            >
              CRUD Manager
            </Button>
            <Button
              variant={showTestForm ? 'primary' : 'outline'}
              onClick={() => setShowTestForm(!showTestForm)}
            >
              Test Form
            </Button>
          </div>

          {/* Operation Status */}
          {operationStatus.isAnyOperationPending && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-blue-800 text-sm">
                🔄 Operation in progress...
                {isCreating && ' Creating transaction'}
                {isUpdating && ' Updating transaction'}
                {isDeleting && ' Deleting transaction'}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Test Form */}
      {showTestForm && (
        <EnhancedTransactionForm
          onSave={(result) => {
            console.log('Form saved:', result);
            setShowTestForm(false);
          }}
          onCancel={() => setShowTestForm(false)}
        />
      )}

      {/* Active Demo */}
      {activeDemo === 'list' && (
        <EnhancedTransactionList
          showCRUDControls={true}
          showFilters={true}
          showSearch={true}
          onTransactionChange={(operation, data) => {
            console.log(`Demo: ${operation}`, data);
          }}
        />
      )}

      {activeDemo === 'crud' && (
        <Card>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">CRUD Manager Component</h3>
            <TransactionCRUDManager
              onTransactionChange={(operation, data) => {
                console.log(`CRUD Manager: ${operation}`, data);
              }}
              showNotifications={true}
            />
          </div>
        </Card>
      )}

      {/* Architecture Summary */}
      <Card className="bg-gray-50">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Architecture Overview</h3>
          <div className="text-sm text-gray-700">
            <div className="mb-4">
              <strong>Current Data Flow:</strong>
            </div>
            <div className="bg-white rounded p-3 font-mono text-xs">
              UI Forms → useTransactionOperations → TransactionService → TransactionRepository → StorageService → LocalStorage
            </div>
            <div className="mt-4 mb-2">
              <strong>To Add Backend (Future):</strong>
            </div>
            <div className="bg-white rounded p-3 font-mono text-xs">
              UI Forms → useTransactionOperations → TransactionService → <span className="bg-yellow-200">APIRepository</span> → <span className="bg-yellow-200">HTTP Client</span> → <span className="bg-yellow-200">Backend API</span>
            </div>
            <div className="mt-3 text-xs text-gray-600">
              ✅ Only the Repository layer needs to change - all UI and business logic stays the same!
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TransactionCRUDDemo;