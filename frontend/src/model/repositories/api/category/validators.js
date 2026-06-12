/**
 * Pure business-rule validation for category entities.
 * The hasTransactions check (async, requires repo access) stays in the repository method.
 *
 * @param {Object} category - Category data being validated
 * @param {Object} context - { existingCategories?: Array }
 * @returns {{ errors: string[], warnings: string[] }}
 */
export function validateCategoryBusinessRules(category, context = {}) {
  const errors = [];
  const warnings = [];

  if (context.existingCategories) {
    const duplicates = context.existingCategories.filter(c =>
      c.name.toLowerCase() === category.name.toLowerCase() &&
      c.type === category.type &&
      c.id !== category.id
    );

    if (duplicates.length > 0) {
      errors.push(`A ${category.type} category with this name already exists`);
    }
  }

  return { errors, warnings };
}
