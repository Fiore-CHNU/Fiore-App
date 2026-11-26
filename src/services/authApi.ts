import { ApiError, apiRequest } from './http';
import type { LoginCredentials, StaffRole, StaffUser } from '../types/auth';

interface AuthResponse {
  userId: string;
  email: string;
  roles: string[];
  accessToken: string;
  expiresAt: string;
}

export type LoginResult =
  | { kind: 'success'; user: StaffUser }
  | { kind: 'invalid' }
  | { kind: 'locked'; retryAfterSeconds: number }
  | { kind: 'forbidden' }
  | { kind: 'error' };

const pickStaffRole = (roles: string[]): StaffRole | null =>
  roles.includes('administrator') ? 'administrator' : roles.includes('manager') ? 'manager' : null;

/**
 * Staff sign-in against the backend (US-7.1). The server counts failed attempts and locks the
 * account for 5 minutes after 5 wrong passwords, answering 423 with `retryAfterSeconds`.
 */
export async function loginStaff(credentials: LoginCredentials): Promise<LoginResult> {
  try {
    const response = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email: credentials.email.trim(), password: credentials.password },
    });
    const role = pickStaffRole(response.roles);
    if (!role) return { kind: 'forbidden' };
    return {
      kind: 'success',
      user: {
        id: response.userId,
        email: response.email,
        fullName: response.email,
        role,
        token: response.accessToken,
        expiresAt: response.expiresAt,
      },
    };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401 || error.status === 400) return { kind: 'invalid' };
      if (error.status === 423) {
        const seconds = (error.body as { retryAfterSeconds?: number } | undefined)?.retryAfterSeconds;
        return { kind: 'locked', retryAfterSeconds: typeof seconds === 'number' ? seconds : 300 };
      }
    }
    return { kind: 'error' };
  }
}
