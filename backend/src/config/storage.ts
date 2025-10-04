/**
 * Storage configuration to switch between database and localStorage
 * This allows using localStorage for development/testing without database
 */

export enum StorageMode {
  DATABASE = 'database',
  LOCALSTORAGE = 'localStorage'
}

export const storageConfig = {
  // Default to localStorage if not specified, or if STORAGE_MODE is set to 'localStorage'
  mode: (process.env.STORAGE_MODE as StorageMode) || StorageMode.LOCALSTORAGE,
  
  // localStorage configuration
  localStorage: {
    // Path where localStorage files will be stored (for Node.js implementation)
    dataPath: process.env.LOCALSTORAGE_PATH || './data',
    // Enable persistence to file system (for Node.js)
    persist: process.env.LOCALSTORAGE_PERSIST !== 'false'
  },

  // Helper methods
  isDatabase(): boolean {
    return this.mode === StorageMode.DATABASE;
  },

  isLocalStorage(): boolean {
    return this.mode === StorageMode.LOCALSTORAGE;
  }
};

// Log the storage mode on startup
console.log(`📦 Storage Mode: ${storageConfig.mode.toUpperCase()}`);
if (storageConfig.isLocalStorage()) {
  console.log(`   Data Path: ${storageConfig.localStorage.dataPath}`);
  console.log(`   Persistence: ${storageConfig.localStorage.persist ? 'Enabled' : 'Disabled'}`);
}
