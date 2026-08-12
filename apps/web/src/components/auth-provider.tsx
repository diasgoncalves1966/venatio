'use client';

import type { AuthResponse, AuthUser } from '@venatio/shared';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api } from '@/lib/api';
import {
  clearSession,
  getStoredToken,
  getStoredUser,
  persistSessionUser,
  storeSession,
} from '@/lib/auth-storage';

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  ready: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (input: {
    email: string;
    password: string;
    displayName: string;
    city?: string;
    country?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
  updateProfile: (input: {
    displayName?: string;
    bio?: string;
    city?: string;
    country?: string;
  }) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();

    if (!storedToken) {
      setReady(true);
      return;
    }

    setToken(storedToken);
    setUser(storedUser);

    api
      .me(storedToken)
      .then((me) => {
        setUser(me);
        persistSessionUser(storedToken, me);
      })
      .catch(() => {
        clearSession();
        setToken(null);
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  const login = useCallback(async (email: string, password: string, remember = true) => {
    const response: AuthResponse = await api.login({ email, password });
    storeSession(response.accessToken, response.user, remember);
    setToken(response.accessToken);
    setUser(response.user);
  }, []);

  const register = useCallback(
    async (input: {
      email: string;
      password: string;
      displayName: string;
      city?: string;
      country?: string;
    }) => {
      const response = await api.register(input);
      storeSession(response.accessToken, response.user, true);
      setToken(response.accessToken);
      setUser(response.user);
    },
    [],
  );

  const logout = useCallback(() => {
    clearSession();
    setToken(null);
    setUser(null);
  }, []);

  const refreshMe = useCallback(async () => {
    if (!token) return;
    const me = await api.me(token);
    setUser(me);
    persistSessionUser(token, me);
  }, [token]);

  const updateProfile = useCallback(
    async (input: {
      displayName?: string;
      bio?: string;
      city?: string;
      country?: string;
    }) => {
      if (!token) {
        throw new Error('Not authenticated');
      }
      const me = await api.updateProfile(token, input);
      setUser(me);
      persistSessionUser(token, me);
    },
    [token],
  );

  const value = useMemo(
    () => ({ user, token, ready, login, register, logout, refreshMe, updateProfile }),
    [user, token, ready, login, register, logout, refreshMe, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
