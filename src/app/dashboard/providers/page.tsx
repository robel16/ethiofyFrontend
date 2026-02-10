"use client";

import { useAuth } from "@/contexts/auth-context";
import { AdminShell } from "@/components/admin/admin-shell";
import { ProvidersList } from "@/components/admin/providers-list";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function ProvidersPage() {
  const { user } = useAuth();

  // Create user object for AdminShell using real auth data
  const adminUser = {
    name:
      user?.name ||
      `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
      user?.email?.split("@")[0] ||
      "Admin",
    email: user?.email || "admin@ethiofy.com",
    role: user?.role === "admin" ? "Super Admin" : "Administrator",
    avatar: user?.avatar_url,
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminShell currentPath="/dashboard/providers" user={adminUser}>
        <ProvidersList />
      </AdminShell>
    </ProtectedRoute>
  );
}
