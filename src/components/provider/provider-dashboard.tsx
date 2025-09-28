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
import { Loading } from "@/components/ui/loading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Eye,
  Settings,
  RefreshCw,
  TrendingUp,
  Users,
  Star,
  Calendar,
  BarChart3,
  Activity,
} from "lucide-react";
import {
  FulfillmentService,
  ProviderProfile,
} from "@/services/fulfillment.service";
import { OrderService, Order } from "@/services/order.service";
import { useAuth } from "@/contexts/auth-context";
import toast from "react-hot-toast";
import { OrderManagement } from "./order-management";

interface DashboardStats {
  pendingOrders: number;
  inProduction: number;
  completedToday: number;
  totalRevenue: number;
  weeklyOrders: number;
  monthlyRevenue: number;
  averageRating: number;
  completionRate: number;
  capacityUtilization: number;
}

interface PerformanceMetrics {
  qualityScore: number;
  onTimeDelivery: number;
  customerSatisfaction: number;
  productionEfficiency: number;
}

export function ProviderDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    pendingOrders: 0,
    inProduction: 0,
    completedToday: 0,
    totalRevenue: 0,
    weeklyOrders: 0,
    monthlyRevenue: 0,
    averageRating: 0,
    completionRate: 0,
    capacityUtilization: 0,
  });
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    qualityScore: 0,
    onTimeDelivery: 0,
    customerSatisfaction: 0,
    productionEfficiency: 0,
  });
  const [activeTab, setActiveTab] = useState<
    "overview" | "orders" | "analytics"
  >("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fulfillmentService = FulfillmentService.getInstance();
  const orderService = OrderService.getInstance();

  useEffect(() => {
    if (user?.role === "print_provider") {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // For now, use mock data since backend might not be available
      setProfile({
        id: "provider_123",
        company_info: {
          company_name: "Premium Print Co",
          contact_email: "contact@premiumprint.com",
          contact_phone: "+1234567890",
          description: "High-quality printing services",
        },
        status: "active",
        capabilities: {
          supported_products: [],
          regions: ["US", "CA"],
          production_capacity: {
            daily_capacity: 500,
            rush_orders: true,
            bulk_discounts: true,
          },
        },
        pricing: {
          base_prices: {},
          shipping_rates: {
            standard: 4.99,
            expedited: 9.99,
            rush: 19.99,
          },
          rush_fee_percentage: 25,
        },
        service_levels: {
          production_time_days: 3,
          shipping_time_days: 5,
          quality_guarantee: true,
          return_policy_days: 30,
        },
      });

      // Mock recent orders
      const mockOrders: Order[] = [
        {
          id: "order_1",
          order_number: "ORD-2024-001",
          status: "processing",
          fulfillment_status: "pending",
          total_amount: 29.99,
          currency: "USD",
          items: [
            {
              product_id: "prod_1",
              variant_id: "var_1",
              quantity: 1,
              unit_price: 24.99,
              total_price: 24.99,
              merchant_id: "merchant_1",
              store_id: "store_1",
            },
          ],
          shipping_address: {
            first_name: "John",
            last_name: "Doe",
            address_line_1: "123 Main St",
            city: "New York",
            state: "NY",
            postal_code: "10001",
            country: "US",
          },
          billing_address: {
            first_name: "John",
            last_name: "Doe",
            address_line_1: "123 Main St",
            city: "New York",
            state: "NY",
            postal_code: "10001",
            country: "US",
          },
          payment_info: {
            payment_method: "stripe",
            payment_id: "pi_123",
            amount: 29.99,
            currency: "USD",
            status: "completed",
            transaction_id: "txn_123",
          },
          created_at: new Date().toISOString(),
        },
      ];

      setRecentOrders(mockOrders);
      setStats({
        pendingOrders: 12,
        inProduction: 8,
        completedToday: 24,
        totalRevenue: 2847.5,
        weeklyOrders: 156,
        monthlyRevenue: 18420.75,
        averageRating: 4.8,
        completionRate: 96.5,
        capacityUtilization: 78,
      });

      setMetrics({
        qualityScore: 94.2,
        onTimeDelivery: 97.8,
        customerSatisfaction: 4.7,
        productionEfficiency: 89.3,
      });
    } catch (error: any) {
      console.error("Error loading dashboard data:", error);
      setError(error.message || "Failed to load dashboard data");
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "processing":
        return "default";
      case "shipped":
        return "outline";
      case "delivered":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-6">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              onClick={loadDashboardData}
              className="ml-4"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (activeTab === "orders") {
    return <OrderManagement />;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Provider Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {profile?.company_info.company_name || "Provider"}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge
            variant={profile?.status === "active" ? "secondary" : "destructive"}
            className="capitalize"
          >
            {profile?.status}
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex w-fit space-x-1 rounded-lg bg-gray-100 p-1">
        <Button
          variant={activeTab === "overview" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("overview")}
          className="px-4"
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          Overview
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
          variant={activeTab === "analytics" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("analytics")}
          className="px-4"
        >
          <Activity className="mr-2 h-4 w-4" />
          Analytics
        </Button>
      </div>

      {activeTab === "overview" && (
        <>
          {/* Key Stats Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Orders
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingOrders}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting production
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  In Production
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inProduction}</div>
                <p className="text-xs text-muted-foreground">
                  Currently processing
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Completed Today
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedToday}</div>
                <p className="text-xs text-muted-foreground">
                  Orders delivered
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Daily Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${stats.totalRevenue.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  From completed orders
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Quality Score
                </CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.qualityScore}%
                </div>
                <Progress value={metrics.qualityScore} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  On-Time Delivery
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.onTimeDelivery}%
                </div>
                <Progress value={metrics.onTimeDelivery} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Customer Rating
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.customerSatisfaction}/5
                </div>
                <div className="mt-2 flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${i < Math.floor(metrics.customerSatisfaction) ? "fill-current text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Capacity Usage
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.capacityUtilization}%
                </div>
                <Progress value={stats.capacityUtilization} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders Queue */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Order Queue</CardTitle>
                <CardDescription>
                  Orders requiring immediate attention
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={loadDashboardData}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
                <Button size="sm" onClick={() => setActiveTab("orders")}>
                  View All Orders
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="py-8 text-center">
                  <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p className="text-gray-500">No pending orders</p>
                  <p className="mt-1 text-sm text-gray-400">
                    New orders will appear here when customers place them
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.slice(0, 5).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                          <Package className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">{order.order_number}</p>
                          <p className="text-sm text-gray-600">
                            {order.items.length} item
                            {order.items.length !== 1 ? "s" : ""} • $
                            {order.total_amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">Due in 2 days</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <Badge
                            variant={getStatusBadgeVariant(order.status)}
                            className="mb-1 capitalize"
                          >
                            {order.status}
                          </Badge>
                          <p className="text-xs capitalize text-yellow-600">
                            {order.fulfillment_status}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveTab("orders")}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === "analytics" && (
        <>
          {/* Monthly Overview */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Monthly Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Orders Completed
                  </span>
                  <span className="font-semibold">{stats.weeklyOrders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Revenue Generated
                  </span>
                  <span className="font-semibold">
                    ${stats.monthlyRevenue.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Average Rating</span>
                  <span className="font-semibold">{stats.averageRating}/5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completion Rate</span>
                  <span className="font-semibold">{stats.completionRate}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Production Efficiency</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>Quality Control</span>
                    <span>{metrics.qualityScore}%</span>
                  </div>
                  <Progress value={metrics.qualityScore} />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>Production Speed</span>
                    <span>{metrics.productionEfficiency}%</span>
                  </div>
                  <Progress value={metrics.productionEfficiency} />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>Delivery Performance</span>
                    <span>{metrics.onTimeDelivery}%</span>
                  </div>
                  <Progress value={metrics.onTimeDelivery} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Maintenance
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Update Capabilities
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Reports
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Customer Feedback
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Provider Status Alert */}
      {profile?.status !== "active" && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your provider status is currently "{profile?.status}".
            {profile?.status === "pending_verification" &&
              " Please complete your verification process to start receiving orders."}
            {profile?.status === "maintenance" &&
              " You are in maintenance mode and not receiving new orders."}
            {profile?.status === "suspended" &&
              " Your account is suspended. Please contact support for assistance."}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
