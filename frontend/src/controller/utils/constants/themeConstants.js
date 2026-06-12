export const COLOR_THEMES = {
  DEFAULT: {
    id: 'default',
    name: 'Default',
    description: 'Classic blue and gray theme',
    primary: '#3b82f6',
    secondary: '#10b981',
    accent: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  },
  OCEAN: {
    id: 'ocean',
    name: 'Ocean',
    description: 'Cool blues and teals',
    primary: '#0891b2',
    secondary: '#06b6d4',
    accent: '#3b82f6',
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
    info: '#0284c7'
  },
  FOREST: {
    id: 'forest',
    name: 'Forest',
    description: 'Natural greens and earth tones',
    primary: '#059669',
    secondary: '#10b981',
    accent: '#65a30d',
    success: '#16a34a',
    warning: '#ca8a04',
    error: '#dc2626',
    info: '#0891b2'
  }
};

export const THEME_CONFIG = {
  DEFAULT_THEME: 'light',
  AVAILABLE_THEMES: ['light', 'dark', 'auto'],
  DEFAULT_COLOR_THEME: 'default',
  AVAILABLE_COLOR_THEMES: Object.keys(COLOR_THEMES).map(key => COLOR_THEMES[key]),
  STORAGE_KEY: 'budget_tracker_theme',
  COLOR_STORAGE_KEY: 'budget_tracker_color_theme'
};
