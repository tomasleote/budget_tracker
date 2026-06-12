import { STANDARD_FIELD_MAPPINGS } from '../types';

export function inferTypeFromSheetName(sheetName: string): 'transactions' | 'categories' | 'budgets' | null {
  const name = sheetName.toLowerCase();
  if (name.includes('transaction') || name.includes('trans') || name.includes('record')) return 'transactions';
  if (name.includes('categor') || name.includes('cat') || name.includes('type')) return 'categories';
  if (name.includes('budget') || name.includes('plan')) return 'budgets';
  return null;
}

export function getTypeVariations(type: string): string[] {
  const variations: Record<string, string[]> = {
    transactions: ['transactions', 'transaction', 'trans', 'data', 'records'],
    categories: ['categories', 'category', 'cats', 'types'],
    budgets: ['budgets', 'budget', 'plans', 'planning']
  };
  return variations[type] || [type];
}

export function findRelevantSheet(
  sheets: string[],
  type: 'transactions' | 'categories' | 'budgets'
): string | null {
  const typeVariations = getTypeVariations(type);
  for (const variation of typeVariations) {
    const match = sheets.find(sheet =>
      sheet.toLowerCase().includes(variation.toLowerCase()) ||
      variation.toLowerCase().includes(sheet.toLowerCase())
    );
    if (match) return match;
  }
  return sheets[0] || null;
}

export function getHeaders(type: 'transactions' | 'categories' | 'budgets'): string[] {
  const fieldMapping = STANDARD_FIELD_MAPPINGS.default?.[type];
  if (!fieldMapping) return [];
  return Object.values(fieldMapping);
}

export function getColumnWidths(type: 'transactions' | 'categories' | 'budgets'): any[] {
  const widths: Record<string, any[]> = {
    transactions: [{ wch: 10 }, { wch: 12 }, { wch: 30 }, { wch: 15 }, { wch: 12 }],
    categories:   [{ wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 30 }, { wch: 20 }],
    budgets:      [{ wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 12 }, { wch: 12 }]
  };
  return widths[type] || [];
}

export function isHeaderMatch(actualHeader: string, expectedHeader: string): boolean {
  const normalize = (str: string) => str.toLowerCase().replace(/[_\s-]/g, '');
  return normalize(actualHeader) === normalize(expectedHeader) ||
         normalize(actualHeader).includes(normalize(expectedHeader)) ||
         normalize(expectedHeader).includes(normalize(actualHeader));
}
