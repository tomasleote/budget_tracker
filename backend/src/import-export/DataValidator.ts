import { 
  ImportError, 
  ImportWarning, 
  DataValidationResult, 
  IMPORT_ERROR_CODES, 
  IMPORT_WARNING_CODES,
  IMPORT_LIMITS 
} from './types';
import { logger } from '../config/logger';

export class DataValidator {
  private errors: ImportError[] = [];
  private warnings: ImportWarning[] = [];

  /**
   * Validate transaction data
   */
  validateTransactionRow(row: any, rowIndex: number, existingCategories: Map<string, any>): boolean {
    let isValid = true;

    // Validate required fields
    if (!row.type || typeof row.type !== 'string') {
      this.addError(rowIndex, 'type', row.type, IMPORT_ERROR_CODES.MISSING_REQUIRED_FIELD, 'Transaction type is required');
      isValid = false;
    } else if (!['income', 'expense'].includes(row.type.toLowerCase())) {
      this.addError(rowIndex, 'type', row.type, IMPORT_ERROR_CODES.INVALID_TYPE, 'Type must be "income" or "expense"');
      isValid = false;
    }

    // Validate amount
    if (row.amount === undefined || row.amount === null || row.amount === '') {
      this.addError(rowIndex, 'amount', row.amount, IMPORT_ERROR_CODES.MISSING_REQUIRED_FIELD, 'Amount is required');
      isValid = false;
    } else {
      const amount = this.parseAmount(row.amount);
      if (isNaN(amount) || amount <= 0) {
        this.addError(rowIndex, 'amount', row.amount, IMPORT_ERROR_CODES.INVALID_AMOUNT, 'Amount must be a positive number');
        isValid = false;
      } else if (amount > 999999999.99) {
        this.addError(rowIndex, 'amount', row.amount, IMPORT_ERROR_CODES.INVALID_AMOUNT, 'Amount cannot exceed 999,999,999.99');
        isValid = false;
      }
    }

    // Validate description
    if (!row.description || typeof row.description !== 'string' || row.description.trim().length === 0) {
      this.addError(rowIndex, 'description', row.description, IMPORT_ERROR_CODES.MISSING_REQUIRED_FIELD, 'Description is required');
      isValid = false;
    } else if (row.description.length > 200) {
      this.addWarning(rowIndex, 'description', row.description, IMPORT_WARNING_CODES.DATA_TRUNCATED, 'Description will be truncated to 200 characters');
    }

    // Validate category
    if (!row.category || typeof row.category !== 'string') {
      this.addError(rowIndex, 'category', row.category, IMPORT_ERROR_CODES.MISSING_REQUIRED_FIELD, 'Category is required');
      isValid = false;
    } else {
      // Check if category exists (by name or ID)
      const categoryExists = this.checkCategoryExists(row.category, existingCategories);
      if (!categoryExists) {
        this.addError(rowIndex, 'category', row.category, IMPORT_ERROR_CODES.CATEGORY_NOT_FOUND, `Category "${row.category}" not found`);
        isValid = false;
      }
    }

    // Validate date
    if (!row.date) {
      this.addError(rowIndex, 'date', row.date, IMPORT_ERROR_CODES.MISSING_REQUIRED_FIELD, 'Date is required');
      isValid = false;
    } else {
      const parsedDate = this.parseDate(row.date);
      if (!parsedDate) {
        this.addError(rowIndex, 'date', row.date, IMPORT_ERROR_CODES.INVALID_DATE_FORMAT, 'Invalid date format. Use YYYY-MM-DD, MM/DD/YYYY, or DD/MM/YYYY');
        isValid = false;
      } else {
        // Check if date is too far in the future
        const now = new Date();
        const maxFutureDate = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // 1 week
        if (parsedDate > maxFutureDate) {
          this.addWarning(rowIndex, 'date', row.date, IMPORT_WARNING_CODES.AUTO_CORRECTED_VALUE, 'Date is more than 1 week in the future');
        }
      }
    }

    return isValid;
  }

  /**
   * Validate category data
   */
  validateCategoryRow(row: any, rowIndex: number, existingCategories: Map<string, any>): boolean {
    let isValid = true;

    // Validate name
    if (!row.name || typeof row.name !== 'string' || row.name.trim().length === 0) {
      this.addError(rowIndex, 'name', row.name, IMPORT_ERROR_CODES.MISSING_REQUIRED_FIELD, 'Category name is required');
      isValid = false;
    } else if (row.name.length > 50) {
      this.addError(rowIndex, 'name', row.name, IMPORT_ERROR_CODES.INVALID_FIELD_VALUE, 'Category name must be 50 characters or less');
      isValid = false;
    } else {
      // Check for duplicate names
      const nameExists = Array.from(existingCategories.values()).some(cat => 
        cat.name.toLowerCase() === row.name.toLowerCase() && cat.type === row.type
      );
      if (nameExists) {
        this.addError(rowIndex, 'name', row.name, IMPORT_ERROR_CODES.DUPLICATE_ENTRY, `Category "${row.name}" already exists`);
        isValid = false;
      }
    }

    // Validate type
    if (!row.type || !['income', 'expense'].includes(row.type.toLowerCase())) {
      this.addError(rowIndex, 'type', row.type, IMPORT_ERROR_CODES.INVALID_TYPE, 'Type must be "income" or "expense"');
      isValid = false;
    }

    // Validate color
    if (!row.color || !this.isValidHexColor(row.color)) {
      this.addError(rowIndex, 'color', row.color, IMPORT_ERROR_CODES.INVALID_FIELD_VALUE, 'Color must be a valid hex color (e.g., #FF0000)');
      isValid = false;
    }

    // Validate icon
    if (!row.icon || typeof row.icon !== 'string' || row.icon.trim().length === 0) {
      this.addError(rowIndex, 'icon', row.icon, IMPORT_ERROR_CODES.MISSING_REQUIRED_FIELD, 'Icon is required');
      isValid = false;
    }

    // Validate description (optional)
    if (row.description && row.description.length > 200) {
      this.addWarning(rowIndex, 'description', row.description, IMPORT_WARNING_CODES.DATA_TRUNCATED, 'Description will be truncated to 200 characters');
    }

    // Validate parent category (optional)
    if (row.parent_category) {
      const parentExists = this.checkCategoryExists(row.parent_category, existingCategories);
      if (!parentExists) {
        this.addError(rowIndex, 'parent_category', row.parent_category, IMPORT_ERROR_CODES.CATEGORY_NOT_FOUND, `Parent category "${row.parent_category}" not found`);
        isValid = false;
      }
    }

    return isValid;
  }

  /**
   * Validate budget data
   */
  validateBudgetRow(row: any, rowIndex: number, existingCategories: Map<string, any>, existingBudgets: any[]): boolean {
    let isValid = true;

    // Validate category
    if (!row.category) {
      this.addError(rowIndex, 'category', row.category, IMPORT_ERROR_CODES.MISSING_REQUIRED_FIELD, 'Category is required');
      isValid = false;
    } else {
      const categoryExists = this.checkCategoryExists(row.category, existingCategories);
      if (!categoryExists) {
        this.addError(rowIndex, 'category', row.category, IMPORT_ERROR_CODES.CATEGORY_NOT_FOUND, `Category "${row.category}" not found`);
        isValid = false;
      } else {
        // Check if category is expense type
        const category = this.findCategory(row.category, existingCategories);
        if (category && category.type !== 'expense') {
          this.addError(rowIndex, 'category', row.category, IMPORT_ERROR_CODES.INVALID_FIELD_VALUE, 'Budgets can only be created for expense categories');
          isValid = false;
        }
      }
    }

    // Validate amount
    if (row.amount === undefined || row.amount === null || row.amount === '') {
      this.addError(rowIndex, 'amount', row.amount, IMPORT_ERROR_CODES.MISSING_REQUIRED_FIELD, 'Budget amount is required');
      isValid = false;
    } else {
      const amount = this.parseAmount(row.amount);
      if (isNaN(amount) || amount <= 0) {
        this.addError(rowIndex, 'amount', row.amount, IMPORT_ERROR_CODES.INVALID_AMOUNT, 'Budget amount must be a positive number');
        isValid = false;
      }
    }

    // Validate period
    if (!row.period || !['weekly', 'monthly', 'yearly'].includes(row.period.toLowerCase())) {
      this.addError(rowIndex, 'period', row.period, IMPORT_ERROR_CODES.INVALID_PERIOD, 'Period must be "weekly", "monthly", or "yearly"');
      isValid = false;
    }

    // Validate start date
    if (!row.start_date) {
      this.addError(rowIndex, 'start_date', row.start_date, IMPORT_ERROR_CODES.MISSING_REQUIRED_FIELD, 'Start date is required');
      isValid = false;
    } else {
      const startDate = this.parseDate(row.start_date);
      if (!startDate) {
        this.addError(rowIndex, 'start_date', row.start_date, IMPORT_ERROR_CODES.INVALID_DATE_FORMAT, 'Invalid start date format');
        isValid = false;
      } else {
        // Validate end date if provided
        if (row.end_date) {
          const endDate = this.parseDate(row.end_date);
          if (!endDate) {
            this.addError(rowIndex, 'end_date', row.end_date, IMPORT_ERROR_CODES.INVALID_DATE_FORMAT, 'Invalid end date format');
            isValid = false;
          } else if (endDate <= startDate) {
            this.addError(rowIndex, 'end_date', row.end_date, IMPORT_ERROR_CODES.INVALID_FIELD_VALUE, 'End date must be after start date');
            isValid = false;
          }
        }

        // Check for overlapping budgets
        if (isValid) {
          const overlapping = this.checkBudgetOverlap(row, existingBudgets, existingCategories);
          if (overlapping) {
            this.addError(rowIndex, 'start_date', row.start_date, IMPORT_ERROR_CODES.OVERLAPPING_BUDGET, 'Budget period overlaps with existing budget for this category');
            isValid = false;
          }
        }
      }
    }

    return isValid;
  }

  /**
   * Get validation results
   */
  getValidationResults(totalRows: number): DataValidationResult {
    const validRows = totalRows - this.getRowsWithErrors().length;
    
    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      summary: {
        total_rows: totalRows,
        valid_rows: validRows,
        rows_with_errors: this.getRowsWithErrors().length,
        rows_with_warnings: this.getRowsWithWarnings().length
      }
    };
  }

  /**
   * Reset validation state
   */
  reset(): void {
    this.errors = [];
    this.warnings = [];
  }

  // Private helper methods
  private addError(row: number, field: string, value: any, code: string, message: string): void {
    this.errors.push({
      row,
      field,
      value,
      error_code: code,
      message,
      severity: 'error'
    });
  }

  private addWarning(row: number, field: string, value: any, code: string, message: string): void {
    this.warnings.push({
      row,
      field,
      value,
      warning_code: code,
      message
    });
  }

  private parseAmount(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Remove currency symbols and commas
      const cleaned = value.replace(/[$,€£¥]/g, '').trim();
      return parseFloat(cleaned);
    }
    return NaN;
  }

  private parseDate(value: any): Date | null {
    if (!value) return null;
    
    // Try different date formats
    const formats = IMPORT_LIMITS.SUPPORTED_DATE_FORMATS;
    const dateStr = value.toString().trim();
    
    for (const format of formats) {
      const parsed = this.parseDateWithFormat(dateStr, format);
      if (parsed && !isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    
    // Try native Date parsing as fallback
    const nativeDate = new Date(dateStr);
    return !isNaN(nativeDate.getTime()) ? nativeDate : null;
  }

  private parseDateWithFormat(dateStr: string, format: string): Date | null {
    try {
      // Simple format matching - in a production app, use a proper date library
      if (format === 'YYYY-MM-DD') {
        const match = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
        if (match && match[1] && match[2] && match[3]) {
          return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
        }
      } else if (format === 'MM/DD/YYYY') {
        const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (match && match[1] && match[2] && match[3]) {
          return new Date(parseInt(match[3]), parseInt(match[1]) - 1, parseInt(match[2]));
        }
      } else if (format === 'DD/MM/YYYY') {
        const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (match && match[1] && match[2] && match[3]) {
          return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
        }
      }
      // Add more format parsers as needed
      return null;
    } catch {
      return null;
    }
  }

  private isValidHexColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }

  private checkCategoryExists(categoryNameOrId: string, existingCategories: Map<string, any>): boolean {
    // Check by ID first
    if (existingCategories.has(categoryNameOrId)) {
      return true;
    }
    
    // Check by name
    return Array.from(existingCategories.values()).some(cat => 
      cat.name.toLowerCase() === categoryNameOrId.toLowerCase()
    );
  }

  private findCategory(categoryNameOrId: string, existingCategories: Map<string, any>): any | null {
    // Check by ID first
    if (existingCategories.has(categoryNameOrId)) {
      return existingCategories.get(categoryNameOrId);
    }
    
    // Check by name
    return Array.from(existingCategories.values()).find(cat => 
      cat.name.toLowerCase() === categoryNameOrId.toLowerCase()
    ) || null;
  }

  private checkBudgetOverlap(budgetRow: any, existingBudgets: any[], existingCategories: Map<string, any>): boolean {
    const category = this.findCategory(budgetRow.category, existingCategories);
    if (!category) return false;

    const startDate = this.parseDate(budgetRow.start_date);
    const endDate = budgetRow.end_date ? this.parseDate(budgetRow.end_date) : this.calculateEndDate(startDate!, budgetRow.period);
    
    if (!startDate || !endDate) return false;

    return existingBudgets.some(budget => {
      if (budget.category_id !== category.id) return false;
      
      const existingStart = new Date(budget.start_date);
      const existingEnd = new Date(budget.end_date);
      
      // Check for overlap
      return startDate <= existingEnd && endDate >= existingStart;
    });
  }

  private calculateEndDate(startDate: Date, period: string): Date {
    const end = new Date(startDate);
    
    switch (period.toLowerCase()) {
      case 'weekly':
        end.setDate(startDate.getDate() + 6);
        break;
      case 'monthly':
        end.setMonth(startDate.getMonth() + 1);
        end.setDate(end.getDate() - 1);
        break;
      case 'yearly':
        end.setFullYear(startDate.getFullYear() + 1);
        end.setDate(end.getDate() - 1);
        break;
    }
    
    return end;
  }

  private getRowsWithErrors(): number[] {
    return [...new Set(this.errors.map(e => e.row))];
  }

  private getRowsWithWarnings(): number[] {
    return [...new Set(this.warnings.map(w => w.row))];
  }
}
