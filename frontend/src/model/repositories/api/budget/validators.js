/**
 * Pure business-rule validation for budget entities.
 * No I/O — takes plain objects, returns { isValid, errors, warnings }.
 *
 * @param {Object} budget - Budget data being validated
 * @param {Object} context - { existingBudgets?: Array }
 * @returns {{ isValid: boolean, errors: string[], warnings: string[] }}
 */
export function validateBudgetBusinessRules(budget, context = {}) {
  const errors = [];
  const warnings = [];

  if (context.existingBudgets) {
    const overlapping = context.existingBudgets.filter(b =>
      b.categoryId === budget.categoryId &&
      b.period === budget.period &&
      b.isActive &&
      b.id !== budget.id
    );

    if (overlapping.length > 0) {
      errors.push('An active budget already exists for this category and period');
    }
  }

  if (!budget.id && budget.startDate) {
    const startDate = new Date(budget.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      warnings.push('Budget start date is in the past');
    }
  }

  if (budget.amount) {
    if (budget.amount < 10) {
      warnings.push('Budget amount seems very low');
    } else if (budget.amount > 100000) {
      warnings.push('Budget amount seems very high');
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
}
