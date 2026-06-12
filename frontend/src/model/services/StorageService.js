import {
  STORAGE_KEYS,
  DEFAULT_PREFERENCES,
  safeExecute,
  asyncSafeExecute,
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  getStorageSize
} from '../../controller/utils/index.js';
import {
  calculateStorageSize,
  getStorageBreakdown,
  getStorageStats,
  measureStoragePerformance
} from './storage/storageMetrics.js';

class StorageService {
  constructor() {
    this.storageKeys = STORAGE_KEYS;
    this.version = '1.0.0';
    this.initialized = false;
  }

  async initialize() {
    return asyncSafeExecute(async () => {
      const appData = getStorageItem(this.storageKeys.APP_DATA);
      if (!appData) {
        await this.initializeDefaultData();
      } else {
        await this.checkVersionAndMigrate(appData);
      }
      this.initialized = true;
      return true;
    }, false);
  }

  async initializeDefaultData() {
    return asyncSafeExecute(async () => {
      const defaultData = {
        version: this.version,
        initialized: true,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      setStorageItem(this.storageKeys.TRANSACTIONS, []);
      setStorageItem(this.storageKeys.BUDGETS, []);
      setStorageItem(this.storageKeys.CATEGORIES, []);
      setStorageItem(this.storageKeys.USER, null);
      setStorageItem(this.storageKeys.SETTINGS, {});
      setStorageItem(this.storageKeys.PREFERENCES, DEFAULT_PREFERENCES);
      setStorageItem(this.storageKeys.APP_DATA, defaultData);

      return true;
    }, false);
  }

  async checkVersionAndMigrate(appData) {
    return asyncSafeExecute(async () => {
      if (appData.version !== this.version) {
        console.log(`Migrating data from version ${appData.version} to ${this.version}`);
        await this.migrateData(appData.version, this.version);

        setStorageItem(this.storageKeys.APP_DATA, {
          ...appData,
          version: this.version,
          lastUpdated: new Date().toISOString(),
          migrated: true,
          previousVersion: appData.version
        });
      }
      return true;
    }, false);
  }

  async migrateData(fromVersion, toVersion) {
    return asyncSafeExecute(async () => {
      console.log(`Migration from ${fromVersion} to ${toVersion} completed`);
      return true;
    }, false);
  }

  setItem(key, value) {
    const success = setStorageItem(key, value);
    if (success) this.updateLastModified();
    return success;
  }

  getItem(key, defaultValue = null) {
    return getStorageItem(key, defaultValue);
  }

  removeItem(key) {
    const success = removeStorageItem(key);
    if (success) this.updateLastModified();
    return success;
  }

  hasItem(key) {
    return safeExecute(() => getStorageItem(key) !== null, false);
  }

  async createFullBackup() {
    return asyncSafeExecute(async () => {
      const backup = { version: this.version, timestamp: new Date().toISOString(), data: {} };
      Object.entries(this.storageKeys).forEach(([name, key]) => {
        backup.data[name] = getStorageItem(key);
      });
      return JSON.stringify(backup, null, 2);
    }, null);
  }

  async restoreFromFullBackup(backupString) {
    return asyncSafeExecute(async () => {
      const backup = JSON.parse(backupString);
      if (!backup.data) throw new Error('Invalid backup format');

      Object.entries(backup.data).forEach(([name, data]) => {
        if (this.storageKeys[name]) setStorageItem(this.storageKeys[name], data);
      });

      return { success: true, version: backup.version, timestamp: backup.timestamp };
    }, { success: false, error: 'Failed to restore backup' });
  }

  async clearAllData() {
    return asyncSafeExecute(async () => {
      Object.values(this.storageKeys).forEach(key => removeStorageItem(key));
      return true;
    }, false);
  }

  async getStorageInfo() {
    return asyncSafeExecute(async () => ({
      version: this.version,
      initialized: this.initialized,
      appData: getStorageItem(this.storageKeys.APP_DATA),
      storageSize: calculateStorageSize(this.storageKeys),
      keys: Object.keys(this.storageKeys),
      totalSize: getStorageSize()
    }), null);
  }

  calculateStorageSize() {
    return calculateStorageSize(this.storageKeys);
  }

  updateLastModified() {
    safeExecute(() => {
      const appData = getStorageItem(this.storageKeys.APP_DATA, {});
      appData.lastUpdated = new Date().toISOString();
      setStorageItem(this.storageKeys.APP_DATA, appData);
    });
  }

  static isStorageAvailable() {
    return safeExecute(() => {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    }, false);
  }

  addEventListener(callback) {
    const handleStorageChange = (event) => {
      if (Object.values(this.storageKeys).includes(event.key)) {
        safeExecute(() => {
          callback({
            key: event.key,
            oldValue: event.oldValue ? JSON.parse(event.oldValue) : null,
            newValue: event.newValue ? JSON.parse(event.newValue) : null,
            storageArea: event.storageArea
          });
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }

  validateStorageIntegrity() {
    return safeExecute(() => {
      const issues = [];

      Object.entries(this.storageKeys).forEach(([name, key]) => {
        try {
          const data = getStorageItem(key);
          if (data !== null && typeof data === 'string') {
            JSON.parse(data);
          }
        } catch (error) {
          issues.push({ key: name, storageKey: key, error: error.message });
        }
      });

      return { isValid: issues.length === 0, issues };
    }, { isValid: false, issues: [] });
  }

  async cleanupCorruptedData() {
    return asyncSafeExecute(async () => {
      const validation = this.validateStorageIntegrity();
      let cleanedCount = 0;

      if (!validation.isValid) {
        validation.issues.forEach(issue => {
          console.warn(`Removing corrupted data for ${issue.key}:`, issue.error);
          removeStorageItem(issue.storageKey);
          cleanedCount++;
        });

        if (cleanedCount > 0) await this.initialize();
      }

      return { cleanedCount, issues: validation.issues };
    }, { cleanedCount: 0, issues: [] });
  }

  exportData(dataType) {
    return safeExecute(() => {
      const key = this.storageKeys[dataType.toUpperCase()];
      if (!key) throw new Error(`Unknown data type: ${dataType}`);
      return { dataType, data: getStorageItem(key), timestamp: new Date().toISOString() };
    }, null);
  }

  importData(dataType, data) {
    return safeExecute(() => {
      const key = this.storageKeys[dataType.toUpperCase()];
      if (!key) throw new Error(`Unknown data type: ${dataType}`);
      const success = setStorageItem(key, data);
      return { success, dataType, error: success ? null : 'Failed to save data' };
    }, { success: false, dataType, error: 'Failed to import data' });
  }

  getStorageBreakdown() {
    return getStorageBreakdown(this.storageKeys);
  }

  async compactStorage() {
    return asyncSafeExecute(async () => {
      const cleaned = await this.cleanupCorruptedData();
      const sizeBefore = calculateStorageSize(this.storageKeys);

      Object.values(this.storageKeys).forEach(key => {
        const data = getStorageItem(key);
        if (
          (data === null || data === undefined ||
            (Array.isArray(data) && data.length === 0) ||
            (typeof data === 'object' && Object.keys(data).length === 0)) &&
          key !== this.storageKeys.APP_DATA
        ) {
          setStorageItem(key, Array.isArray(data) ? [] : {});
        }
      });

      const sizeAfter = calculateStorageSize(this.storageKeys);
      return {
        success: true,
        sizeBefore,
        sizeAfter,
        spaceFreed: sizeBefore.bytes - sizeAfter.bytes,
        corruptedItemsCleaned: cleaned.cleanedCount
      };
    }, { success: false, error: 'Failed to compact storage' });
  }

  getStorageStats() {
    return getStorageStats(this.storageKeys);
  }

  async setBatch(items) {
    return asyncSafeExecute(async () => {
      const results = items.map(({ key, value }) => ({ key, success: setStorageItem(key, value) }));
      this.updateLastModified();
      return {
        total: items.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      };
    }, { total: 0, successful: 0, failed: 0, results: [] });
  }

  async getBatch(keys) {
    return asyncSafeExecute(async () => {
      const results = {};
      keys.forEach(key => { results[key] = getStorageItem(key); });
      return results;
    }, {});
  }

  clearCache() {
    return safeExecute(() => {
      const cacheData = getStorageItem(this.storageKeys.CACHE, {});
      const cleared = Object.keys(cacheData).length;
      setStorageItem(this.storageKeys.CACHE, {});
      return { success: true, itemsCleared: cleared };
    }, { success: false, itemsCleared: 0 });
  }

  measureStoragePerformance() {
    return measureStoragePerformance();
  }
}

const storageService = new StorageService();

export default storageService;
