import path from 'path';
import fs from 'fs/promises';
import { Response } from 'express';
import { logger } from '../../config/logger';

/** Derive import format from file extension. */
export function getFormatFromFile(fileName: string): 'csv' | 'xlsx' {
  return path.extname(fileName).toLowerCase() === '.csv' ? 'csv' : 'xlsx';
}

/** Parse export/import filter parameters from an Express query object. */
export function parseFilters(query: any): any {
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

/** Set response headers for a file download and send the file buffer. */
export async function sendFileDownload(
  res: Response,
  filePath: string,
  fileName: string,
  format: 'csv' | 'xlsx',
  fileSize: number
): Promise<void> {
  const contentType = format === 'csv'
    ? 'text/csv'
    : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.setHeader('Content-Length', fileSize);

  const buffer = await fs.readFile(filePath);
  res.send(buffer);
}

/** Schedule deletion of a temporary file after a delay. */
export function scheduleFileDeletion(filePath: string, delayMs: number): void {
  setTimeout(async () => {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      logger.warn('Failed to cleanup file:', error);
    }
  }, delayMs);
}
