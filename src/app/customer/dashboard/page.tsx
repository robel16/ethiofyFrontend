"use client";

import { useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { CustomerDashboard } from "@/components/customer/customer-dashboard";

export default function CustomerDashboardPage() {
  return (
    <ProtectedRoute requiredRole="customer">
      <CustomerDashboard />
    </ProtectedRoute>
  );
}
