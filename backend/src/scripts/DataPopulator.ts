import { MockDataGenerator, MockDataConfig } from './MockDataGenerator';
import { logger } from '../config/logger';
import { supabaseAdmin } from '../config/database';

export class DataPopulator {
  private generator = new MockDataGenerator();

  /**
   * Populate database with mock data for specified period
   */
  async populateData(config: MockDataConfig): Promise<void> {
    try {
      logger.info(`Starting data population for ${config.months} months...`);

      // Get existing categories
      const categories = await this.generator.getExistingCategories();
      logger.info(`Found ${categories.length} categories`);

      // Generate transactions
      const transactions = this.generator.generateTransactions(categories, config);
      
      // Generate budgets (only for current month)
      const budgets = this.generator.generateBudgets(categories, config);

      // Insert data into database
      await this.generator.insertTransactions(transactions);
      await this.generator.insertBudgets(budgets);

      // Log summary
      const summary = await this.getDataSummary();
      logger.info('Data population completed successfully!');
      logger.info('Database summary:', summary);

    } catch (error) {
      logger.error('Error populating data:', error);
      throw error;
    }
  }

  /**
   * Delete all transactions and budgets (keep categories)
   */
  async deleteAllData(): Promise<void> {
    try {
      logger.info('Starting data cleanup...');

      // Delete all transactions
      const { error: transactionError } = await supabaseAdmin
        .from('transactions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (transactionError) {
        throw new Error(`Failed to delete transactions: ${transactionError.message}`);
      }

      // Delete all budgets
      const { error: budgetError } = await supabaseAdmin
        .from('budgets')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (budgetError) {
        throw new Error(`Failed to delete budgets: ${budgetError.message}`);
      }

      logger.info('All transactions and budgets deleted successfully');

      const summary = await this.getDataSummary();
      logger.info('Database summary after cleanup:', summary);

    } catch (error) {
      logger.error('Error deleting data:', error);
      throw error;
    }
  }

  /**
   * Complete database reset (delete all data including non-default categories)
   */
  async resetDatabase(): Promise<void> {
    try {
      logger.info('Starting complete database reset...');

      // Delete all transactions first (due to foreign key constraints)
      const { error: transactionError } = await supabaseAdmin
        .from('transactions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (transactionError) {
        throw new Error(`Failed to delete transactions: ${transactionError.message}`);
      }

      // Delete all budgets
      const { error: budgetError } = await supabaseAdmin
        .from('budgets')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (budgetError) {
        throw new Error(`Failed to delete budgets: ${budgetError.message}`);
      }

      // Delete non-default categories
      const { error: categoryError } = await supabaseAdmin
        .from('categories')
        .delete()
        .eq('is_default', false);

      if (categoryError) {
        throw new Error(`Failed to delete custom categories: ${categoryError.message}`);
      }

      logger.info('Complete database reset completed successfully');

      const summary = await this.getDataSummary();
      logger.info('Database summary after reset:', summary);

    } catch (error) {
      logger.error('Error resetting database:', error);
      throw error;
    }
  }

  /**
   * Get current database summary
   */
  async getDataSummary(): Promise<any> {
    try {
      // Count transactions
      const { count: transactionCount, error: transactionError } = await supabaseAdmin
        .from('transactions')
        .select('*', { count: 'exact', head: true });

      if (transactionError) {
        throw new Error(`Failed to count transactions: ${transactionError.message}`);
      }

      // Count budgets
      const { count: budgetCount, error: budgetError } = await supabaseAdmin
        .from('budgets')
        .select('*', { count: 'exact', head: true });

      if (budgetError) {
        throw new Error(`Failed to count budgets: ${budgetError.message}`);
      }

      // Count categories
      const { count: categoryCount, error: categoryError } = await supabaseAdmin
        .from('categories')
        .select('*', { count: 'exact', head: true });

      if (categoryError) {
        throw new Error(`Failed to count categories: ${categoryError.message}`);
      }

      // Get date range of transactions
      const { data: dateRange, error: dateError } = await supabaseAdmin
        .from('transactions')
        .select('date')
        .order('date', { ascending: true })
        .limit(1);

      const { data: latestDate, error: latestError } = await supabaseAdmin
        .from('transactions')
        .select('date')
        .order('date', { ascending: false })
        .limit(1);

      return {
        categories: categoryCount || 0,
        transactions: transactionCount || 0,
        budgets: budgetCount || 0,
        date_range: {
          earliest: dateRange?.[0]?.date || null,
          latest: latestDate?.[0]?.date || null
        }
      };

    } catch (error) {
      logger.error('Error getting data summary:', error);
      return {
        categories: 0,
        transactions: 0,
        budgets: 0,
        date_range: { earliest: null, latest: null }
      };
    }
  }

  /**
   * Verify data integrity after population
   */
  async verifyDataIntegrity(): Promise<boolean> {
    try {
      logger.info('Verifying data integrity...');

      // Check for transactions without valid categories
      const { data: orphanedTransactions, error: orphanError } = await supabaseAdmin
        .from('transactions')
        .select('id, category_id')
        .not('category_id', 'in', `(SELECT id FROM categories WHERE is_active = true)`);

      if (orphanError) {
        logger.warn('Could not check for orphaned transactions:', orphanError.message);
      } else if (orphanedTransactions && orphanedTransactions.length > 0) {
        logger.warn(`Found ${orphanedTransactions.length} transactions with invalid categories`);
        return false;
      }

      // Check for budgets without valid categories
      const { data: orphanedBudgets, error: budgetOrphanError } = await supabaseAdmin
        .from('budgets')
        .select('id, category_id')
        .not('category_id', 'in', `(SELECT id FROM categories WHERE is_active = true AND type = 'expense')`);

      if (budgetOrphanError) {
        logger.warn('Could not check for orphaned budgets:', budgetOrphanError.message);
      } else if (orphanedBudgets && orphanedBudgets.length > 0) {
        logger.warn(`Found ${orphanedBudgets.length} budgets with invalid categories`);
        return false;
      }

      // Check for duplicate budgets (same category, overlapping periods)
      const { data: budgets, error: budgetCheckError } = await supabaseAdmin
        .from('budgets')
        .select('category_id, start_date, end_date')
        .eq('is_active', true);

      if (budgetCheckError) {
        logger.warn('Could not check for duplicate budgets:', budgetCheckError.message);
      } else if (budgets) {
        const categoryPeriods = new Map<string, Array<{start: string, end: string}>>();
        
        budgets.forEach(budget => {
          if (!categoryPeriods.has(budget.category_id)) {
            categoryPeriods.set(budget.category_id, []);
          }
          categoryPeriods.get(budget.category_id)!.push({
            start: budget.start_date,
            end: budget.end_date
          });
        });

        let hasOverlaps = false;
        categoryPeriods.forEach((periods, categoryId) => {
          for (let i = 0; i < periods.length; i++) {
            for (let j = i + 1; j < periods.length; j++) {
              const period1 = periods[i];
              const period2 = periods[j];
              
              // Check for overlap
              if (new Date(period1.start) <= new Date(period2.end) && 
                  new Date(period2.start) <= new Date(period1.end)) {
                logger.warn(`Found overlapping budgets for category ${categoryId}`);
                hasOverlaps = true;
              }
            }
          }
        });

        if (hasOverlaps) {
          return false;
        }
      }

      logger.info('Data integrity verification passed');
      return true;

    } catch (error) {
      logger.error('Error verifying data integrity:', error);
      return false;
    }
  }
}
