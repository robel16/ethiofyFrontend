"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Building,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Eye,
  Settings,
  RefreshCw,
  Download,
  Bell,
  Calendar,
  Globe,
  Zap,
} from "lucide-react";
import { OrderService } from "@/services/order.service";
import { UserService } from "@/services/user.service";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

interface PlatformMetrics {
  revenue: {
    total: number;
    monthly: number;
    growth: number;
  };
  orders: {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    growth: number;
  };
  users: {
    total: number;
    customers: number;
    providers: number;
    admins: number;
    growth: number;
  };
  providers: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
  };
}

interface SystemAlert {
  id: string;
  type: "error" | "warning" | "info";
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

interface RecentActivity {
  id: string;
  type: "order" | "user" | "provider" | "system";
  description: string;
  timestamp: string;
  status: "success" | "warning" | "error";
}

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<PlatformMetrics>({
    revenue: { total: 245231, monthly: 45231, growth: 12.5 },
    orders: {
      total: 5234,
      pending: 45,
      processing: 123,
      completed: 4890,
      growth: 8.3,
    },
    users: {
      total: 2890,
      customers: 2650,
      providers: 35,
      admins: 5,
      growth: 15.2,
    },
    providers: { total: 35, active: 28, pending: 4, suspended: 3 },
  });

  const [alerts, setAlerts] = useState<SystemAlert[]>([
    {
      id: "alert_1",
      type: "warning",
      title: "High Order Volume",
      message:
        "Order volume is 25% higher than usual. Monitor provider capacity.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      resolved: false,
    },
    {
      id: "alert_2",
      type: "info",
      title: "New Provider Application",
      message: "3 new provider applications pending review.",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      resolved: false,
    },
  ]);

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      id: "activity_1",
      type: "provider",
      description: "Premium Print Co. completed 15 orders",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      status: "success",
    },
    {
      id: "activity_2",
      type: "order",
      description: "Order #ORD-2024-1234 disputed by customer",
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      status: "warning",
    },
    {
      id: "activity_3",
      type: "user",
      description: "New customer registration: john.doe@example.com",
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      status: "success",
    },
  ]);

  const [loading, setLoading] = useState(false);

  const orderService = OrderService.getInstance();
  const userService = UserService.getInstance();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // In a real implementation, load actual metrics from APIs
      // For now, using mock data
    } catch (error: any) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(
      alerts.map((alert) =>
        alert.id === alertId ? { ...alert, resolved: true } : alert
      )
    );
    toast.success("Alert resolved");
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Bell className="h-4 w-4 text-blue-600" />;
    }
  };

  const getAlertVariant = (type: string) => {
    switch (type) {
      case "error":
        return "destructive";
      case "warning":
        return "default";
      default:
        return "default";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "order":
        return <ShoppingCart className="h-4 w-4" />;
      case "user":
        return <Users className="h-4 w-4" />;
      case "provider":
        return <Building className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-50";
      case "warning":
        return "text-yellow-600 bg-yellow-50";
      case "error":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Platform overview and management</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={loadDashboardData}
            disabled={loading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* System Alerts */}
      {alerts.filter((alert) => !alert.resolved).length > 0 && (
        <div className="space-y-2">
          {alerts
            .filter((alert) => !alert.resolved)
            .map((alert) => (
              <Alert key={alert.id} variant={getAlertVariant(alert.type)}>
                {getAlertIcon(alert.type)}
                <AlertDescription className="flex items-center justify-between">
                  <div>
                    <strong>{alert.title}:</strong> {alert.message}
                    <span className="ml-2 text-xs text-gray-500">
                      {formatDistanceToNow(new Date(alert.timestamp), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resolveAlert(alert.id)}
                  >
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Resolve
                  </Button>
                </AlertDescription>
              </Alert>
            ))}
        </div>
      )}

      {/* KPI Overview */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${metrics.revenue.total.toLocaleString()}
            </div>
            <div className="mt-1 flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />+
              {metrics.revenue.growth}% from last month
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              ${metrics.revenue.monthly.toLocaleString()} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metrics.orders.total.toLocaleString()}
            </div>
            <div className="mt-1 flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-blue-600" />+
              {metrics.orders.growth}% from last month
            </div>
            <div className="mt-1 flex items-center space-x-2 text-xs">
              <Badge variant="outline" className="text-yellow-600">
                {metrics.orders.pending} pending
              </Badge>
              <Badge variant="outline" className="text-blue-600">
                {metrics.orders.processing} processing
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Platform Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {metrics.users.total.toLocaleString()}
            </div>
            <div className="mt-1 flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-purple-600" />+
              {metrics.users.growth}% from last month
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {metrics.users.customers} customers, {metrics.users.providers}{" "}
              providers
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Print Providers
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {metrics.providers.total}
            </div>
            <div className="mt-1 flex items-center space-x-2 text-xs">
              <Badge variant="secondary" className="text-green-600">
                {metrics.providers.active} active
              </Badge>
              <Badge variant="outline" className="text-yellow-600">
                {metrics.providers.pending} pending
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {metrics.providers.suspended} suspended
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Health */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Health</CardTitle>
            <CardDescription>
              Overall platform performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>Order Processing</span>
                <span>98.5%</span>
              </div>
              <Progress value={98.5} className="h-2" />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>Provider Capacity</span>
                <span>76%</span>
              </div>
              <Progress value={76} className="h-2" />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>Customer Satisfaction</span>
                <span>94.2%</span>
              </div>
              <Progress value={94.2} className="h-2" />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>System Uptime</span>
                <span>99.9%</span>
              </div>
              <Progress value={99.9} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>
              Latest platform activities and events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div
                    className={`rounded-full p-1 ${getActivityColor(activity.status)}`}
                  >
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(activity.timestamp), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Building className="mr-2 h-4 w-4" />
              Review Providers
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Monitor Orders
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Analytics
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Platform Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics Overview
          </CardTitle>
          <CardDescription>
            Key performance indicators and trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex items-center space-x-4 rounded-lg border p-4">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Revenue Growth</p>
                <p className="text-lg font-semibold text-gray-900">+12.5%</p>
                <p className="text-xs text-green-600">Trending upward</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 rounded-lg border p-4">
              <Activity className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Order Volume</p>
                <p className="text-lg font-semibold text-gray-900">High</p>
                <p className="text-xs text-blue-600">Above average</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 rounded-lg border p-4">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">User Acquisition</p>
                <p className="text-lg font-semibold text-gray-900">+15.2%</p>
                <p className="text-xs text-purple-600">Strong growth</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
