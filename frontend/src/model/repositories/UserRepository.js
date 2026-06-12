import BaseRepository from './BaseRepository.js';
import { User } from '../entities/index.js';
import StorageService from '../services/StorageService.js';
import * as crud from './user/crudOps.js';
import * as prefs from './user/preferencesOps.js';
import * as settings from './user/settingsOps.js';
import * as profile from './user/profileOps.js';

class UserRepository extends BaseRepository {
  constructor() {
    super('User', StorageService.storageKeys.USER, User);
  }

  _ctx() {
    return { storageService: this.storageService, storageKey: this.storageKey };
  }

  async getCurrentUser() { return crud.getCurrentUser(this._ctx()); }
  async saveUser(userData) { return crud.saveUser(this._ctx(), userData); }
  async updateUser(updateData) { return crud.updateUser(this._ctx(), updateData); }
  async deleteUser() { return crud.deleteUser(this._ctx()); }

  async getUserPreferences() { return prefs.getUserPreferences(this._ctx()); }
  async updatePreferences(newPreferences) { return prefs.updatePreferences(this._ctx(), newPreferences); }
  async updatePreference(key, value) { return prefs.updatePreference(this._ctx(), key, value); }
  async getPreference(key, defaultValue = null) { return prefs.getPreference(this._ctx(), key, defaultValue); }
  async getTheme() { return prefs.getTheme(this._ctx()); }
  async setTheme(theme) { return prefs.setTheme(this._ctx(), theme); }
  async getCurrency() { return prefs.getCurrency(this._ctx()); }
  async setCurrency(currency) { return prefs.setCurrency(this._ctx(), currency); }

  async getUserSettings() { return settings.getUserSettings(this._ctx()); }
  async updateSettings(newSettings) { return settings.updateSettings(this._ctx(), newSettings); }
  async updateSetting(key, value) { return settings.updateSetting(this._ctx(), key, value); }
  async getSetting(key, defaultValue = null) { return settings.getSetting(this._ctx(), key, defaultValue); }

  async updateProfile(profileData) { return profile.updateProfile(this._ctx(), profileData); }
  async updateAvatar(avatarUrl) { return profile.updateAvatar(this._ctx(), avatarUrl); }
  async removeAvatar() { return profile.removeAvatar(this._ctx()); }
  async validateUser() { return profile.validateUser(this._ctx()); }
  async userExists() { return profile.userExists(this._ctx()); }
  async initializeUser(userData = {}) { return profile.initializeUser(this._ctx(), userData); }
  async createDefaultUser() { return profile.createDefaultUser(this._ctx()); }
  async resetUserToDefaults() { return profile.resetUserToDefaults(this._ctx()); }
  async formatCurrency(amount) { return profile.formatCurrency(this._ctx(), amount); }
  async formatDate(date) { return profile.formatDate(this._ctx(), date); }
  async exportUserData() { return profile.exportUserData(this._ctx()); }
  async importUserData(userData) { return profile.importUserData(this._ctx(), userData); }
  async backupUser() { return profile.backupUser(this._ctx()); }
  async restoreUser(backupData) { return profile.restoreUser(this._ctx(), backupData); }
}

export default UserRepository;
