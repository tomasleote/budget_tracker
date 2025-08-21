/**
 * Offline Mode Handler
 * Manages offline functionality and data synchronization
 */

class OfflineHandler {
  constructor() {
    this.isOnline = navigator.onLine;
    this.pendingOperations = this.loadPendingOperations();
    this.listeners = new Set();
    this.setupEventListeners();
  }

  /**
   * Setup online/offline event listeners
   */
  setupEventListeners() {
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }

  /**
   * Handle online event
   */
  handleOnline() {
    console.log('🌐 Connection restored');
    this.isOnline = true;
    this.notifyListeners(true);
    this.processPendingOperations();
  }

  /**
   * Handle offline event
   */
  handleOffline() {
    console.log('📵 Connection lost - switching to offline mode');
    this.isOnline = false;
    this.notifyListeners(false);
  }

  /**
   * Add listener for connection changes
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  addConnectionListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of connection change
   * @param {boolean} online - Online status
   */
  notifyListeners(online) {
    this.listeners.forEach(callback => callback(online));
  }

  /**
   * Queue operation for when connection is restored
   * @param {Object} operation - Operation details
   */
  queueOperation(operation) {
    const queuedOp = {
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...operation
    };

    this.pendingOperations.push(queuedOp);
    this.savePendingOperations();
    
    console.log('📋 Operation queued for sync:', queuedOp);
    return queuedOp.id;
  }

  /**
   * Load pending operations from localStorage
   * @returns {Array} Pending operations
   */
  loadPendingOperations() {
    try {
      const stored = localStorage.getItem('budget_tracker_pending_operations');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading pending operations:', error);
      return [];
    }
  }

  /**
   * Save pending operations to localStorage
   */
  savePendingOperations() {
    try {
      localStorage.setItem(
        'budget_tracker_pending_operations',
        JSON.stringify(this.pendingOperations)
      );
    } catch (error) {
      console.error('Error saving pending operations:', error);
    }
  }

  /**
   * Process all pending operations
   */
  async processPendingOperations() {
    if (this.pendingOperations.length === 0) {
      console.log('✅ No pending operations to sync');
      return;
    }

    console.log(`🔄 Processing ${this.pendingOperations.length} pending operations...`);
    
    const results = {
      successful: 0,
      failed: 0,
      errors: []
    };

    // Process operations in order
    for (const operation of [...this.pendingOperations]) {
      try {
        await this.processOperation(operation);
        this.removePendingOperation(operation.id);
        results.successful++;
      } catch (error) {
        console.error('Failed to process operation:', operation, error);
        results.failed++;
        results.errors.push({
          operation,
          error: error.message
        });
      }
    }

    console.log('📊 Sync complete:', results);
    
    // Notify about sync completion
    if (results.failed > 0) {
      this.notifySyncError(results);
    } else {
      this.notifySyncSuccess(results);
    }

    return results;
  }

  /**
   * Process a single operation
   * @param {Object} operation - Operation to process
   */
  async processOperation(operation) {
    const { type, entity, action, data } = operation;
    
    // Import repositories dynamically to avoid circular dependencies
    const { RepositoryFactory } = await import('./RepositoryFactory.js');
    
    // Get the appropriate repository (force API mode)
    let repository;
    switch (entity) {
      case 'transaction':
        repository = RepositoryFactory.createTransactionRepository();
        break;
      case 'category':
        repository = RepositoryFactory.createCategoryRepository();
        break;
      case 'budget':
        repository = RepositoryFactory.createBudgetRepository();
        break;
      default:
        throw new Error(`Unknown entity type: ${entity}`);
    }

    // Execute the operation
    switch (action) {
      case 'create':
        return await repository.create(data);
      case 'update':
        return await repository.update(data.id, data);
      case 'delete':
        return await repository.delete(data.id);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  /**
   * Remove pending operation
   * @param {string} operationId - Operation ID
   */
  removePendingOperation(operationId) {
    this.pendingOperations = this.pendingOperations.filter(
      op => op.id !== operationId
    );
    this.savePendingOperations();
  }

  /**
   * Clear all pending operations
   */
  clearPendingOperations() {
    this.pendingOperations = [];
    this.savePendingOperations();
  }

  /**
   * Get pending operations count
   * @returns {number} Count
   */
  getPendingCount() {
    return this.pendingOperations.length;
  }

  /**
   * Check if there are pending operations
   * @returns {boolean} True if pending operations exist
   */
  hasPendingOperations() {
    return this.pendingOperations.length > 0;
  }

  /**
   * Notify sync success
   * @param {Object} results - Sync results
   */
  notifySyncSuccess(results) {
    // Dispatch custom event for UI notification
    window.dispatchEvent(new CustomEvent('offlineSyncComplete', {
      detail: {
        success: true,
        message: `Successfully synced ${results.successful} operations`,
        results
      }
    }));
  }

  /**
   * Notify sync error
   * @param {Object} results - Sync results
   */
  notifySyncError(results) {
    // Dispatch custom event for UI notification
    window.dispatchEvent(new CustomEvent('offlineSyncComplete', {
      detail: {
        success: false,
        message: `Failed to sync ${results.failed} operations`,
        results
      }
    }));
  }

  /**
   * Get offline status info
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      isOnline: this.isOnline,
      pendingOperations: this.pendingOperations.length,
      oldestOperation: this.pendingOperations[0]?.timestamp || null,
      newestOperation: this.pendingOperations[this.pendingOperations.length - 1]?.timestamp || null
    };
  }

  /**
   * Create offline-capable wrapper for repository methods
   * @param {Object} repository - Repository instance
   * @param {string} entityType - Entity type name
   * @returns {Object} Wrapped repository
   */
  wrapRepository(repository, entityType) {
    const handler = this;
    
    return new Proxy(repository, {
      get(target, prop) {
        const original = target[prop];
        
        // Only wrap mutation methods
        if (typeof original === 'function' && 
            ['create', 'update', 'delete', 'createMultiple', 'updateMultiple', 'deleteMultiple'].includes(prop)) {
          
          return async function(...args) {
            // If online, execute normally
            if (handler.isOnline) {
              return original.apply(target, args);
            }
            
            // If offline, queue the operation
            console.log(`📵 Offline: Queueing ${prop} operation for ${entityType}`);
            
            const operationData = {
              type: 'repository',
              entity: entityType,
              action: prop,
              data: args[0], // First argument is usually the data
              args: args // Store all arguments for complex operations
            };
            
            const operationId = handler.queueOperation(operationData);
            
            // Return a mock successful response
            return {
              success: true,
              offline: true,
              operationId,
              message: 'Operation queued for sync when online',
              data: args[0] // Return the data as if it was saved
            };
          };
        }
        
        return original;
      }
    });
  }
}

// Create singleton instance
const offlineHandler = new OfflineHandler();

export default offlineHandler;
export { OfflineHandler };
