class User {
  constructor({
    id = null,
    name = '',
    email = '',
    avatar = null,
    preferences = {},
    settings = {},
    createdAt = new Date(),
    updatedAt = new Date()
  } = {}) {
    this.id = id || this.generateId();
    this.name = name.trim();
    this.email = email.trim().toLowerCase();
    this.avatar = avatar;
    this.preferences = this.initializePreferences(preferences);
    this.settings = this.initializeSettings(settings);
    this.createdAt = new Date(createdAt);
    this.updatedAt = new Date(updatedAt);
    
    this.validate();
  }

  // Generate unique ID
  generateId() {
    return 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Initialize default preferences with Phase 2 additions
  initializePreferences(preferences = {}) {
    return {
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      theme: 'light',
      language: 'en',
      defaultView: 'dashboard',
      budgetAlerts: true,
      emailNotifications: true,
      // Phase 2 additions
      thousandsSeparator: ',',
      colorTheme: 'default',
      // Phase 3 additions (placeholder)
      dashboardSections: {
        quickStats: true,
        balanceCard: true,
        budgetProgress: true,
        spendingChart: true,
        recentTransactions: true,
        enhancedAnalytics: true,
        dashboardWidgets: true
      },
      // Phase 4 additions (placeholder)
      categoryColors: {},
      ...preferences
    };
  }

  // Initialize default settings with Phase 2 additions
  initializeSettings(settings = {}) {
    return {
      autoCategories: true,
      showBalance: true,
      budgetPeriod: 'monthly',
      firstDayOfWeek: 'sunday',
      decimalPlaces: 2,
      compactMode: false,
      // Phase 2 additions
      thousandsSeparator: ',',
      numberFormat: {
        decimalPlaces: 2,
        thousandsSeparator: ','
      },
      ...settings
    };
  }

  // Validation method
  validate() {
    const errors = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Name is required');
    }

    if (this.name.length > 100) {
      errors.push('Name must be 100 characters or less');
    }

    if (!this.email || this.email.trim().length === 0) {
      errors.push('Email is required');
    }

    if (!this.isValidEmail(this.email)) {
      errors.push('Valid email address is required');
    }

    if (this.avatar && !this.isValidUrl(this.avatar)) {
      errors.push('Avatar must be a valid URL');
    }

    if (errors.length > 0) {
      throw new Error(`User validation failed: ${errors.join(', ')}`);
    }
  }

  // Validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate URL format
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Update user information
  update(data) {
    const allowedFields = ['name', 'email', 'avatar'];
    
    allowedFields.forEach(field => {
      if (data.hasOwnProperty(field)) {
        if (field === 'name') {
          this[field] = data[field].trim();
        } else if (field === 'email') {
          this[field] = data[field].trim().toLowerCase();
        } else {
          this[field] = data[field];
        }
      }
    });

    this.updatedAt = new Date();
    this.validate();
    return this;
  }

  // Update preferences
  updatePreferences(newPreferences) {
    this.preferences = {
      ...this.preferences,
      ...newPreferences
    };
    this.updatedAt = new Date();
    return this;
  }

  // Update settings
  updateSettings(newSettings) {
    this.settings = {
      ...this.settings,
      ...newSettings
    };
    this.updatedAt = new Date();
    return this;
  }

  // Update single preference
  updatePreference(key, value) {
    this.preferences[key] = value;
    this.updatedAt = new Date();
    return this;
  }

  // Update single setting
  updateSetting(key, value) {
    this.settings[key] = value;
    this.updatedAt = new Date();
    return this;
  }

  // Get preference value
  getPreference(key, defaultValue = null) {
    return this.preferences[key] !== undefined ? this.preferences[key] : defaultValue;
  }

  // Get setting value
  getSetting(key, defaultValue = null) {
    return this.settings[key] !== undefined ? this.settings[key] : defaultValue;
  }

  // Get formatted currency with user preferences
  formatCurrency(amount) {
    const currency = this.getPreference('currency', 'USD');
    const decimalPlaces = this.getSetting('decimalPlaces', 2);
    const thousandsSeparator = this.getPreference('thousandsSeparator', ',');
    
    try {
      let formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces
      }).format(parseFloat(amount) || 0);
      
      // Apply thousands separator preference
      if (thousandsSeparator !== ',') {
        if (thousandsSeparator === '.') {
          // European style: swap . and ,
          formatted = formatted.replace(/,/g, 'TEMP').replace(/\./g, ',').replace(/TEMP/g, '.');
        } else if (thousandsSeparator === ' ') {
          // Space separator
          formatted = formatted.replace(/,/g, ' ');
        }
      }
      
      return formatted;
    } catch (error) {
      // Fallback formatting
      const symbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
      return `${symbol}${(parseFloat(amount) || 0).toFixed(decimalPlaces)}`;
    }
  }

  // Get formatted date
  formatDate(date) {
    const dateFormat = this.getPreference('dateFormat', 'MM/DD/YYYY');
    const dateObj = new Date(date);
    
    switch (dateFormat) {
      case 'DD/MM/YYYY':
        return dateObj.toLocaleDateString('en-GB');
      case 'YYYY-MM-DD':
        return dateObj.toISOString().split('T')[0];
      case 'MM/DD/YYYY':
      default:
        return dateObj.toLocaleDateString('en-US');
    }
  }

  // Check if user has budget alerts enabled
  hasBudgetAlertsEnabled() {
    return this.getPreference('budgetAlerts', true);
  }

  // Check if user has email notifications enabled
  hasEmailNotificationsEnabled() {
    return this.getPreference('emailNotifications', true);
  }

  // Get user initials for avatar
  getInitials() {
    return this.name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  // Convert to plain object for storage
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      avatar: this.avatar,
      preferences: this.preferences,
      settings: this.settings,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  // Create from plain object
  static fromJSON(data) {
    return new User({
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt)
    });
  }

  // Create default user with Phase 2 preferences
  static createDefault() {
    return new User({
      name: 'Demo User',
      email: 'demo@budgettracker.com',
      preferences: {
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        theme: 'light',
        language: 'en',
        defaultView: 'dashboard',
        budgetAlerts: true,
        emailNotifications: false,
        thousandsSeparator: ',',
        colorTheme: 'default'
      }
    });
  }
}

export default User;