import { STANDARD_FIELD_MAPPINGS } from '../types';

export function getRequiredFields(type: 'transactions' | 'categories' | 'budgets'): string[] {
  switch (type) {
    case 'transactions': return ['type', 'amount', 'description', 'category', 'date'];
    case 'categories':   return ['name', 'type', 'color', 'icon'];
    case 'budgets':      return ['category', 'amount', 'period', 'start_date'];
    default: return [];
  }
}

export function isFieldMatch(csvHeader: string, expectedField: string): boolean {
  const normalizedHeader = csvHeader.toLowerCase().replace(/[_\s-]/g, '');
  const normalizedExpected = expectedField.toLowerCase().replace(/[_\s-]/g, '');
  return normalizedHeader === normalizedExpected ||
         normalizedHeader.includes(normalizedExpected) ||
         normalizedExpected.includes(normalizedHeader);
}

export function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
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

export function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  if (longer.length === 0) return 1.0;
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

export function generateFieldSuggestions(actualFields: string[], expectedFields: string[]): string[] {
  const suggestions: string[] = [];
  actualFields.forEach(actualField => {
    const suggestion = expectedFields.find(expectedField =>
      calculateSimilarity(actualField, expectedField) > 0.6
    );
    if (suggestion) suggestions.push(`"${actualField}" might be "${suggestion}"`);
  });
  return suggestions;
}

export function getEmptyTemplate(type: 'transactions' | 'categories' | 'budgets'): string {
  const fieldMapping = STANDARD_FIELD_MAPPINGS.default?.[type];
  if (!fieldMapping) return '';
  return Object.values(fieldMapping).join(',') + '\n';
}

export function getExampleData(type: 'transactions' | 'categories' | 'budgets'): any[] {
  switch (type) {
    case 'transactions':
      return [
        { 'Type': 'expense', 'Amount': '12.50', 'Description': 'Coffee shop', 'Category': 'Dining Out', 'Date': '2025-06-25' },
        { 'Type': 'income', 'Amount': '3000.00', 'Description': 'Salary payment', 'Category': 'Salary', 'Date': '2025-06-01' }
      ];
    case 'categories':
      return [
        { 'Name': 'Coffee & Tea', 'Type': 'expense', 'Color': '#8B5CF6', 'Icon': 'coffee', 'Description': 'Coffee, tea, and beverages', 'Parent Category': 'Dining Out' }
      ];
    case 'budgets':
      return [
        { 'Category': 'Groceries', 'Budget Amount': '500.00', 'Period': 'monthly', 'Start Date': '2025-06-01', 'End Date': '2025-06-30' }
      ];
    default:
      return [];
  }
}
