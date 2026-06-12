import { STANDARD_FIELD_MAPPINGS } from '../types';

export function parseAmount(value: any): number | null {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[$,€£¥]/g, '').trim();
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

export function formatDateForDB(value: any): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return null;
  return date.toISOString().split('T')[0] || null;
}

export function formatDateForExcel(value: any): any {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  return date;
}

export function formatForExcel(value: any, field: string): any {
  if (value === null || value === undefined) return '';
  switch (field) {
    case 'amount':
      return typeof value === 'number' ? value : parseFloat(value) || 0;
    case 'date':
    case 'start_date':
    case 'end_date':
      return formatDateForExcel(value);
    default:
      return value;
  }
}

export function transformFieldValue(value: any, field: string): any {
  if (value === null || value === undefined || value === '') return null;
  switch (field) {
    case 'type':
    case 'period':
      return typeof value === 'string' ? value.toLowerCase() : value;
    case 'amount':
      return parseAmount(value);
    case 'date':
    case 'start_date':
    case 'end_date':
      return formatDateForDB(value);
    default:
      return value;
  }
}

export function createReverseMapping(fieldMapping: any): Record<string, string> {
  const reverseMapping: Record<string, string> = {};
  Object.entries(fieldMapping).forEach(([standardField, header]) => {
    reverseMapping[(header as string).toLowerCase()] = standardField;
  });
  return reverseMapping;
}

export function mapFieldsToStandard(
  data: any[],
  type: 'transactions' | 'categories' | 'budgets'
): any[] {
  const fieldMapping = STANDARD_FIELD_MAPPINGS.default?.[type];
  if (!fieldMapping) return data;
  const reverseMapping = createReverseMapping(fieldMapping);

  return data.map(row => {
    const mappedRow: any = {};
    Object.entries(row).forEach(([excelField, value]) => {
      const standardField = reverseMapping[excelField.toLowerCase()];
      if (standardField) {
        mappedRow[standardField] = transformFieldValue(value, standardField);
      }
    });
    return mappedRow;
  });
}

export function extractFieldValue(item: any, field: string, type: string): any {
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

export function mapObjectToExcel(
  item: any,
  type: 'transactions' | 'categories' | 'budgets' | null
): any[] {
  if (!type) return Object.values(item);
  const fieldMapping = STANDARD_FIELD_MAPPINGS.default?.[type];
  if (!fieldMapping) return Object.values(item);

  const result: any[] = [];
  Object.keys(fieldMapping).forEach(standardField => {
    const value = extractFieldValue(item, standardField, type);
    result.push(formatForExcel(value, standardField));
  });
  return result;
}
