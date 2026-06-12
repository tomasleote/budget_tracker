import { STANDARD_FIELD_MAPPINGS } from '../types';

export function getTemplateHeaders(type: 'transactions' | 'categories' | 'budgets'): string[] {
  const fieldMapping = STANDARD_FIELD_MAPPINGS.default?.[type];
  if (!fieldMapping) throw new Error(`No field mapping found for type: ${type}`);
  return Object.values(fieldMapping);
}

export function getTemplateExamples(type: 'transactions' | 'categories' | 'budgets'): any[] {
  switch (type) {
    case 'transactions':
      return [
        { Type: 'expense', Amount: 12.50, Description: 'Coffee shop', Category: 'Dining Out', Date: '2025-06-25' },
        { Type: 'income', Amount: 3000.00, Description: 'Salary payment', Category: 'Salary', Date: '2025-06-01' }
      ];
    case 'categories':
      return [
        { Name: 'Coffee & Tea', Type: 'expense', Color: '#8B5CF6', Icon: 'coffee', Description: 'Coffee, tea, and beverages', 'Parent Category': 'Dining Out' }
      ];
    case 'budgets':
      return [
        { Category: 'Groceries', 'Budget Amount': 500.00, Period: 'monthly', 'Start Date': '2025-06-01', 'End Date': '2025-06-30' }
      ];
    default:
      return [];
  }
}

export function getTemplateInstructions(type: 'transactions' | 'categories' | 'budgets'): string[] {
  switch (type) {
    case 'transactions':
      return [
        'Type: "income" or "expense"',
        'Amount: Positive number (e.g., 25.50)',
        'Description: Brief description of the transaction',
        'Category: Must match existing category name',
        'Date: YYYY-MM-DD format'
      ];
    case 'categories':
      return [
        'Name: Unique category name',
        'Type: "income" or "expense"',
        'Color: Hex color code (e.g., #FF5733)',
        'Icon: FontAwesome icon name',
        'Description: Optional description',
        'Parent Category: Optional parent category name'
      ];
    case 'budgets':
      return [
        'Category: Must match existing expense category',
        'Budget Amount: Positive number',
        'Period: "weekly", "monthly", or "yearly"',
        'Start Date: YYYY-MM-DD format',
        'End Date: Optional end date (YYYY-MM-DD)'
      ];
    default:
      return [];
  }
}

export function getAllTemplateInstructions(): string[] {
  return [
    'General Guidelines:',
    '• Each sheet represents a different data type',
    '• Do not modify the header row',
    '• Follow the example format provided',
    '• Dates should be in YYYY-MM-DD format',
    '• Amounts should be positive numbers',
    '',
    ...getTemplateInstructions('transactions'),
    '',
    ...getTemplateInstructions('categories'),
    '',
    ...getTemplateInstructions('budgets')
  ];
}
