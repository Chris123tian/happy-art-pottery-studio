import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEY = 'happy_art_auth_token';
const ENCRYPTED_ADMIN_DATA = 'aGFwcHlhcnRAZ21haWwuY29tfEhhcHB5SWRlYWxs';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const decoded = atob(ENCRYPTED_ADMIN_DATA);
      const [adminEmail, adminPassword] = decoded.split('|');
      
      if (email === adminEmail && password === adminPassword) {
        setIsAuthenticated(true);
        await AsyncStorage.setItem(AUTH_KEY, 'authenticated');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    setIsAuthenticated(false);
    await AsyncStorage.removeItem(AUTH_KEY);
  }, []);

  const checkAuthStatus = useCallback(async () => {
    const authToken = await AsyncStorage.getItem(AUTH_KEY);
    if (authToken === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

  return useMemo(
    () => ({
      isAuthenticated,
      login,
      logout,
      checkAuthStatus,
    }),
    [isAuthenticated, login, logout, checkAuthStatus]
  );
});
