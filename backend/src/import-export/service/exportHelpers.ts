import { ExportOptions } from '../types';

export function buildTransactionFilters(options: ExportOptions): any {
  const filters: any = {};
  if (options.dateRange) {
    filters.date_from = options.dateRange.start_date;
    filters.date_to = options.dateRange.end_date;
  }
  if (options.filters?.category_ids) filters.category_ids = options.filters.category_ids;
  if (options.filters?.transaction_types) filters.type = options.filters.transaction_types;
  return filters;
}

export function buildBudgetFilters(options: ExportOptions): any {
  const filters: any = {};
  if (options.dateRange) {
    filters.start_date_from = options.dateRange.start_date;
    filters.end_date_to = options.dateRange.end_date;
  }
  if (options.filters?.category_ids) filters.category_ids = options.filters.category_ids;
  if (options.filters?.budget_periods) filters.period = options.filters.budget_periods;
  return filters;
}

export function prepareExcelData(
  data: any,
  options: ExportOptions
): { [sheetName: string]: any[] } {
  const excelData: { [sheetName: string]: any[] } = {};
  if (options.type === 'full') {
    excelData['Transactions'] = data.transactions || [];
    excelData['Categories']   = data.categories   || [];
    excelData['Budgets']      = data.budgets       || [];
  } else {
    const sheetName = options.type.charAt(0).toUpperCase() + options.type.slice(1);
    excelData[sheetName] = data[options.type] || [];
  }
  return excelData;
}

export function createExportSummary(data: any): any {
  const summary: any = {};
  if (data.transactions) summary.transactions = data.transactions.length;
  if (data.categories)   summary.categories   = data.categories.length;
  if (data.budgets)      summary.budgets       = data.budgets.length;
  return summary;
}

export function getTimestamp(): string {
  const iso = new Date().toISOString();
  const datePart = iso.split('T')[0] || '';
  const timePart = iso.split('T')[1];
  const timeComponent = timePart ? timePart.split('.')[0]?.replace(/:/g, '-') || '' : '';
  return datePart + '_' + timeComponent;
}
