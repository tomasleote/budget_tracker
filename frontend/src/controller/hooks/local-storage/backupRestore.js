/**
 * Backup and restore functionality for local storage
 * Creates backup and sync objects for data persistence
 */

export const createBackup = (appStorage) => ({
  // Create backup of all data
  createBackup: () => {
    const backupData = appStorage.exportAllAppData();
    const backupString = JSON.stringify(backupData);

    return {
      data: backupString,
      filename: `budget_tracker_backup_${new Date().toISOString().split('T')[0]}.json`,
      size: backupString.length
    };
  },

  // Restore from backup
  restoreFromBackup: (backupString) => {
    try {
      const backupData = JSON.parse(backupString);
      return appStorage.importAllAppData(backupData);
    } catch (error) {
      console.error('Error restoring from backup:', error);
      return false;
    }
  },

  // Download backup file - Note: self-reference bug preserved from original
  downloadBackup: function() {
    const backup = this.createBackup();
    const blob = new Blob([backup.data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = backup.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  }
});

// State synchronization helpers
export const createSync = (getItem, setItem) => ({
  // Simple state sync - save data to localStorage
  saveState: (key, state) => {
    return setItem(`budget_tracker_state_${key}`, {
      data: state,
      timestamp: new Date().toISOString()
    });
  },

  // Load state from localStorage
  loadState: (key) => {
    const stateData = getItem(`budget_tracker_state_${key}`);
    return stateData ? stateData.data : null;
  },

  // Check if state is stale (older than specified minutes)
  isStateStale: (key, maxAgeMinutes = 30) => {
    const stateData = getItem(`budget_tracker_state_${key}`);
    if (!stateData || !stateData.timestamp) return true;

    const stateAge = Date.now() - new Date(stateData.timestamp).getTime();
    const maxAge = maxAgeMinutes * 60 * 1000; // Convert to milliseconds

    return stateAge > maxAge;
  }
});
