"use client";

import { useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AdminManagement } from "@/components/admin/admin-management";

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminManagement />
    </ProtectedRoute>
  );
}
