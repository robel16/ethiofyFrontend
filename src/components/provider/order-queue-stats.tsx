"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  Package,
  Truck,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Calendar,
  DollarSign,
} from "lucide-react";
import { Order } from "@/services/order.service";

interface OrderQueueStatsProps {
  orders: Order[];
}

export function OrderQueueStats({ orders }: OrderQueueStatsProps) {
  const getOrderStats = () => {
    const stats = {
      pending: orders.filter((o) => o.status === "pending").length,
      processing: orders.filter((o) => o.status === "processing").length,
      shipped: orders.filter((o) => o.status === "shipped").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
      totalRevenue: orders.reduce((sum, o) => sum + o.total_amount, 0),
      avgOrderValue:
        orders.length > 0
          ? orders.reduce((sum, o) => sum + o.total_amount, 0) / orders.length
          : 0,
      urgentOrders: 0,
      completionRate: 0,
    };

    // Calculate urgent orders (older than 48 hours and still pending/processing)
    const now = Date.now();
    stats.urgentOrders = orders.filter((order) => {
      const hoursOld =
        (now - new Date(order.created_at).getTime()) / (1000 * 60 * 60);
      return (
        hoursOld > 48 &&
        (order.status === "pending" || order.status === "processing")
      );
    }).length;

    // Calculate completion rate
    const completedOrders = stats.delivered + stats.cancelled;
    stats.completionRate =
      orders.length > 0 ? (completedOrders / orders.length) * 100 : 0;

    return stats;
  };

  const stats = getOrderStats();

  const getOrdersByTimeframe = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      today: orders.filter((o) => new Date(o.created_at) >= today).length,
      yesterday: orders.filter((o) => {
        const orderDate = new Date(o.created_at);
        return orderDate >= yesterday && orderDate < today;
      }).length,
      thisWeek: orders.filter((o) => new Date(o.created_at) >= thisWeek).length,
    };
  };

  const timeframeStats = getOrdersByTimeframe();

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Active Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {stats.pending + stats.processing}
          </div>
          <div className="mt-1 flex items-center space-x-2 text-xs text-muted-foreground">
            <span className="flex items-center">
              <Clock className="mr-1 h-3 w-3" />
              {stats.pending} pending
            </span>
            <span>•</span>
            <span>{stats.processing} in production</span>
          </div>
          {stats.urgentOrders > 0 && (
            <div className="mt-2 flex items-center">
              <AlertTriangle className="mr-1 h-3 w-3 text-red-500" />
              <span className="text-xs font-medium text-red-600">
                {stats.urgentOrders} urgent
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completion Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {stats.completionRate.toFixed(1)}%
          </div>
          <Progress value={stats.completionRate} className="mt-2" />
          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>{stats.delivered} delivered</span>
            <span>{orders.length} total</span>
          </div>
        </CardContent>
      </Card>

      {/* Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            ${stats.totalRevenue.toFixed(2)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Avg: ${stats.avgOrderValue.toFixed(2)} per order
          </p>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {timeframeStats.today}
          </div>
          <p className="text-xs text-muted-foreground">orders today</p>
          <div className="mt-1 flex items-center space-x-2 text-xs text-muted-foreground">
            <span>{timeframeStats.yesterday} yesterday</span>
            <span>•</span>
            <span>{timeframeStats.thisWeek} this week</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
