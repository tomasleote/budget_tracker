// Enhanced validation methods extracted from ValidationService.
// All functions are pure — no side effects, no imports from service layer.

import {
  validateFormInput,
  safeExecute
} from '../../../controller/utils/index.js';

export function validateMultipleFields(data, fieldRules) {
  return safeExecute(() => {
    const results = {};
    let allValid = true;
    const allErrors = [];

    Object.entries(fieldRules).forEach(([fieldName, rules]) => {
      const validation = validateFormInput(data[fieldName], { ...rules, fieldName });
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
      validFields: Object.keys(results).filter(f => results[f].isValid),
      invalidFields: Object.keys(results).filter(f => !results[f].isValid)
    };
  }, {
    isValid: false,
    errors: ['Multi-field validation failed'],
    fieldResults: {},
    validFields: [],
    invalidFields: []
  });
}

export function validateConditional(data, conditions) {
  return safeExecute(() => {
    const errors = [];
    const warnings = [];

    conditions.forEach(({ when, validate, message, type }) => {
      const shouldValidate = typeof when === 'function' ? when(data) : when;
      if (!shouldValidate) return;

      const isValid = typeof validate === 'function' ? validate(data) : validate;
      if (!isValid) {
        const msg = message || 'Conditional validation failed';
        if (type === 'warning') warnings.push(msg);
        else errors.push(msg);
      }
    });

    return { isValid: errors.length === 0, errors, warnings };
  }, { isValid: false, errors: ['Conditional validation failed'], warnings: [] });
}

export function validateCrossField(data, rules) {
  return safeExecute(() => {
    const errors = [];
    const warnings = [];

    rules.forEach(({ fields, validator, message, type = 'error' }) => {
      const fieldValues = fields.map(f => data[f]);
      const isValid = validator(...fieldValues, data);
      if (!isValid) {
        const msg = message || 'Cross-field validation failed';
        if (type === 'warning') warnings.push(msg);
        else errors.push(msg);
      }
    });

    return { isValid: errors.length === 0, errors, warnings };
  }, { isValid: false, errors: ['Cross-field validation failed'], warnings: [] });
}

export function validateSchema(data, schema) {
  return safeExecute(() => {
    const errors = [];
    const warnings = [];
    const normalizedData = { ...data };

    if (schema.required) {
      schema.required.forEach(field => {
        if (!Object.prototype.hasOwnProperty.call(data, field) || data[field] == null) {
          errors.push(`Required field '${field}' is missing`);
        }
      });
    }

    if (schema.properties) {
      Object.entries(schema.properties).forEach(([fieldName, fieldSchema]) => {
        const value = data[fieldName];
        if (value == null) return;

        if (fieldSchema.type) {
          const validation = validateFormInput(value, { type: fieldSchema.type, fieldName, ...fieldSchema });
          if (!validation.isValid) errors.push(...validation.errors);
        }

        if (fieldSchema.validator) {
          if (!fieldSchema.validator(value, data)) {
            errors.push(fieldSchema.message || `Invalid value for field '${fieldName}'`);
          }
        }

        if (fieldSchema.transform) {
          normalizedData[fieldName] = fieldSchema.transform(value);
        }
      });
    }

    return { isValid: errors.length === 0, errors, warnings, data: normalizedData };
  }, { isValid: false, errors: ['Schema validation failed'], warnings: [], data });
}

export function validatePipeline(data, validators) {
  return safeExecute(() => {
    const results = [];
    let currentData = { ...data };
    let allValid = true;
    const allErrors = [];
    const allWarnings = [];

    validators.forEach((validator, index) => {
      const result = typeof validator === 'function'
        ? validator(currentData)
        : validateSchema(currentData, validator);

      results.push({ step: index + 1, validator: validator.name || `Step ${index + 1}`, ...result });

      if (!result.isValid) allValid = false;
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
      if (result.data) currentData = result.data;
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

export function generateValidationReport(validationResults) {
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

    if (report.details.errors.length > 0) {
      report.recommendations.push('Review and correct the validation errors listed above');
    }
    if (report.details.warnings.length > 0) {
      report.recommendations.push('Consider addressing the warnings to improve data quality');
    }
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
