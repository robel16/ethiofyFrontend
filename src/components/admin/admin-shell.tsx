"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Truck,
  DollarSign,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  Building2,
  FileText,
  Calculator,
  Zap,
  MessageSquare,
  Shield,
  BarChart3,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import toast from "react-hot-toast";

interface AdminShellProps {
  children: React.ReactNode;
  currentPath?: string;
  user?: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
}

const navigationItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard/providers",
    badge: null,
  },
  {
    title: "Providers",
    icon: Building2,
    href: "/admin/providers",
    badge: "12",
  },
  {
    title: "Products",
    icon: Package,
    href: "/admin/products",
    badge: null,
  },
  {
    title: "Orders",
    icon: ShoppingCart,
    href: "/admin/orders",
    badge: "5",
  },
  {
    title: "Shipping",
    icon: Truck,
    href: "/admin/shipping",
    badge: null,
  },
  {
    title: "Pricing & Fees",
    icon: DollarSign,
    href: "/admin/pricing",
    badge: null,
  },
  {
    title: "Tax & VAT",
    icon: Calculator,
    href: "/admin/taxes",
    badge: null,
  },
  {
    title: "Billing & Payouts",
    icon: FileText,
    href: "/admin/billing",
    badge: null,
  },
  {
    title: "Rules Engine",
    icon: Zap,
    href: "/admin/rules",
    badge: null,
  },
  {
    title: "Notifications",
    icon: Bell,
    href: "/admin/notifications",
    badge: null,
  },
  {
    title: "Analytics",
    icon: BarChart3,
    href: "/admin/analytics",
    badge: null,
  },
  {
    title: "Support",
    icon: MessageSquare,
    href: "/admin/support",
    badge: "3",
  },
  {
    title: "Integrations",
    icon: Globe,
    href: "/admin/integrations",
    badge: null,
  },
  {
    title: "Security & Logs",
    icon: Shield,
    href: "/admin/security",
    badge: null,
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/admin/settings",
    badge: null,
  },
];

export function AdminShell({
  children,
  currentPath = "/admin",
  user,
}: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { logout } = useAuth();

  const currentItem = navigationItems.find((item) =>
    currentPath.startsWith(item.href)
  );
  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch (error: any) {
      toast.error("Failed to logout");
    }
  };
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div
        className={cn(
          "flex flex-col border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-700 dark:bg-gray-800",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
          {sidebarOpen && (
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                <span className="text-sm font-bold text-white">E</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                Ethiofy Admin
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2"
          >
            {sidebarOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Environment Badge */}
        {sidebarOpen && (
          <div className="px-4 py-2">
            <Badge
              variant="outline"
              className="border-green-200 bg-green-50 text-green-700"
            >
              Production
            </Badge>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-2">
            {navigationItems.map((item) => {
              const isActive = currentPath.startsWith(item.href);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
                      : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                  )}
                >
                  <item.icon
                    className={cn("h-5 w-5", sidebarOpen ? "mr-3" : "mx-auto")}
                  />
                  {sidebarOpen && (
                    <>
                      <span className="flex-1">{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </a>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            {/* Breadcrumbs & Search */}
            <div className="flex flex-1 items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Admin</span>
                {currentItem && (
                  <>
                    <span>/</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {currentItem.title}
                    </span>
                  </>
                )}
              </div>

              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search anything..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-80 pl-10 pr-4"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 transform rounded bg-gray-100 px-2 py-1 text-xs text-gray-500 dark:bg-gray-700">
                  ⌘K
                </kbd>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Quick Actions */}
              <Button variant="outline" size="sm">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
                <Badge variant="destructive" className="ml-2 text-xs">
                  3
                </Badge>
              </Button>

              {/* Store Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Building2 className="mr-2 h-4 w-4" />
                    All Stores
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>All Stores</DropdownMenuItem>
                  <DropdownMenuItem>Ethiofy Main</DropdownMenuItem>
                  <DropdownMenuItem>Partner Store A</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Manage Stores</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500">
                      <span className="text-sm font-medium text-white">
                        {user?.name?.charAt(0) || "A"}
                      </span>
                    </div>
                    {user && (
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {user.role}
                        </div>
                      </div>
                    )}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                  <DropdownMenuItem>Impersonate User</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}
