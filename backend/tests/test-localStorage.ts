/**
 * Test script to verify localStorage implementation
 */

import dotenv from 'dotenv';
dotenv.config();

// Force localStorage mode for testing
process.env.STORAGE_MODE = 'localStorage';

import { getCategoryRepository, getTransactionRepository } from '../src/repositories/RepositoryFactory';
import { logger } from '../src/config/logger';

async function testLocalStorage() {
  console.log('\n🧪 Testing localStorage Implementation\n');
  console.log('=====================================\n');

  const categoryRepo = getCategoryRepository();
  const transactionRepo = getTransactionRepository();

  try {
    // Test 1: Create a category
    console.log('📝 Test 1: Creating a test category...');
    const createResult = await categoryRepo.create({
      name: 'Test Category',
      type: 'expense',
      color: '#FF0000',
      icon: 'test',
      is_default: false,
      is_active: true,
      parent_id: null
    });
    
    if (createResult.error) {
      throw new Error(`Failed to create category: ${createResult.error}`);
    }
    console.log('✅ Category created:', createResult.data?.id);

    // Test 2: Find all categories
    console.log('\n📝 Test 2: Finding all categories...');
    const allResult = await categoryRepo.findAll();
    if (allResult.error) {
      throw new Error(`Failed to find categories: ${allResult.error}`);
    }
    console.log(`✅ Found ${allResult.data?.length || 0} categories`);

    // Test 3: Find category by ID
    console.log('\n📝 Test 3: Finding category by ID...');
    const findResult = await categoryRepo.findById(createResult.data!.id);
    if (findResult.error) {
      throw new Error(`Failed to find category: ${findResult.error}`);
    }
    console.log('✅ Found category:', findResult.data?.name);

    // Test 4: Update category
    console.log('\n📝 Test 4: Updating category...');
    const updateResult = await categoryRepo.update(createResult.data!.id, {
      name: 'Updated Test Category'
    });
    if (updateResult.error) {
      throw new Error(`Failed to update category: ${updateResult.error}`);
    }
    console.log('✅ Category updated:', updateResult.data?.name);

    // Test 5: Create a transaction
    console.log('\n📝 Test 5: Creating a test transaction...');
    const transactionResult = await transactionRepo.create({
      type: 'expense',
      amount: 100.50,
      description: 'Test Transaction',
      date: new Date().toISOString(),
      category_id: createResult.data!.id,
      notes: 'This is a test transaction'
    });
    if (transactionResult.error) {
      throw new Error(`Failed to create transaction: ${transactionResult.error}`);
    }
    console.log('✅ Transaction created:', transactionResult.data?.id);

    // Test 6: Find transactions
    console.log('\n📝 Test 6: Finding all transactions...');
    const transactionsResult = await transactionRepo.findAll();
    if (transactionsResult.error) {
      throw new Error(`Failed to find transactions: ${transactionsResult.error}`);
    }
    console.log(`✅ Found ${transactionsResult.data?.length || 0} transactions`);

    // Test 7: Delete transaction
    console.log('\n📝 Test 7: Deleting transaction...');
    const deleteTransResult = await transactionRepo.delete(transactionResult.data!.id);
    if (deleteTransResult.error) {
      throw new Error(`Failed to delete transaction: ${deleteTransResult.error}`);
    }
    console.log('✅ Transaction deleted');

    // Test 8: Delete category
    console.log('\n📝 Test 8: Deleting category...');
    const deleteResult = await categoryRepo.delete(createResult.data!.id);
    if (deleteResult.error) {
      throw new Error(`Failed to delete category: ${deleteResult.error}`);
    }
    console.log('✅ Category deleted');

    // Summary
    console.log('\n=====================================');
    console.log('✨ All localStorage tests passed! ✨');
    console.log('=====================================\n');
    console.log('📁 Data is stored in:', process.env.LOCALSTORAGE_PATH || './data');
    console.log('💾 Persistence enabled:', process.env.LOCALSTORAGE_PERSIST !== 'false');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests
testLocalStorage().catch(console.error);
