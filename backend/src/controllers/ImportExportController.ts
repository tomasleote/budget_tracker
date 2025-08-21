import { Request, Response } from 'express';
import { ImportExportService } from '../import-export/ImportExportService';
import { 
  ImportOptions, 
  ExportOptions, 
  TemplateOptions,
  IMPORT_LIMITS 
} from '../import-export/types';
import { logger } from '../config/logger';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: IMPORT_LIMITS.MAX_FILE_SIZE_MB * 1024 * 1024,
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.csv', '.xlsx'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type. Allowed: ${allowedExtensions.join(', ')}`));
    }
  }
});

export class ImportExportController {
  private importExportService: ImportExportService;

  constructor() {
    this.importExportService = new ImportExportService();
  }

  /**
   * Handle file upload middleware
   */
  uploadMiddleware = upload.single('file');

  /**
   * Import data from uploaded file
   */
  async importData(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
        return;
      }

      const options: ImportOptions = {
        format: req.body.format || this.getFormatFromFile(req.file.originalname),
        type: req.body.type || 'transactions',
        validateData: req.body.validateData !== 'false',
        skipDuplicates: req.body.skipDuplicates === 'true',
        updateExisting: req.body.updateExisting === 'true',
        dateFormat: req.body.dateFormat || 'YYYY-MM-DD',
        delimiter: req.body.delimiter,
        encoding: req.body.encoding || 'utf8'
      };

      logger.info('Starting import process', {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        options
      });

      const result = await this.importExportService.importData(
        req.file.buffer,
        req.file.originalname,
        options
      );

      if (result.success) {
        logger.info('Import completed successfully', {
          summary: result.summary,
          executionTime: result.execution_time_ms
        });
      } else {
        logger.warn('Import completed with errors', {
          summary: result.summary,
          errorCount: result.errors?.length || 0
        });
      }

      res.status(result.success ? 200 : 422).json(result);
    } catch (error) {
      logger.error('Import failed:', error);
      res.status(500).json({
        success: false,
        error: 'Import failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Export data to file
   */
  async exportData(req: Request, res: Response): Promise<void> {
    try {
      const options: ExportOptions = {
        format: req.query.format as 'csv' | 'xlsx' || 'xlsx',
        type: req.query.type as 'transactions' | 'categories' | 'budgets' | 'full' || 'full',
        includeHeaders: req.query.includeHeaders !== 'false',
        includeMetadata: req.query.includeMetadata === 'true',
        filters: this.parseFilters(req.query)
      };
      
      if (req.query.start_date && req.query.end_date) {
        options.dateRange = {
          start_date: req.query.start_date as string,
          end_date: req.query.end_date as string
        };
      }
      
      if (req.query.fields) {
        options.customFields = (req.query.fields as string).split(',');
      }

      logger.info('Starting export process', { options });

      const result = await this.importExportService.exportData(options);

      logger.info('Export completed successfully', {
        fileName: result.file_name,
        fileSize: result.file_size,
        recordCount: result.summary.total_records,
        executionTime: result.execution_time_ms
      });

      // Set appropriate headers for file download
      const contentType = result.format === 'csv' 
        ? 'text/csv' 
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename=\"${result.file_name}\"`);
      res.setHeader('Content-Length', result.file_size);

      // Read and send the file
      const fileBuffer = await fs.readFile(result.download_url as string);
      res.send(fileBuffer);

      // Clean up the temporary file
      setTimeout(async () => {
        try {
          await fs.unlink(result.download_url as string);
        } catch (error) {
          logger.warn('Failed to cleanup export file:', error);
        }
      }, 5000); // Delete after 5 seconds

    } catch (error) {
      logger.error('Export failed:', error);
      res.status(500).json({
        success: false,
        error: 'Export failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get export metadata without downloading file
   */
  async getExportInfo(req: Request, res: Response): Promise<void> {
    try {
      const options: ExportOptions = {
        format: req.query.format as 'csv' | 'xlsx' || 'xlsx',
        type: req.query.type as 'transactions' | 'categories' | 'budgets' | 'full' || 'full',
        includeHeaders: req.query.includeHeaders !== 'false',
        includeMetadata: req.query.includeMetadata === 'true',
        filters: this.parseFilters(req.query)
      };
      
      if (req.query.start_date && req.query.end_date) {
        options.dateRange = {
          start_date: req.query.start_date as string,
          end_date: req.query.end_date as string
        };
      }

      // Get just the metadata without creating the file
      const result = await this.importExportService.exportData(options);
      
      // Remove the actual file content from response
      const { download_url, ...exportInfo } = result;

      res.json(exportInfo);

      // Clean up the file
      if (download_url) {
        setTimeout(async () => {
          try {
            await fs.unlink(download_url as string);
          } catch (error) {
            logger.warn('Failed to cleanup export file:', error);
          }
        }, 1000);
      }
    } catch (error) {
      logger.error('Export info failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get export info',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Generate and download template files
   */
  async downloadTemplate(req: Request, res: Response): Promise<void> {
    try {
      const options: TemplateOptions = {
        type: req.params.type as 'transactions' | 'categories' | 'budgets',
        format: req.query.format as 'csv' | 'xlsx' || 'xlsx',
        includeExamples: req.query.includeExamples !== 'false',
        includeInstructions: req.query.includeInstructions !== 'false'
      };

      if (!['transactions', 'categories', 'budgets'].includes(options.type)) {
        res.status(400).json({
          success: false,
          error: 'Invalid template type',
          message: 'Type must be one of: transactions, categories, budgets'
        });
        return;
      }

      logger.info('Generating template', { options });

      const result = await this.importExportService.generateTemplate(options);

      logger.info('Template generated successfully', {
        fileName: result.file_name,
        format: result.format
      });

      // Set appropriate headers for file download
      const contentType = result.format === 'csv' 
        ? 'text/csv' 
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename=\"${result.file_name}\"`);

      // Read and send the file
      const fileBuffer = await fs.readFile(result.download_url as string);
      res.send(fileBuffer);

      // Clean up the temporary file
      setTimeout(async () => {
        try {
          await fs.unlink(result.download_url as string);
        } catch (error) {
          logger.warn('Failed to cleanup template file:', error);
        }
      }, 5000);

    } catch (error) {
      logger.error('Template generation failed:', error);
      res.status(500).json({
        success: false,
        error: 'Template generation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get template info without downloading
   */
  async getTemplateInfo(req: Request, res: Response): Promise<void> {
    try {
      const type = req.params.type as 'transactions' | 'categories' | 'budgets';
      
      if (!['transactions', 'categories', 'budgets'].includes(type)) {
        res.status(400).json({
          success: false,
          error: 'Invalid template type',
          message: 'Type must be one of: transactions, categories, budgets'
        });
        return;
      }

      const options: TemplateOptions = {
        type,
        format: req.query.format as 'csv' | 'xlsx' || 'csv',
        includeExamples: req.query.includeExamples !== 'false',
        includeInstructions: req.query.includeInstructions !== 'false'
      };

      const result = await this.importExportService.generateTemplate(options);
      
      // Remove the actual file content from response
      const { download_url, ...templateInfo } = result;

      res.json(templateInfo);

      // Clean up the file
      if (download_url) {
        setTimeout(async () => {
          try {
            await fs.unlink(download_url as string);
          } catch (error) {
            logger.warn('Failed to cleanup template file:', error);
          }
        }, 1000);
      }
    } catch (error) {
      logger.error('Template info failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get template info',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Validate uploaded file structure
   */
  async validateFile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
        return;
      }

      const fileExtension = path.extname(req.file.originalname).toLowerCase();
      
      // Simple validation based on file type
      const validation = {
        success: true,
        file_name: req.file.originalname,
        file_size: req.file.size,
        format: fileExtension === '.csv' ? 'csv' : 'xlsx',
        issues: [] as string[],
        suggestions: [] as string[]
      };

      // Check file size
      if (req.file.size > IMPORT_LIMITS.MAX_FILE_SIZE_MB * 1024 * 1024) {
        validation.success = false;
        validation.issues.push(`File size exceeds ${IMPORT_LIMITS.MAX_FILE_SIZE_MB}MB limit`);
      }

      // Basic content validation would go here
      // For now, just return the basic validation

      res.json(validation);
    } catch (error) {
      logger.error('File validation failed:', error);
      res.status(500).json({
        success: false,
        error: 'File validation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get import/export configuration and limits
   */
  async getConfig(req: Request, res: Response): Promise<void> {
    try {
      const config = {
        limits: IMPORT_LIMITS,
        supported_formats: ['csv', 'xlsx'],
        supported_types: ['transactions', 'categories', 'budgets', 'full'],
        supported_encodings: IMPORT_LIMITS.SUPPORTED_ENCODINGS,
        supported_date_formats: IMPORT_LIMITS.SUPPORTED_DATE_FORMATS,
        examples: {
          transactions: {
            csv_headers: ['Type', 'Amount', 'Description', 'Category', 'Date'],
            required_fields: ['type', 'amount', 'description', 'category', 'date']
          },
          categories: {
            csv_headers: ['Name', 'Type', 'Color', 'Icon', 'Description', 'Parent Category'],
            required_fields: ['name', 'type', 'color', 'icon']
          },
          budgets: {
            csv_headers: ['Category', 'Budget Amount', 'Period', 'Start Date', 'End Date'],
            required_fields: ['category', 'amount', 'period', 'start_date']
          }
        }
      };

      res.json(config);
    } catch (error) {
      logger.error('Failed to get config:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get configuration',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Private helper methods
  private getFormatFromFile(fileName: string): 'csv' | 'xlsx' {
    const extension = path.extname(fileName).toLowerCase();
    return extension === '.csv' ? 'csv' : 'xlsx';
  }

  private parseFilters(query: any): any {
    const filters: any = {};

    if (query.category_ids) {
      filters.category_ids = Array.isArray(query.category_ids) 
        ? query.category_ids 
        : query.category_ids.split(',');
    }

    if (query.transaction_types) {
      filters.transaction_types = Array.isArray(query.transaction_types)
        ? query.transaction_types
        : query.transaction_types.split(',');
    }

    if (query.budget_periods) {
      filters.budget_periods = Array.isArray(query.budget_periods)
        ? query.budget_periods
        : query.budget_periods.split(',');
    }

    return Object.keys(filters).length > 0 ? filters : undefined;
  }
}
