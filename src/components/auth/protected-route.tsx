"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredRoles?: string[];
  fallbackUrl?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredRoles,
  fallbackUrl = "/auth/login",
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated, hasRole, hasAnyRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Redirect to login if not authenticated
      if (!isAuthenticated) {
        router.push(fallbackUrl);
        return;
      }

      // Check role-based access
      if (requiredRole && !hasRole(requiredRole)) {
        router.push("/dashboard");
        return;
      }

      if (requiredRoles && !hasAnyRole(requiredRoles)) {
        router.push("/dashboard");
        return;
      }
    }
  }, [
    isLoading,
    isAuthenticated,
    user,
    requiredRole,
    requiredRoles,
    hasRole,
    hasAnyRole,
    router,
    fallbackUrl,
  ]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated or doesn't have required role
  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return null;
  }

  if (requiredRoles && !hasAnyRole(requiredRoles)) {
    return null;
  }

  return <>{children}</>;
}
