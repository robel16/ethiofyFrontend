"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Clock,
  AlertTriangle,
  Star,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { adminService } from "@/services/admin.service";

function LoadingSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <span className="ml-2 text-gray-600">Loading dashboard data...</span>
      </div>
    </div>
  );
}

function KPICard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  format = "number",
}: {
  title: string;
  value: number;
  change: number;
  trend: "up" | "down";
  icon: React.ElementType;
  format?: "number" | "currency" | "percentage" | "days";
}) {
  const formatValue = (val: number) => {
    switch (format) {
      case "currency":
        return `$${val.toLocaleString()}`;
      case "percentage":
        return `${val}%`;
      case "days":
        return `${val} days`;
      default:
        return val.toLocaleString();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {formatValue(value)}
        </div>
        <div className="mt-2 flex items-center">
          {trend === "up" ? (
            <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
          )}
          <span
            className={`text-sm font-medium ${
              trend === "up" ? "text-green-600" : "text-red-600"
            }`}
          >
            {Math.abs(change)}%
          </span>
          <span className="ml-1 text-sm text-gray-500">vs last month</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminDashboard() {
  const {
    data: dashboardData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => adminService.getDashboardData(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Failed to load dashboard
              </h3>
              <p className="mb-4 text-gray-600">
                There was an error loading the dashboard data.
              </p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { kpis, topProviders, topProducts, ordersByCountry } = dashboardData!;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Overview of your print-on-demand platform
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select defaultValue="30d">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button>Export Report</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KPICard
          title="Total Orders"
          value={kpis.totalOrders.value}
          change={kpis.totalOrders.change}
          trend={kpis.totalOrders.trend}
          icon={ShoppingCart}
        />
        <KPICard
          title="Gross Revenue"
          value={kpis.grossRevenue.value}
          change={kpis.grossRevenue.change}
          trend={kpis.grossRevenue.trend}
          icon={DollarSign}
          format="currency"
        />
        <KPICard
          title="Net Revenue"
          value={kpis.netRevenue.value}
          change={kpis.netRevenue.change}
          trend={kpis.netRevenue.trend}
          icon={TrendingUp}
          format="currency"
        />
        <KPICard
          title="Outstanding Payouts"
          value={kpis.outstandingPayouts.value}
          change={kpis.outstandingPayouts.change}
          trend={kpis.outstandingPayouts.trend}
          icon={Clock}
          format="currency"
        />
        <KPICard
          title="Refund Rate"
          value={kpis.refundRate.value}
          change={kpis.refundRate.change}
          trend={kpis.refundRate.trend}
          icon={AlertTriangle}
          format="percentage"
        />
        <KPICard
          title="Avg Production Time"
          value={kpis.avgProductionTime.value}
          change={kpis.avgProductionTime.change}
          trend={kpis.avgProductionTime.trend}
          icon={Package}
          format="days"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <div className="text-center">
                <TrendingUp className="mx-auto mb-2 h-12 w-12 text-purple-400" />
                <p className="text-gray-500">
                  Revenue chart will be implemented with Recharts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders by Country */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Country</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ordersByCountry.map((item) => (
                <div
                  key={item.country}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-5 w-8 rounded-sm bg-gray-200 dark:bg-gray-700"></div>
                    <span className="text-sm font-medium">{item.country}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Progress value={item.percentage} className="w-20" />
                    <span className="w-12 text-right text-sm text-gray-500">
                      {item.orders.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Providers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top Providers</CardTitle>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProviders.map((provider, index) => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-medium text-white">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{provider.name}</p>
                      <div className="mt-1 flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {provider.country}
                        </Badge>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 fill-current text-yellow-400" />
                          <span className="ml-1 text-xs text-gray-500">
                            {provider.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      ${provider.revenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {provider.orders} orders
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top Products</CardTitle>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-blue-500 text-sm font-medium text-white">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-gray-500">
                        {product.orders} orders
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      ${product.revenue.toLocaleString()}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {product.margin} margin
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
