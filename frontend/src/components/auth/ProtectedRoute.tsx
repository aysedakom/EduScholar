import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, role, user, isSessionLocked } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Prevent accessing or mounting any protected route/dashboard while session is locked
  if (isSessionLocked) {
    return null;
  }

  // Redirect new student applicants who have not completed basic form to onboarding
  if (
    role === 'student' &&
    user?.hasCompletedBasicForm === false &&
    location.pathname !== '/basic-form'
  ) {
    return <Navigate to="/basic-form" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
