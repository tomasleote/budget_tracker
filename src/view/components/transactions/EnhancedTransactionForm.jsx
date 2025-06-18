import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDollarSign, 
  faCalendarAlt, 
  faFileText, 
  faTag,
  faExchangeAlt,
  faSave,
  faTimes,
  faSpinner,
  faCheckCircle,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { useCategories } from '../../../controller/hooks/useCategories';
import { DEFAULT_CATEGORIES } from '../../../controller/utils/constants';
import { formatCurrencyInput, formatDateInput } from '../../../controller/utils/formatters';
import useTransactionOperations from './useTransactionOperations';

const EnhancedTransactionForm = ({ 
  transaction = null, 
  isOpen = true,
  onSave = () => {},
  onCancel = () => {},
  showSuccessMessage = true,
  className = ''
}) => {
  // Enhanced operations hook with validation and error handling
  const {
    createTransaction,
    updateTransaction,
    isCreating,
    isUpdating,
    validationErrors,
    lastError,
    lastOperation,
    getOperationStatus,
    clearOperationState
  } = useTransactionOperations({
    onSuccess: (operation, result) => {
      if (showSuccessMessage) {
        console.log(`Transaction ${operation} successful:`, result);
      }
      onSave(result);
    },
    onError: (operation, error) => {
      console.error(`Transaction ${operation} failed:`, error);
    }
  });

  const { categories } = useCategories();

  // Form state
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [localErrors, setLocalErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Determine if editing
  const isEditing = Boolean(transaction);
  const isLoading = isCreating || isUpdating;

  // Initialize form data when transaction prop changes
  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type || 'expense',
        amount: transaction.amount?.toString() || '',
        description: transaction.description || '',
        category: transaction.category || '',
        date: formatDateInput(transaction.date) || new Date().toISOString().split('T')[0]
      });
    } else {
      // Reset form for new transaction
      setFormData({
        type: 'expense',
        amount: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
    setLocalErrors({});
    clearOperationState();
  }, [transaction, clearOperationState]);

  // Update category suggestions when type changes
  const availableCategories = categories.length > 0 
    ? categories.filter(cat => cat.type === formData.type)
    : DEFAULT_CATEGORIES[formData.type] || [];

  // Show success message effect
  useEffect(() => {
    if (lastOperation && (Date.now() - lastOperation.timestamp) < 1000) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastOperation]);

  // Combine validation errors
  const allErrors = { ...localErrors, ...validationErrors };

  // Local form validation
  const validateForm = () => {
    const errors = {};

    // Amount validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Amount must be greater than 0';
    } else if (parseFloat(formData.amount) > 1000000) {
      errors.amount = 'Amount cannot exceed $1,000,000';
    }

    // Description validation
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.trim().length > 100) {
      errors.description = 'Description cannot exceed 100 characters';
    }

    // Category validation
    if (!formData.category) {
      errors.category = 'Category is required';
    }

    // Date validation
    if (!formData.date) {
      errors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      const fiveYearsAgo = new Date();
      fiveYearsAgo.setFullYear(today.getFullYear() - 5);

      if (selectedDate > today) {
        errors.date = 'Date cannot be in the future';
      } else if (selectedDate < fiveYearsAgo) {
        errors.date = 'Date cannot be more than 5 years ago';
      }
    }

    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    if (field === 'amount') {
      value = formatCurrencyInput(value);
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (allErrors[field]) {
      setLocalErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        description: formData.description.trim()
      };

      let result;
      if (isEditing) {
        result = await updateTransaction(transaction.id, transactionData);
      } else {
        result = await createTransaction(transactionData);
      }

      if (result) {
        // Reset form if creating new transaction
        if (!isEditing) {
          setFormData({
            type: 'expense',
            amount: '',
            description: '',
            category: '',
            date: new Date().toISOString().split('T')[0]
          });
        }
      }
    } catch (error) {
      // Error is already handled by the operations hook
      console.error('Form submission error:', error);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (!isEditing) {
      setFormData({
        type: 'expense',
        amount: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
    setLocalErrors({});
    clearOperationState();
    onCancel();
  };

  // Get operation status
  const operationStatus = getOperationStatus();

  if (!isOpen) return null;

  return (
    <Card 
      className={className}
      title={
        <div className="flex items-center space-x-2">
          <FontAwesomeIcon icon={faExchangeAlt} className="text-blue-600" />
          <span>{isEditing ? 'Edit Transaction' : 'Add New Transaction'}</span>
          {operationStatus.isAnyOperationPending && (
            <FontAwesomeIcon icon={faSpinner} className="text-blue-600 animate-spin ml-auto" />
          )}
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Success Message */}
        {showSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mr-2" />
              <span className="text-green-700 text-sm">
                {isEditing ? 'Transaction updated successfully!' : 'Transaction created successfully!'}
              </span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {lastError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{lastError.message}</span>
            </div>
          </div>
        )}

        {/* Transaction Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Transaction Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleInputChange('type', 'income')}
              className={`p-4 rounded-lg border-2 transition-colors disabled:opacity-50 ${
                formData.type === 'income'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <FontAwesomeIcon 
                  icon="fa-solid fa-arrow-up" 
                  className={`text-xl mb-2 ${
                    formData.type === 'income' ? 'text-green-600' : 'text-gray-400'
                  }`} 
                />
                <div className="font-medium">Income</div>
                <div className="text-xs text-gray-500">Money received</div>
              </div>
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleInputChange('type', 'expense')}
              className={`p-4 rounded-lg border-2 transition-colors disabled:opacity-50 ${
                formData.type === 'expense'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <FontAwesomeIcon 
                  icon="fa-solid fa-arrow-down" 
                  className={`text-xl mb-2 ${
                    formData.type === 'expense' ? 'text-red-600' : 'text-gray-400'
                  }`} 
                />
                <div className="font-medium">Expense</div>
                <div className="text-xs text-gray-500">Money spent</div>
              </div>
            </button>
          </div>
        </div>

        {/* Amount */}
        <Input
          label="Amount"
          type="text"
          placeholder="0.00"
          value={formData.amount}
          onChange={(e) => handleInputChange('amount', e.target.value)}
          error={allErrors.amount}
          required
          disabled={isLoading}
          icon={faDollarSign}
          iconPosition="left"
        />

        {/* Description */}
        <Input
          label="Description"
          type="text"
          placeholder="Enter transaction description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          error={allErrors.description}
          required
          disabled={isLoading}
          icon={faFileText}
          iconPosition="left"
        />

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FontAwesomeIcon 
              icon={faTag} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" 
            />
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              disabled={isLoading}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:bg-gray-100 ${
                allErrors.category ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Select a category</option>
              {availableCategories.map((category) => (
                <option key={category.name || category} value={category.name || category}>
                  {category.name || category}
                </option>
              ))}
            </select>
          </div>
          {allErrors.category && (
            <p className="mt-2 text-sm text-red-600">{allErrors.category}</p>
          )}
        </div>

        {/* Date */}
        <Input
          label="Date"
          type="date"
          value={formData.date}
          onChange={(e) => handleInputChange('date', e.target.value)}
          error={allErrors.date}
          required
          disabled={isLoading}
          icon={faCalendarAlt}
          iconPosition="left"
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            <FontAwesomeIcon icon={faTimes} className="mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || operationStatus.isAnyOperationPending}
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                {isEditing ? 'Update Transaction' : 'Add Transaction'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default EnhancedTransactionForm;