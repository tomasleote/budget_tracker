import { parseDate, calculateEndDate } from './dateHelpers';

export function checkCategoryExists(categoryNameOrId: string, existingCategories: Map<string, any>): boolean {
  if (existingCategories.has(categoryNameOrId)) return true;
  return Array.from(existingCategories.values()).some(
    cat => cat.name.toLowerCase() === categoryNameOrId.toLowerCase()
  );
}

export function findCategory(categoryNameOrId: string, existingCategories: Map<string, any>): any | null {
  if (existingCategories.has(categoryNameOrId)) return existingCategories.get(categoryNameOrId);
  return Array.from(existingCategories.values()).find(
    cat => cat.name.toLowerCase() === categoryNameOrId.toLowerCase()
  ) || null;
}

export function checkBudgetOverlap(
  budgetRow: any,
  existingBudgets: any[],
  existingCategories: Map<string, any>
): boolean {
  const category = findCategory(budgetRow.category, existingCategories);
  if (!category) return false;

  const startDate = parseDate(budgetRow.start_date);
  if (!startDate) return false;
  const endDate = budgetRow.end_date
    ? parseDate(budgetRow.end_date)
    : calculateEndDate(startDate, budgetRow.period);
  if (!endDate) return false;

  return existingBudgets.some(budget => {
    if (budget.category_id !== category.id) return false;
    const existingStart = new Date(budget.start_date);
    const existingEnd = new Date(budget.end_date);
    return startDate <= existingEnd && endDate >= existingStart;
  });
}
