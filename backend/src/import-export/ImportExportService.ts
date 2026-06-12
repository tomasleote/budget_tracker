import {
  ImportOptions,
  ExportOptions,
  ImportResult,
  ExportResult,
  TemplateOptions,
  TemplateResult,
  IMPORT_LIMITS
} from './types';
import { CSVParser } from './CSVParser';
import { ExcelParser } from './ExcelParser';
import { DataValidator } from './DataValidator';
import { CategoryRepository } from '../repositories/CategoryRepository';
import { TransactionRepository } from '../repositories/TransactionRepository';
import { BudgetRepository } from '../repositories/BudgetRepository';
import { logger } from '../config/logger';
import path from 'path';
import fs from 'fs/promises';
import { processTransactionRow, processCategoryRow, processBudgetRow } from './service/rowProcessors';
import { buildTransactionFilters, buildBudgetFilters, prepareExcelData, createExportSummary, getTimestamp } from './service/exportHelpers';
import { getTemplateHeaders, getTemplateExamples, getTemplateInstructions, getAllTemplateInstructions } from './service/templateHelpers';

export class ImportExportService {
  private categoryRepo: CategoryRepository;
  private transactionRepo: TransactionRepository;
  private budgetRepo: BudgetRepository;
  private validator: DataValidator;

  constructor() {
    this.categoryRepo = new CategoryRepository();
    this.transactionRepo = new TransactionRepository();
    this.budgetRepo = new BudgetRepository();
    this.validator = new DataValidator();
  }

  async importData(fileBuffer: Buffer, fileName: string, options: ImportOptions): Promise<ImportResult> {
    const startTime = Date.now();
    try {
      if (fileBuffer.length > IMPORT_LIMITS.MAX_FILE_SIZE_MB * 1024 * 1024) {
        throw new Error(`File size exceeds limit of ${IMPORT_LIMITS.MAX_FILE_SIZE_MB}MB`);
      }

      let parsedData: any;
      const fileExtension = path.extname(fileName).toLowerCase();

      if (options.format === 'csv' || fileExtension === '.csv') {
        const fileContent = fileBuffer.toString((options.encoding || 'utf8') as BufferEncoding);
        parsedData = CSVParser.parseCSV(fileContent, options).data;
      } else if (options.format === 'xlsx' || fileExtension === '.xlsx') {
        parsedData = ExcelParser.parseExcel(fileBuffer, options).data;
      } else {
        throw new Error(`Unsupported file format: ${fileExtension}`);
      }

      return options.type === 'full'
        ? await this.importFullData(parsedData, options, startTime)
        : await this.importSingleType(parsedData, options, startTime);
    } catch (error) {
      logger.error('Import error:', error);
      return {
        success: false,
        summary: { total_rows: 0, processed: 0, imported: 0, updated: 0, skipped: 0, errors: 1 },
        errors: [{
          row: 0,
          error_code: 'IMPORT_FAILED',
          message: error instanceof Error ? error.message : 'Import failed',
          severity: 'error' as const
        }],
        execution_time_ms: Date.now() - startTime
      };
    }
  }

  async exportData(options: ExportOptions): Promise<ExportResult> {
    const startTime = Date.now();
    try {
      let data: any = {};
      let totalRecords = 0;

      if (options.type === 'full') {
        data = await this.fetchAllData(options);
        totalRecords = Object.values(data).reduce(
          (sum: number, arr: any) => sum + (Array.isArray(arr) ? arr.length : 0), 0
        );
      } else {
        const singleTypeData = await this.fetchSingleTypeData(options);
        data[options.type] = singleTypeData;
        totalRecords = singleTypeData.length;
      }

      let fileBuffer: Buffer;
      let fileName: string;

      if (options.format === 'csv') {
        if (options.type === 'full') {
          throw new Error('CSV format does not support full export with multiple types');
        }
        const csvContent = CSVParser.generateCSV(data[options.type], options.type, options.includeHeaders);
        fileBuffer = Buffer.from(csvContent, 'utf8');
        fileName = `${options.type}_export_${getTimestamp()}.csv`;
      } else {
        fileBuffer = ExcelParser.generateExcel(prepareExcelData(data, options), options);
        fileName = `budget_tracker_export_${getTimestamp()}.xlsx`;
      }

      const filePath = await this.saveExportFile(fileBuffer, fileName);

      const result: ExportResult = {
        success: true,
        file_name: fileName,
        file_size: fileBuffer.length,
        format: options.format,
        summary: { ...createExportSummary(data), total_records: totalRecords },
        download_url: filePath,
        execution_time_ms: Date.now() - startTime
      };

      const metadata: {
        exported_at: string;
        date_range?: { start: string; end: string };
        filters_applied?: any;
      } = { exported_at: new Date().toISOString() };

      if (options.dateRange) {
        metadata.date_range = { start: options.dateRange.start_date, end: options.dateRange.end_date };
      }
      if (options.filters) metadata.filters_applied = options.filters;
      result.metadata = metadata;

      return result;
    } catch (error) {
      logger.error('Export error:', error);
      throw error;
    }
  }

  async generateTemplate(options: TemplateOptions): Promise<TemplateResult> {
    try {
      let fileBuffer: Buffer;
      let fileName: string;
      let headers: string[];
      let exampleData: any[] = [];
      let instructions: string[] = [];

      if (options.format === 'csv') {
        const csvContent = CSVParser.generateTemplate(options.type, options.includeExamples);
        fileBuffer = Buffer.from(csvContent, 'utf8');
        fileName = `${options.type}_template.csv`;
        headers = getTemplateHeaders(options.type);
        if (options.includeExamples) exampleData = getTemplateExamples(options.type);
        if (options.includeInstructions) instructions = getTemplateInstructions(options.type);
      } else {
        fileBuffer = ExcelParser.generateTemplate(options.includeExamples);
        fileName = 'budget_tracker_template.xlsx';
        headers = getTemplateHeaders(options.type);
        if (options.includeExamples) exampleData = getTemplateExamples(options.type);
        instructions = getAllTemplateInstructions();
      }

      const filePath = await this.saveExportFile(fileBuffer, fileName);
      return { file_name: fileName, format: options.format, headers, example_data: exampleData, instructions, download_url: filePath };
    } catch (error) {
      logger.error('Template generation error:', error);
      throw error;
    }
  }

  private async importSingleType(data: any[], options: ImportOptions, startTime: number): Promise<ImportResult> {
    const summary = { total_rows: data.length, processed: 0, imported: 0, updated: 0, skipped: 0, errors: 0 };

    if (data.length === 0) return { success: true, summary, execution_time_ms: Date.now() - startTime };

    const existingCategories = await this.getExistingCategoriesMap();
    let existingBudgetsData: any[] = [];
    if (options.type === 'budgets') {
      const budgetsResult = await this.budgetRepo.findAll();
      existingBudgetsData = budgetsResult.data || [];
    }

    this.validator.reset();
    const validRows: any[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      let isValid = false;
      try {
        switch (options.type) {
          case 'transactions': isValid = this.validator.validateTransactionRow(row, i + 1, existingCategories); break;
          case 'categories':   isValid = this.validator.validateCategoryRow(row, i + 1, existingCategories); break;
          case 'budgets':      isValid = this.validator.validateBudgetRow(row, i + 1, existingCategories, existingBudgetsData); break;
        }
        summary.processed++;
        if (isValid) validRows.push({ ...row, _originalRowIndex: i + 1 });
      } catch {
        summary.errors++;
      }
    }

    const validationResult = this.validator.getValidationResults(data.length);
    summary.errors = validationResult.errors.length;

    if (validRows.length > 0 && (options.validateData === false || validationResult.isValid)) {
      try {
        const importResult = await this.processValidRows(validRows, options);
        summary.imported = importResult.imported;
        summary.updated  = importResult.updated;
        summary.skipped  = importResult.skipped;
      } catch (error) {
        logger.error('Processing valid rows failed:', error);
        summary.errors += validRows.length;
      }
    }

    return {
      success: summary.errors === 0,
      summary,
      errors: validationResult.errors,
      warnings: validationResult.warnings,
      execution_time_ms: Date.now() - startTime
    };
  }

  private async importFullData(data: any, options: ImportOptions, startTime: number): Promise<ImportResult> {
    const results: ImportResult[] = [];
    const importOrder: Array<'categories' | 'transactions' | 'budgets'> = ['categories', 'transactions', 'budgets'];

    for (const type of importOrder) {
      if (data[type] && Array.isArray(data[type]) && data[type].length > 0) {
        results.push(await this.importSingleType(data[type], { ...options, type }, startTime));
      }
    }

    return {
      success: results.every(r => r.success),
      summary: {
        total_rows:  results.reduce((sum, r) => sum + r.summary.total_rows, 0),
        processed:   results.reduce((sum, r) => sum + r.summary.processed, 0),
        imported:    results.reduce((sum, r) => sum + r.summary.imported, 0),
        updated:     results.reduce((sum, r) => sum + r.summary.updated, 0),
        skipped:     results.reduce((sum, r) => sum + r.summary.skipped, 0),
        errors:      results.reduce((sum, r) => sum + r.summary.errors, 0)
      },
      data: {
        categories:   data.categories   || [],
        transactions: data.transactions || [],
        budgets:      data.budgets      || []
      },
      errors:   results.flatMap(r => r.errors   || []),
      warnings: results.flatMap(r => r.warnings || []),
      execution_time_ms: Date.now() - startTime
    };
  }

  private async processValidRows(
    validRows: any[],
    options: ImportOptions
  ): Promise<{ imported: number; updated: number; skipped: number }> {
    let imported = 0, updated = 0, skipped = 0;

    for (let i = 0; i < validRows.length; i += IMPORT_LIMITS.MAX_BATCH_SIZE) {
      const batch = validRows.slice(i, i + IMPORT_LIMITS.MAX_BATCH_SIZE);
      for (const row of batch) {
        try {
          let result: 'imported' | 'updated' | 'skipped';
          switch (options.type) {
            case 'transactions':
              result = await processTransactionRow(row, options, this.categoryRepo, this.transactionRepo);
              break;
            case 'categories':
              result = await processCategoryRow(row, options, this.categoryRepo);
              break;
            case 'budgets':
              result = await processBudgetRow(row, options, this.categoryRepo, this.budgetRepo);
              break;
            default:
              throw new Error(`Unsupported import type: ${options.type}`);
          }
          if (result === 'imported') imported++;
          else if (result === 'updated') updated++;
          else skipped++;
        } catch (error) {
          logger.error(`Failed to process row ${row._originalRowIndex}:`, error);
          skipped++;
        }
      }
    }

    return { imported, updated, skipped };
  }

  private async fetchAllData(options: ExportOptions): Promise<any> {
    const categoriesResult = await this.categoryRepo.findAll();
    return {
      categories:   categoriesResult.data || [],
      transactions: await this.transactionRepo.findAllWithFilters(buildTransactionFilters(options)),
      budgets:      await this.budgetRepo.findAllWithFilters(buildBudgetFilters(options))
    };
  }

  private async fetchSingleTypeData(options: ExportOptions): Promise<any[]> {
    switch (options.type) {
      case 'transactions':
        return await this.transactionRepo.findAllWithFilters(buildTransactionFilters(options));
      case 'categories':
        return (await this.categoryRepo.findAll()).data || [];
      case 'budgets':
        return await this.budgetRepo.findAllWithFilters(buildBudgetFilters(options));
      default:
        throw new Error(`Unsupported export type: ${options.type}`);
    }
  }

  private async getExistingCategoriesMap(): Promise<Map<string, any>> {
    const result = await this.categoryRepo.findAll();
    const categories = result.data || [];
    const map = new Map();
    categories.forEach(category => {
      map.set(category.id, category);
      map.set(category.name.toLowerCase(), category);
    });
    return map;
  }

  private async saveExportFile(fileBuffer: Buffer, fileName: string): Promise<string> {
    const exportsDir = path.join(process.cwd(), 'exports');
    try {
      await fs.access(exportsDir);
    } catch {
      await fs.mkdir(exportsDir, { recursive: true });
    }
    const filePath = path.join(exportsDir, fileName);
    await fs.writeFile(filePath, fileBuffer);
    return filePath;
  }
}
