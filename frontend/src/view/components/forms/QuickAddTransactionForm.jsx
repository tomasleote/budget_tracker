import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDollarSign, 
  faFileText, 
  faTag,
  faPlus,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useTransactions } from '../../../controller/hooks/useTransactions';
import { useCategories } from '../../../controller/hooks/useCategories';
import { DEFAULT_CATEGORIES } from '../../../controller/utils/constants';
import { formatCurrencyInput } from '../../../controller/utils/formatters';

const QuickAddTransactionForm = ({ 
  type = 'expense',
  onTransactionAdded = () => {},
  className = ''
}) => {
  // Hooks
  const { createTransaction, isCreatingTransaction } = useTransactions();
  const { categories } = useCategories();

  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: ''
  });

  const [errors, setErrors] = useState({});

  // Get available categories
  const availableCategories = categories.length > 0 
    ? categories.filter(cat => cat.type === type)
    : DEFAULT_CATEGORIES[type] || [];

  // Get common categories for quick selection
  const quickCategories = availableCategories.slice(0, 4);

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description required';
    }

    if (!formData.category) {
      newErrors.category = 'Category required';
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

  // Handle quick category selection
  const handleQuickCategory = (categoryName) => {
    handleInputChange('category', categoryName);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const transactionData = {
        type,
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        category: formData.category,
        date: new Date().toISOString()
      };

      const result = await createTransaction(transactionData);
      if (result) {
        // Reset form
        setFormData({
          amount: '',
          description: '',
          category: ''
        });
        setErrors({});
        onTransactionAdded(result);
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  const typeColor = type === 'income' ? 'green' : 'red';
  const typeIcon = type === 'income' ? 'fa-solid fa-arrow-up' : 'fa-solid fa-arrow-down';

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-2 mb-4">
        <div className={`p-2 rounded-lg bg-${typeColor}-100`}>
          <FontAwesomeIcon 
            icon={typeIcon} 
            className={`text-${typeColor}-600`} 
          />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">
            Quick Add {type === 'income' ? 'Income' : 'Expense'}
          </h3>
          <p className="text-xs text-gray-500">
            Add a new {type} transaction quickly
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount */}
        <Input
          type="text"
          placeholder="0.00"
          value={formData.amount}
          onChange={(e) => handleInputChange('amount', e.target.value)}
          error={errors.amount}
          icon={faDollarSign}
          iconPosition="left"
          size="sm"
        />

        {/* Description */}
        <Input
          type="text"
          placeholder="Description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          error={errors.description}
          icon={faFileText}
          iconPosition="left"
          size="sm"
        />

        {/* Quick Categories */}
        {quickCategories.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Quick Categories
            </label>
            <div className="grid grid-cols-2 gap-2">
              {quickCategories.map((category) => (
                <button
                  key={category.name || category}
                  type="button"
                  onClick={() => handleQuickCategory(category.name || category)}
                  className={`p-2 text-xs rounded-lg border transition-colors ${
                    formData.category === (category.name || category)
                      ? `border-${typeColor}-500 bg-${typeColor}-50 text-${typeColor}-700`
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {category.name || category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category Dropdown */}
        <div className="relative">
          <FontAwesomeIcon 
            icon={faTag} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" 
          />
          <select
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className={`w-full pl-8 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.category ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select category</option>
            {availableCategories.map((category) => (
              <option key={category.name || category} value={category.name || category}>
                {category.name || category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-xs text-red-600">{errors.category}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="sm"
          fullWidth
          disabled={isCreatingTransaction}
        >
          {isCreatingTransaction ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add {type === 'income' ? 'Income' : 'Expense'}
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default QuickAddTransactionForm;