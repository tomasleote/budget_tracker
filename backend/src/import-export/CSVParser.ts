import Papa from 'papaparse';
import { ImportOptions, IMPORT_LIMITS, STANDARD_FIELD_MAPPINGS } from './types';
import { logger } from '../config/logger';
import {
  mapFieldsToStandard,
  mapObjectToCSV
} from './csv/fieldMappers';
import {
  getRequiredFields,
  isFieldMatch,
  generateFieldSuggestions,
  getEmptyTemplate,
  getExampleData
} from './csv/structureHelpers';

export class CSVParser {
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
        transform: (value: string) => (typeof value === 'string' ? value.trim() : value)
      };

      const result = Papa.parse(fileContent, parseOptions);

      if (result.data.length > IMPORT_LIMITS.MAX_ROWS_CSV) {
        throw new Error(`CSV file exceeds maximum rows limit of ${IMPORT_LIMITS.MAX_ROWS_CSV}`);
      }

      if (options.type !== 'full') {
        return {
          data: mapFieldsToStandard(result.data, options.type),
          meta: result.meta,
          errors: result.errors
        };
      }

      return { data: result.data, meta: result.meta, errors: result.errors };
    } catch (error) {
      logger.error('CSV parsing error:', error);
      throw error;
    }
  }

  static generateCSV(
    data: any[],
    type: 'transactions' | 'categories' | 'budgets',
    includeHeaders = true
  ): string {
    try {
      if (!data || data.length === 0) return getEmptyTemplate(type);

      const fieldMapping = STANDARD_FIELD_MAPPINGS.default?.[type];
      if (!fieldMapping) throw new Error(`No field mapping found for type: ${type}`);

      const csvData = data.map(item => mapObjectToCSV(item, fieldMapping, type));

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

  static generateTemplate(
    type: 'transactions' | 'categories' | 'budgets',
    includeExamples = true
  ): string {
    const fieldMapping = STANDARD_FIELD_MAPPINGS.default?.[type];
    if (!fieldMapping) throw new Error(`No field mapping found for type: ${type}`);

    const data = includeExamples ? getExampleData(type) : [];

    return Papa.unparse(data, {
      header: true,
      columns: Object.values(fieldMapping),
      delimiter: ',',
      quotes: true
    });
  }

  static validateCSVStructure(
    fileContent: string,
    expectedType: 'transactions' | 'categories' | 'budgets'
  ): { isValid: boolean; missingFields: string[]; extraFields: string[]; suggestions: string[] } {
    try {
      const headerLine = fileContent.split('\n')[0];
      if (!headerLine) throw new Error('No header line found');

      const parseResult = Papa.parse(headerLine, { header: false });
      const headers = parseResult.data[0] as string[];
      const cleanHeaders = headers.map(h => h.trim().toLowerCase());

      const expectedMapping = STANDARD_FIELD_MAPPINGS.default?.[expectedType];
      if (!expectedMapping) throw new Error(`No field mapping found for type: ${expectedType}`);

      const expectedFields = Object.values(expectedMapping).map(f => f.toLowerCase());
      const requiredFields = getRequiredFields(expectedType);

      const missingFields = requiredFields.filter(
        field => !cleanHeaders.some(header => isFieldMatch(header, field))
      );
      const extraFields = cleanHeaders.filter(
        header => !expectedFields.some(field => isFieldMatch(header, field))
      );
      const suggestions = generateFieldSuggestions(cleanHeaders, expectedFields);

      return { isValid: missingFields.length === 0, missingFields, extraFields, suggestions };
    } catch (error) {
      logger.error('CSV structure validation error:', error);
      return { isValid: false, missingFields: [], extraFields: [], suggestions: [] };
    }
  }
}
