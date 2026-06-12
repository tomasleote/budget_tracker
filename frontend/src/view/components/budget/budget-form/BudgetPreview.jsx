import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const BudgetPreview = ({ formData }) => {
  if (!formData.budgetAmount || !formData.period) return null;

  return (
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
  );
};

export default BudgetPreview;
