"use client";

import { useAuth } from "@/hooks/use-auth";

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredRoles?: string[];
  fallback?: React.ReactNode;
}

export function RoleGuard({
  children,
  requiredRole,
  requiredRoles,
  fallback = null,
}: RoleGuardProps) {
  const { hasRole, hasAnyRole, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  // Check single role
  if (requiredRole && !hasRole(requiredRole)) {
    return <>{fallback}</>;
  }

  // Check multiple roles
  if (requiredRoles && !hasAnyRole(requiredRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
