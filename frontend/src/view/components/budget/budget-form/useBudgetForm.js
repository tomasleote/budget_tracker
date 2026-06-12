import { useState, useEffect } from 'react';
import { useBudgets } from '../../../../controller/hooks/useBudgets';
import { useCategories } from '../../../../controller/hooks/useCategories';
import { DEFAULT_CATEGORIES } from '../../../../controller/utils/constants';
import { formatCurrencyInput } from '../../../../controller/utils/formatters';

const EMPTY_FORM = () => ({
  category: '',
  budgetAmount: '',
  period: 'monthly',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  description: '',
  alertThreshold: '80'
});

const computeEndDate = (startDate, period) => {
  const start = new Date(startDate);
  const end = new Date(start);
  switch (period) {
    case 'weekly':
      end.setDate(start.getDate() + 6);
      break;
    case 'monthly':
      end.setMonth(start.getMonth() + 1);
      end.setDate(end.getDate() - 1);
      break;
    case 'quarterly':
      end.setMonth(start.getMonth() + 3);
      end.setDate(end.getDate() - 1);
      break;
    case 'yearly':
      end.setFullYear(start.getFullYear() + 1);
      end.setDate(end.getDate() - 1);
      break;
    default:
      return null;
  }
  return end.toISOString().split('T')[0];
};

const validateForm = (formData) => {
  const errors = {};

  if (!formData.category) {
    errors.category = 'Category is required';
  }

  if (!formData.budgetAmount || parseFloat(formData.budgetAmount) <= 0) {
    errors.budgetAmount = 'Budget amount must be greater than 0';
  } else if (parseFloat(formData.budgetAmount) > 1000000) {
    errors.budgetAmount = 'Budget amount cannot exceed $1,000,000';
  }

  if (!formData.period) {
    errors.period = 'Budget period is required';
  }

  if (!formData.startDate) {
    errors.startDate = 'Start date is required';
  } else {
    const startDate = new Date(formData.startDate);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    if (startDate < oneYearAgo) {
      errors.startDate = 'Start date cannot be more than 1 year ago';
    } else if (startDate > oneYearFromNow) {
      errors.startDate = 'Start date cannot be more than 1 year from now';
    }
  }

  if (formData.alertThreshold && (parseFloat(formData.alertThreshold) < 1 || parseFloat(formData.alertThreshold) > 100)) {
    errors.alertThreshold = 'Alert threshold must be between 1% and 100%';
  }

  if (formData.description && formData.description.length > 200) {
    errors.description = 'Description cannot exceed 200 characters';
  }

  return errors;
};

export const useBudgetForm = (budget, onSave, onCancel) => {
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

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  const isEditing = Boolean(budget);
  const isLoading = isCreatingBudget || isUpdatingBudget;

  const availableCategories = categories.length > 0
    ? categories.filter(cat => cat.type === 'expense')
    : DEFAULT_CATEGORIES.expense || [];

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
      setFormData(EMPTY_FORM());
    }
    setErrors({});
  }, [budget]);

  useEffect(() => {
    if (formData.startDate && formData.period) {
      const endDate = computeEndDate(formData.startDate, formData.period);
      if (endDate) {
        setFormData(prev => ({ ...prev, endDate }));
      }
    }
  }, [formData.startDate, formData.period]);

  const handleInputChange = (field, value) => {
    const resolved = field === 'budgetAmount' ? formatCurrencyInput(value) : value;
    setFormData(prev => ({ ...prev, [field]: resolved }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm(formData);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const budgetData = {
        ...formData,
        budgetAmount: parseFloat(formData.budgetAmount),
        alertThreshold: parseFloat(formData.alertThreshold) || 80,
        description: formData.description.trim()
      };

      const result = isEditing
        ? await updateBudget(budget.id, budgetData)
        : await createBudget(budgetData);

      if (result) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        onSave(result);
        if (!isEditing) {
          setFormData(EMPTY_FORM());
        }
      }
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  const handleCancel = () => {
    if (!isEditing) {
      setFormData(EMPTY_FORM());
    }
    setErrors({});
    onCancel();
  };

  const getCurrentError = () => {
    if (hasCreateError) return getError('create');
    if (hasUpdateError) return getError('update');
    return null;
  };

  return {
    formData,
    errors,
    showSuccess,
    isEditing,
    isLoading,
    availableCategories,
    handleInputChange,
    handleSubmit,
    handleCancel,
    getCurrentError
  };
};
