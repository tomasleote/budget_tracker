/**
 * Public Category repository entry point.
 * Backed by Firestore; named export is the class (for `new`-based consumers),
 * default export is the shared singleton instance.
 */
export { CategoryFirestoreRepository as CategoryRepository } from './firestore/CategoryFirestoreRepository';
export { default } from './firestore/CategoryFirestoreRepository';
