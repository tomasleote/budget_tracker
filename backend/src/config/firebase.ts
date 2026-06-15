/**
 * Firebase Admin SDK initialization.
 * Credentials resolve from GOOGLE_APPLICATION_CREDENTIALS (a service-account
 * JSON path) or from inline FIREBASE_PROJECT_ID / _CLIENT_EMAIL / _PRIVATE_KEY.
 * Exposes the verified-token Auth instance and the Firestore handle.
 */
import {
  initializeApp,
  getApps,
  getApp,
  cert,
  applicationDefault,
  type App,
} from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function resolveApp(): App {
  if (getApps().length) return getApp();

  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

  if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
    return initializeApp({
      credential: cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        // Env vars store newlines as the literal "\n"; restore them for the PEM key.
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  }

  // Falls back to GOOGLE_APPLICATION_CREDENTIALS (path to a service-account JSON).
  return initializeApp({ credential: applicationDefault() });
}

const app = resolveApp();
const adminAuth = getAuth(app);
const firestore = getFirestore(app);

export { app, adminAuth, firestore };
