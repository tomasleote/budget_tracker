import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

import { supabaseAdmin } from '../src/config/database';
import { logger } from '../src/config/logger';

/**
 * Performance Testing Script - Phase A1
 * Test database query performance after index optimization
 */

class PerformanceTester {
  async testCategoryQueries(): Promise<void> {
    logger.info('🧪 Testing Category Query Performance...');
    
    const tests = [
      {
        name: 'Get active categories by type',
        query: () => supabaseAdmin
          .from('categories')
          .select('*')
          .eq('type', 'expense')
          .eq('is_active', true)
      },
      {
        name: 'Get category hierarchy',
        query: () => supabaseAdmin
          .from('categories')
          .select('*')
          .is('parent_id', null)
          .eq('is_active', true)
      },
      {
        name: 'Find category by name',
        query: () => supabaseAdmin
          .from('categories')
          .select('*')
          .ilike('name', '%food%')
          .eq('is_active', true)
      }
    ];

    for (const test of tests) {
      const startTime = Date.now();
      const { data, error } = await test.query();
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      const status = error ? '❌' : '✅';
      const count = data ? data.length : 0;
      
      logger.info(`${status} ${test.name}: ${duration}ms (${count} results)`);
    }
  }

  async testTransactionQueries(): Promise<void> {
    logger.info('🧪 Testing Transaction Query Performance...');
    
    const tests = [
      {
        name: 'Get transactions by type',
        query: () => supabaseAdmin
          .from('transactions')
          .select('*')
          .eq('type', 'expense')
          .order('date', { ascending: false })
          .limit(20)
      },
      {
        name: 'Get transactions by date range',
        query: () => supabaseAdmin
          .from('transactions')
          .select('*')
          .gte('date', '2024-01-01')
          .lte('date', '2024-12-31')
          .order('date', { ascending: false })
          .limit(50)
      },
      {
        name: 'Get transactions with category join',
        query: () => supabaseAdmin
          .from('transactions')
          .select(`
            *,
            categories (
              id,
              name,
              type,
              color
            )
          `)
          .limit(20)
      },
      {
        name: 'Search transactions by description',
        query: () => supabaseAdmin
          .from('transactions')
          .select('*')
          .ilike('description', '%grocery%')
          .limit(10)
      }
    ];

    for (const test of tests) {
      const startTime = Date.now();
      const { data, error } = await test.query();
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      const status = error ? '❌' : '✅';
      const count = data ? data.length : 0;
      
      logger.info(`${status} ${test.name}: ${duration}ms (${count} results)`);
    }
  }

  async testComplexQueries(): Promise<void> {
    logger.info('🧪 Testing Complex Query Performance...');
    
    const tests = [
      {
        name: 'Transaction summary calculation',
        query: async () => {
          const { data, error } = await supabaseAdmin
            .from('transactions')
            .select('type, amount')
            .gte('date', '2024-01-01');
          return { data, error };
        }
      },
      {
        name: 'Category usage count',
        query: () => supabaseAdmin
          .from('transactions')
          .select('category_id, count(*)')
          .not('category_id', 'is', null)
      }
    ];

    for (const test of tests) {
      const startTime = Date.now();
      const { data, error } = await test.query();
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      const status = error ? '❌' : '✅';
      const count = data ? data.length : 0;
      
      logger.info(`${status} ${test.name}: ${duration}ms (${count} results)`);
    }
  }

  async runFullPerformanceTest(): Promise<void> {
    logger.info('🚀 Starting Performance Test Suite...');
    logger.info('================================================');
    
    const overallStart = Date.now();
    
    await this.testCategoryQueries();
    logger.info('');
    
    await this.testTransactionQueries();
    logger.info('');
    
    await this.testComplexQueries();
    logger.info('');
    
    const overallEnd = Date.now();
    const totalDuration = overallEnd - overallStart;
    
    logger.info('================================================');
    logger.info(`🎯 Performance test completed in ${totalDuration}ms`);
    logger.info('');
    logger.info('📊 Expected improvements after Step A1:');
    logger.info('   • Category queries: 80-90% faster');
    logger.info('   • Transaction filtering: 80-90% faster');
    logger.info('   • Complex queries: 70-85% faster');
    logger.info('   • Overall API response: 60-80% faster');
  }
}

/**
 * Main execution
 */
async function main() {
  const tester = new PerformanceTester();
  
  try {
    await tester.runFullPerformanceTest();
  } catch (error) {
    logger.error('Performance test failed:', error);
    process.exit(1);
  }
}

// Execute if called directly
if (require.main === module) {
  main();
}

export { PerformanceTester };