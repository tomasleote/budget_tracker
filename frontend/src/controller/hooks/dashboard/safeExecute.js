import { logger } from '../../utils/logger.js';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';

// Safe fallback function for missing utilities
export const safeExecute = (fn, fallback) => {
  try {
    return fn();
  } catch (error) {
    logger.warn('Safe execute error:', error);
    return fallback;
  }
};

// Async version of safe execute
export const asyncSafeExecute = async (fn, fallback) => {
  try {
    return await fn();
  } catch (error) {
    logger.warn('Async safe execute error:', error);
    return fallback;
  }
};

// Basic icon constants
export const COMMON_ICONS = {
  SUCCESS: 'check-circle',
  WARNING: 'exclamation-triangle',
  ERROR: 'times-circle',
  INFO: 'info-circle',
  INCOME: 'arrow-up',
  EXPENSE: 'arrow-down'
};
