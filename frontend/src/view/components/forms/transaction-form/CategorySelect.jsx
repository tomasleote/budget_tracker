import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTag } from '@fortawesome/free-solid-svg-icons';

const CategorySelect = ({ value, onChange, error, categories }) => (
  <div>
    <label className="block text-sm font-medium text-theme-primary mb-2">
      Category <span className="text-red-500">*</span>
    </label>
    <div className="relative">
      <FontAwesomeIcon
        icon={faTag}
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-secondary w-4 h-4"
      />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full pl-10 pr-4 py-3 border rounded-lg input-theme ${error ? 'input-error' : ''}`}
        required
      >
        <option value="">Select a category</option>
        {categories.map((category) => (
          <option key={category.id || category.name || category} value={category.id || category.name || category}>
            {category.name || category}
          </option>
        ))}
      </select>
    </div>
    {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
  </div>
);

export default CategorySelect;
