import { 
  ImportOptions, 
  ExportOptions, 
  ImportResult, 
  ExportResult, 
  TemplateOptions, 
  TemplateResult,
  IMPORT_LIMITS,
  STANDARD_FIELD_MAPPINGS
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

  /**
   * Import data from file
   */
  async importData(fileBuffer: Buffer, fileName: string, options: ImportOptions): Promise<ImportResult> {
    const startTime = Date.now();
    
    try {
      // Validate file size
      if (fileBuffer.length > IMPORT_LIMITS.MAX_FILE_SIZE_MB * 1024 * 1024) {
        throw new Error(`File size exceeds limit of ${IMPORT_LIMITS.MAX_FILE_SIZE_MB}MB`);
      }

      // Parse file based on format
      let parsedData: any;
      const fileExtension = path.extname(fileName).toLowerCase();
      
      if (options.format === 'csv' || fileExtension === '.csv') {
        const fileContent = fileBuffer.toString((options.encoding || 'utf8') as BufferEncoding);
        const parseResult = CSVParser.parseCSV(fileContent, options);
        parsedData = parseResult.data;
      } else if (options.format === 'xlsx' || fileExtension === '.xlsx') {
        const parseResult = ExcelParser.parseExcel(fileBuffer, options);
        parsedData = parseResult.data;
      } else {
        throw new Error(`Unsupported file format: ${fileExtension}`);
      }

      // Process data based on type
      if (options.type === 'full') {
        return await this.importFullData(parsedData, options, startTime);
      } else {
        return await this.importSingleType(parsedData, options, startTime);
      }
    } catch (error) {
      logger.error('Import error:', error);
      return {
        success: false,
        summary: {
          total_rows: 0,
          processed: 0,
          imported: 0,
          updated: 0,
          skipped: 0,
          errors: 1
        },
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

  /**
   * Export data to file
   */
  async exportData(options: ExportOptions): Promise<ExportResult> {
    const startTime = Date.now();
    
    try {
      // Fetch data based on type
      let data: any = {};
      let totalRecords = 0;

      if (options.type === 'full') {
        data = await this.fetchAllData(options);
        totalRecords = Object.values(data).reduce((sum: number, arr: any) => 
          sum + (Array.isArray(arr) ? arr.length : 0), 0
        );
      } else {
        const singleTypeData = await this.fetchSingleTypeData(options);
        data[options.type] = singleTypeData;
        totalRecords = singleTypeData.length;
      }

      // Generate file based on format
      let fileBuffer: Buffer;
      let fileName: string;
      
      if (options.format === 'csv') {
        if (options.type === 'full') {
          throw new Error('CSV format does not support full export with multiple types');
        }
        const csvContent = CSVParser.generateCSV(data[options.type], options.type, options.includeHeaders);
        fileBuffer = Buffer.from(csvContent, 'utf8');
        fileName = `${options.type}_export_${this.getTimestamp()}.csv`;
      } else {
        // Excel format
        const excelData = this.prepareExcelData(data, options);
        fileBuffer = ExcelParser.generateExcel(excelData, options);
        fileName = `budget_tracker_export_${this.getTimestamp()}.xlsx`;
      }

      // Save file (in production, you might save to cloud storage)
      const filePath = await this.saveExportFile(fileBuffer, fileName);

      const result: ExportResult = {
        success: true,
        file_name: fileName,
        file_size: fileBuffer.length,
        format: options.format,
        summary: {
          ...this.createExportSummary(data),
          total_records: totalRecords
        },
        download_url: filePath,
        execution_time_ms: Date.now() - startTime
      };

      // Build metadata object with required fields
      const metadata: {
        exported_at: string;
        date_range?: { start: string; end: string; };
        filters_applied?: any;
      } = {
        exported_at: new Date().toISOString()
      };
      
      if (options.dateRange) {
        metadata.date_range = {
          start: options.dateRange.start_date,
          end: options.dateRange.end_date
        };
      }
      
      if (options.filters) {
        metadata.filters_applied = options.filters;
      }
      
      result.metadata = metadata;

      return result;
    } catch (error) {
      logger.error('Export error:', error);
      throw error;
    }
  }

  /**
   * Generate template file
   */
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
        headers = this.getTemplateHeaders(options.type);
        
        if (options.includeExamples) {
          exampleData = this.getTemplateExamples(options.type);
        }
        
        if (options.includeInstructions) {
          instructions = this.getTemplateInstructions(options.type);
        }
      } else {
        // Excel template with multiple sheets and instructions
        fileBuffer = ExcelParser.generateTemplate(options.includeExamples);
        fileName = 'budget_tracker_template.xlsx';
        headers = this.getTemplateHeaders(options.type);
        
        if (options.includeExamples) {
          exampleData = this.getTemplateExamples(options.type);
        }
        
        instructions = this.getAllTemplateInstructions();
      }

      // Save template file
      const filePath = await this.saveExportFile(fileBuffer, fileName);

      return {
        file_name: fileName,
        format: options.format,
        headers,
        example_data: exampleData,
        instructions,
        download_url: filePath
      };
    } catch (error) {
      logger.error('Template generation error:', error);
      throw error;
    }
  }

  // Private methods for import processing
  private async importSingleType(
    data: any[],
    options: ImportOptions,
    startTime: number
  ): Promise<ImportResult> {
    const summary = {
      total_rows: data.length,
      processed: 0,
      imported: 0,
      updated: 0,
      skipped: 0,
      errors: 0
    };

    if (data.length === 0) {
      return {
        success: true,
        summary,
        execution_time_ms: Date.now() - startTime
      };
    }

    // Get existing data for validation
    const existingCategories = await this.getExistingCategoriesMap();
    let existingBudgetsData: any[] = [];
    if (options.type === 'budgets') {
      const budgetsResult = await this.budgetRepo.findAll();
      existingBudgetsData = budgetsResult.data || [];
    }

    // Validate data
    this.validator.reset();
    const validRows: any[] = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      let isValid = false;
      
      try {
        switch (options.type) {
          case 'transactions':
            isValid = this.validator.validateTransactionRow(row, i + 1, existingCategories);
            break;
          case 'categories':
            isValid = this.validator.validateCategoryRow(row, i + 1, existingCategories);
            break;
          case 'budgets':
            isValid = this.validator.validateBudgetRow(row, i + 1, existingCategories, existingBudgetsData);
            break;
        }
        
        summary.processed++;
        
        if (isValid) {
          validRows.push({ ...row, _originalRowIndex: i + 1 });
        }
      } catch (error) {
        summary.errors++;
      }
    }

    const validationResult = this.validator.getValidationResults(data.length);
    summary.errors = validationResult.errors.length;

    // Process valid rows
    if (validRows.length > 0 && (options.validateData === false || validationResult.isValid)) {
      try {
        const importResult = await this.processValidRows(validRows, options);
        summary.imported = importResult.imported;
        summary.updated = importResult.updated;
        summary.skipped = importResult.skipped;
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

  private async importFullData(
    data: any,
    options: ImportOptions,
    startTime: number
  ): Promise<ImportResult> {
    const results: ImportResult[] = [];
    
    // Import in order: categories first, then transactions, then budgets
    const importOrder: Array<'categories' | 'transactions' | 'budgets'> = ['categories', 'transactions', 'budgets'];
    
    for (const type of importOrder) {
      if (data[type] && Array.isArray(data[type]) && data[type].length > 0) {
        const typeOptions = { ...options, type };
        const result = await this.importSingleType(data[type], typeOptions, startTime);
        results.push(result);
      }
    }

    // Combine results
    const combinedResult: ImportResult = {
      success: results.every(r => r.success),
      summary: {
        total_rows: results.reduce((sum, r) => sum + r.summary.total_rows, 0),
        processed: results.reduce((sum, r) => sum + r.summary.processed, 0),
        imported: results.reduce((sum, r) => sum + r.summary.imported, 0),
        updated: results.reduce((sum, r) => sum + r.summary.updated, 0),
        skipped: results.reduce((sum, r) => sum + r.summary.skipped, 0),
        errors: results.reduce((sum, r) => sum + r.summary.errors, 0)
      },
      data: {
        categories: data.categories || [],
        transactions: data.transactions || [],
        budgets: data.budgets || []
      },
      errors: results.flatMap(r => r.errors || []),
      warnings: results.flatMap(r => r.warnings || []),
      execution_time_ms: Date.now() - startTime
    };

    return combinedResult;
  }

  private async processValidRows(
    validRows: any[],
    options: ImportOptions
  ): Promise<{ imported: number; updated: number; skipped: number }> {
    let imported = 0;
    let updated = 0;
    let skipped = 0;

    // Process in batches
    const batchSize = IMPORT_LIMITS.MAX_BATCH_SIZE;
    
    for (let i = 0; i < validRows.length; i += batchSize) {
      const batch = validRows.slice(i, i + batchSize);
      
      for (const row of batch) {
        try {
          const result = await this.processRow(row, options);
          
          switch (result) {
            case 'imported':
              imported++;
              break;
            case 'updated':
              updated++;
              break;
            case 'skipped':
              skipped++;
              break;
          }
        } catch (error) {
          logger.error(`Failed to process row ${row._originalRowIndex}:`, error);
          skipped++;
        }
      }
    }

    return { imported, updated, skipped };
  }

  private async processRow(
    row: any,
    options: ImportOptions
  ): Promise<'imported' | 'updated' | 'skipped'> {
    switch (options.type) {
      case 'transactions':
        return await this.processTransactionRow(row, options);
      case 'categories':
        return await this.processCategoryRow(row, options);
      case 'budgets':
        return await this.processBudgetRow(row, options);
      default:
        throw new Error(`Unsupported import type: ${options.type}`);
    }
  }

  private async processTransactionRow(
    row: any,
    options: ImportOptions
  ): Promise<'imported' | 'updated' | 'skipped'> {
    // Find category by name or ID
    const category = await this.findCategoryByNameOrId(row.category);
    if (!category) {
      throw new Error(`Category not found: ${row.category}`);
    }

    const transactionData = {
      type: row.type as 'income' | 'expense',
      amount: row.amount,
      description: row.description,
      category_id: category.id,
      date: row.date
    };

    // Check for duplicates if skipDuplicates is enabled
    if (options.skipDuplicates) {
      const existing = await this.transactionRepo.findDuplicate(transactionData);
      if (existing) {
        return 'skipped';
      }
    }

    // Create transaction
    await this.transactionRepo.create(transactionData);
    return 'imported';
  }

  private async processCategoryRow(
    row: any,
    options: ImportOptions
  ): Promise<'imported' | 'updated' | 'skipped'> {
    const categoryData = {
      name: row.name,
      type: row.type as 'income' | 'expense',
      color: row.color,
      icon: row.icon,
      description: row.description || null,
      parent_id: null as string | null
    };

    // Find parent category if specified
    if (row.parent_category) {
      const parent = await this.findCategoryByNameOrId(row.parent_category);
      if (parent) {
        categoryData.parent_id = parent.id;
      }
    }

    // Check for duplicates
    const existingResult = await this.categoryRepo.findByNameAndType(categoryData.name, categoryData.type);
    
    if (existingResult.data) {
      if (options.updateExisting) {
        const result = await this.categoryRepo.update(existingResult.data.id, categoryData);
        if (result.error) throw new Error(result.error);
        return 'updated';
      } else if (options.skipDuplicates) {
        return 'skipped';
      }
    }

    // Create new category
    const result = await this.categoryRepo.create(categoryData);
    if (result.error) throw new Error(result.error);
    return 'imported';
  }

  private async processBudgetRow(
    row: any,
    options: ImportOptions
  ): Promise<'imported' | 'updated' | 'skipped'> {
    // Find category
    const category = await this.findCategoryByNameOrId(row.category);
    if (!category) {
      throw new Error(`Category not found: ${row.category}`);
    }

    const budgetData = {
      category_id: category.id,
      budget_amount: row.amount,
      period: row.period as 'weekly' | 'monthly' | 'yearly',
      start_date: row.start_date,
      end_date: row.end_date || this.calculateEndDate(new Date(row.start_date), row.period)
    };

    // Check for overlapping budgets
    const overlapping = await this.budgetRepo.findOverlapping(
      category.id,
      budgetData.start_date,
      budgetData.end_date
    );

    if (overlapping) {
      if (options.updateExisting) {
        const result = await this.budgetRepo.update(overlapping.id, budgetData);
        if (result.error) throw new Error(result.error);
        return 'updated';
      } else if (options.skipDuplicates) {
        return 'skipped';
      }
    }

    // Create new budget
    const result = await this.budgetRepo.create(budgetData);
    if (result.error) throw new Error(result.error);
    return 'imported';
  }

  // Private methods for export processing
  private async fetchAllData(options: ExportOptions): Promise<any> {
    const data: any = {};

    // Fetch categories
    const categoriesResult = await this.categoryRepo.findAll();
    data.categories = categoriesResult.data || [];

    // Fetch transactions with filters
    const transactionFilters = this.buildTransactionFilters(options);
    data.transactions = await this.transactionRepo.findAllWithFilters(transactionFilters);

    // Fetch budgets with filters  
    const budgetFilters = this.buildBudgetFilters(options);
    data.budgets = await this.budgetRepo.findAllWithFilters(budgetFilters);

    return data;
  }

  private async fetchSingleTypeData(options: ExportOptions): Promise<any[]> {
    switch (options.type) {
      case 'transactions':
        const transactionFilters = this.buildTransactionFilters(options);
        return await this.transactionRepo.findAllWithFilters(transactionFilters);
        
      case 'categories':
        const categoriesResult = await this.categoryRepo.findAll();
        return categoriesResult.data || [];
        
      case 'budgets':
        const budgetFilters = this.buildBudgetFilters(options);
        return await this.budgetRepo.findAllWithFilters(budgetFilters);
        
      default:
        throw new Error(`Unsupported export type: ${options.type}`);
    }
  }

  private buildTransactionFilters(options: ExportOptions): any {
    const filters: any = {};

    if (options.dateRange) {
      filters.date_from = options.dateRange.start_date;
      filters.date_to = options.dateRange.end_date;
    }

    if (options.filters?.category_ids) {
      filters.category_ids = options.filters.category_ids;
    }

    if (options.filters?.transaction_types) {
      filters.type = options.filters.transaction_types;
    }

    return filters;
  }

  private buildBudgetFilters(options: ExportOptions): any {
    const filters: any = {};

    if (options.dateRange) {
      filters.start_date_from = options.dateRange.start_date;
      filters.end_date_to = options.dateRange.end_date;
    }

    if (options.filters?.category_ids) {
      filters.category_ids = options.filters.category_ids;
    }

    if (options.filters?.budget_periods) {
      filters.period = options.filters.budget_periods;
    }

    return filters;
  }

  private prepareExcelData(data: any, options: ExportOptions): { [sheetName: string]: any[] } {
    const excelData: { [sheetName: string]: any[] } = {};

    if (options.type === 'full') {
      excelData['Transactions'] = data.transactions || [];
      excelData['Categories'] = data.categories || [];
      excelData['Budgets'] = data.budgets || [];
    } else {
      const sheetName = this.capitalizeFirst(options.type);
      excelData[sheetName] = data[options.type] || [];
    }

    return excelData;
  }

  private createExportSummary(data: any): any {
    const summary: any = {};

    if (data.transactions) {
      summary.transactions = data.transactions.length;
    }
    if (data.categories) {
      summary.categories = data.categories.length;
    }
    if (data.budgets) {
      summary.budgets = data.budgets.length;
    }

    return summary;
  }

  // Helper methods
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

  private async findCategoryByNameOrId(nameOrId: string): Promise<any | null> {
    // Try to find by ID first
    try {
      const categoryById = await this.categoryRepo.findById(nameOrId);
      if (categoryById.data) return categoryById.data;
    } catch {
      // Not a valid ID, continue to name search
    }

    // Search by name
    const result = await this.categoryRepo.findAll();
    const categories = result.data || [];
    return categories.find(cat => cat.name.toLowerCase() === nameOrId.toLowerCase()) || null;
  }

  private calculateEndDate(startDate: Date, period: string): string {
    const endDate = new Date(startDate);
    
    switch (period.toLowerCase()) {
      case 'weekly':
        endDate.setDate(startDate.getDate() + 6);
        break;
      case 'monthly':
        endDate.setMonth(startDate.getMonth() + 1);
        endDate.setDate(endDate.getDate() - 1);
        break;
      case 'yearly':
        endDate.setFullYear(startDate.getFullYear() + 1);
        endDate.setDate(endDate.getDate() - 1);
        break;
    }
    
    return endDate.toISOString().split('T')[0] || '';
  }

  private async saveExportFile(fileBuffer: Buffer, fileName: string): Promise<string> {
    // In production, you would save to cloud storage (S3, GCS, etc.)
    // For now, save to local exports directory
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

  private getTimestamp(): string {
    const datePart = new Date().toISOString().split('T')[0] || '';
    const timePart = new Date().toISOString().split('T')[1];
    const timeComponent = timePart ? timePart.split('.')[0]?.replace(/:/g, '-') || '' : '';
    return datePart + '_' + timeComponent;
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private getTemplateHeaders(type: 'transactions' | 'categories' | 'budgets'): string[] {
    const fieldMapping = STANDARD_FIELD_MAPPINGS.default?.[type];
    if (!fieldMapping) {
      throw new Error(`No field mapping found for type: ${type}`);
    }
    return Object.values(fieldMapping);
  }

  private getTemplateExamples(type: 'transactions' | 'categories' | 'budgets'): any[] {
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

  private getTemplateInstructions(type: 'transactions' | 'categories' | 'budgets'): string[] {
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

  private getAllTemplateInstructions(): string[] {
    return [
      'General Guidelines:',
      '• Each sheet represents a different data type',
      '• Do not modify the header row',
      '• Follow the example format provided',
      '• Dates should be in YYYY-MM-DD format',
      '• Amounts should be positive numbers',
      '',
      ...this.getTemplateInstructions('transactions'),
      '',
      ...this.getTemplateInstructions('categories'),
      '',
      ...this.getTemplateInstructions('budgets')
    ];
  }
}
