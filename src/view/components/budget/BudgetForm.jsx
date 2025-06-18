import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDollarSign, 
  faCalendarAlt, 
  faTag,
  faWallet,
  faSave,
  faTimes,
  faSpinner,
  faCheckCircle,
  faExclamationTriangle,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { useBudgets } from '../../../controller/hooks/useBudgets';
import { useCategories } from '../../../controller/hooks/useCategories';
import { DEFAULT_CATEGORIES } from '../../../controller/utils/constants';
import { formatCurrencyInput } from '../../../controller/utils/formatters';

const BudgetForm = ({ 
  budget = null, 
  isOpen = true,
  onSave = () => {},
  onCancel = () => {},
  className = ''
}) => {
  // Hooks
  const { 
    createBudget, 
    updateBudget, 
    isCreatingBudget, 
    isUpdatingBudget,
    hasCreateError,
    hasUpdateError,
    getError
  } = useBudgets();

  const { categories } = useCategories();

  // Form state
  const [formData, setFormData] = useState({
    category: '',
    budgetAmount: '',
    period: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    description: '',
    alertThreshold: '80'
  });

  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Determine if editing
  const isEditing = Boolean(budget);
  const isLoading = isCreatingBudget || isUpdatingBudget;

  // Initialize form data when budget prop changes
  useEffect(() => {
    if (budget) {
      setFormData({
        category: budget.category || '',
        budgetAmount: budget.budgetAmount?.toString() || '',
        period: budget.period || 'monthly',
        startDate: budget.startDate ? new Date(budget.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: budget.endDate ? new Date(budget.endDate).toISOString().split('T')[0] : '',
        description: budget.description || '',
        alertThreshold: budget.alertThreshold?.toString() || '80'
      });
    } else {
      // Reset form for new budget
      setFormData({
        category: '',
        budgetAmount: '',
        period: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        description: '',
        alertThreshold: '80'
      });
    }
    setErrors({});
  }, [budget]);

  // Auto-calculate end date based on period and start date
  useEffect(() => {
    if (formData.startDate && formData.period) {
      const startDate = new Date(formData.startDate);
      let endDate = new Date(startDate);

      switch (formData.period) {
        case 'weekly':
          endDate.setDate(startDate.getDate() + 6);
          break;
        case 'monthly':
          endDate.setMonth(startDate.getMonth() + 1);
          endDate.setDate(endDate.getDate() - 1);
          break;
        case 'quarterly':
          endDate.setMonth(startDate.getMonth() + 3);
          endDate.setDate(endDate.getDate() - 1);
          break;
        case 'yearly':
          endDate.setFullYear(startDate.getFullYear() + 1);
          endDate.setDate(endDate.getDate() - 1);
          break;
        default:
          return;
      }

      setFormData(prev => ({
        ...prev,
        endDate: endDate.toISOString().split('T')[0]
      }));
    }
  }, [formData.startDate, formData.period]);

  // Get available categories (expense categories only for budgets)
  const availableCategories = categories.length > 0 
    ? categories.filter(cat => cat.type === 'expense')
    : DEFAULT_CATEGORIES.expense || [];

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    // Category validation
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    // Budget amount validation
    if (!formData.budgetAmount || parseFloat(formData.budgetAmount) <= 0) {
      newErrors.budgetAmount = 'Budget amount must be greater than 0';
    } else if (parseFloat(formData.budgetAmount) > 1000000) {
      newErrors.budgetAmount = 'Budget amount cannot exceed $1,000,000';
    }

    // Period validation
    if (!formData.period) {
      newErrors.period = 'Budget period is required';
    }

    // Start date validation
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    } else {
      const startDate = new Date(formData.startDate);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

      if (startDate < oneYearAgo) {
        newErrors.startDate = 'Start date cannot be more than 1 year ago';
      } else if (startDate > oneYearFromNow) {
        newErrors.startDate = 'Start date cannot be more than 1 year from now';
      }
    }

    // Alert threshold validation
    if (formData.alertThreshold && (parseFloat(formData.alertThreshold) < 1 || parseFloat(formData.alertThreshold) > 100)) {
      newErrors.alertThreshold = 'Alert threshold must be between 1% and 100%';
    }

    // Description validation
    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'Description cannot exceed 200 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    if (field === 'budgetAmount') {
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
      const budgetData = {
        ...formData,
        budgetAmount: parseFloat(formData.budgetAmount),
        alertThreshold: parseFloat(formData.alertThreshold) || 80,
        description: formData.description.trim()
      };

      let result;
      if (isEditing) {
        result = await updateBudget(budget.id, budgetData);
      } else {
        result = await createBudget(budgetData);
      }

      if (result) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        onSave(result);
        
        // Reset form if creating new budget
        if (!isEditing) {
          setFormData({
            category: '',
            budgetAmount: '',
            period: 'monthly',
            startDate: new Date().toISOString().split('T')[0],
            endDate: '',
            description: '',
            alertThreshold: '80'
          });
        }
      }
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (!isEditing) {
      setFormData({
        category: '',
        budgetAmount: '',
        period: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        description: '',
        alertThreshold: '80'
      });
    }
    setErrors({});
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
          <FontAwesomeIcon icon={faWallet} className="text-blue-600" />
          <span>{isEditing ? 'Edit Budget' : 'Create New Budget'}</span>
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
                Budget {isEditing ? 'updated' : 'created'} successfully!
              </span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {getCurrentError() && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{getCurrentError()}</span>
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
              <option value="">Select a category to budget</option>
              {availableCategories.map((category) => (
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

        {/* Budget Amount */}
        <Input
          label="Budget Amount"
          type="text"
          placeholder="0.00"
          value={formData.budgetAmount}
          onChange={(e) => handleInputChange('budgetAmount', e.target.value)}
          error={errors.budgetAmount}
          required
          icon={faDollarSign}
          iconPosition="left"
        />

        {/* Budget Period */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Budget Period <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: 'weekly', label: 'Weekly', desc: '7 days' },
              { value: 'monthly', label: 'Monthly', desc: '1 month' },
              { value: 'quarterly', label: 'Quarterly', desc: '3 months' },
              { value: 'yearly', label: 'Yearly', desc: '12 months' }
            ].map((period) => (
              <button
                key={period.value}
                type="button"
                onClick={() => handleInputChange('period', period.value)}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  formData.period === period.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="font-medium text-sm">{period.label}</div>
                  <div className="text-xs text-gray-500">{period.desc}</div>
                </div>
              </button>
            ))}
          </div>
          {errors.period && (
            <p className="mt-2 text-sm text-red-600">{errors.period}</p>
          )}
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Date */}
          <Input
            label="Start Date"
            type="date"
            value={formData.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            error={errors.startDate}
            required
            icon={faCalendarAlt}
            iconPosition="left"
          />

          {/* End Date (auto-calculated, read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <div className="relative">
              <FontAwesomeIcon 
                icon={faCalendarAlt} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" 
              />
              <input
                type="date"
                value={formData.endDate}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                readOnly
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Auto-calculated based on period and start date
            </p>
          </div>
        </div>

        {/* Alert Threshold */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alert Threshold
          </label>
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="80"
                value={formData.alertThreshold}
                onChange={(e) => handleInputChange('alertThreshold', e.target.value)}
                error={errors.alertThreshold}
                min="1"
                max="100"
              />
            </div>
            <span className="text-gray-500 text-sm">%</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Get notified when spending reaches this percentage of your budget
          </p>
          {errors.alertThreshold && (
            <p className="mt-2 text-sm text-red-600">{errors.alertThreshold}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            placeholder="Add notes about this budget..."
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            rows="3"
            maxLength="200"
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-gray-500">
              Optional notes about this budget
            </p>
            <p className="text-xs text-gray-500">
              {formData.description.length}/200
            </p>
          </div>
          {errors.description && (
            <p className="mt-2 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        {/* Budget Preview */}
        {formData.budgetAmount && formData.period && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600" />
              <h4 className="font-medium text-blue-900">Budget Preview</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Category:</span>
                <span className="font-medium text-blue-900">{formData.category || 'Not selected'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Amount:</span>
                <span className="font-medium text-blue-900">${parseFloat(formData.budgetAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Period:</span>
                <span className="font-medium text-blue-900">{formData.period}</span>
              </div>
              {formData.startDate && formData.endDate && (
                <div className="flex justify-between">
                  <span className="text-blue-700">Duration:</span>
                  <span className="font-medium text-blue-900">
                    {new Date(formData.startDate).toLocaleDateString()} - {new Date(formData.endDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

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
                {isEditing ? 'Update Budget' : 'Create Budget'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default BudgetForm;