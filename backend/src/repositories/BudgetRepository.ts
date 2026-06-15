/**
 * Public Budget repository entry point.
 * Backed by Firestore; named export is the class (for `new`-based consumers),
 * default export is the shared singleton instance.
 */
export { BudgetFirestoreRepository as BudgetRepository } from './firestore/BudgetFirestoreRepository';
export { default } from './firestore/BudgetFirestoreRepository';
