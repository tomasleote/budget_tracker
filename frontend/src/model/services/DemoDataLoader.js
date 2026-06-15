/**
 * DemoDataLoader
 * Populates the localStorage repositories with generated mock data for demo mode.
 *
 * Track B calls loadDemoData() from enterDemo and clearDemoData() from exitDemo.
 * The mock generator writes to the same storage keys the localStorage repositories
 * read (budget_tracker_transactions / _budgets), so a populated dashboard follows.
 *
 * Public API:
 *   loadDemoData(): Promise<{ loaded: boolean, reason?: string }>
 *   clearDemoData(): void
 */

import {
  loadMockDataToStorage,
  clearMockData,
  hasMockData
} from '../../data/mockDataGenerator.js';

const DEMO_MONTHS = 4;

/**
 * Load demo data into localStorage. Idempotent: if demo data is already present
 * it returns without regenerating, so repeated enterDemo calls never duplicate.
 * @returns {Promise<{ loaded: boolean, reason?: string }>}
 */
export async function loadDemoData() {
  if (hasMockData()) {
    return { loaded: false, reason: 'already-populated' };
  }

  await loadMockDataToStorage(DEMO_MONTHS);
  return { loaded: true };
}

/**
 * Remove all demo data from localStorage.
 */
export function clearDemoData() {
  clearMockData();
}
