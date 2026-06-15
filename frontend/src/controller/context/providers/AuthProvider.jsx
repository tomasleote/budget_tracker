import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '../../../config/firebase.js';
import { getAppMode, setAppMode, clearAppMode } from '../../appMode.js';
import { loadDemoData, clearDemoData } from '../../../model/services/DemoDataLoader.js';
import { AuthContext } from '../AuthContext.jsx';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Single source of mode/user sync. On refresh this hydrates the user and
  // restores 'authed'. Demo mode has no Firebase user, so a null event never
  // clears it — only the authed path writes the mode here.
  useEffect(() => {
    // No Firebase config: demo mode still works, so resolve loading immediately.
    if (!auth) {
      setLoading(false);
      return undefined;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setAppMode('authed');
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = useCallback(async (email, password) => {
    if (!auth) throw new Error('Authentication is not configured. Set REACT_APP_FIREBASE_* in frontend/.env.');
    const { user: signedIn } = await signInWithEmailAndPassword(auth, email, password);
    setAppMode('authed');
    return signedIn;
  }, []);

  const register = useCallback(async (email, password) => {
    if (!auth) throw new Error('Authentication is not configured. Set REACT_APP_FIREBASE_* in frontend/.env.');
    const { user: created } = await createUserWithEmailAndPassword(auth, email, password);
    setAppMode('authed');
    return created;
  }, []);

  const logout = useCallback(async () => {
    if (getAppMode() === 'authed') {
      await signOut(auth);
    }
    clearAppMode();
  }, []);

  const enterDemo = useCallback(async () => {
    setAppMode('demo');
    await loadDemoData();
  }, []);

  const exitDemo = useCallback(() => {
    clearDemoData();
    clearAppMode();
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, enterDemo, exitDemo }),
    [user, loading, login, register, logout, enterDemo, exitDemo]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
