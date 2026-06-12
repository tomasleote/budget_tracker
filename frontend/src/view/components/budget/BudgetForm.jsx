import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWallet,
  faSave,
  faTimes,
  faSpinner,
  faCheckCircle,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { useBudgetForm } from './budget-form/useBudgetForm';
import {
  CategoryField,
  AmountField,
  PeriodField,
  DateRangeFields,
  AlertThresholdField,
  DescriptionField
} from './budget-form/BudgetFormFields';
import BudgetPreview from './budget-form/BudgetPreview';

const BudgetForm = ({
  budget = null,
  isOpen = true,
  onSave = () => {},
  onCancel = () => {},
  className = ''
}) => {
  const {
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
  } = useBudgetForm(budget, onSave, onCancel);

  if (!isOpen) return null;

  const currentError = getCurrentError();

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

        {currentError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{currentError}</span>
            </div>
          </div>
        )}

        <CategoryField
          value={formData.category}
          onChange={handleInputChange}
          error={errors.category}
          availableCategories={availableCategories}
        />

        <AmountField
          value={formData.budgetAmount}
          onChange={handleInputChange}
          error={errors.budgetAmount}
        />

        <PeriodField
          value={formData.period}
          onChange={handleInputChange}
          error={errors.period}
        />

        <DateRangeFields
          startDate={formData.startDate}
          endDate={formData.endDate}
          onStartChange={handleInputChange}
          errorStart={errors.startDate}
        />

        <AlertThresholdField
          value={formData.alertThreshold}
          onChange={handleInputChange}
          error={errors.alertThreshold}
        />

        <DescriptionField
          value={formData.description}
          onChange={handleInputChange}
          error={errors.description}
        />

        <BudgetPreview formData={formData} />

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
