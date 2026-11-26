import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { StaffUser, LoginCredentials } from '../types/auth';
import { AuthContext } from './auth-context';
import { loginStaff } from '../services/authApi';

/** The JWT lives only for this browser tab session; it is cleared on sign-out or expiry. */
const AUTH_STORAGE_KEY = 'fiore_staff_session_v2';
const LEGACY_KEYS = ['fiore_staff_user_v1', 'fiore_staff_attempts_v1', 'fiore_staff_lockout_until_v1'];

const readSession = (): StaffUser | null => {
  try {
    LEGACY_KEYS.forEach(key => localStorage.removeItem(key));
    const saved = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!saved) return null;
    const user = JSON.parse(saved) as StaffUser;
    return new Date(user.expiresAt).getTime() > Date.now() ? user : null;
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<StaffUser | null>(readSession);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(() => {
    setUser(null);
    try {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // storage unavailable
    }
  }, []);

  // Tick once a second while locked out, and sign out when the token expires.
  useEffect(() => {
    if (!lockoutUntil && !user) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [lockoutUntil, user]);

  useEffect(() => {
    if (user && new Date(user.expiresAt).getTime() <= now) logout();
  }, [user, now, logout]);

  const lockoutRemainingSeconds = lockoutUntil ? Math.max(0, Math.ceil((lockoutUntil - now) / 1000)) : 0;

  const clearError = useCallback(() => setError(null), []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await loginStaff(credentials);
      switch (result.kind) {
        case 'success':
          setUser(result.user);
          setLockoutUntil(null);
          try {
            sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(result.user));
          } catch {
            // the session then lasts until reload
          }
          return true;
        case 'locked':
          // US-7.1 scenario 3: the server blocks sign-in for 5 minutes after 5 wrong passwords.
          setLockoutUntil(Date.now() + result.retryAfterSeconds * 1000);
          setNow(Date.now());
          return false;
        case 'invalid':
          // US-7.1 scenario 2: do not reveal which field was wrong.
          setError('Неправильний логін або пароль');
          return false;
        case 'forbidden':
          setError('Цей обліковий запис не має доступу до адмін-панелі.');
          return false;
        default:
          setError('Сервер недоступний. Спробуйте пізніше.');
          return false;
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      error,
      isLocked: lockoutRemainingSeconds > 0,
      lockoutRemainingSeconds,
      login,
      logout,
      clearError,
    }),
    [user, isLoading, error, lockoutRemainingSeconds, login, logout, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
