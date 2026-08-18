import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const RoleGuard = ({ allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());
  const userRole = user.role.toUpperCase();

  if (!normalizedAllowed.includes(userRole)) {
    if (userRole === 'MANAGER') return <Navigate to="/manager" replace />;
    return <Navigate to="/menu" replace />;
  }

  return <Outlet />;
};
