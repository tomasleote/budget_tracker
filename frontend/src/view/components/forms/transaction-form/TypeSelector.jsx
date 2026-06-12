import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';

const TypeSelector = ({ value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-theme-primary mb-3">
      Transaction Type <span className="text-red-500">*</span>
    </label>
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => onChange('income')}
        className={`p-4 rounded-lg border-2 transition-colors ${
          value === 'income'
            ? 'border-green-500 bg-green-50 text-green-700'
            : 'border-theme-primary bg-theme-primary text-theme-secondary'
        }`}
      >
        <div className="text-center">
          <FontAwesomeIcon
            icon={faArrowUp}
            className={`text-xl mb-2 ${value === 'income' ? 'text-green-600' : 'text-gray-400'}`}
          />
          <div className="font-medium">Income</div>
          <div className="text-xs text-gray-500">Money received</div>
        </div>
      </button>
      <button
        type="button"
        onClick={() => onChange('expense')}
        className={`p-4 rounded-lg border-2 transition-colors ${
          value === 'expense'
            ? 'border-red-500 bg-red-50 text-red-700'
            : 'border-theme-primary bg-theme-primary text-theme-secondary'
        }`}
      >
        <div className="text-center">
          <FontAwesomeIcon
            icon={faArrowDown}
            className={`text-xl mb-2 ${value === 'expense' ? 'text-red-600' : 'text-gray-400'}`}
          />
          <div className="font-medium">Expense</div>
          <div className="text-xs text-gray-500">Money spent</div>
        </div>
      </button>
    </div>
  </div>
);

export default TypeSelector;
