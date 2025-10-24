"use client";

import { useAuth } from "@/contexts/auth-context";
import { AdminShell } from "./admin-shell";
import { AdminDashboard } from "./admin-dashboard";
export function AdminManagement() {
  console.log("🚀 AdminManagement component is rendering!");

  const { user, isLoading, isAuthenticated } = useAuth();
  console.log("AdminManagement - user:", user);
  console.log("AdminManagement - isLoading:", isLoading);
  console.log("AdminManagement - isAuthenticated:", isAuthenticated);

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

  console.log("📋 AdminUser object created:", adminUser);

  return (
    <AdminShell currentPath="/admin" user={adminUser}>
      <AdminDashboard />
    </AdminShell>
  );
}
