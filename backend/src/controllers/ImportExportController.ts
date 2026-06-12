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
import {
  getFormatFromFile,
  parseFilters,
  sendFileDownload,
  scheduleFileDeletion
} from './helpers/importExportHelpers';

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

  uploadMiddleware = upload.single('file');

  async importData(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, error: 'No file uploaded' });
        return;
      }

      const options: ImportOptions = {
        format: req.body.format || getFormatFromFile(req.file.originalname),
        type: req.body.type || 'transactions',
        validateData: req.body.validateData !== 'false',
        skipDuplicates: req.body.skipDuplicates === 'true',
        updateExisting: req.body.updateExisting === 'true',
        dateFormat: req.body.dateFormat || 'YYYY-MM-DD',
        delimiter: req.body.delimiter,
        encoding: req.body.encoding || 'utf8'
      };

      logger.info('Starting import process', { fileName: req.file.originalname, fileSize: req.file.size, options });

      const result = await this.importExportService.importData(req.file.buffer, req.file.originalname, options);

      if (result.success) {
        logger.info('Import completed successfully', { summary: result.summary, executionTime: result.execution_time_ms });
      } else {
        logger.warn('Import completed with errors', { summary: result.summary, errorCount: result.errors?.length || 0 });
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

  async exportData(req: Request, res: Response): Promise<void> {
    try {
      const options: ExportOptions = {
        format: req.query.format as 'csv' | 'xlsx' || 'xlsx',
        type: req.query.type as 'transactions' | 'categories' | 'budgets' | 'full' || 'full',
        includeHeaders: req.query.includeHeaders !== 'false',
        includeMetadata: req.query.includeMetadata === 'true',
        filters: parseFilters(req.query)
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

      await sendFileDownload(res, result.download_url as string, result.file_name, result.format, result.file_size);
      scheduleFileDeletion(result.download_url as string, 5000);
    } catch (error) {
      logger.error('Export failed:', error);
      res.status(500).json({
        success: false,
        error: 'Export failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getExportInfo(req: Request, res: Response): Promise<void> {
    try {
      const options: ExportOptions = {
        format: req.query.format as 'csv' | 'xlsx' || 'xlsx',
        type: req.query.type as 'transactions' | 'categories' | 'budgets' | 'full' || 'full',
        includeHeaders: req.query.includeHeaders !== 'false',
        includeMetadata: req.query.includeMetadata === 'true',
        filters: parseFilters(req.query)
      };

      if (req.query.start_date && req.query.end_date) {
        options.dateRange = {
          start_date: req.query.start_date as string,
          end_date: req.query.end_date as string
        };
      }

      const result = await this.importExportService.exportData(options);
      const { download_url, ...exportInfo } = result;

      res.json(exportInfo);

      if (download_url) {
        scheduleFileDeletion(download_url as string, 1000);
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

      logger.info('Template generated successfully', { fileName: result.file_name, format: result.format });

      await sendFileDownload(res, result.download_url as string, result.file_name, result.format, 0);
      scheduleFileDeletion(result.download_url as string, 5000);
    } catch (error) {
      logger.error('Template generation failed:', error);
      res.status(500).json({
        success: false,
        error: 'Template generation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

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
      const { download_url, ...templateInfo } = result;

      res.json(templateInfo);

      if (download_url) {
        scheduleFileDeletion(download_url as string, 1000);
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

  async validateFile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, error: 'No file uploaded' });
        return;
      }

      const fileExtension = path.extname(req.file.originalname).toLowerCase();

      const validation = {
        success: true,
        file_name: req.file.originalname,
        file_size: req.file.size,
        format: fileExtension === '.csv' ? 'csv' : 'xlsx',
        issues: [] as string[],
        suggestions: [] as string[]
      };

      if (req.file.size > IMPORT_LIMITS.MAX_FILE_SIZE_MB * 1024 * 1024) {
        validation.success = false;
        validation.issues.push(`File size exceeds ${IMPORT_LIMITS.MAX_FILE_SIZE_MB}MB limit`);
      }

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
}
