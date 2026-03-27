import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getApp } from 'firebase/app';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    try {
      const app = getApp();
      const auth = getAuth(app);
      
      console.log('[Auth] Setting up Firebase Auth listener');
      
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        console.log('[Auth] State changed:', firebaseUser ? 'Authenticated' : 'Not authenticated');
        if (firebaseUser) {
          console.log('[Auth] User email:', firebaseUser.email);
        }
        setUser(firebaseUser);
        setIsAuthenticated(!!firebaseUser);
        setAuthInitialized(true);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('[Auth] Firebase Auth initialization error:', error);
      setAuthInitialized(true);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const app = getApp();
      const auth = getAuth(app);
      
      console.log('[Auth] Attempting Firebase login with:', email);
      await signInWithEmailAndPassword(auth, email, password);
      console.log('[Auth] Login successful');
      return true;
    } catch (error: any) {
      console.error('[Auth] Login error:', error.code, error.message);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const app = getApp();
      const auth = getAuth(app);
      await signOut(auth);
      console.log('[Auth] Logout successful');
    } catch (error) {
      console.error('[Auth] Logout error:', error);
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    console.log('[Auth] Check status called - using onAuthStateChanged listener');
  }, []);

  return useMemo(
    () => ({
      isAuthenticated,
      user,
      authInitialized,
      login,
      logout,
      checkAuthStatus,
    }),
    [isAuthenticated, user, authInitialized, login, logout, checkAuthStatus]
  );
});
