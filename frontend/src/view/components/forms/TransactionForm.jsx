import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDollarSign,
  faCalendarAlt,
  faFileText,
  faExchangeAlt,
  faSave,
  faTimes,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { useTransactions } from '../../../controller/hooks/useTransactions';
import { useCategories } from '../../../controller/hooks/useCategories';
import { DEFAULT_CATEGORIES } from '../../../controller/utils/constants';
import { formatCurrencyInput, formatDateInput } from '../../../controller/utils/formatters';
import TypeSelector from './transaction-form/TypeSelector';
import CategorySelect from './transaction-form/CategorySelect';
import validateTransactionForm from './transaction-form/validateTransactionForm';

const EMPTY_FORM = {
  type: 'expense',
  amount: '',
  description: '',
  categoryId: '',
  date: new Date().toISOString().split('T')[0]
};

const TransactionForm = ({
  transaction = null,
  isOpen = true,
  onSave = () => {},
  onCancel = () => {},
  className = ''
}) => {
  const {
    createTransaction,
    updateTransaction,
    isCreatingTransaction,
    isUpdatingTransaction,
    hasError,
    getError
  } = useTransactions();

  const { categories } = useCategories();

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [suggestions, setSuggestions] = useState({ categories: [], descriptions: [] });

  const isEditing = Boolean(transaction);
  const isLoading = isCreatingTransaction || isUpdatingTransaction;

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type || 'expense',
        amount: transaction.amount?.toString() || '',
        description: transaction.description || '',
        categoryId: transaction.categoryId || transaction.category_id || '',
        date: formatDateInput(transaction.date) || new Date().toISOString().split('T')[0]
      });
    } else {
      setFormData(EMPTY_FORM);
    }
    setErrors({});
  }, [transaction]);

  useEffect(() => {
    const availableCategories = categories.length > 0
      ? categories.filter(cat => cat.type === formData.type)
      : DEFAULT_CATEGORIES[formData.type] || [];

    setSuggestions(prev => ({ ...prev, categories: availableCategories }));
  }, [formData.type, categories]);

  const handleInputChange = (field, value) => {
    if (field === 'amount') {
      value = formatCurrencyInput(value);
    }
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateTransactionForm(formData);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
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

      if (result?.success) {
        onSave(result.data || result);
        if (!isEditing) {
          setFormData(EMPTY_FORM);
        }
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const handleCancel = () => {
    if (!isEditing) {
      setFormData(EMPTY_FORM);
    }
    setErrors({});
    onCancel();
  };

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
          <FontAwesomeIcon icon={faExchangeAlt} className="text-theme-accent" />
          <span>{isEditing ? 'Edit Transaction' : 'Add New Transaction'}</span>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {getCurrentError() && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faTimes} className="text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{getCurrentError()}</span>
            </div>
          </div>
        )}

        <TypeSelector value={formData.type} onChange={(v) => handleInputChange('type', v)} />

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

        <CategorySelect
          value={formData.categoryId}
          onChange={(v) => handleInputChange('categoryId', v)}
          error={errors.categoryId}
          categories={suggestions.categories}
        />

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

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-theme-primary">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
            <FontAwesomeIcon icon={faTimes} className="mr-2" />
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
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