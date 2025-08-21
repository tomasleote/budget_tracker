import * as XLSX from 'xlsx';
import { ImportOptions, ExportOptions, IMPORT_LIMITS, STANDARD_FIELD_MAPPINGS } from './types';
import { logger } from '../config/logger';

export class ExcelParser {
  /**
   * Parse Excel file buffer into structured data
   */
  static parseExcel(
    fileBuffer: Buffer,
    options: ImportOptions
  ): { data: any; sheets: string[]; meta: any } {
    try {
      const workbook = XLSX.read(fileBuffer, {
        type: 'buffer',
        cellDates: true,
        cellNF: false,
        cellText: false
      });

      const sheets = workbook.SheetNames;
      let data: any = {};
      let meta: any = {
        sheets: sheets,
        totalRows: 0
      };

      if (options.type === 'full') {
        // Parse all sheets for full export
        data = this.parseMultipleSheets(workbook, sheets);
        meta.totalRows = Object.values(data).reduce((sum: number, sheetData: any) => 
          sum + (Array.isArray(sheetData) ? sheetData.length : 0), 0
        );
      } else {
        // Parse specific sheet for single type
        const sheetName = this.findRelevantSheet(sheets, options.type);
        if (!sheetName) {
          throw new Error(`No relevant sheet found for ${options.type}. Available sheets: ${sheets.join(', ')}`);
        }
        
        data = this.parseSheet(workbook, sheetName, options.type);
        meta.totalRows = data.length;
        meta.activeSheet = sheetName;
      }

      // Validate row limits
      if (meta.totalRows > IMPORT_LIMITS.MAX_ROWS_XLSX) {
        throw new Error(`Excel file exceeds maximum rows limit of ${IMPORT_LIMITS.MAX_ROWS_XLSX}`);
      }

      return { data, sheets, meta };
    } catch (error) {
      logger.error('Excel parsing error:', error);
      throw error;
    }
  }

  /**
   * Generate Excel workbook from data
   */
  static generateExcel(
    data: { [sheetName: string]: any[] },
    options: ExportOptions
  ): Buffer {
    try {
      const workbook = XLSX.utils.book_new();

      Object.entries(data).forEach(([sheetName, sheetData]) => {
        if (!sheetData || sheetData.length === 0) {
          // Create empty sheet with headers
          const type = this.inferTypeFromSheetName(sheetName);
          if (type !== null) {
            const headers = this.getHeaders(type);
            const worksheet = XLSX.utils.aoa_to_sheet([headers]);
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
          } else {
            // Create empty sheet without headers for unknown type
            const worksheet = XLSX.utils.aoa_to_sheet([[]]);
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
          }
          return;
        }

        // Create worksheet from data
        const worksheet = this.createWorksheetFromData(sheetData, sheetName, options);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      });

      // Add metadata sheet if requested
      if (options.includeMetadata) {
        const metadataSheet = this.createMetadataSheet(options);
        XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Metadata');
      }

      return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    } catch (error) {
      logger.error('Excel generation error:', error);
      throw error;
    }
  }

  /**
   * Generate Excel template with multiple sheets
   */
  static generateTemplate(includeExamples = true): Buffer {
    try {
      const workbook = XLSX.utils.book_new();

      // Create template sheets for each data type
      const types: Array<'transactions' | 'categories' | 'budgets'> = ['transactions', 'categories', 'budgets'];
      
      types.forEach(type => {
        const headers = this.getHeaders(type);
        const exampleData = includeExamples ? this.getExampleData(type) : [];
        
        // Create worksheet
        const wsData = [headers, ...exampleData];
        const worksheet = XLSX.utils.aoa_to_sheet(wsData);
        
        // Set column widths
        const columnWidths = this.getColumnWidths(type);
        worksheet['!cols'] = columnWidths;
        
        // Add data validation and formatting
        this.addDataValidation(worksheet, type, headers.length, exampleData.length + 1);
        
        XLSX.utils.book_append_sheet(workbook, worksheet, this.capitalizeFirst(type));
      });

      // Add instructions sheet
      const instructionsSheet = this.createInstructionsSheet();
      XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

      return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    } catch (error) {
      logger.error('Excel template generation error:', error);
      throw error;
    }
  }

  /**
   * Validate Excel file structure
   */
  static validateExcelStructure(
    fileBuffer: Buffer
  ): { isValid: boolean; issues: string[]; suggestions: string[] } {
    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheets = workbook.SheetNames;
      const issues: string[] = [];
      const suggestions: string[] = [];

      // Check if file has any sheets
      if (sheets.length === 0) {
        issues.push('Excel file contains no sheets');
        return { isValid: false, issues, suggestions };
      }

      // Check for known sheet patterns
      const expectedSheets = ['transactions', 'categories', 'budgets'];
      const foundSheets = sheets.map(s => s.toLowerCase());
      
      expectedSheets.forEach(expectedSheet => {
        const found = foundSheets.some(sheet => 
          sheet.includes(expectedSheet) || expectedSheet.includes(sheet)
        );
        if (!found) {
          issues.push(`No sheet found for ${expectedSheet}`);
          suggestions.push(`Add a sheet named "${this.capitalizeFirst(expectedSheet)}" or similar`);
        }
      });

      // Validate sheet contents
      sheets.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) {
          issues.push(`Sheet "${sheetName}" not found in workbook`);
          return;
        }
        const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (sheetData.length === 0) {
          issues.push(`Sheet "${sheetName}" is empty`);
          return;
        }

        const headers = sheetData[0] as string[];
        if (!headers || headers.length === 0) {
          issues.push(`Sheet "${sheetName}" has no headers`);
          return;
        }

        // Check for common header patterns
        const type = this.inferTypeFromSheetName(sheetName);
        if (type) {
          const expectedHeaders = this.getHeaders(type);
          const missingHeaders = expectedHeaders.filter(expected => 
            !headers.some(header => this.isHeaderMatch(header, expected))
          );
          
          if (missingHeaders.length > 0) {
            issues.push(`Sheet "${sheetName}" missing headers: ${missingHeaders.join(', ')}`);
          }
        }
      });

      return {
        isValid: issues.length === 0,
        issues,
        suggestions
      };
    } catch (error) {
      logger.error('Excel validation error:', error);
      return {
        isValid: false,
        issues: ['Failed to read Excel file'],
        suggestions: ['Ensure the file is a valid Excel (.xlsx) format']
      };
    }
  }

  // Private helper methods
  private static parseSheet(
    workbook: XLSX.WorkBook,
    sheetName: string,
    type: 'transactions' | 'categories' | 'budgets'
  ): any[] {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      throw new Error(`Sheet "${sheetName}" not found`);
    }

    // Convert to JSON with headers
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      blankrows: false
    });

    if (jsonData.length === 0) {
      return [];
    }

    const headers = jsonData[0] as string[];
    const rows = jsonData.slice(1);

    // Map to objects
    const mappedData = rows.map(row => {
      const obj: any = {};
      headers.forEach((header, index) => {
        if (header && header.trim()) {
          obj[header.trim()] = (row as any[])[index] || '';
        }
      });
      return obj;
    });

    // Transform to standard format
    return this.mapFieldsToStandard(mappedData, type);
  }

  private static parseMultipleSheets(workbook: XLSX.WorkBook, sheets: string[]): any {
    const result: any = {};
    
    sheets.forEach(sheetName => {
      const type = this.inferTypeFromSheetName(sheetName);
      if (type) {
        try {
          result[type] = this.parseSheet(workbook, sheetName, type);
        } catch (error) {
          logger.warn(`Failed to parse sheet "${sheetName}":`, error);
          result[type] = [];
        }
      }
    });
    
    return result;
  }

  private static findRelevantSheet(sheets: string[], type: 'transactions' | 'categories' | 'budgets'): string | null {
    // Look for exact or partial matches
    const typeVariations = this.getTypeVariations(type);
    
    for (const variation of typeVariations) {
      const match = sheets.find(sheet => 
        sheet.toLowerCase().includes(variation.toLowerCase()) ||
        variation.toLowerCase().includes(sheet.toLowerCase())
      );
      if (match) return match;
    }
    
    // Fallback to first sheet
    return sheets[0] || null;
  }

  private static getTypeVariations(type: string): string[] {
    const variations: Record<string, string[]> = {
      transactions: ['transactions', 'transaction', 'trans', 'data', 'records'],
      categories: ['categories', 'category', 'cats', 'types'],
      budgets: ['budgets', 'budget', 'plans', 'planning']
    };
    
    return variations[type] || [type];
  }

  private static inferTypeFromSheetName(sheetName: string): 'transactions' | 'categories' | 'budgets' | null {
    const name = sheetName.toLowerCase();
    
    if (name.includes('transaction') || name.includes('trans') || name.includes('record')) {
      return 'transactions';
    }
    if (name.includes('categor') || name.includes('cat') || name.includes('type')) {
      return 'categories';
    }
    if (name.includes('budget') || name.includes('plan')) {
      return 'budgets';
    }
    
    return null;
  }

  private static createWorksheetFromData(data: any[], sheetName: string, options: ExportOptions): XLSX.WorkSheet {
    if (data.length === 0) {
      return XLSX.utils.aoa_to_sheet([[]]);
    }

    // Get the type for proper formatting
    const type = this.inferTypeFromSheetName(sheetName);
    const headers = type ? this.getHeaders(type) : Object.keys(data[0]);
    
    // Map data to standard format
    const mappedData = data.map(item => this.mapObjectToExcel(item, type));
    
    // Create worksheet
    const wsData = options.includeHeaders !== false ? [headers, ...mappedData] : mappedData;
    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    
    // Set column widths
    if (type) {
      worksheet['!cols'] = this.getColumnWidths(type);
    }
    
    // Add formatting
    this.addCellFormatting(worksheet, type, headers.length, data.length);
    
    return worksheet;
  }

  private static mapObjectToExcel(item: any, type: 'transactions' | 'categories' | 'budgets' | null): any[] {
    if (!type) {
      return Object.values(item);
    }

    const fieldMapping = STANDARD_FIELD_MAPPINGS.default?.[type];
    if (!fieldMapping) {
      return Object.values(item);
    }
    const result: any[] = [];
    
    Object.keys(fieldMapping).forEach(standardField => {
      const value = this.extractFieldValue(item, standardField, type);
      result.push(this.formatForExcel(value, standardField));
    });
    
    return result;
  }

  private static extractFieldValue(item: any, field: string, type: string): any {
    switch (type) {
      case 'transactions':
        if (field === 'category') return item.category?.name || item.category_id;
        break;
      case 'categories':
        if (field === 'parent_category') return item.parent?.name || null;
        break;
      case 'budgets':
        if (field === 'category') return item.category?.name || item.category_id;
        if (field === 'amount') return item.budget_amount;
        break;
    }
    return item[field];
  }

  private static formatForExcel(value: any, field: string): any {
    if (value === null || value === undefined) {
      return '';
    }

    switch (field) {
      case 'amount':
        return typeof value === 'number' ? value : parseFloat(value) || 0;
      case 'date':
      case 'start_date':
      case 'end_date':
        return this.formatDateForExcel(value);
      default:
        return value;
    }
  }

  private static formatDateForExcel(value: any): any {
    if (!value) return '';
    
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    
    return date;
  }

  private static mapFieldsToStandard(data: any[], type: 'transactions' | 'categories' | 'budgets'): any[] {
    const fieldMapping = STANDARD_FIELD_MAPPINGS.default?.[type];
    if (!fieldMapping) {
      return data;
    }
    const reverseMapping = this.createReverseMapping(fieldMapping);

    return data.map(row => {
      const mappedRow: any = {};
      
      Object.entries(row).forEach(([excelField, value]) => {
        const standardField = reverseMapping[excelField.toLowerCase()];
        if (standardField) {
          mappedRow[standardField] = this.transformFieldValue(value, standardField);
        }
      });

      return mappedRow;
    });
  }

  private static createReverseMapping(fieldMapping: any): Record<string, string> {
    const reverseMapping: Record<string, string> = {};
    
    Object.entries(fieldMapping).forEach(([standardField, excelHeader]) => {
      reverseMapping[(excelHeader as string).toLowerCase()] = standardField;
    });
    
    return reverseMapping;
  }

  private static transformFieldValue(value: any, field: string): any {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    switch (field) {
      case 'type':
      case 'period':
        return typeof value === 'string' ? value.toLowerCase() : value;
      case 'amount':
        return this.parseAmount(value);
      case 'date':
      case 'start_date':
      case 'end_date':
        return this.formatDateForDB(value);
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
    
    let date: Date;
    if (value instanceof Date) {
      date = value;
    } else {
      date = new Date(value);
    }
    
    if (isNaN(date.getTime())) return null;
    
    return date.toISOString().split('T')[0] || null;
  }

  private static getHeaders(type: 'transactions' | 'categories' | 'budgets'): string[] {
    const fieldMapping = STANDARD_FIELD_MAPPINGS.default?.[type];
    if (!fieldMapping) {
      return [];
    }
    return Object.values(fieldMapping);
  }

  private static getColumnWidths(type: 'transactions' | 'categories' | 'budgets'): any[] {
    const widths: Record<string, any[]> = {
      transactions: [
        { wch: 10 }, // Type
        { wch: 12 }, // Amount
        { wch: 30 }, // Description
        { wch: 15 }, // Category
        { wch: 12 }  // Date
      ],
      categories: [
        { wch: 20 }, // Name
        { wch: 10 }, // Type
        { wch: 10 }, // Color
        { wch: 15 }, // Icon
        { wch: 30 }, // Description
        { wch: 20 }  // Parent Category
      ],
      budgets: [
        { wch: 20 }, // Category
        { wch: 15 }, // Budget Amount
        { wch: 10 }, // Period
        { wch: 12 }, // Start Date
        { wch: 12 }  // End Date
      ]
    };
    
    return widths[type] || [];
  }

  private static addDataValidation(
    worksheet: XLSX.WorkSheet,
    type: 'transactions' | 'categories' | 'budgets',
    colCount: number,
    startRow: number
  ): void {
    // Add data validation rules (this is a simplified version)
    // In a full implementation, you would add Excel data validation rules
    // for dropdowns, date validation, etc.
    
    if (!worksheet['!dataValidation']) {
      worksheet['!dataValidation'] = [];
    }
    
    // Example: Type column validation
    if (type === 'transactions' || type === 'categories') {
      const typeCol = type === 'transactions' ? 'A' : 'B';
      worksheet['!dataValidation'].push({
        type: 'list',
        allowBlank: false,
        sqref: `${typeCol}${startRow}:${typeCol}1000`,
        formulas: ['"income,expense"']
      });
    }
  }

  private static addCellFormatting(
    worksheet: XLSX.WorkSheet,
    type: 'transactions' | 'categories' | 'budgets' | null,
    colCount: number,
    rowCount: number
  ): void {
    // Add basic formatting (simplified)
    if (!type) return;
    
    // Format amount columns as currency
    const amountCols = type === 'transactions' ? ['B'] : type === 'budgets' ? ['B'] : [];
    amountCols.forEach(col => {
      for (let row = 2; row <= rowCount + 1; row++) {
        const cellRef = `${col}${row}`;
        if (worksheet[cellRef]) {
          worksheet[cellRef].z = '#,##0.00';
        }
      }
    });
    
    // Format date columns
    const dateCols = type === 'transactions' ? ['E'] : type === 'budgets' ? ['D', 'E'] : [];
    dateCols.forEach(col => {
      for (let row = 2; row <= rowCount + 1; row++) {
        const cellRef = `${col}${row}`;
        if (worksheet[cellRef]) {
          worksheet[cellRef].z = 'yyyy-mm-dd';
        }
      }
    });
  }

  private static createMetadataSheet(options: ExportOptions): XLSX.WorkSheet {
    const metadata = [
      ['Export Information'],
      [''],
      ['Generated At', new Date().toISOString()],
      ['Export Type', options.type],
      ['Format', options.format],
      ['']
    ];

    if (options.dateRange) {
      metadata.push(
        ['Date Range'],
        ['Start Date', options.dateRange.start_date],
        ['End Date', options.dateRange.end_date],
        ['']
      );
    }

    if (options.filters) {
      metadata.push(['Filters Applied']);
      Object.entries(options.filters).forEach(([key, value]) => {
        metadata.push([key, Array.isArray(value) ? value.join(', ') : value]);
      });
    }

    return XLSX.utils.aoa_to_sheet(metadata);
  }

  private static createInstructionsSheet(): XLSX.WorkSheet {
    const instructions = [
      ['Budget Tracker Import Instructions'],
      [''],
      ['General Guidelines:'],
      ['• Each sheet represents a different data type'],
      ['• Do not modify the header row'],
      ['• Follow the example format provided'],
      ['• Dates should be in YYYY-MM-DD format'],
      ['• Amounts should be positive numbers'],
      [''],
      ['Transactions Sheet:'],
      ['• Type: "income" or "expense"'],
      ['• Amount: Positive number (e.g., 25.50)'],
      ['• Description: Brief description of the transaction'],
      ['• Category: Must match existing category name'],
      ['• Date: YYYY-MM-DD format'],
      [''],
      ['Categories Sheet:'],
      ['• Name: Unique category name'],
      ['• Type: "income" or "expense"'],
      ['• Color: Hex color code (e.g., #FF5733)'],
      ['• Icon: FontAwesome icon name'],
      ['• Description: Optional description'],
      ['• Parent Category: Optional parent category name'],
      [''],
      ['Budgets Sheet:'],
      ['• Category: Must match existing expense category'],
      ['• Budget Amount: Positive number'],
      ['• Period: "weekly", "monthly", or "yearly"'],
      ['• Start Date: YYYY-MM-DD format'],
      ['• End Date: Optional end date (YYYY-MM-DD)']
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(instructions);
    
    // Set column width for readability
    worksheet['!cols'] = [{ wch: 50 }, { wch: 30 }];
    
    return worksheet;
  }

  private static getExampleData(type: 'transactions' | 'categories' | 'budgets'): any[][] {
    switch (type) {
      case 'transactions':
        return [
          ['expense', 12.50, 'Coffee shop', 'Dining Out', '2025-06-25'],
          ['income', 3000.00, 'Salary payment', 'Salary', '2025-06-01']
        ];
      case 'categories':
        return [
          ['Coffee & Tea', 'expense', '#8B5CF6', 'coffee', 'Coffee, tea, and beverages', 'Dining Out']
        ];
      case 'budgets':
        return [
          ['Groceries', 500.00, 'monthly', '2025-06-01', '2025-06-30']
        ];
      default:
        return [];
    }
  }

  private static isHeaderMatch(actualHeader: string, expectedHeader: string): boolean {
    const normalize = (str: string) => str.toLowerCase().replace(/[_\s-]/g, '');
    return normalize(actualHeader) === normalize(expectedHeader) ||
           normalize(actualHeader).includes(normalize(expectedHeader)) ||
           normalize(expectedHeader).includes(normalize(actualHeader));
  }

  private static capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
