import React, { useState, useEffect, useCallback } from 'react';
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
  faLightbulb,
  faExclamationTriangle,
  faCheck,
  faRobot
} from '@fortawesome/free-solid-svg-icons';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { useTransactions } from '../../../controller/hooks/useTransactions';
import { useCategories } from '../../../controller/hooks/useCategories';
import { DEFAULT_CATEGORIES } from '../../../controller/utils/constants';
import { formatCurrencyInput, formatDateInput, formatCurrency } from '../../../controller/utils/formatters';
import TransactionService from '../../../model/services/TransactionService';

const AdvancedTransactionForm = ({ 
  transaction = null, 
  isOpen = true,
  onSave = () => {},
  onCancel = () => {},
  className = ''
}) => {
  // Hooks
  const { 
    createTransaction, 
    updateTransaction, 
    isCreatingTransaction, 
    isUpdatingTransaction,
    hasCreateError,
    hasUpdateError,
    getError,
    transactions
  } = useTransactions();

  const { categories } = useCategories();

  // Form state
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState({});
  const [suggestions, setSuggestions] = useState({
    categories: [],
    descriptions: [],
    categorySuggestion: null
  });
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Determine if editing
  const isEditing = Boolean(transaction);
  const isLoading = isCreatingTransaction || isUpdatingTransaction;

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
    setErrors({});
    setSuggestions(prev => ({ ...prev, categorySuggestion: null }));
    setDuplicateWarning(null);
  }, [transaction]);

  // Update category suggestions when type changes
  useEffect(() => {
    const availableCategories = categories.length > 0 
      ? categories.filter(cat => cat.type === formData.type)
      : DEFAULT_CATEGORIES[formData.type] || [];
    
    setSuggestions(prev => ({
      ...prev,
      categories: availableCategories
    }));
  }, [formData.type, categories]);

  // Auto-categorization when description changes
  const suggestCategory = useCallback(async (description) => {
    if (!description || description.length < 3) {
      setSuggestions(prev => ({ ...prev, categorySuggestion: null }));
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const suggestion = await TransactionService.suggestCategory(description, formData.amount);
      if (suggestion.confidence > 0.5) {
        setSuggestions(prev => ({
          ...prev,
          categorySuggestion: suggestion
        }));
      }
    } catch (error) {
      console.error('Error getting category suggestion:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [formData.amount]);

  // Check for duplicates
  const checkForDuplicates = useCallback(async () => {
    if (!formData.description || !formData.amount || !formData.date) {
      setDuplicateWarning(null);
      return;
    }

    const potentialDuplicates = transactions.filter(t => {
      if (isEditing && t.id === transaction.id) return false;
      
      const isSameAmount = Math.abs(parseFloat(t.amount) - parseFloat(formData.amount)) < 0.01;
      const isSameDescription = t.description.toLowerCase() === formData.description.toLowerCase();
      const transactionDate = new Date(t.date);
      const formDate = new Date(formData.date);
      const daysDiff = Math.abs(transactionDate - formDate) / (1000 * 60 * 60 * 24);
      
      return isSameAmount && isSameDescription && daysDiff <= 1;
    });

    if (potentialDuplicates.length > 0) {
      setDuplicateWarning({
        count: potentialDuplicates.length,
        transactions: potentialDuplicates.slice(0, 3)
      });
    } else {
      setDuplicateWarning(null);
    }
  }, [formData, transactions, isEditing, transaction]);

  // Debounced effects
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.description && formData.description.length >= 3) {
        suggestCategory(formData.description);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.description, suggestCategory]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkForDuplicates();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [formData.description, formData.amount, formData.date, checkForDuplicates]);

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    // Amount validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (parseFloat(formData.amount) > 1000000) {
      newErrors.amount = 'Amount cannot exceed $1,000,000';
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length > 100) {
      newErrors.description = 'Description cannot exceed 100 characters';
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    // Date validation
    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      const fiveYearsAgo = new Date();
      fiveYearsAgo.setFullYear(today.getFullYear() - 5);

      if (selectedDate > today) {
        newErrors.date = 'Date cannot be in the future';
      } else if (selectedDate < fiveYearsAgo) {
        newErrors.date = 'Date cannot be more than 5 years ago';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Apply category suggestion
  const applyCategorySuggestion = () => {
    if (suggestions.categorySuggestion) {
      handleInputChange('category', suggestions.categorySuggestion.category);
      setSuggestions(prev => ({ ...prev, categorySuggestion: null }));
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
        onSave(result);
        // Reset form if creating new transaction
        if (!isEditing) {
          setFormData({
            type: 'expense',
            amount: '',
            description: '',
            category: '',
            date: new Date().toISOString().split('T')[0]
          });
          setSuggestions(prev => ({ ...prev, categorySuggestion: null }));
          setDuplicateWarning(null);
        }
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
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
    setErrors({});
    setSuggestions(prev => ({ ...prev, categorySuggestion: null }));
    setDuplicateWarning(null);
    onCancel();
  };

  // Get current error message
  const getCurrentError = () => {
    if (hasCreateError) return getError('create');
    if (hasUpdateError) return getError('update');
    return null;
  };

  if (!isOpen) return null;

  return (
    <Card 
      className={className}
      title={
        <div className="flex items-center space-x-2">
          <FontAwesomeIcon icon={faExchangeAlt} className="text-blue-600" />
          <span>{isEditing ? 'Edit Transaction' : 'Add New Transaction'}</span>
          <div className="flex items-center space-x-2 ml-auto">
            <FontAwesomeIcon icon={faLightbulb} className="text-gray-400" />
            <span className="text-xs text-gray-500">Smart Features</span>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Display */}
        {getCurrentError() && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faTimes} className="text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{getCurrentError()}</span>
            </div>
          </div>
        )}

        {/* Duplicate Warning */}
        {duplicateWarning && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500 mr-2 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">
                  Potential Duplicate Transaction
                </h4>
                <p className="text-sm text-yellow-700 mb-3">
                  Found {duplicateWarning.count} similar transaction(s):
                </p>
                <div className="space-y-2">
                  {duplicateWarning.transactions.map(dup => (
                    <div key={dup.id} className="text-xs bg-yellow-100 rounded p-2">
                      <div className="font-medium">{dup.description}</div>
                      <div className="text-yellow-600">
                        {formatCurrency(dup.amount)} • {new Date(dup.date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
              onClick={() => handleInputChange('type', 'income')}
              className={`p-4 rounded-lg border-2 transition-colors ${
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
              onClick={() => handleInputChange('type', 'expense')}
              className={`p-4 rounded-lg border-2 transition-colors ${
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
          error={errors.amount}
          required
          icon={faDollarSign}
          iconPosition="left"
        />

        {/* Description */}
        <div>
          <Input
            label="Description"
            type="text"
            placeholder="Enter transaction description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            error={errors.description}
            required
            icon={faFileText}
            iconPosition="left"
          />
          {isLoadingSuggestions && (
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
              Analyzing description for smart suggestions...
            </div>
          )}
        </div>

        {/* Category Suggestion */}
        {suggestions.categorySuggestion && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <FontAwesomeIcon icon={faLightbulb} className="text-blue-500 mr-2 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-800 mb-2">
                  Smart Category Suggestion
                </h4>
                <p className="text-sm text-blue-700 mb-3">
                  Based on your transaction history, we suggest: <strong>{suggestions.categorySuggestion.category}</strong>
                  <span className="text-xs ml-2">
                    ({Math.round(suggestions.categorySuggestion.confidence * 100)}% match)
                  </span>
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={applyCategorySuggestion}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <FontAwesomeIcon icon={faCheck} className="mr-2" />
                  Apply Suggestion
                </Button>
              </div>
            </div>
          </div>
        )}

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
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Select a category</option>
              {suggestions.categories.map((category) => (
                <option key={category.name || category} value={category.name || category}>
                  {category.name || category}
                </option>
              ))}
            </select>
          </div>
          {errors.category && (
            <p className="mt-2 text-sm text-red-600">{errors.category}</p>
          )}
        </div>

        {/* Date */}
        <Input
          label="Date"
          type="date"
          value={formData.date}
          onChange={(e) => handleInputChange('date', e.target.value)}
          error={errors.date}
          required
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
            disabled={isLoading}
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

export default AdvancedTransactionForm;