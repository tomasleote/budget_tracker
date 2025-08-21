import {
  STORAGE_KEYS,
  DEFAULT_PREFERENCES,
  safeExecute,
  asyncSafeExecute,
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  clearStorage,
  getStorageSize
} from '../../controller/utils/index.js';

class StorageService {
  constructor() {
    this.storageKeys = STORAGE_KEYS;
    this.version = '1.0.0';
    this.initialized = false;
  }

  // Initialize storage with default data using utility functions
  async initialize() {
    return asyncSafeExecute(async () => {
      // Check if app data exists
      const appData = getStorageItem(this.storageKeys.APP_DATA);
      
      if (!appData) {
        await this.initializeDefaultData();
      } else {
        // Check version and migrate if needed
        await this.checkVersionAndMigrate(appData);
      }
      
      this.initialized = true;
      return true;
    }, false);
  }

  // Initialize with default data using utility functions
  async initializeDefaultData() {
    return asyncSafeExecute(async () => {
      const defaultData = {
        version: this.version,
        initialized: true,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      // Initialize empty arrays for main data using utility functions
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

  // Check version and migrate data if needed
  async checkVersionAndMigrate(appData) {
    return asyncSafeExecute(async () => {
      if (appData.version !== this.version) {
        console.log(`Migrating data from version ${appData.version} to ${this.version}`);
        await this.migrateData(appData.version, this.version);
        
        // Update version using utility functions
        const updatedAppData = {
          ...appData,
          version: this.version,
          lastUpdated: new Date().toISOString(),
          migrated: true,
          previousVersion: appData.version
        };
        
        setStorageItem(this.storageKeys.APP_DATA, updatedAppData);
      }
      return true;
    }, false);
  }

  // Data migration logic
  async migrateData(fromVersion, toVersion) {
    return asyncSafeExecute(async () => {
      // Add migration logic here when needed
      console.log(`Migration from ${fromVersion} to ${toVersion} completed`);
      return true;
    }, false);
  }

  // Core storage operations using utility functions
  setItem(key, value) {
    const success = setStorageItem(key, value);
    if (success) {
      this.updateLastModified();
    }
    return success;
  }

  getItem(key, defaultValue = null) {
    return getStorageItem(key, defaultValue);
  }

  removeItem(key) {
    const success = removeStorageItem(key);
    if (success) {
      this.updateLastModified();
    }
    return success;
  }

  // Check if a key exists using utility functions
  hasItem(key) {
    return safeExecute(() => {
      return getStorageItem(key) !== null;
    }, false);
  }

  // Backup and restore operations using utility functions
  async createFullBackup() {
    return asyncSafeExecute(async () => {
      const backup = {
        version: this.version,
        timestamp: new Date().toISOString(),
        data: {}
      };

      // Backup all storage keys using utility functions
      Object.entries(this.storageKeys).forEach(([name, key]) => {
        backup.data[name] = getStorageItem(key);
      });

      return JSON.stringify(backup, null, 2);
    }, null);
  }

  async restoreFromFullBackup(backupString) {
    return asyncSafeExecute(async () => {
      const backup = JSON.parse(backupString);
      
      if (!backup.data) {
        throw new Error('Invalid backup format');
      }

      // Restore each data type using utility functions
      Object.entries(backup.data).forEach(([name, data]) => {
        if (this.storageKeys[name]) {
          setStorageItem(this.storageKeys[name], data);
        }
      });

      return {
        success: true,
        version: backup.version,
        timestamp: backup.timestamp
      };
    }, {
      success: false,
      error: 'Failed to restore backup'
    });
  }

  // Storage management using utility functions
  async clearAllData() {
    return asyncSafeExecute(async () => {
      Object.values(this.storageKeys).forEach(key => {
        removeStorageItem(key);
      });
      return true;
    }, false);
  }

  async getStorageInfo() {
    return asyncSafeExecute(async () => {
      const info = {
        version: this.version,
        initialized: this.initialized,
        appData: getStorageItem(this.storageKeys.APP_DATA),
        storageSize: this.calculateStorageSize(),
        keys: Object.keys(this.storageKeys),
        totalSize: getStorageSize()
      };

      return info;
    }, null);
  }

  calculateStorageSize() {
    return safeExecute(() => {
      let totalSize = 0;
      
      Object.values(this.storageKeys).forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += item.length;
        }
      });

      return {
        bytes: totalSize,
        kb: Math.round(totalSize / 1024 * 100) / 100,
        mb: Math.round(totalSize / (1024 * 1024) * 100) / 100
      };
    }, { bytes: 0, kb: 0, mb: 0 });
  }

  // Utility methods using utility functions
  updateLastModified() {
    safeExecute(() => {
      const appData = getStorageItem(this.storageKeys.APP_DATA, {});
      appData.lastUpdated = new Date().toISOString();
      setStorageItem(this.storageKeys.APP_DATA, appData);
    });
  }

  // Check if storage is available
  static isStorageAvailable() {
    return safeExecute(() => {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    }, false);
  }

  // Storage event handling for multi-tab synchronization
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

    // Return cleanup function
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }

  // Data validation using utility functions
  validateStorageIntegrity() {
    return safeExecute(() => {
      const issues = [];

      Object.entries(this.storageKeys).forEach(([name, key]) => {
        try {
          const data = getStorageItem(key);
          
          // Check if data can be parsed (already done in getStorageItem, but explicit check)
          if (data !== null && typeof data === 'string') {
            JSON.parse(data);
          }
        } catch (error) {
          issues.push({
            key: name,
            storageKey: key,
            error: error.message
          });
        }
      });

      return {
        isValid: issues.length === 0,
        issues
      };
    }, { isValid: false, issues: [] });
  }

  // Cleanup corrupted data using utility functions
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

        // Reinitialize if needed
        if (cleanedCount > 0) {
          await this.initialize();
        }
      }

      return {
        cleanedCount,
        issues: validation.issues
      };
    }, { cleanedCount: 0, issues: [] });
  }

  // Export specific data type using utility functions
  exportData(dataType) {
    return safeExecute(() => {
      const key = this.storageKeys[dataType.toUpperCase()];
      if (!key) {
        throw new Error(`Unknown data type: ${dataType}`);
      }

      const data = getStorageItem(key);
      return {
        dataType,
        data,
        timestamp: new Date().toISOString()
      };
    }, null);
  }

  // Import specific data type using utility functions
  importData(dataType, data) {
    return safeExecute(() => {
      const key = this.storageKeys[dataType.toUpperCase()];
      if (!key) {
        throw new Error(`Unknown data type: ${dataType}`);
      }

      const success = setStorageItem(key, data);
      return {
        success,
        dataType,
        error: success ? null : 'Failed to save data'
      };
    }, {
      success: false,
      dataType,
      error: 'Failed to import data'
    });
  }

  // Get all storage keys and their sizes using utility functions
  getStorageBreakdown() {
    return safeExecute(() => {
      const breakdown = {};

      Object.entries(this.storageKeys).forEach(([name, key]) => {
        const item = localStorage.getItem(key);
        breakdown[name] = {
          key,
          exists: item !== null,
          size: item ? item.length : 0,
          sizeKB: item ? Math.round(item.length / 1024 * 100) / 100 : 0
        };
      });

      return breakdown;
    }, {});
  }

  // Enhanced storage operations
  async compactStorage() {
    return asyncSafeExecute(async () => {
      const cleaned = await this.cleanupCorruptedData();
      const sizeBefore = this.calculateStorageSize();
      
      // Remove empty or null values
      Object.values(this.storageKeys).forEach(key => {
        const data = getStorageItem(key);
        if (data === null || data === undefined || 
            (Array.isArray(data) && data.length === 0) ||
            (typeof data === 'object' && Object.keys(data).length === 0)) {
          // Don't remove essential keys, just clean them
          if (key !== this.storageKeys.APP_DATA) {
            setStorageItem(key, Array.isArray(data) ? [] : {});
          }
        }
      });

      const sizeAfter = this.calculateStorageSize();
      
      return {
        success: true,
        sizeBefore,
        sizeAfter,
        spaceFreed: sizeBefore.bytes - sizeAfter.bytes,
        corruptedItemsCleaned: cleaned.cleanedCount
      };
    }, {
      success: false,
      error: 'Failed to compact storage'
    });
  }

  // Get storage usage statistics
  getStorageStats() {
    return safeExecute(() => {
      const breakdown = this.getStorageBreakdown();
      const totalSize = this.calculateStorageSize();
      
      const stats = {
        totalSize,
        breakdown,
        largestItems: Object.entries(breakdown)
          .sort(([,a], [,b]) => b.size - a.size)
          .slice(0, 5)
          .map(([name, data]) => ({ name, ...data })),
        emptyItems: Object.entries(breakdown)
          .filter(([,data]) => !data.exists || data.size === 0)
          .map(([name]) => name),
        utilizationPercentage: Object.values(breakdown).filter(data => data.exists).length / 
                              Object.keys(breakdown).length * 100
      };

      return stats;
    }, null);
  }

  // Batch operations
  async setBatch(items) {
    return asyncSafeExecute(async () => {
      const results = [];
      
      items.forEach(({ key, value }) => {
        const success = setStorageItem(key, value);
        results.push({ key, success });
      });

      this.updateLastModified();
      
      return {
        total: items.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      };
    }, {
      total: 0,
      successful: 0,
      failed: 0,
      results: []
    });
  }

  async getBatch(keys) {
    return asyncSafeExecute(async () => {
      const results = {};
      
      keys.forEach(key => {
        results[key] = getStorageItem(key);
      });

      return results;
    }, {});
  }

  // Cache management
  clearCache() {
    return safeExecute(() => {
      const cacheData = getStorageItem(this.storageKeys.CACHE, {});
      const cleared = Object.keys(cacheData).length;
      setStorageItem(this.storageKeys.CACHE, {});
      
      return {
        success: true,
        itemsCleared: cleared
      };
    }, {
      success: false,
      itemsCleared: 0
    });
  }

  // Performance monitoring
  measureStoragePerformance() {
    return safeExecute(() => {
      const testData = { test: 'performance_test_data' };
      
      // Measure write performance
      const writeStart = performance.now();
      setStorageItem('__perf_test__', testData);
      const writeTime = performance.now() - writeStart;
      
      // Measure read performance
      const readStart = performance.now();
      getStorageItem('__perf_test__');
      const readTime = performance.now() - readStart;
      
      // Cleanup
      removeStorageItem('__perf_test__');
      
      return {
        writeTime: Math.round(writeTime * 100) / 100,
        readTime: Math.round(readTime * 100) / 100,
        timestamp: new Date().toISOString()
      };
    }, {
      writeTime: 0,
      readTime: 0,
      timestamp: new Date().toISOString()
    });
  }
}

// Create singleton instance
const storageService = new StorageService();

export default storageService;
