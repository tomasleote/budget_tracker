/**
 * Firebase client SDK initialization.
 * Exposes the initialized app and the Auth instance for the frontend.
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Firebase only powers login/register. Demo mode is fully offline and must boot
// without any config, so initialization is guarded: when the REACT_APP_FIREBASE_*
// vars are absent, `auth` is null and the auth-backed paths report a clear error
// instead of the SDK throwing auth/invalid-api-key at import and crashing the app.
const hasConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

const app = hasConfig ? (getApps().length ? getApp() : initializeApp(firebaseConfig)) : null;
const auth = app ? getAuth(app) : null;

if (!hasConfig && process.env.NODE_ENV !== 'test') {
  console.warn(
    'Firebase config missing (set REACT_APP_FIREBASE_* in frontend/.env). ' +
    'Login and registration are disabled; demo mode still works.'
  );
}

export { app, auth };
