import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faDesktop, faCheck } from '@fortawesome/free-solid-svg-icons';

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', description: 'Classic light theme', icon: faSun, preview: '#ffffff' },
  { value: 'dark', label: 'Dark', description: 'Dark theme for low light', icon: faMoon, preview: '#1e293b' },
  { value: 'auto', label: 'Auto', description: 'Follow system preference', icon: faDesktop, preview: 'linear-gradient(45deg, #ffffff 50%, #1e293b 50%)' }
];

const ThemeSection = ({ value, onChange }) => (
  <div className="card-theme border rounded-lg p-6">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Theme Selection
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Choose your preferred theme appearance
        </p>
      </div>
      <FontAwesomeIcon icon={faSun} className="text-xl" style={{ color: 'var(--accent-primary)' }} />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {THEME_OPTIONS.map((theme) => {
        const selected = value === theme.value;
        return (
          <button
            key={theme.value}
            onClick={() => onChange(theme.value)}
            className="relative p-4 rounded-lg border-2 transition-all duration-200 text-left"
            style={{
              borderColor: selected ? 'var(--accent-primary)' : 'var(--border-primary)',
              backgroundColor: selected ? 'var(--accent-primary)' : 'var(--bg-card)'
            }}
          >
            <div className="flex items-center space-x-3 mb-2">
              <div
                className="w-6 h-6 rounded-full border-2"
                style={{ background: theme.preview, borderColor: 'var(--border-secondary)' }}
              ></div>
              <FontAwesomeIcon
                icon={theme.icon}
                className="w-4 h-4"
                style={{ color: selected ? 'var(--text-inverse)' : 'var(--text-secondary)' }}
              />
              <span className="font-medium" style={{ color: selected ? 'var(--text-inverse)' : 'var(--text-primary)' }}>
                {theme.label}
              </span>
            </div>
            <p className="text-sm" style={{ color: selected ? 'var(--text-inverse)' : 'var(--text-secondary)' }}>
              {theme.description}
            </p>
            {selected && (
              <div className="absolute top-2 right-2">
                <FontAwesomeIcon icon={faCheck} className="w-4 h-4" style={{ color: 'var(--text-inverse)' }} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  </div>
);

export default ThemeSection;
