import * as XLSX from 'xlsx';
import { ExportOptions } from '../types';
import { inferTypeFromSheetName, getHeaders, getColumnWidths } from './sheetHelpers';
import { mapObjectToExcel } from './fieldMappers';

export function createWorksheetFromData(
  data: any[],
  sheetName: string,
  options: ExportOptions
): XLSX.WorkSheet {
  if (data.length === 0) return XLSX.utils.aoa_to_sheet([[]]);

  const type = inferTypeFromSheetName(sheetName);
  const headers = type ? getHeaders(type) : Object.keys(data[0]);
  const mappedData = data.map(item => mapObjectToExcel(item, type));
  const wsData = options.includeHeaders !== false ? [headers, ...mappedData] : mappedData;
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);

  if (type) {
    worksheet['!cols'] = getColumnWidths(type);
  }

  addCellFormatting(worksheet, type, headers.length, data.length);
  return worksheet;
}

export function addDataValidation(
  worksheet: XLSX.WorkSheet,
  type: 'transactions' | 'categories' | 'budgets',
  _colCount: number,
  startRow: number
): void {
  if (!worksheet['!dataValidation']) {
    worksheet['!dataValidation'] = [];
  }
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

export function addCellFormatting(
  worksheet: XLSX.WorkSheet,
  type: 'transactions' | 'categories' | 'budgets' | null,
  _colCount: number,
  rowCount: number
): void {
  if (!type) return;
  const amountCols = type === 'transactions' ? ['B'] : type === 'budgets' ? ['B'] : [];
  amountCols.forEach(col => {
    for (let row = 2; row <= rowCount + 1; row++) {
      const cellRef = `${col}${row}`;
      if (worksheet[cellRef]) worksheet[cellRef].z = '#,##0.00';
    }
  });
  const dateCols = type === 'transactions' ? ['E'] : type === 'budgets' ? ['D', 'E'] : [];
  dateCols.forEach(col => {
    for (let row = 2; row <= rowCount + 1; row++) {
      const cellRef = `${col}${row}`;
      if (worksheet[cellRef]) worksheet[cellRef].z = 'yyyy-mm-dd';
    }
  });
}

export function createMetadataSheet(options: ExportOptions): XLSX.WorkSheet {
  const metadata: any[][] = [
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

export function createInstructionsSheet(): XLSX.WorkSheet {
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
  worksheet['!cols'] = [{ wch: 50 }, { wch: 30 }];
  return worksheet;
}

export function getExampleData(type: 'transactions' | 'categories' | 'budgets'): any[][] {
  switch (type) {
    case 'transactions':
      return [
        ['expense', 12.50, 'Coffee shop', 'Dining Out', '2025-06-25'],
        ['income', 3000.00, 'Salary payment', 'Salary', '2025-06-01']
      ];
    case 'categories':
      return [['Coffee & Tea', 'expense', '#8B5CF6', 'coffee', 'Coffee, tea, and beverages', 'Dining Out']];
    case 'budgets':
      return [['Groceries', 500.00, 'monthly', '2025-06-01', '2025-06-30']];
    default:
      return [];
  }
}
