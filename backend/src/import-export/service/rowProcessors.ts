import { ImportOptions } from '../types';
import { CategoryRepository } from '../../repositories/CategoryRepository';
import { TransactionRepository } from '../../repositories/TransactionRepository';
import { BudgetRepository } from '../../repositories/BudgetRepository';

function calculateEndDate(startDate: Date, period: string): string {
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

async function findCategoryByNameOrId(
  nameOrId: string,
  categoryRepo: CategoryRepository
): Promise<any | null> {
  try {
    const byId = await categoryRepo.findById(nameOrId);
    if (byId.data) return byId.data;
  } catch {
    // not a valid ID, fall through
  }
  const result = await categoryRepo.findAll();
  const categories = result.data || [];
  return categories.find(cat => cat.name.toLowerCase() === nameOrId.toLowerCase()) || null;
}

export async function processTransactionRow(
  row: any,
  options: ImportOptions,
  categoryRepo: CategoryRepository,
  transactionRepo: TransactionRepository
): Promise<'imported' | 'updated' | 'skipped'> {
  const category = await findCategoryByNameOrId(row.category, categoryRepo);
  if (!category) throw new Error(`Category not found: ${row.category}`);

  const transactionData = {
    type: row.type as 'income' | 'expense',
    amount: row.amount,
    description: row.description,
    category_id: category.id,
    date: row.date
  };

  if (options.skipDuplicates) {
    const existing = await transactionRepo.findDuplicate(transactionData);
    if (existing) return 'skipped';
  }

  await transactionRepo.create(transactionData);
  return 'imported';
}

export async function processCategoryRow(
  row: any,
  options: ImportOptions,
  categoryRepo: CategoryRepository
): Promise<'imported' | 'updated' | 'skipped'> {
  const categoryData = {
    name: row.name,
    type: row.type as 'income' | 'expense',
    color: row.color,
    icon: row.icon,
    description: row.description || null,
    parent_id: null as string | null
  };

  if (row.parent_category) {
    const parent = await findCategoryByNameOrId(row.parent_category, categoryRepo);
    if (parent) categoryData.parent_id = parent.id;
  }

  const existingResult = await categoryRepo.findByNameAndType(categoryData.name, categoryData.type);
  if (existingResult.data) {
    if (options.updateExisting) {
      const result = await categoryRepo.update(existingResult.data.id, categoryData);
      if (result.error) throw new Error(result.error);
      return 'updated';
    } else if (options.skipDuplicates) {
      return 'skipped';
    }
  }

  const result = await categoryRepo.create(categoryData);
  if (result.error) throw new Error(result.error);
  return 'imported';
}

export async function processBudgetRow(
  row: any,
  options: ImportOptions,
  categoryRepo: CategoryRepository,
  budgetRepo: BudgetRepository
): Promise<'imported' | 'updated' | 'skipped'> {
  const category = await findCategoryByNameOrId(row.category, categoryRepo);
  if (!category) throw new Error(`Category not found: ${row.category}`);

  const budgetData = {
    category_id: category.id,
    budget_amount: row.amount,
    period: row.period as 'weekly' | 'monthly' | 'yearly',
    start_date: row.start_date,
    end_date: row.end_date || calculateEndDate(new Date(row.start_date), row.period)
  };

  const overlapping = await budgetRepo.findOverlapping(
    category.id,
    budgetData.start_date,
    budgetData.end_date
  );

  if (overlapping) {
    if (options.updateExisting) {
      const result = await budgetRepo.update(overlapping.id, budgetData);
      if (result.error) throw new Error(result.error);
      return 'updated';
    } else if (options.skipDuplicates) {
      return 'skipped';
    }
  }

  const result = await budgetRepo.create(budgetData);
  if (result.error) throw new Error(result.error);
  return 'imported';
}
