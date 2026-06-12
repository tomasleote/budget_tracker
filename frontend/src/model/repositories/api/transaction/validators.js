/**
 * Pure business-rule validation for transaction entities.
 * No I/O — takes plain objects, returns { isValid, errors, warnings }.
 *
 * @param {Object} transaction - Transaction data being validated
 * @param {Object} context - { existingTransactions?: Array, categoryType?: string }
 * @returns {{ isValid: boolean, errors: string[], warnings: string[] }}
 */
export function validateTransactionBusinessRules(transaction, context = {}) {
  const errors = [];
  const warnings = [];

  if (context.existingTransactions) {
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const duplicates = context.existingTransactions.filter(t =>
      t.amount === transaction.amount &&
      t.description === transaction.description &&
      t.categoryId === transaction.categoryId &&
      Math.abs(new Date(t.date) - new Date(transaction.date)) < ONE_DAY_MS
    );

    if (duplicates.length > 0) {
      warnings.push('Possible duplicate transaction detected');
    }
  }

  if (transaction.type && context.categoryType && transaction.type !== context.categoryType) {
    errors.push(`${transaction.type} transaction must use ${transaction.type} category`);
  }

  return { isValid: errors.length === 0, errors, warnings };
}
