import React, { useState, useEffect, useCallback } from 'react';
import type { StaffUser, LoginCredentials } from '../types/auth';
import { AuthContext } from './auth-context';
import { loginStaff } from '../services/authApi';

const AUTH_STORAGE_KEY = 'fiore_staff_user_v1';
const ATTEMPTS_KEY = 'fiore_staff_attempts_v1';
const LOCKOUT_KEY = 'fiore_staff_lockout_until_v1';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes (US-7.1 Scenario 3)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<StaffUser | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0', 10);
    } catch {
      return 0;
    }
  });

  const [lockoutUntil, setLockoutUntil] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem(LOCKOUT_KEY);
      if (saved) {
        const val = parseInt(saved, 10);
        if (val > Date.now()) return val;
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [lockoutRemainingSeconds, setLockoutRemainingSeconds] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Countdown timer for lockout
  useEffect(() => {
    if (!lockoutUntil) {
      setLockoutRemainingSeconds(0);
      return;
    }

    const checkLockout = () => {
      const remainingMs = lockoutUntil - Date.now();
      if (remainingMs <= 0) {
        setLockoutUntil(null);
        setLockoutRemainingSeconds(0);
        setFailedAttempts(0);
        localStorage.removeItem(LOCKOUT_KEY);
        localStorage.removeItem(ATTEMPTS_KEY);
      } else {
        setLockoutRemainingSeconds(Math.ceil(remainingMs / 1000));
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const clearError = useCallback(() => setError(null), []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    // Check if account is locked (US-7.1 Scenario 3)
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remainingMins = Math.ceil((lockoutUntil - Date.now()) / 60000);
      setError(`Вхід заблоковано через перевищення ліміту спроб. Зачекайте ${remainingMins} хв.`);
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await loginStaff(credentials);

      if (result.user) {
        // Successful login (US-7.1 Scenario 1)
        setUser(result.user);
        setFailedAttempts(0);
        setLockoutUntil(null);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(result.user));
        localStorage.removeItem(ATTEMPTS_KEY);
        localStorage.removeItem(LOCKOUT_KEY);
        return true;
      }

      // Failed login (US-7.1 Scenario 2 & 3)
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      localStorage.setItem(ATTEMPTS_KEY, newAttempts.toString());

      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        const lockTime = Date.now() + LOCKOUT_DURATION_MS;
        setLockoutUntil(lockTime);
        localStorage.setItem(LOCKOUT_KEY, lockTime.toString());
        setError('Забагато невдалих спроб. Вхід заблоковано на 5 хвилин.');
      } else {
        // Generic error message without revealing if username or password was wrong
        setError(result.error || 'Неправильний логін або пароль');
      }
      return false;
    } catch {
      setError('Помилка авторизації. Спробуйте пізніше.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    // US-7.1 Scenario 4: Sign out and clear session
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        isLocked: lockoutRemainingSeconds > 0,
        lockoutRemainingSeconds,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
