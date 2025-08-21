/**
 * Base Transformer
 * Abstract base class for data transformation between frontend and backend formats
 */
class BaseTransformer {
  /**
   * Transform from backend format to frontend format
   * @param {Object} backendData - Data from API
   * @returns {Object} Frontend formatted data
   */
  static fromBackend(backendData) {
    throw new Error('fromBackend method must be implemented by subclass');
  }

  /**
   * Transform from frontend format to backend format
   * @param {Object} frontendData - Data from frontend
   * @returns {Object} Backend formatted data
   */
  static toBackend(frontendData) {
    throw new Error('toBackend method must be implemented by subclass');
  }

  /**
   * Transform array of items from backend format
   * @param {Array} backendDataArray - Array of backend data
   * @returns {Array} Array of frontend formatted data
   */
  static fromBackendArray(backendDataArray) {
    if (!Array.isArray(backendDataArray)) {
      return [];
    }
    return backendDataArray.map(item => this.fromBackend(item));
  }

  /**
   * Transform array of items to backend format
   * @param {Array} frontendDataArray - Array of frontend data
   * @returns {Array} Array of backend formatted data
   */
  static toBackendArray(frontendDataArray) {
    if (!Array.isArray(frontendDataArray)) {
      return [];
    }
    return frontendDataArray.map(item => this.toBackend(item));
  }

  /**
   * Convert snake_case to camelCase
   * @param {string} str - Snake case string
   * @returns {string} Camel case string
   */
  static snakeToCamel(str) {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  /**
   * Convert camelCase to snake_case
   * @param {string} str - Camel case string
   * @returns {string} Snake case string
   */
  static camelToSnake(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  /**
   * Convert object keys from snake_case to camelCase
   * @param {Object} obj - Object with snake_case keys
   * @returns {Object} Object with camelCase keys
   */
  static snakeToCamelKeys(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return obj;
    if (Array.isArray(obj)) return obj.map(item => this.snakeToCamelKeys(item));

    const transformed = {};
    Object.keys(obj).forEach(key => {
      const camelKey = this.snakeToCamel(key);
      transformed[camelKey] = this.snakeToCamelKeys(obj[key]);
    });
    return transformed;
  }

  /**
   * Convert object keys from camelCase to snake_case
   * @param {Object} obj - Object with camelCase keys
   * @returns {Object} Object with snake_case keys
   */
  static camelToSnakeKeys(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return obj;
    if (Array.isArray(obj)) return obj.map(item => this.camelToSnakeKeys(item));

    const transformed = {};
    Object.keys(obj).forEach(key => {
      const snakeKey = this.camelToSnake(key);
      transformed[snakeKey] = this.camelToSnakeKeys(obj[key]);
    });
    return transformed;
  }

  /**
   * Parse date string to Date object
   * @param {string|Date} dateValue - Date string or Date object
   * @returns {Date|null} Date object or null
   */
  static parseDate(dateValue) {
    if (!dateValue) return null;
    if (dateValue instanceof Date) return dateValue;
    
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? null : date;
  }

  /**
   * Format date to ISO string
   * @param {Date|string} date - Date object or string
   * @returns {string|null} ISO date string or null
   */
  static formatDateToISO(date) {
    if (!date) return null;
    const parsedDate = this.parseDate(date);
    return parsedDate ? parsedDate.toISOString() : null;
  }

  /**
   * Parse amount to float with 2 decimal precision
   * @param {string|number} amount - Amount value
   * @returns {number} Parsed amount
   */
  static parseAmount(amount) {
    const parsed = parseFloat(amount);
    return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
  }

  /**
   * Parse boolean value
   * @param {any} value - Value to parse
   * @returns {boolean} Boolean value
   */
  static parseBoolean(value) {
    return Boolean(value);
  }

  /**
   * Clean string value
   * @param {string} value - String to clean
   * @returns {string} Cleaned string
   */
  static cleanString(value) {
    return value ? value.trim() : '';
  }
}

export default BaseTransformer;
