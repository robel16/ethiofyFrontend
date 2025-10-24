"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { RoleGuard } from "@/components/auth/role-guard";
import {
  LayoutDashboard,
  ShoppingBag,
  Palette,
  ShoppingCart,
  Users,
  Settings,
  BarChart3,
  Package,
  Truck,
  CreditCard,
  User,
} from "lucide-react";
import { NavUser } from "./nav-user";
import { sidebarData } from "./data/sidebar-data";

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/products",
    icon: ShoppingBag,
  },
  {
    title: "Design Studio",
    href: "/design-studio",
    icon: Palette,
  },
  {
    title: "Orders",
    href: "/orders",
    icon: ShoppingCart,
  },
  {
    title: "Merchant Panel",
    href: "/merchant",
    icon: Package,
    roles: ["merchant", "admin"],
  },
  {
    title: "Provider Panel",
    href: "/provider",
    icon: Truck,
    roles: ["provider", "admin"],
  },
  {
    title: "User Management",
    href: "/admin/users",
    icon: Users,
    roles: ["admin"],
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    roles: ["admin"],
  },
  {
    title: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
    roles: ["admin"],
  },
  {
    title: "Account",
    href: "/account",
    icon: User,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className={cn("w-64 pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Navigation
          </h2>
          <div className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;

              if (item.roles) {
                return (
                  <RoleGuard key={item.href} requiredRoles={item.roles}>
                    <SidebarLink item={item} isActive={isActive} />
                  </RoleGuard>
                );
              }

              return (
                <SidebarLink key={item.href} item={item} isActive={isActive} />
              );
            })}
          </div>
        </div>
      </div>
      <div>
        <NavUser user={sidebarData.user} />
      </div>
    </div>
  );
}

interface SidebarLinkProps {
  item: SidebarItem;
  isActive: boolean;
}

function SidebarLink({ item, isActive }: SidebarLinkProps) {
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
        isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
      )}
    >
      <item.icon className="mr-2 h-4 w-4" />
      {item.title}
    </Link>
  );
}
