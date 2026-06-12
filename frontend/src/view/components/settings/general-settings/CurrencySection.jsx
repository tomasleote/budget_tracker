import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign } from '@fortawesome/free-solid-svg-icons';
import { CURRENCY_CONFIG } from '../../../../controller/utils/constants';

const CurrencySection = ({ value, onChange }) => (
  <div className="card-theme border rounded-lg p-6">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Currency
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Select your default currency for all financial displays
        </p>
      </div>
      <FontAwesomeIcon icon={faDollarSign} className="text-xl" style={{ color: 'var(--success)' }} />
    </div>

    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
        Currency
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-theme w-full px-3 py-2 rounded-lg"
      >
        {CURRENCY_CONFIG.SUPPORTED.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.symbol} {currency.name} ({currency.code})
          </option>
        ))}
      </select>
    </div>
  </div>
);

export default CurrencySection;
