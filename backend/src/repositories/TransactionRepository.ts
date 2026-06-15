/**
 * Public Transaction repository entry point.
 * Backed by Firestore; named export is the class (for `new`-based consumers),
 * default export is the shared singleton instance.
 */
export { TransactionFirestoreRepository as TransactionRepository } from './firestore/TransactionFirestoreRepository';
export { default } from './firestore/TransactionFirestoreRepository';
