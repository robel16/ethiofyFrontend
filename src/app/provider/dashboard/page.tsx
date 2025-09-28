"use client";

import { useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ProviderManagement } from "@/components/provider/provider-management";
import { Loading } from "@/components/ui/loading";

export default function ProviderDashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute requiredRole="print_provider">
      <ProviderManagement />
    </ProtectedRoute>
  );
}
