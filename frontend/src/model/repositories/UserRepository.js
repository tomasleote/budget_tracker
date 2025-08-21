import BaseRepository from './BaseRepository.js';
import { User } from '../entities/index.js';
import StorageService from '../services/StorageService.js';

class UserRepository extends BaseRepository {
  constructor() {
    super('User', StorageService.storageKeys.USER, User);
  }

  // Override base methods since User is typically a single entity
  async getCurrentUser() {
    try {
      const userData = this.storageService.getItem(this.storageKey, null);
      return userData;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async saveUser(userData) {
    try {
      // Create user entity to validate
      const user = new User(userData);
      
      // Save user data (single object, not array)
      const saved = this.storageService.setItem(this.storageKey, user.toJSON());
      if (!saved) {
        throw new Error('Failed to save user');
      }

      return {
        success: true,
        data: user.toJSON()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  async updateUser(updateData) {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('No user found to update');
      }

      // Create user entity and update
      const user = User.fromJSON(currentUser);
      user.update(updateData);

      // Save updated user
      const saved = this.storageService.setItem(this.storageKey, user.toJSON());
      if (!saved) {
        throw new Error('Failed to update user');
      }

      return {
        success: true,
        data: user.toJSON()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  async deleteUser() {
    try {
      const removed = this.storageService.removeItem(this.storageKey);
      return {
        success: removed,
        error: removed ? null : 'Failed to delete user'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // User preferences management
  async getUserPreferences() {
    try {
      const user = await this.getCurrentUser();
      return user ? user.preferences : {};
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return {};
    }
  }

  async updatePreferences(newPreferences) {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('No user found');
      }

      const user = User.fromJSON(currentUser);
      user.updatePreferences(newPreferences);

      const saved = this.storageService.setItem(this.storageKey, user.toJSON());
      if (!saved) {
        throw new Error('Failed to update preferences');
      }

      return {
        success: true,
        data: user.preferences
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  async updatePreference(key, value) {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('No user found');
      }

      const user = User.fromJSON(currentUser);
      user.updatePreference(key, value);

      const saved = this.storageService.setItem(this.storageKey, user.toJSON());
      if (!saved) {
        throw new Error('Failed to update preference');
      }

      return {
        success: true,
        data: { [key]: value }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getPreference(key, defaultValue = null) {
    try {
      const user = await this.getCurrentUser();
      if (!user || !user.preferences) {
        return defaultValue;
      }

      return user.preferences[key] !== undefined ? user.preferences[key] : defaultValue;
    } catch (error) {
      console.error('Error getting user preference:', error);
      return defaultValue;
    }
  }

  // User settings management
  async getUserSettings() {
    try {
      const user = await this.getCurrentUser();
      return user ? user.settings : {};
    } catch (error) {
      console.error('Error getting user settings:', error);
      return {};
    }
  }

  async updateSettings(newSettings) {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('No user found');
      }

      const user = User.fromJSON(currentUser);
      user.updateSettings(newSettings);

      const saved = this.storageService.setItem(this.storageKey, user.toJSON());
      if (!saved) {
        throw new Error('Failed to update settings');
      }

      return {
        success: true,
        data: user.settings
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  async updateSetting(key, value) {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('No user found');
      }

      const user = User.fromJSON(currentUser);
      user.updateSetting(key, value);

      const saved = this.storageService.setItem(this.storageKey, user.toJSON());
      if (!saved) {
        throw new Error('Failed to update setting');
      }

      return {
        success: true,
        data: { [key]: value }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getSetting(key, defaultValue = null) {
    try {
      const user = await this.getCurrentUser();
      if (!user || !user.settings) {
        return defaultValue;
      }

      return user.settings[key] !== undefined ? user.settings[key] : defaultValue;
    } catch (error) {
      console.error('Error getting user setting:', error);
      return defaultValue;
    }
  }

  // User profile management
  async updateProfile(profileData) {
    try {
      const allowedFields = ['name', 'email', 'avatar'];
      const updateData = {};

      // Only allow specific profile fields
      allowedFields.forEach(field => {
        if (profileData.hasOwnProperty(field)) {
          updateData[field] = profileData[field];
        }
      });

      return await this.updateUser(updateData);
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async updateAvatar(avatarUrl) {
    try {
      return await this.updateUser({ avatar: avatarUrl });
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async removeAvatar() {
    try {
      return await this.updateUser({ avatar: null });
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // User initialization and defaults
  async initializeUser(userData = {}) {
    try {
      const existingUser = await this.getCurrentUser();
      
      if (existingUser) {
        return {
          success: true,
          data: existingUser,
          message: 'User already exists'
        };
      }

      // Create user with defaults if no data provided
      const defaultUserData = {
        name: 'Demo User',
        email: 'demo@budgettracker.com',
        ...userData
      };

      return await this.saveUser(defaultUserData);
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async createDefaultUser() {
    try {
      const defaultUser = User.createDefault();
      return await this.saveUser(defaultUser.toJSON());
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async resetUserToDefaults() {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        return await this.createDefaultUser();
      }

      // Keep basic profile info but reset preferences and settings
      const resetData = {
        name: currentUser.name,
        email: currentUser.email,
        avatar: currentUser.avatar,
        preferences: User.createDefault().preferences,
        settings: User.createDefault().settings
      };

      return await this.saveUser(resetData);
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // User validation and checks
  async validateUser() {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        return {
          isValid: false,
          errors: ['No user found']
        };
      }

      // Try to create User entity to validate
      try {
        new User(user);
        return {
          isValid: true,
          errors: []
        };
      } catch (validationError) {
        return {
          isValid: false,
          errors: [validationError.message]
        };
      }
    } catch (error) {
      return {
        isValid: false,
        errors: [error.message]
      };
    }
  }

  async userExists() {
    try {
      const user = await this.getCurrentUser();
      return user !== null;
    } catch (error) {
      return false;
    }
  }

  // Currency and formatting helpers
  async formatCurrency(amount) {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        // Default formatting
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(amount);
      }

      const userEntity = User.fromJSON(user);
      return userEntity.formatCurrency(amount);
    } catch (error) {
      console.error('Error formatting currency:', error);
      return `$${amount}`;
    }
  }

  async formatDate(date) {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        // Default formatting
        return new Date(date).toLocaleDateString('en-US');
      }

      const userEntity = User.fromJSON(user);
      return userEntity.formatDate(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return new Date(date).toLocaleDateString();
    }
  }

  // User data export/import
  async exportUserData() {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        return null;
      }

      return {
        user,
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      };
    } catch (error) {
      console.error('Error exporting user data:', error);
      return null;
    }
  }

  async importUserData(userData) {
    try {
      if (!userData || !userData.user) {
        throw new Error('Invalid user data format');
      }

      return await this.saveUser(userData.user);
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // User backup and restore
  async backupUser() {
    try {
      const user = await this.getCurrentUser();
      return {
        user,
        timestamp: new Date().toISOString(),
        storageKey: this.storageKey
      };
    } catch (error) {
      console.error('Error backing up user:', error);
      return null;
    }
  }

  async restoreUser(backupData) {
    try {
      if (!backupData || !backupData.user) {
        throw new Error('Invalid backup data');
      }

      const saved = this.storageService.setItem(this.storageKey, backupData.user);
      return {
        success: saved,
        error: saved ? null : 'Failed to restore user data'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Theme and appearance
  async getTheme() {
    try {
      return await this.getPreference('theme', 'light');
    } catch (error) {
      return 'light';
    }
  }

  async setTheme(theme) {
    try {
      if (!['light', 'dark', 'auto'].includes(theme)) {
        throw new Error('Invalid theme. Must be light, dark, or auto');
      }

      return await this.updatePreference('theme', theme);
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getCurrency() {
    try {
      return await this.getPreference('currency', 'USD');
    } catch (error) {
      return 'USD';
    }
  }

  async setCurrency(currency) {
    try {
      // Basic currency code validation
      if (!currency || currency.length !== 3) {
        throw new Error('Invalid currency code');
      }

      return await this.updatePreference('currency', currency.toUpperCase());
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default UserRepository;