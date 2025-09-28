"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Loading } from "@/components/ui/loading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Import dashboard components
import { AdminManagement } from "@/components/admin/admin-management";
import { ProviderManagement } from "@/components/provider/provider-management";
import CustomerDashboard from "@/components/customer/customer-dashboard";

export function RoleBasedDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!isLoading && !user) {
      router.push("/auth/login");
      return;
    }

    // If user exists but no role, show error
    if (user && !user.role) {
      console.error("User has no role assigned");
      return;
    }
  }, [user, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading />
      </div>
    );
  }

  // Show error if no user after loading
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Authentication required. Redirecting to login...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show error if user has no role
  if (!user.role) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your account does not have a role assigned. Please contact support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Render appropriate dashboard based on user role
  switch (user.role) {
    case "customer":
      return <CustomerDashboard />;

    case "print_provider":
      return <ProviderManagement />;

    case "admin":
      return <AdminManagement />;

    case "merchant":
      // For now, merchants use the customer dashboard
      // This can be expanded later with merchant-specific features
      return <CustomerDashboard />;

    default:
      return (
        <div className="flex min-h-screen items-center justify-center p-6">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unknown user role: {user.role}. Please contact support.
            </AlertDescription>
          </Alert>
        </div>
      );
  }
}
