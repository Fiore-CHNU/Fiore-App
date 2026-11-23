export type StaffRole = 'admin' | 'manager';

export interface StaffUser {
  id: string;
  username: string;
  fullName: string;
  role: StaffRole;
  email: string;
  token: string;
}

export interface LoginCredentials {
  username: string;
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
