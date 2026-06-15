/**
 * Public Analytics repository entry point.
 * Backed by Firestore; named export is the class, default is the singleton.
 */
export { AnalyticsFirestoreRepository as AnalyticsRepository } from './firestore/AnalyticsFirestoreRepository';
export { default } from './firestore/AnalyticsFirestoreRepository';
