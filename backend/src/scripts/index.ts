import { DataPopulator } from './DataPopulator';
import { logger } from '../config/logger';

// Simple script runner - can be called directly without CLI parsing
export async function runDataScript(
  command: 'populate' | 'delete' | 'reset' | 'summary' | 'verify',
  options: {
    months?: 1 | 3 | 6 | 12;
    variability?: 'low' | 'medium' | 'high';
    includeWeekends?: boolean;
    startDate?: string;
  } = {}
): Promise<void> {
  const populator = new DataPopulator();

  try {
    switch (command) {
      case 'populate':
        logger.info(`Populating database with ${options.months || 3} months of data...`);
        await populator.populateData({
          months: options.months || 3,
          variability: options.variability || 'medium',
          includeWeekends: options.includeWeekends || false,
          startDate: options.startDate
        });
        break;

      case 'delete':
        logger.info('Deleting all transactions and budgets...');
        await populator.deleteAllData();
        break;

      case 'reset':
        logger.info('Performing complete database reset...');
        await populator.resetDatabase();
        break;

      case 'summary':
        const summary = await populator.getDataSummary();
        logger.info('Database summary:', summary);
        return;

      case 'verify':
        const isValid = await populator.verifyDataIntegrity();
        if (!isValid) {
          throw new Error('Data integrity verification failed');
        }
        logger.info('Data integrity verification passed');
        return;
    }

    // Show summary after operations
    const finalSummary = await populator.getDataSummary();
    logger.info('Operation completed. Database summary:', finalSummary);

  } catch (error) {
    logger.error(`Error running ${command} command:`, error);
    throw error;
  }
}

// Individual helper functions for common operations
export async function populate1Month(): Promise<void> {
  return runDataScript('populate', { months: 1 });
}

export async function populate3Months(): Promise<void> {
  return runDataScript('populate', { months: 3 });
}

export async function populate6Months(): Promise<void> {
  return runDataScript('populate', { months: 6 });
}

export async function populate12Months(): Promise<void> {
  return runDataScript('populate', { months: 12 });
}

export async function deleteAllData(): Promise<void> {
  return runDataScript('delete');
}

export async function resetDatabase(): Promise<void> {
  return runDataScript('reset');
}

export async function getDatabaseSummary(): Promise<any> {
  const populator = new DataPopulator();
  return populator.getDataSummary();
}

export async function verifyDataIntegrity(): Promise<boolean> {
  const populator = new DataPopulator();
  return populator.verifyDataIntegrity();
}
