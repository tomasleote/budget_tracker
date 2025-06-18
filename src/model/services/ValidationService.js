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

class ValidationService {
  // Transaction validation using utility functions
  static validateTransaction(data) {
    return safeExecute(() => {
      return validateTransaction(data);
    }, { isValid: false, errors: ['Validation failed'], warnings: [] });
  }

  // Budget validation using utility functions
  static validateBudget(data) {
    return safeExecute(() => {
      return validateBudget(data);
    }, { isValid: false, errors: ['Validation failed'], warnings: [] });
  }

  // Category validation using utility functions
  static validateCategory(data) {
    return safeExecute(() => {
      return validateCategory(data);
    }, { isValid: false, errors: ['Validation failed'], warnings: [] });
  }

  // User validation using utility functions
  static validateUser(data) {
    return safeExecute(() => {
      return validateUser(data);
    }, { isValid: false, errors: ['Validation failed'], warnings: [] });
  }

  // Form input validation using utility functions
  static validateFormInput(value, rules = {}) {
    return safeExecute(() => {
      return validateFormInput(value, rules);
    }, { isValid: false, errors: ['Validation failed'] });
  }

  // Batch validation using utility functions
  static validateBatch(items, validator) {
    return safeExecute(() => {
      return validateBatch(items, validator);
    }, {
      isValid: false,
      results: [],
      validItems: [],
      invalidItems: []
    });
  }

  // Business rule validations using utility functions
  static validateBusinessRules(data, context = {}) {
    return safeExecute(() => {
      return validateBusinessRules(data, context);
    }, { isValid: false, errors: ['Business rule validation failed'], warnings: [] });
  }

  // Helper validation functions using utility functions
  static isValidEmail(email) {
    return safeExecute(() => {
      return isValidEmail(email);
    }, false);
  }

  static isValidHexColor(color) {
    return safeExecute(() => {
      return isValidHexColor(color);
    }, false);
  }

  static isValidUrl(url) {
    return safeExecute(() => {
      return isValidUrl(url);
    }, false);
  }

  // Sanitization functions using utility functions
  static sanitizeInput(input, type = 'text') {
    return safeExecute(() => {
      return sanitizeInput(input, type);
    }, input);
  }

  // Data normalization using utility functions
  static normalizeData(data, schema = {}) {
    return safeExecute(() => {
      return normalizeData(data, schema);
    }, data);
  }

  // Enhanced validation methods
  static validateMultipleFields(data, fieldRules) {
    return safeExecute(() => {
      const results = {};
      let allValid = true;
      const allErrors = [];

      Object.entries(fieldRules).forEach(([fieldName, rules]) => {
        const fieldValue = data[fieldName];
        const validation = validateFormInput(fieldValue, { ...rules, fieldName });
        
        results[fieldName] = validation;
        
        if (!validation.isValid) {
          allValid = false;
          allErrors.push(...validation.errors);
        }
      });

      return {
        isValid: allValid,
        errors: allErrors,
        fieldResults: results,
        validFields: Object.keys(results).filter(field => results[field].isValid),
        invalidFields: Object.keys(results).filter(field => !results[field].isValid)
      };
    }, {
      isValid: false,
      errors: ['Multi-field validation failed'],
      fieldResults: {},
      validFields: [],
      invalidFields: []
    });
  }

  // Conditional validation
  static validateConditional(data, conditions) {
    return safeExecute(() => {
      const errors = [];
      const warnings = [];

      conditions.forEach(condition => {
        const { when, validate, message } = condition;
        
        // Check if condition applies
        const shouldValidate = typeof when === 'function' ? when(data) : when;
        
        if (shouldValidate) {
          const isValid = typeof validate === 'function' ? validate(data) : validate;
          
          if (!isValid) {
            if (condition.type === 'warning') {
              warnings.push(message || 'Conditional validation warning');
            } else {
              errors.push(message || 'Conditional validation failed');
            }
          }
        }
      });

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    }, {
      isValid: false,
      errors: ['Conditional validation failed'],
      warnings: []
    });
  }

  // Cross-field validation
  static validateCrossField(data, rules) {
    return safeExecute(() => {
      const errors = [];
      const warnings = [];

      rules.forEach(rule => {
        const { fields, validator, message, type = 'error' } = rule;
        const fieldValues = fields.map(field => data[field]);
        
        const isValid = validator(...fieldValues, data);
        
        if (!isValid) {
          if (type === 'warning') {
            warnings.push(message || 'Cross-field validation warning');
          } else {
            errors.push(message || 'Cross-field validation failed');
          }
        }
      });

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    }, {
      isValid: false,
      errors: ['Cross-field validation failed'],
      warnings: []
    });
  }

  // Async validation support
  static async validateAsync(data, validator) {
    try {
      const result = await validator(data);
      return result;
    } catch (error) {
      return {
        isValid: false,
        errors: [error.message || 'Async validation failed'],
        warnings: []
      };
    }
  }

  // Schema validation
  static validateSchema(data, schema) {
    return safeExecute(() => {
      const errors = [];
      const warnings = [];
      const normalizedData = { ...data };

      // Validate required fields
      if (schema.required) {
        schema.required.forEach(field => {
          if (!data.hasOwnProperty(field) || data[field] === null || data[field] === undefined) {
            errors.push(`Required field '${field}' is missing`);
          }
        });
      }

      // Validate field types and rules
      if (schema.properties) {
        Object.entries(schema.properties).forEach(([fieldName, fieldSchema]) => {
          const value = data[fieldName];
          
          if (value !== null && value !== undefined) {
            // Type validation
            if (fieldSchema.type) {
              const validation = validateFormInput(value, {
                type: fieldSchema.type,
                fieldName,
                ...fieldSchema
              });
              
              if (!validation.isValid) {
                errors.push(...validation.errors);
              }
            }

            // Custom validator
            if (fieldSchema.validator) {
              const isValid = fieldSchema.validator(value, data);
              if (!isValid) {
                errors.push(fieldSchema.message || `Invalid value for field '${fieldName}'`);
              }
            }

            // Transform value if specified
            if (fieldSchema.transform) {
              normalizedData[fieldName] = fieldSchema.transform(value);
            }
          }
        });
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        data: normalizedData
      };
    }, {
      isValid: false,
      errors: ['Schema validation failed'],
      warnings: [],
      data
    });
  }

  // Validation pipeline
  static validatePipeline(data, validators) {
    return safeExecute(() => {
      const results = [];
      let currentData = { ...data };
      let allValid = true;
      const allErrors = [];
      const allWarnings = [];

      validators.forEach((validator, index) => {
        const result = typeof validator === 'function' ? 
          validator(currentData) : 
          this.validateSchema(currentData, validator);
        
        results.push({
          step: index + 1,
          validator: validator.name || `Step ${index + 1}`,
          ...result
        });

        if (!result.isValid) {
          allValid = false;
        }

        allErrors.push(...result.errors);
        allWarnings.push(...result.warnings);

        // Update data for next validator if normalization occurred
        if (result.data) {
          currentData = result.data;
        }
      });

      return {
        isValid: allValid,
        errors: allErrors,
        warnings: allWarnings,
        results,
        data: currentData,
        passedSteps: results.filter(r => r.isValid).length,
        totalSteps: results.length
      };
    }, {
      isValid: false,
      errors: ['Validation pipeline failed'],
      warnings: [],
      results: [],
      data,
      passedSteps: 0,
      totalSteps: 0
    });
  }

  // Validation reporting
  static generateValidationReport(validationResults) {
    return safeExecute(() => {
      const report = {
        timestamp: new Date().toISOString(),
        summary: {
          isValid: validationResults.isValid,
          totalErrors: validationResults.errors?.length || 0,
          totalWarnings: validationResults.warnings?.length || 0
        },
        details: {
          errors: validationResults.errors || [],
          warnings: validationResults.warnings || [],
          fieldResults: validationResults.fieldResults || {},
          additionalInfo: {}
        },
        recommendations: []
      };

      // Generate recommendations based on errors
      if (report.details.errors.length > 0) {
        report.recommendations.push('Review and correct the validation errors listed above');
      }

      if (report.details.warnings.length > 0) {
        report.recommendations.push('Consider addressing the warnings to improve data quality');
      }

      // Add field-specific recommendations
      if (validationResults.fieldResults) {
        Object.entries(validationResults.fieldResults).forEach(([field, result]) => {
          if (!result.isValid) {
            report.recommendations.push(`Fix validation issues in field: ${field}`);
          }
        });
      }

      return report;
    }, {
      timestamp: new Date().toISOString(),
      summary: { isValid: false, totalErrors: 1, totalWarnings: 0 },
      details: { errors: ['Failed to generate validation report'], warnings: [], fieldResults: {}, additionalInfo: {} },
      recommendations: ['Check validation configuration']
    });
  }
}

export default ValidationService;
