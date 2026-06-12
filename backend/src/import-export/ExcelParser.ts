import * as XLSX from 'xlsx';
import { ImportOptions, ExportOptions, IMPORT_LIMITS } from './types';
import { logger } from '../config/logger';
import {
  inferTypeFromSheetName,
  findRelevantSheet,
  getHeaders,
  getColumnWidths,
  isHeaderMatch
} from './excel/sheetHelpers';
import { mapFieldsToStandard } from './excel/fieldMappers';
import {
  createWorksheetFromData,
  addDataValidation,
  createMetadataSheet,
  createInstructionsSheet,
  getExampleData
} from './excel/worksheetBuilders';

export class ExcelParser {
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
      const meta: any = { sheets, totalRows: 0 };

      if (options.type === 'full') {
        data = parseMultipleSheets(workbook, sheets);
        meta.totalRows = Object.values(data).reduce(
          (sum: number, sheetData: any) => sum + (Array.isArray(sheetData) ? sheetData.length : 0), 0
        );
      } else {
        const sheetName = findRelevantSheet(sheets, options.type);
        if (!sheetName) {
          throw new Error(`No relevant sheet found for ${options.type}. Available sheets: ${sheets.join(', ')}`);
        }
        data = parseSheet(workbook, sheetName, options.type);
        meta.totalRows = data.length;
        meta.activeSheet = sheetName;
      }

      if (meta.totalRows > IMPORT_LIMITS.MAX_ROWS_XLSX) {
        throw new Error(`Excel file exceeds maximum rows limit of ${IMPORT_LIMITS.MAX_ROWS_XLSX}`);
      }

      return { data, sheets, meta };
    } catch (error) {
      logger.error('Excel parsing error:', error);
      throw error;
    }
  }

  static generateExcel(
    data: { [sheetName: string]: any[] },
    options: ExportOptions
  ): Buffer {
    try {
      const workbook = XLSX.utils.book_new();

      Object.entries(data).forEach(([sheetName, sheetData]) => {
        if (!sheetData || sheetData.length === 0) {
          const type = inferTypeFromSheetName(sheetName);
          if (type !== null) {
            const headers = getHeaders(type);
            XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([headers]), sheetName);
          } else {
            XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([[]]), sheetName);
          }
          return;
        }
        const worksheet = createWorksheetFromData(sheetData, sheetName, options);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      });

      if (options.includeMetadata) {
        XLSX.utils.book_append_sheet(workbook, createMetadataSheet(options), 'Metadata');
      }

      return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    } catch (error) {
      logger.error('Excel generation error:', error);
      throw error;
    }
  }

  static generateTemplate(includeExamples = true): Buffer {
    try {
      const workbook = XLSX.utils.book_new();
      const types: Array<'transactions' | 'categories' | 'budgets'> = ['transactions', 'categories', 'budgets'];

      types.forEach(type => {
        const headers = getHeaders(type);
        const exampleData = includeExamples ? getExampleData(type) : [];
        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...exampleData]);
        worksheet['!cols'] = getColumnWidths(type);
        addDataValidation(worksheet, type, headers.length, exampleData.length + 1);
        const sheetName = type.charAt(0).toUpperCase() + type.slice(1);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      });

      XLSX.utils.book_append_sheet(workbook, createInstructionsSheet(), 'Instructions');
      return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    } catch (error) {
      logger.error('Excel template generation error:', error);
      throw error;
    }
  }

  static validateExcelStructure(
    fileBuffer: Buffer
  ): { isValid: boolean; issues: string[]; suggestions: string[] } {
    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheets = workbook.SheetNames;
      const issues: string[] = [];
      const suggestions: string[] = [];

      if (sheets.length === 0) {
        issues.push('Excel file contains no sheets');
        return { isValid: false, issues, suggestions };
      }

      const expectedSheets = ['transactions', 'categories', 'budgets'];
      const foundSheets = sheets.map(s => s.toLowerCase());

      expectedSheets.forEach(expectedSheet => {
        const found = foundSheets.some(sheet =>
          sheet.includes(expectedSheet) || expectedSheet.includes(sheet)
        );
        if (!found) {
          const capitalized = expectedSheet.charAt(0).toUpperCase() + expectedSheet.slice(1);
          issues.push(`No sheet found for ${expectedSheet}`);
          suggestions.push(`Add a sheet named "${capitalized}" or similar`);
        }
      });

      sheets.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) {
          issues.push(`Sheet "${sheetName}" not found in workbook`);
          return;
        }
        const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (sheetData.length === 0) { issues.push(`Sheet "${sheetName}" is empty`); return; }

        const headers = sheetData[0] as string[];
        if (!headers || headers.length === 0) { issues.push(`Sheet "${sheetName}" has no headers`); return; }

        const type = inferTypeFromSheetName(sheetName);
        if (type) {
          const expectedHeaders = getHeaders(type);
          const missingHeaders = expectedHeaders.filter(
            expected => !headers.some(header => isHeaderMatch(header, expected))
          );
          if (missingHeaders.length > 0) {
            issues.push(`Sheet "${sheetName}" missing headers: ${missingHeaders.join(', ')}`);
          }
        }
      });

      return { isValid: issues.length === 0, issues, suggestions };
    } catch (error) {
      logger.error('Excel validation error:', error);
      return {
        isValid: false,
        issues: ['Failed to read Excel file'],
        suggestions: ['Ensure the file is a valid Excel (.xlsx) format']
      };
    }
  }
}

// Module-private helpers used by ExcelParser methods above

function parseSheet(
  workbook: XLSX.WorkBook,
  sheetName: string,
  type: 'transactions' | 'categories' | 'budgets'
): any[] {
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) throw new Error(`Sheet "${sheetName}" not found`);

  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', blankrows: false });
  if (jsonData.length === 0) return [];

  const headers = jsonData[0] as string[];
  const rows = jsonData.slice(1);

  const mappedData = rows.map(row => {
    const obj: any = {};
    headers.forEach((header, index) => {
      if (header && header.trim()) obj[header.trim()] = (row as any[])[index] || '';
    });
    return obj;
  });

  return mapFieldsToStandard(mappedData, type);
}

function parseMultipleSheets(workbook: XLSX.WorkBook, sheets: string[]): any {
  const result: any = {};
  sheets.forEach(sheetName => {
    const type = inferTypeFromSheetName(sheetName);
    if (type) {
      try {
        result[type] = parseSheet(workbook, sheetName, type);
      } catch (error) {
        logger.warn(`Failed to parse sheet "${sheetName}":`, error);
        result[type] = [];
      }
    }
  });
  return result;
}
