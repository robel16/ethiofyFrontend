import { ProtectedRoute } from "@/components/auth/protected-route";
import { RoleBasedDashboard } from "@/components/dashboard/role-based-dashboard";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <RoleBasedDashboard />
    </ProtectedRoute>
  );
}
