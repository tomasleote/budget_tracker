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
  const date = new Date(value);
  if (isNaN(date.getTime())) return null;
  return date.toISOString().split('T')[0] || null;
}

export function formatDateForExport(value: any): string {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0] || '';
}

export function formatForCSV(value: any, field: string): any {
  if (value === null || value === undefined) return '';
  switch (field) {
    case 'amount':
      return typeof value === 'number' ? value.toFixed(2) : value;
    case 'date':
    case 'start_date':
    case 'end_date':
      return formatDateForExport(value);
    default:
      return value;
  }
}

export function transformFieldValue(value: any, field: string, _type: string): any {
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
  Object.entries(fieldMapping).forEach(([standardField, csvHeader]) => {
    reverseMapping[(csvHeader as string).toLowerCase()] = standardField;
  });
  return reverseMapping;
}

export function extractTransactionField(transaction: any, field: string): any {
  switch (field) {
    case 'category': return transaction.category?.name || transaction.category_id;
    case 'date': return transaction.date;
    default: return transaction[field];
  }
}

export function extractCategoryField(category: any, field: string): any {
  switch (field) {
    case 'parent_category': return category.parent?.name || null;
    default: return category[field];
  }
}

export function extractBudgetField(budget: any, field: string): any {
  switch (field) {
    case 'category': return budget.category?.name || budget.category_id;
    case 'amount': return budget.budget_amount;
    default: return budget[field];
  }
}

export function extractFieldValue(item: any, field: string, type: string): any {
  switch (type) {
    case 'transactions': return extractTransactionField(item, field);
    case 'categories':   return extractCategoryField(item, field);
    case 'budgets':      return extractBudgetField(item, field);
    default: return item[field];
  }
}

export function mapObjectToCSV(item: any, fieldMapping: any, type: string): any {
  const csvRow: any = {};
  Object.entries(fieldMapping).forEach(([standardField, csvHeader]) => {
    const value = extractFieldValue(item, standardField, type);
    csvRow[csvHeader as string] = formatForCSV(value, standardField);
  });
  return csvRow;
}

export function mapFieldsToStandard(
  data: any[],
  type: 'transactions' | 'categories' | 'budgets'
): any[] {
  const fieldMapping = STANDARD_FIELD_MAPPINGS.default?.[type];
  if (!fieldMapping) throw new Error(`No field mapping found for type: ${type}`);
  const reverseMapping = createReverseMapping(fieldMapping);

  return data.map(row => {
    const mappedRow: any = {};
    Object.entries(row).forEach(([csvField, value]) => {
      const standardField = reverseMapping[csvField.toLowerCase()];
      if (standardField) {
        mappedRow[standardField] = transformFieldValue(value, standardField, type);
      }
    });
    return mappedRow;
  });
}
