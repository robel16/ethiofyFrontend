"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Users,
  Building,
  ShoppingCart,
  Settings,
  FileText,
  Shield,
  TrendingUp,
} from "lucide-react";
import { AdminDashboard } from "./admin-dashboard";
import { UserManagement } from "./user-management";

type AdminTab =
  | "dashboard"
  | "users"
  | "providers"
  | "orders"
  | "analytics"
  | "settings";

export function AdminManagement() {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <AdminDashboard />;
      case "users":
        return <UserManagement />;
      case "providers":
        return (
          <div className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>Provider Management</CardTitle>
                <CardDescription>
                  Manage print providers and their capabilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="py-8 text-center">
                  <Building className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p className="text-gray-500">
                    Provider management coming soon
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    Advanced provider management features will be available here
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case "orders":
        return (
          <div className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <CardDescription>
                  Monitor and manage platform orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="py-8 text-center">
                  <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p className="text-gray-500">Order management coming soon</p>
                  <p className="mt-1 text-sm text-gray-400">
                    Comprehensive order management features will be available
                    here
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case "analytics":
        return (
          <div className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Reports</CardTitle>
                <CardDescription>
                  Platform analytics and business intelligence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="py-8 text-center">
                  <BarChart3 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p className="text-gray-500">
                    Analytics dashboard coming soon
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    Advanced analytics and reporting features will be available
                    here
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case "settings":
        return (
          <div className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>
                  Configure platform settings and policies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="py-8 text-center">
                  <Settings className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p className="text-gray-500">Platform settings coming soon</p>
                  <p className="mt-1 text-sm text-gray-400">
                    Platform configuration and settings will be available here
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <Badge variant="destructive" className="capitalize">
              Administrator
            </Badge>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-4 flex w-fit space-x-1 rounded-lg bg-gray-100 p-1">
            <Button
              variant={activeTab === "dashboard" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("dashboard")}
              className="px-4"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant={activeTab === "users" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("users")}
              className="px-4"
            >
              <Users className="mr-2 h-4 w-4" />
              Users
            </Button>
            <Button
              variant={activeTab === "providers" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("providers")}
              className="px-4"
            >
              <Building className="mr-2 h-4 w-4" />
              Providers
            </Button>
            <Button
              variant={activeTab === "orders" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("orders")}
              className="px-4"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Orders
            </Button>
            <Button
              variant={activeTab === "analytics" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("analytics")}
              className="px-4"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Analytics
            </Button>
            <Button
              variant={activeTab === "settings" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("settings")}
              className="px-4"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1">{renderTabContent()}</div>
    </div>
  );
}
