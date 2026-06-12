// Pure helpers for storage size measurement and statistics.
// Extracted to keep StorageService under the line-count limit.

import {
  getStorageItem,
  setStorageItem,
  removeStorageItem
} from '../../../controller/utils/index.js';

export function calculateStorageSize(storageKeys) {
  try {
    let totalSize = 0;
    Object.values(storageKeys).forEach(key => {
      const item = localStorage.getItem(key);
      if (item) totalSize += item.length;
    });
    return {
      bytes: totalSize,
      kb: Math.round(totalSize / 1024 * 100) / 100,
      mb: Math.round(totalSize / (1024 * 1024) * 100) / 100
    };
  } catch (e) {
    return { bytes: 0, kb: 0, mb: 0 };
  }
}

export function getStorageBreakdown(storageKeys) {
  try {
    const breakdown = {};
    Object.entries(storageKeys).forEach(([name, key]) => {
      const item = localStorage.getItem(key);
      breakdown[name] = {
        key,
        exists: item !== null,
        size: item ? item.length : 0,
        sizeKB: item ? Math.round(item.length / 1024 * 100) / 100 : 0
      };
    });
    return breakdown;
  } catch (e) {
    return {};
  }
}

export function getStorageStats(storageKeys) {
  try {
    const breakdown = getStorageBreakdown(storageKeys);
    const totalSize = calculateStorageSize(storageKeys);
    return {
      totalSize,
      breakdown,
      largestItems: Object.entries(breakdown)
        .sort(([, a], [, b]) => b.size - a.size)
        .slice(0, 5)
        .map(([name, data]) => ({ name, ...data })),
      emptyItems: Object.entries(breakdown)
        .filter(([, data]) => !data.exists || data.size === 0)
        .map(([name]) => name),
      utilizationPercentage:
        (Object.values(breakdown).filter(data => data.exists).length /
          Object.keys(breakdown).length) * 100
    };
  } catch (e) {
    return null;
  }
}

export function measureStoragePerformance() {
  try {
    const testData = { test: 'performance_test_data' };

    const writeStart = performance.now();
    setStorageItem('__perf_test__', testData);
    const writeTime = performance.now() - writeStart;

    const readStart = performance.now();
    getStorageItem('__perf_test__');
    const readTime = performance.now() - readStart;

    removeStorageItem('__perf_test__');

    return {
      writeTime: Math.round(writeTime * 100) / 100,
      readTime: Math.round(readTime * 100) / 100,
      timestamp: new Date().toISOString()
    };
  } catch (e) {
    return { writeTime: 0, readTime: 0, timestamp: new Date().toISOString() };
  }
}
