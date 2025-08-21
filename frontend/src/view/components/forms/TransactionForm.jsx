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
  faArrowUp,
  faArrowDown
} from '@fortawesome/free-solid-svg-icons';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { useTransactions } from '../../../controller/hooks/useTransactions';
import { useCategories } from '../../../controller/hooks/useCategories';
import { DEFAULT_CATEGORIES } from '../../../controller/utils/constants';
import { formatCurrencyInput, formatDateInput } from '../../../controller/utils/formatters';

const TransactionForm = ({ 
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
    hasError,
    getError
  } = useTransactions();

  const { categories } = useCategories();

  // Form state
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    description: '',
    categoryId: '', // Changed from 'category' to 'categoryId'
    date: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState({});
  const [suggestions, setSuggestions] = useState({
    categories: [],
    descriptions: []
  });

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
        categoryId: transaction.categoryId || transaction.category_id || '', // Handle both formats
        date: formatDateInput(transaction.date) || new Date().toISOString().split('T')[0]
      });
    } else {
      // Reset form for new transaction
      setFormData({
        type: 'expense',
        amount: '',
        description: '',
        categoryId: '', // Changed from 'category' to 'categoryId'
        date: new Date().toISOString().split('T')[0]
      });
    }
    setErrors({});
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
    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required'; // Changed field name
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
            categoryId: '', // Changed from 'category' to 'categoryId'
            date: new Date().toISOString().split('T')[0]
          });
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
        categoryId: '', // Changed from 'category' to 'categoryId'
        date: new Date().toISOString().split('T')[0]
      });
    }
    setErrors({});
    onCancel();
  };

  // Get current error message
  const getCurrentError = () => {
    if (hasError('create')) return getError('create');
    if (hasError('update')) return getError('update');
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
                  icon={faArrowUp} 
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
                  icon={faArrowDown} 
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
              value={formData.categoryId} // Changed from 'category' to 'categoryId'
              onChange={(e) => handleInputChange('categoryId', e.target.value)} // Changed field name
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.categoryId ? 'border-red-500' : 'border-gray-300' // Changed error field
              }`}
              required
            >
              <option value="">Select a category</option>
              {suggestions.categories.map((category) => (
                <option key={category.id || category.name || category} value={category.id || category.name || category}>
                  {category.name || category}
                </option>
              ))}
            </select>
          </div>
          {errors.categoryId && ( // Changed error field
            <p className="mt-2 text-sm text-red-600">{errors.categoryId}</p>
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

export default TransactionForm;