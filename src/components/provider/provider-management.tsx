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
  Building2,
  Package,
  Settings,
  BarChart3,
  Warehouse,
  Users,
  Bell,
  TrendingUp,
} from "lucide-react";
import { ProviderProfileSetup } from "./provider-profile-setup";
import { InventoryManagement } from "./inventory-management";
import { ProviderDashboard } from "./provider-dashboard";
import { OrderManagement } from "./order-management";
import { PerformanceMetrics } from "./performance-metrics";
import { CapacityManagement } from "./capacity-management";

type ManagementTab =
  | "dashboard"
  | "profile"
  | "inventory"
  | "orders"
  | "capacity"
  | "performance"
  | "analytics";

export function ProviderManagement() {
  const [activeTab, setActiveTab] = useState<ManagementTab>("dashboard");

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <ProviderDashboard />;
      case "profile":
        return <ProviderProfileSetup />;
      case "inventory":
        return <InventoryManagement />;
      case "orders":
        return <OrderManagement />;
      case "capacity":
        return <CapacityManagement />;
      case "performance":
        return <PerformanceMetrics />;
      case "analytics":
        return (
          <div className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Reports</CardTitle>
                <CardDescription>
                  Detailed analytics and performance reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="py-8 text-center">
                  <BarChart3 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p className="text-gray-500">
                    Analytics dashboard coming soon
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    Advanced reporting and analytics features will be available
                    here
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return <ProviderDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Provider Management
            </h1>
            <Badge variant="secondary" className="capitalize">
              Active Provider
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
              variant={activeTab === "orders" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("orders")}
              className="px-4"
            >
              <Package className="mr-2 h-4 w-4" />
              Orders
            </Button>
            <Button
              variant={activeTab === "inventory" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("inventory")}
              className="px-4"
            >
              <Warehouse className="mr-2 h-4 w-4" />
              Inventory
            </Button>
            <Button
              variant={activeTab === "capacity" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("capacity")}
              className="px-4"
            >
              <Settings className="mr-2 h-4 w-4" />
              Capacity
            </Button>
            <Button
              variant={activeTab === "performance" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("performance")}
              className="px-4"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Performance
            </Button>
            <Button
              variant={activeTab === "profile" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("profile")}
              className="px-4"
            >
              <Building2 className="mr-2 h-4 w-4" />
              Profile & Setup
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1">{renderTabContent()}</div>
    </div>
  );
}
