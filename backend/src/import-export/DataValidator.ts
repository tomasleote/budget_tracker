import {
  ImportError,
  ImportWarning,
  DataValidationResult,
  IMPORT_ERROR_CODES,
  IMPORT_WARNING_CODES
} from './types';
import { parseAmount, parseDate, isValidHexColor } from './validation/dateHelpers';
import { checkCategoryExists, findCategory, checkBudgetOverlap } from './validation/categoryHelpers';

export class DataValidator {
  private errors: ImportError[] = [];
  private warnings: ImportWarning[] = [];

  validateTransactionRow(row: any, rowIndex: number, existingCategories: Map<string, any>): boolean {
    let isValid = true;

    if (!row.type || typeof row.type !== 'string') {
      this.addError(rowIndex, 'type', row.type, IMPORT_ERROR_CODES.MISSING_REQUIRED_FIELD, 'Transaction type is required');
      isValid = false;
    } else if (!['income', 'expense'].includes(row.type.toLowerCase())) {
      this.addError(rowIndex, 'type', row.type, IMPORT_ERROR_CODES.INVALID_TYPE, 'Type must be "income" or "expense"');
      isValid = false;
    }

    if (row.amount === undefined || row.amount === null || row.amount === '') {
      this.addError(rowIndex, 'amount', row.amount, IMPORT_ERROR_CODES.MISSING_REQUIRED_FIELD, 'Amount is required');
      isValid = false;
    } else {
      const amount = parseAmount(row.amount);
      if (isNaN(amount) || amount <= 0) {
        this.addError(rowIndex, 'amount', row.amount, IMPORT_ERROR_CODES.INVALID_AMOUNT, 'Amount must be a positive number');
        isValid = false;
      } else if (amount > 999999999.99) {
        this.addError(rowIndex, 'amount', row.amount, IMPORT_ERROR_CODES.INVALID_AMOUNT, 'Amount cannot exceed 999,999,999.99');
        isValid = false;
      }
    }

    if (!row.description || typeof row.description !== 'string' || row.description.trim().length === 0) {
      this.addError(rowIndex, 'description', row.description, IMPORT_ERROR_CODES.MISSING_REQUIRED_FIELD, 'Description is required');
      isValid = false;
    } else if (row.description.length > 200) {
      this.addWarning(rowIndex, 'description', row.description, IMPORT_WARNING_CODES.DATA_TRUNCATED, 'Description will be truncated to 200 characters');
    }

    if (!row.category || typeof row.category !== 'string') {
      this.addError(rowIndex, 'category', row.category, IMPORT_ERROR_CODES.MISSING_REQUIRED_FIELD, 'Category is required');
      isValid = false;
    } else if (!checkCategoryExists(row.category, existingCategories)) {
      this.addError(rowIndex, 'category', row.category, IMPORT_ERROR_CODES.CATEGORY_NOT_FOUND, `Category "${row.category}" not found`);
      isValid = false;
    }

    if (!row.date) {
      this.addError(rowIndex, 'date', row.date, IMPORT_ERROR_CODES.MISSING_REQUIRED_FIELD, 'Date is required');
      isValid = false;
    } else {
      const parsedDate = parseDate(row.date);
      if (!parsedDate) {
        this.addError(rowIndex, 'date', row.date, IMPORT_ERROR_CODES.INVALID_DATE_FORMAT, 'Invalid date format. Use YYYY-MM-DD, MM/DD/YYYY, or DD/MM/YYYY');
        isValid = false;
      } else {
        const maxFutureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        if (parsedDate > maxFutureDate) {
          this.addWarning(rowIndex, 'date', row.date, IMPORT_WARNING_CODES.AUTO_CORRECTED_VALUE, 'Date is more than 1 week in the future');
        }
      }
    }

    return isValid;
  }

  validateCategoryRow(row: any, rowIndex: number, existingCategories: Map<string, any>): boolean {
    let isValid = true;

    if (!row.name || typeof row.name !== 'string' || row.name.trim().length === 0) {
      this.addError(rowIndex, 'name', row.name, IMPORT_ERROR_CODES.MISSING_REQUIRED_FIELD, 'Category name is required');
      isValid = false;
    } else if (row.name.length > 50) {
      this.addError(rowIndex, 'name', row.name, IMPORT_ERROR_CODES.INVALID_FIELD_VALUE, 'Category name must be 50 characters or less');
      isValid = false;
    } else {
      const nameExists = Array.from(existingCategories.values()).some(
        cat => cat.name.toLowerCase() === row.name.toLowerCase() && cat.type === row.type
      );
      if (nameExists) {
        this.addError(rowIndex, 'name', row.name, IMPORT_ERROR_CODES.DUPLICATE_ENTRY, `Category "${row.name}" already exists`);
        isValid = false;
      }
    }

    if (!row.type || !['income', 'expense'].includes(row.type.toLowerCase())) {
      this.addError(rowIndex, 'type', row.type, IMPORT_ERROR_CODES.INVALID_TYPE, 'Type must be "income" or "expense"');
      isValid = false;
    }

    if (!row.color || !isValidHexColor(row.color)) {
      this.addError(rowIndex, 'color', row.color, IMPORT_ERROR_CODES.INVALID_FIELD_VALUE, 'Color must be a valid hex color (e.g., #FF0000)');
      isValid = false;
    }

    if (!row.icon || typeof row.icon !== 'string' || row.icon.trim().length === 0) {
      this.addError(rowIndex, 'icon', row.icon, IMPORT_ERROR_CODES.MISSING_REQUIRED_FIELD, 'Icon is required');
      isValid = false;
    }

    if (row.description && row.description.length > 200) {
      this.addWarning(rowIndex, 'description', row.description, IMPORT_WARNING_CODES.DATA_TRUNCATED, 'Description will be truncated to 200 characters');
    }

    if (row.parent_category) {
      if (!checkCategoryExists(row.parent_category, existingCategories)) {
        this.addError(rowIndex, 'parent_category', row.parent_category, IMPORT_ERROR_CODES.CATEGORY_NOT_FOUND, `Parent category "${row.parent_category}" not found`);
        isValid = false;
      }
    }

    return isValid;
  }

  validateBudgetRow(row: any, rowIndex: number, existingCategories: Map<string, any>, existingBudgets: any[]): boolean {
    let isValid = true;

    if (!row.category) {
      this.addError(rowIndex, 'category', row.category, IMPORT_ERROR_CODES.MISSING_REQUIRED_FIELD, 'Category is required');
      isValid = false;
    } else if (!checkCategoryExists(row.category, existingCategories)) {
      this.addError(rowIndex, 'category', row.category, IMPORT_ERROR_CODES.CATEGORY_NOT_FOUND, `Category "${row.category}" not found`);
      isValid = false;
    } else {
      const category = findCategory(row.category, existingCategories);
      if (category && category.type !== 'expense') {
        this.addError(rowIndex, 'category', row.category, IMPORT_ERROR_CODES.INVALID_FIELD_VALUE, 'Budgets can only be created for expense categories');
        isValid = false;
      }
    }

    if (row.amount === undefined || row.amount === null || row.amount === '') {
      this.addError(rowIndex, 'amount', row.amount, IMPORT_ERROR_CODES.MISSING_REQUIRED_FIELD, 'Budget amount is required');
      isValid = false;
    } else {
      const amount = parseAmount(row.amount);
      if (isNaN(amount) || amount <= 0) {
        this.addError(rowIndex, 'amount', row.amount, IMPORT_ERROR_CODES.INVALID_AMOUNT, 'Budget amount must be a positive number');
        isValid = false;
      }
    }

    if (!row.period || !['weekly', 'monthly', 'yearly'].includes(row.period.toLowerCase())) {
      this.addError(rowIndex, 'period', row.period, IMPORT_ERROR_CODES.INVALID_PERIOD, 'Period must be "weekly", "monthly", or "yearly"');
      isValid = false;
    }

    if (!row.start_date) {
      this.addError(rowIndex, 'start_date', row.start_date, IMPORT_ERROR_CODES.MISSING_REQUIRED_FIELD, 'Start date is required');
      isValid = false;
    } else {
      const startDate = parseDate(row.start_date);
      if (!startDate) {
        this.addError(rowIndex, 'start_date', row.start_date, IMPORT_ERROR_CODES.INVALID_DATE_FORMAT, 'Invalid start date format');
        isValid = false;
      } else {
        if (row.end_date) {
          const endDate = parseDate(row.end_date);
          if (!endDate) {
            this.addError(rowIndex, 'end_date', row.end_date, IMPORT_ERROR_CODES.INVALID_DATE_FORMAT, 'Invalid end date format');
            isValid = false;
          } else if (endDate <= startDate) {
            this.addError(rowIndex, 'end_date', row.end_date, IMPORT_ERROR_CODES.INVALID_FIELD_VALUE, 'End date must be after start date');
            isValid = false;
          }
        }
        if (isValid && checkBudgetOverlap(row, existingBudgets, existingCategories)) {
          this.addError(rowIndex, 'start_date', row.start_date, IMPORT_ERROR_CODES.OVERLAPPING_BUDGET, 'Budget period overlaps with existing budget for this category');
          isValid = false;
        }
      }
    }

    return isValid;
  }

  getValidationResults(totalRows: number): DataValidationResult {
    const rowsWithErrors = this.getRowsWithErrors();
    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      summary: {
        total_rows: totalRows,
        valid_rows: totalRows - rowsWithErrors.length,
        rows_with_errors: rowsWithErrors.length,
        rows_with_warnings: this.getRowsWithWarnings().length
      }
    };
  }

  reset(): void {
    this.errors = [];
    this.warnings = [];
  }

  private addError(row: number, field: string, value: any, code: string, message: string): void {
    this.errors.push({ row, field, value, error_code: code, message, severity: 'error' });
  }

  private addWarning(row: number, field: string, value: any, code: string, message: string): void {
    this.warnings.push({ row, field, value, warning_code: code, message });
  }

  private getRowsWithErrors(): number[] {
    return [...new Set(this.errors.map(e => e.row))];
  }

  private getRowsWithWarnings(): number[] {
    return [...new Set(this.warnings.map(w => w.row))];
  }
}

