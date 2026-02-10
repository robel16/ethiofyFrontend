"use client";

import { AdminShell } from "@/components/admin/admin-shell";
import { ProvidersList } from "@/components/admin/providers-list";

// Mock user data - replace with real auth
const mockUser = {
  name: "Admin User",
  email: "admin@ethiofy.com",
  role: "Super Admin",
};

export default function ProvidersPage() {
  return (
    <AdminShell currentPath="/dashboard/providers" user={mockUser}>
      <ProvidersList />
    </AdminShell>
  );
}
