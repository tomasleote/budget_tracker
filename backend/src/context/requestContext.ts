/**
 * Per-request authentication context.
 * The auth middleware stores the verified uid here so repositories can scope
 * Firestore reads/writes without threading the uid through every signature.
 */
import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  uid: string;
  email?: string;
}

const storage = new AsyncLocalStorage<RequestContext>();

/** Run `fn` (and everything it awaits) with the given auth context attached. */
export function runWithContext<T>(context: RequestContext, fn: () => T): T {
  return storage.run(context, fn);
}

/** The authenticated uid for the current request. Throws if called unauthenticated. */
export function getUid(): string {
  const ctx = storage.getStore();
  if (!ctx?.uid) {
    throw new Error('getUid() called outside an authenticated request context');
  }
  return ctx.uid;
}

export function getContext(): RequestContext | undefined {
  return storage.getStore();
}
