import { logger } from '../../controller/utils/logger.js';
import {
  generateOperationId,
  loadPendingOperations,
  savePendingOperations,
  MUTATION_METHODS,
} from './offline/queueHelpers.js';

class OfflineHandler {
  constructor() {
    this.isOnline = navigator.onLine;
    this.pendingOperations = loadPendingOperations();
    this.listeners = new Set();
    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }

  handleOnline() {
    logger.debug('🌐 Connection restored');
    this.isOnline = true;
    this.notifyListeners(true);
    this.processPendingOperations();
  }

  handleOffline() {
    logger.debug('📵 Connection lost - switching to offline mode');
    this.isOnline = false;
    this.notifyListeners(false);
  }

  addConnectionListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(online) {
    this.listeners.forEach(callback => callback(online));
  }

  queueOperation(operation) {
    const queuedOp = {
      id: generateOperationId(),
      timestamp: new Date().toISOString(),
      ...operation
    };
    this.pendingOperations.push(queuedOp);
    savePendingOperations(this.pendingOperations);
    logger.debug('📋 Operation queued for sync:', queuedOp);
    return queuedOp.id;
  }

  async processPendingOperations() {
    if (this.pendingOperations.length === 0) {
      logger.debug('✅ No pending operations to sync');
      return;
    }

    logger.debug(`🔄 Processing ${this.pendingOperations.length} pending operations...`);
    const results = { successful: 0, failed: 0, errors: [] };

    for (const operation of [...this.pendingOperations]) {
      try {
        await this.processOperation(operation);
        this.removePendingOperation(operation.id);
        results.successful++;
      } catch (error) {
        logger.error('Failed to process operation:', operation, error);
        results.failed++;
        results.errors.push({ operation, error: error.message });
      }
    }

    logger.debug('📊 Sync complete:', results);
    if (results.failed > 0) { this.notifySyncError(results); }
    else { this.notifySyncSuccess(results); }

    return results;
  }

  async processOperation(operation) {
    const { entity, action, data } = operation;

    // Dynamic import avoids circular dependency with RepositoryFactory
    const { RepositoryFactory } = await import('./RepositoryFactory.js');

    let repository;
    switch (entity) {
      case 'transaction': repository = RepositoryFactory.createTransactionRepository(); break;
      case 'category':    repository = RepositoryFactory.createCategoryRepository();    break;
      case 'budget':      repository = RepositoryFactory.createBudgetRepository();      break;
      default: throw new Error(`Unknown entity type: ${entity}`);
    }

    switch (action) {
      case 'create': return await repository.create(data);
      case 'update': return await repository.update(data.id, data);
      case 'delete': return await repository.delete(data.id);
      default: throw new Error(`Unknown action: ${action}`);
    }
  }

  removePendingOperation(operationId) {
    this.pendingOperations = this.pendingOperations.filter(op => op.id !== operationId);
    savePendingOperations(this.pendingOperations);
  }

  clearPendingOperations() {
    this.pendingOperations = [];
    savePendingOperations(this.pendingOperations);
  }

  getPendingCount() { return this.pendingOperations.length; }

  hasPendingOperations() { return this.pendingOperations.length > 0; }

  notifySyncSuccess(results) {
    window.dispatchEvent(new CustomEvent('offlineSyncComplete', {
      detail: { success: true, message: `Successfully synced ${results.successful} operations`, results }
    }));
  }

  notifySyncError(results) {
    window.dispatchEvent(new CustomEvent('offlineSyncComplete', {
      detail: { success: false, message: `Failed to sync ${results.failed} operations`, results }
    }));
  }

  getStatus() {
    return {
      isOnline: this.isOnline,
      pendingOperations: this.pendingOperations.length,
      oldestOperation: this.pendingOperations[0]?.timestamp || null,
      newestOperation: this.pendingOperations[this.pendingOperations.length - 1]?.timestamp || null
    };
  }

  wrapRepository(repository, entityType) {
    const handler = this;
    return new Proxy(repository, {
      get(target, prop) {
        const original = target[prop];
        if (typeof original === 'function' && MUTATION_METHODS.has(prop)) {
          return async function(...args) {
            if (handler.isOnline) return original.apply(target, args);
            logger.debug(`📵 Offline: Queueing ${prop} operation for ${entityType}`);
            const operationId = handler.queueOperation({
              type: 'repository', entity: entityType, action: prop,
              data: args[0], args
            });
            return { success: true, offline: true, operationId, message: 'Operation queued for sync when online', data: args[0] };
          };
        }
        return original;
      }
    });
  }
}

const offlineHandler = new OfflineHandler();

export default offlineHandler;
export { OfflineHandler };
