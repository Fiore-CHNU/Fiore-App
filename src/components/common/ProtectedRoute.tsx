import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { STAFF_ROLE_LABELS, type StaffRole } from '../../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: StaffRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    // US-9.1 Scenario 4: redirect unauthenticated visitor to login page
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // NFR-08: Action outside allowed role is denied
    return (
      <div className="min-h-screen bg-[#1E0B1A] text-white flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-[#2B1127] border border-[#522149] rounded-2xl p-8 shadow-2xl">
          <h2 className="font-serif text-2xl text-red-400 mb-2">Доступ обмежено</h2>
          <p className="text-sm text-white/70 mb-6">
            Ваша роль ({STAFF_ROLE_LABELS[user.role]}) не має доступу до цієї функції.
          </p>
          <a
            href="/admin"
            className="px-6 py-2.5 rounded-full bg-[#F5B2E2] hover:bg-[#FDBDE9] text-[#1E0B1A] font-semibold text-sm transition-all"
          >
            Повернутися до адмін-панелі
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
