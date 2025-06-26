#!/usr/bin/env node

import dotenv from 'dotenv';
import { DataPopulator } from './DataPopulator';
import { logger } from '../config/logger';

// Load environment variables
dotenv.config();

interface ScriptOptions {
  command: 'populate' | 'delete' | 'reset' | 'summary' | 'verify';
  months?: 1 | 3 | 6 | 12;
  variability?: 'low' | 'medium' | 'high';
  includeWeekends?: boolean;
  startDate?: string;
}

async function parseArguments(): Promise<ScriptOptions> {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    printUsage();
    process.exit(1);
  }

  const options: ScriptOptions = {
    command: args[0] as ScriptOptions['command']
  };

  // Parse additional arguments
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--months' && args[i + 1]) {
      options.months = parseInt(args[i + 1]) as 1 | 3 | 6 | 12;
      i++;
    } else if (arg === '--variability' && args[i + 1]) {
      options.variability = args[i + 1] as 'low' | 'medium' | 'high';
      i++;
    } else if (arg === '--include-weekends') {
      options.includeWeekends = true;
    } else if (arg === '--start-date' && args[i + 1]) {
      options.startDate = args[i + 1];
      i++;
    }
  }

  // Validate command
  if (!['populate', 'delete', 'reset', 'summary', 'verify'].includes(options.command)) {
    console.error(`Invalid command: ${options.command}`);
    printUsage();
    process.exit(1);
  }

  // Validate months for populate command
  if (options.command === 'populate' && options.months && ![1, 3, 6, 12].includes(options.months)) {
    console.error(`Invalid months value: ${options.months}. Must be 1, 3, 6, or 12`);
    process.exit(1);
  }

  return options;
}

function printUsage(): void {
  console.log(`
Budget Tracker Data Management CLI

Usage: npm run data <command> [options]

Commands:
  populate    Generate and insert mock data
  delete      Delete all transactions and budgets (keep categories)
  reset       Complete database reset (delete all data, keep default categories)
  summary     Show current database summary
  verify      Verify data integrity

Options for 'populate' command:
  --months <1|3|6|12>           Number of months of data (default: 3)
  --variability <low|medium|high>  Spending variability (default: medium)
  --include-weekends            Include weekend transactions for work categories
  --start-date <YYYY-MM-DD>     Custom start date (default: X months ago)

Examples:
  npm run data populate --months 6 --variability high
  npm run data populate --months 1 --start-date 2025-01-01
  npm run data delete
  npm run data reset
  npm run data summary
  npm run data verify

Note: Make sure your .env file is properly configured with Supabase credentials.
`);
}

async function main(): Promise<void> {
  try {
    const options = await parseArguments();
    const populator = new DataPopulator();

    console.log('🚀 Budget Tracker Data Management CLI\n');
    
    switch (options.command) {
      case 'populate':
        console.log(`📊 Populating database with ${options.months || 3} months of mock data...`);
        await populator.populateData({
          months: options.months || 3,
          variability: options.variability || 'medium',
          includeWeekends: options.includeWeekends || false,
          startDate: options.startDate
        });
        console.log('✅ Data population completed successfully!');
        break;

      case 'delete':
        console.log('🗑️  Deleting all transactions and budgets...');
        await populator.deleteAllData();
        console.log('✅ Data deletion completed successfully!');
        break;

      case 'reset':
        console.log('🔄 Performing complete database reset...');
        await populator.resetDatabase();
        console.log('✅ Database reset completed successfully!');
        break;

      case 'summary':
        console.log('📋 Getting database summary...');
        const summary = await populator.getDataSummary();
        console.log('\n📊 Current Database Summary:');
        console.log(`   Categories: ${summary.categories}`);
        console.log(`   Transactions: ${summary.transactions}`);
        console.log(`   Budgets: ${summary.budgets}`);
        if (summary.date_range.earliest && summary.date_range.latest) {
          console.log(`   Date Range: ${summary.date_range.earliest} to ${summary.date_range.latest}`);
        }
        break;

      case 'verify':
        console.log('🔍 Verifying data integrity...');
        const isValid = await populator.verifyDataIntegrity();
        if (isValid) {
          console.log('✅ Data integrity verification passed!');
        } else {
          console.log('❌ Data integrity issues found. Check logs for details.');
          process.exit(1);
        }
        break;

      default:
        printUsage();
        process.exit(1);
    }

    // Show final summary for populate, delete, and reset commands
    if (['populate', 'delete', 'reset'].includes(options.command)) {
      console.log('\n📊 Final Database Summary:');
      const finalSummary = await populator.getDataSummary();
      console.log(`   Categories: ${finalSummary.categories}`);
      console.log(`   Transactions: ${finalSummary.transactions}`);
      console.log(`   Budgets: ${finalSummary.budgets}`);
      if (finalSummary.date_range.earliest && finalSummary.date_range.latest) {
        console.log(`   Date Range: ${finalSummary.date_range.earliest} to ${finalSummary.date_range.latest}`);
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    logger.error('CLI Error:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Gracefully shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Gracefully shutting down...');
  process.exit(0);
});

// Run the CLI
if (require.main === module) {
  main();
}
