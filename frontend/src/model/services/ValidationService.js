import {
  validateTransaction,
  validateBudget,
  validateCategory,
  validateUser,
  validateFormInput,
  validateBatch,
  validateBusinessRules,
  isValidEmail,
  isValidHexColor,
  isValidUrl,
  sanitizeInput,
  normalizeData,
  safeExecute
} from '../../controller/utils/index.js';
import {
  validateMultipleFields,
  validateConditional,
  validateCrossField,
  validateSchema,
  validatePipeline,
  generateValidationReport
} from './validation/enhancedValidators.js';

class ValidationService {
  static validateTransaction(data) {
    return safeExecute(() => validateTransaction(data), { isValid: false, errors: ['Validation failed'], warnings: [] });
  }

  static validateBudget(data) {
    return safeExecute(() => validateBudget(data), { isValid: false, errors: ['Validation failed'], warnings: [] });
  }

  static validateCategory(data) {
    return safeExecute(() => validateCategory(data), { isValid: false, errors: ['Validation failed'], warnings: [] });
  }

  static validateUser(data) {
    return safeExecute(() => validateUser(data), { isValid: false, errors: ['Validation failed'], warnings: [] });
  }

  static validateFormInput(value, rules = {}) {
    return safeExecute(() => validateFormInput(value, rules), { isValid: false, errors: ['Validation failed'] });
  }

  static validateBatch(items, validator) {
    return safeExecute(() => validateBatch(items, validator), {
      isValid: false,
      results: [],
      validItems: [],
      invalidItems: []
    });
  }

  static validateBusinessRules(data, context = {}) {
    return safeExecute(() => validateBusinessRules(data, context), {
      isValid: false,
      errors: ['Business rule validation failed'],
      warnings: []
    });
  }

  static isValidEmail(email) {
    return safeExecute(() => isValidEmail(email), false);
  }

  static isValidHexColor(color) {
    return safeExecute(() => isValidHexColor(color), false);
  }

  static isValidUrl(url) {
    return safeExecute(() => isValidUrl(url), false);
  }

  static sanitizeInput(input, type = 'text') {
    return safeExecute(() => sanitizeInput(input, type), input);
  }

  static normalizeData(data, schema = {}) {
    return safeExecute(() => normalizeData(data, schema), data);
  }

  static validateMultipleFields(data, fieldRules) {
    return validateMultipleFields(data, fieldRules);
  }

  static validateConditional(data, conditions) {
    return validateConditional(data, conditions);
  }

  static validateCrossField(data, rules) {
    return validateCrossField(data, rules);
  }

  static async validateAsync(data, validator) {
    try {
      return await validator(data);
    } catch (error) {
      return { isValid: false, errors: [error.message || 'Async validation failed'], warnings: [] };
    }
  }

  static validateSchema(data, schema) {
    return validateSchema(data, schema);
  }

  static validatePipeline(data, validators) {
    return validatePipeline(data, validators);
  }

  static generateValidationReport(validationResults) {
    return generateValidationReport(validationResults);
  }
}

export default ValidationService;
