import Papa from 'papaparse';
import { ImportOptions, IMPORT_LIMITS, STANDARD_FIELD_MAPPINGS } from './types';
import { logger } from '../config/logger';

export class CSVParser {
  /**
   * Parse CSV data into structured objects
   */
  static parseCSV(
    fileContent: string, 
    options: ImportOptions
  ): { data: any[]; meta: any; errors: any[] } {
    try {
      const parseOptions: Papa.ParseConfig = {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        delimiter: options.delimiter || 'auto',
        transformHeader: (header: string) => header.trim(),
        transform: (value: string, field: string) => {
          // Trim whitespace from all values
          if (typeof value === 'string') {
            return value.trim();
          }
          return value;
        }
      };

      const result = Papa.parse(fileContent, parseOptions);
      
      // Validate file size and row limits
      if (result.data.length > IMPORT_LIMITS.MAX_ROWS_CSV) {
        throw new Error(`CSV file exceeds maximum rows limit of ${IMPORT_LIMITS.MAX_ROWS_CSV}`);
      }

      // Map fields to standard format if not 'full' type
      if (options.type !== 'full') {
        const mappedData = this.mapFieldsToStandard(result.data, options.type);
        return {
          data: mappedData,
          meta: result.meta,
          errors: result.errors
        };
      }

      return {
        data: result.data,
        meta: result.meta,
        errors: result.errors
      };
    } catch (error) {
      logger.error('CSV parsing error:', error);
      throw error;
    }
  }

  /**
   * Generate CSV content from data
   */
  static generateCSV(
    data: any[], 
    type: 'transactions' | 'categories' | 'budgets',
    includeHeaders = true
  ): string {
    try {
      if (!data || data.length === 0) {
        return this.getEmptyTemplate(type);
      }

      const fieldMapping = STANDARD_FIELD_MAPPINGS.default?.[type];
      if (!fieldMapping) {
        throw new Error(`No field mapping found for type: ${type}`);
      }
      
      // Map data to CSV format
      const csvData = data.map(item => this.mapObjectToCSV(item, fieldMapping, type));

      const csvOptions: Papa.UnparseConfig = {
        header: includeHeaders,
        columns: Object.values(fieldMapping),
        delimiter: ',',
        quotes: true,
        quoteChar: '"',
        escapeChar: '"',
        newline: '\n'
      };

      return Papa.unparse(csvData, csvOptions);
    } catch (error) {
      logger.error('CSV generation error:', error);
      throw error;
    }
  }

  /**
   * Generate CSV template with headers and example data
   */
  static generateTemplate(
    type: 'transactions' | 'categories' | 'budgets',
    includeExamples = true
  ): string {
    const fieldMapping = STANDARD_FIELD_MAPPINGS.default?.[type];
    if (!fieldMapping) {
      throw new Error(`No field mapping found for type: ${type}`);
    }
    const headers = Object.values(fieldMapping);
    
    let data: any[] = [];
    
    if (includeExamples) {
      data = this.getExampleData(type);
    }

    const csvOptions: Papa.UnparseConfig = {
      header: true,
      columns: headers,
      delimiter: ',',
      quotes: true
    };

    return Papa.unparse(data, csvOptions);
  }

  /**
   * Validate CSV structure and headers
   */
  static validateCSVStructure(
    fileContent: string,
    expectedType: 'transactions' | 'categories' | 'budgets'
  ): { isValid: boolean; missingFields: string[]; extraFields: string[]; suggestions: string[] } {
    try {
      // Parse just the headers
      const headerLine = fileContent.split('\n')[0];
      if (!headerLine) {
        throw new Error('No header line found');
      }
      const parseResult = Papa.parse(headerLine, { header: false });
      const headers = parseResult.data[0] as string[];
      
      const cleanHeaders = headers.map(h => h.trim().toLowerCase());
      const expectedMapping = STANDARD_FIELD_MAPPINGS.default?.[expectedType];
      if (!expectedMapping) {
        throw new Error(`No field mapping found for type: ${expectedType}`);
      }
      const expectedFields = Object.values(expectedMapping).map(f => f.toLowerCase());
      const requiredFields = this.getRequiredFields(expectedType);

      // Check for missing required fields
      const missingFields = requiredFields.filter(field => 
        !cleanHeaders.some(header => this.isFieldMatch(header, field))
      );

      // Check for extra fields
      const extraFields = cleanHeaders.filter(header => 
        !expectedFields.some(field => this.isFieldMatch(header, field))
      );

      // Generate suggestions for mismatched fields
      const suggestions = this.generateFieldSuggestions(cleanHeaders, expectedFields);

      return {
        isValid: missingFields.length === 0,
        missingFields,
        extraFields,
        suggestions
      };
    } catch (error) {
      logger.error('CSV structure validation error:', error);
      return {
        isValid: false,
        missingFields: [],
        extraFields: [],
        suggestions: []
      };
    }
  }

  // Private helper methods
  private static mapFieldsToStandard(data: any[], type: 'transactions' | 'categories' | 'budgets'): any[] {
    const fieldMapping = STANDARD_FIELD_MAPPINGS.default?.[type];
    if (!fieldMapping) {
      throw new Error(`No field mapping found for type: ${type}`);
    }
    const reverseMapping = this.createReverseMapping(fieldMapping);

    return data.map(row => {
      const mappedRow: any = {};
      
      // Map each field from CSV headers to standard field names
      Object.entries(row).forEach(([csvField, value]) => {
        const standardField = reverseMapping[csvField.toLowerCase()];
        if (standardField) {
          mappedRow[standardField] = this.transformFieldValue(value, standardField, type);
        }
      });

      return mappedRow;
    });
  }

  private static mapObjectToCSV(item: any, fieldMapping: any, type: string): any {
    const csvRow: any = {};
    
    Object.entries(fieldMapping).forEach(([standardField, csvHeader]) => {
      const value = this.extractFieldValue(item, standardField, type);
      csvRow[csvHeader as string] = this.formatForCSV(value, standardField);
    });
    
    return csvRow;
  }

  private static createReverseMapping(fieldMapping: any): Record<string, string> {
    const reverseMapping: Record<string, string> = {};
    
    Object.entries(fieldMapping).forEach(([standardField, csvHeader]) => {
      reverseMapping[(csvHeader as string).toLowerCase()] = standardField;
    });
    
    return reverseMapping;
  }

  private static transformFieldValue(value: any, field: string, type: string): any {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    switch (field) {
      case 'type':
        return typeof value === 'string' ? value.toLowerCase() : value;
      case 'amount':
        return this.parseAmount(value);
      case 'date':
      case 'start_date':
      case 'end_date':
        return this.formatDateForDB(value);
      case 'period':
        return typeof value === 'string' ? value.toLowerCase() : value;
      default:
        return value;
    }
  }

  private static extractFieldValue(item: any, field: string, type: string): any {
    switch (type) {
      case 'transactions':
        return this.extractTransactionField(item, field);
      case 'categories':
        return this.extractCategoryField(item, field);
      case 'budgets':
        return this.extractBudgetField(item, field);
      default:
        return item[field];
    }
  }

  private static extractTransactionField(transaction: any, field: string): any {
    switch (field) {
      case 'category':
        return transaction.category?.name || transaction.category_id;
      case 'date':
        return transaction.date;
      default:
        return transaction[field];
    }
  }

  private static extractCategoryField(category: any, field: string): any {
    switch (field) {
      case 'parent_category':
        return category.parent?.name || null;
      default:
        return category[field];
    }
  }

  private static extractBudgetField(budget: any, field: string): any {
    switch (field) {
      case 'category':
        return budget.category?.name || budget.category_id;
      case 'amount':
        return budget.budget_amount;
      default:
        return budget[field];
    }
  }

  private static formatForCSV(value: any, field: string): any {
    if (value === null || value === undefined) {
      return '';
    }

    switch (field) {
      case 'amount':
        return typeof value === 'number' ? value.toFixed(2) : value;
      case 'date':
      case 'start_date':
      case 'end_date':
        return this.formatDateForExport(value);
      default:
        return value;
    }
  }

  private static parseAmount(value: any): number | null {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleaned = value.replace(/[$,€£¥]/g, '').trim();
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  }

  private static formatDateForDB(value: any): string | null {
    if (!value) return null;
    
    const date = new Date(value);
    if (isNaN(date.getTime())) return null;
    
    return date.toISOString().split('T')[0] || null; // YYYY-MM-DD format
  }

  private static formatDateForExport(value: any): string {
    if (!value) return '';
    
    const date = new Date(value);
    if (isNaN(date.getTime())) return '';
    
    return date.toISOString().split('T')[0] || ''; // YYYY-MM-DD format
  }

  private static getRequiredFields(type: 'transactions' | 'categories' | 'budgets'): string[] {
    switch (type) {
      case 'transactions':
        return ['type', 'amount', 'description', 'category', 'date'];
      case 'categories':
        return ['name', 'type', 'color', 'icon'];
      case 'budgets':
        return ['category', 'amount', 'period', 'start_date'];
      default:
        return [];
    }
  }

  private static isFieldMatch(csvHeader: string, expectedField: string): boolean {
    const normalizedHeader = csvHeader.toLowerCase().replace(/[_\s-]/g, '');
    const normalizedExpected = expectedField.toLowerCase().replace(/[_\s-]/g, '');
    
    return normalizedHeader === normalizedExpected || 
           normalizedHeader.includes(normalizedExpected) ||
           normalizedExpected.includes(normalizedHeader);
  }

  private static generateFieldSuggestions(actualFields: string[], expectedFields: string[]): string[] {
    const suggestions: string[] = [];
    
    actualFields.forEach(actualField => {
      const suggestion = expectedFields.find(expectedField => 
        this.calculateSimilarity(actualField, expectedField) > 0.6
      );
      
      if (suggestion) {
        suggestions.push(`"${actualField}" might be "${suggestion}"`);
      }
    });
    
    return suggestions;
  }

  private static calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = Array(str1.length + 1).fill(0);
      matrix[i]![0] = i;
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0]![j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i]![j] = matrix[i - 1]![j - 1]!;
        } else {
          matrix[i]![j] = Math.min(
            matrix[i - 1]![j - 1]! + 1,
            matrix[i]![j - 1]! + 1,
            matrix[i - 1]![j]! + 1
          );
        }
      }
    }
    
    return matrix[str2.length]![str1.length]!;
  }

  private static getExampleData(type: 'transactions' | 'categories' | 'budgets'): any[] {
    switch (type) {
      case 'transactions':
        return [
          {
            'Type': 'expense',
            'Amount': '12.50',
            'Description': 'Coffee shop',
            'Category': 'Dining Out',
            'Date': '2025-06-25'
          },
          {
            'Type': 'income',
            'Amount': '3000.00',
            'Description': 'Salary payment',
            'Category': 'Salary',
            'Date': '2025-06-01'
          }
        ];
      case 'categories':
        return [
          {
            'Name': 'Coffee & Tea',
            'Type': 'expense',
            'Color': '#8B5CF6',
            'Icon': 'coffee',
            'Description': 'Coffee, tea, and beverages',
            'Parent Category': 'Dining Out'
          }
        ];
      case 'budgets':
        return [
          {
            'Category': 'Groceries',
            'Budget Amount': '500.00',
            'Period': 'monthly',
            'Start Date': '2025-06-01',
            'End Date': '2025-06-30'
          }
        ];
      default:
        return [];
    }
  }

  private static getEmptyTemplate(type: 'transactions' | 'categories' | 'budgets'): string {
    const fieldMapping = STANDARD_FIELD_MAPPINGS.default?.[type];
    if (!fieldMapping) {
      return '';
    }
    const headers = Object.values(fieldMapping);
    
    return headers.join(',') + '\n';
  }
}
