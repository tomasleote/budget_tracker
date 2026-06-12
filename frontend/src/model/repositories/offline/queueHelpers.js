/**
 * Pure helpers for OfflineHandler queue management.
 */

const STORAGE_KEY = 'budget_tracker_pending_operations';

/**
 * Generate a unique operation ID.
 */
export function generateOperationId() {
  return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function loadPendingOperations() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function savePendingOperations(operations) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(operations));
  } catch {
    // Storage errors are non-fatal; caller logs if needed
  }
}

/** Methods eligible for offline queueing on a repository proxy. */
export const MUTATION_METHODS = new Set([
  'create', 'update', 'delete', 'createMultiple', 'updateMultiple', 'deleteMultiple'
]);
