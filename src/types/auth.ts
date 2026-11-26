export type StaffRole = 'administrator' | 'manager';

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  administrator: 'Адміністратор',
  manager: 'Менеджер',
};

/** Signed-in staff member; the JWT comes from POST /api/v1/auth/login. */
export interface StaffUser {
  id: string;
  email: string;
  fullName: string;
  role: StaffRole;
  token: string;
  expiresAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthContextType {
  user: StaffUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isLocked: boolean;
  lockoutRemainingSeconds: number;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}
