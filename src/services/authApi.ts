import type { LoginCredentials, StaffUser } from '../types/auth';

const API_BASE_URL = 'http://localhost:5090/api/v1';

// Seed staff accounts for testing & fallback matching backend DB design
const MOCK_STAFF_USERS: Record<string, { passwordHash: string; user: StaffUser }> = {
  admin: {
    passwordHash: 'admin123',
    user: {
      id: 'staff-admin-001',
      username: 'admin',
      fullName: 'Олександр Мельник',
      role: 'admin',
      email: 'admin@fiore.ua',
      token: 'jwt-staff-token-admin-123456789',
    },
  },
  manager: {
    passwordHash: 'manager123',
    user: {
      id: 'staff-manager-001',
      username: 'manager',
      fullName: 'Ірина Коваль',
      role: 'manager',
      email: 'manager@fiore.ua',
      token: 'jwt-staff-token-manager-987654321',
    },
  },
};

export async function loginStaff(credentials: LoginCredentials): Promise<{ user?: StaffUser; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${API_BASE_URL}/auth/staff/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return { user: data.user || data };
    }
  } catch {
    // API is offline or not reachable - fall back to mock accounts
  }

  // Fallback mock authentication
  const found = MOCK_STAFF_USERS[credentials.username.trim().toLowerCase()];
  if (found && found.passwordHash === credentials.password) {
    return { user: found.user };
  }

  // Per US-7.1 Scenario 2: «Неправильний логін або пароль» without revealing which field was incorrect
  return { error: 'Неправильний логін або пароль' };
}
