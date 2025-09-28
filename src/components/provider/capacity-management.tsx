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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Settings,
  Pause,
  Play,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  TrendingUp,
  Calendar,
  Activity,
  Zap,
  Target,
  BarChart3,
} from "lucide-react";
import { FulfillmentService } from "@/services/fulfillment.service";
import toast from "react-hot-toast";

interface CapacitySettings {
  daily_capacity: number;
  rush_orders: boolean;
  bulk_discounts: boolean;
  auto_pause_threshold: number;
  maintenance_mode: boolean;
  working_hours: {
    start: string;
    end: string;
    timezone: string;
  };
  working_days: string[];
}

interface CapacityMetrics {
  current_utilization: number;
  orders_today: number;
  orders_this_week: number;
  average_processing_time: number;
  peak_capacity_reached: boolean;
  estimated_completion_time: string;
  queue_length: number;
}

export function CapacityManagement() {
  const [capacitySettings, setCapacitySettings] = useState<CapacitySettings>({
    daily_capacity: 100,
    rush_orders: true,
    bulk_discounts: true,
    auto_pause_threshold: 90,
    maintenance_mode: false,
    working_hours: {
      start: "09:00",
      end: "17:00",
      timezone: "UTC",
    },
    working_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  });

  const [metrics, setMetrics] = useState<CapacityMetrics>({
    current_utilization: 78,
    orders_today: 78,
    orders_this_week: 420,
    average_processing_time: 2.5,
    peak_capacity_reached: false,
    estimated_completion_time: "2024-01-15T17:00:00Z",
    queue_length: 12,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fulfillmentService = FulfillmentService.getInstance();

  useEffect(() => {
    loadCapacityData();
  }, []);

  const loadCapacityData = async () => {
    try {
      setLoading(true);
      // In a real implementation, load from API
      // For now, using mock data
    } catch (error: any) {
      console.error("Error loading capacity data:", error);
      toast.error("Failed to load capacity data");
    } finally {
      setLoading(false);
    }
  };

  const saveCapacitySettings = async () => {
    try {
      setSaving(true);

      // Update provider profile with new capacity settings
      await fulfillmentService.updateProfile({
        capabilities: {
          production_capacity: {
            daily_capacity: capacitySettings.daily_capacity,
            rush_orders: capacitySettings.rush_orders,
            bulk_discounts: capacitySettings.bulk_discounts,
          },
          supported_products: [], // Keep existing
          regions: [], // Keep existing
        },
      });

      toast.success("Capacity settings updated successfully");
    } catch (error: any) {
      console.error("Error saving capacity settings:", error);
      toast.error("Failed to save capacity settings");
    } finally {
      setSaving(false);
    }
  };

  const toggleMaintenanceMode = async () => {
    try {
      const newMode = !capacitySettings.maintenance_mode;

      await fulfillmentService.updateProviderStatus(
        newMode ? "maintenance" : "active",
        newMode ? "Scheduled maintenance" : "Maintenance completed"
      );

      setCapacitySettings((prev) => ({ ...prev, maintenance_mode: newMode }));

      toast.success(
        newMode ? "Maintenance mode enabled" : "Maintenance mode disabled"
      );
    } catch (error: any) {
      console.error("Error toggling maintenance mode:", error);
      toast.error("Failed to update maintenance mode");
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return "text-red-600";
    if (utilization >= 75) return "text-yellow-600";
    return "text-green-600";
  };

  const getUtilizationStatus = (utilization: number) => {
    if (utilization >= 95) return { status: "Critical", color: "bg-red-500" };
    if (utilization >= 85) return { status: "High", color: "bg-yellow-500" };
    if (utilization >= 60) return { status: "Optimal", color: "bg-green-500" };
    return { status: "Low", color: "bg-blue-500" };
  };

  const utilizationStatus = getUtilizationStatus(metrics.current_utilization);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Capacity Management
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your production capacity and order limits
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge
            variant={
              capacitySettings.maintenance_mode ? "destructive" : "secondary"
            }
            className="flex items-center gap-1"
          >
            {capacitySettings.maintenance_mode ? (
              <>
                <Pause className="h-3 w-3" />
                Maintenance Mode
              </>
            ) : (
              <>
                <Play className="h-3 w-3" />
                Active
              </>
            )}
          </Badge>
          <Button
            variant={capacitySettings.maintenance_mode ? "default" : "outline"}
            onClick={toggleMaintenanceMode}
            size="sm"
          >
            {capacitySettings.maintenance_mode ? (
              <>
                <Play className="mr-2 h-4 w-4" />
                Resume Operations
              </>
            ) : (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Maintenance Mode
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Maintenance Mode Alert */}
      {capacitySettings.maintenance_mode && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Maintenance mode is active. You are not receiving new orders.
            Existing orders will continue to be processed.
          </AlertDescription>
        </Alert>
      )}

      {/* Current Capacity Status */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Utilization
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getUtilizationColor(metrics.current_utilization)}`}
            >
              {metrics.current_utilization}%
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Progress
                value={metrics.current_utilization}
                className="flex-1"
              />
              <Badge variant="outline" className={utilizationStatus.color}>
                {utilizationStatus.status}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {metrics.orders_today} / {capacitySettings.daily_capacity} orders
              today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queue Length</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metrics.queue_length}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Pending orders</p>
            <div className="mt-2">
              <div className="text-xs text-gray-600">
                Est. completion:{" "}
                {new Date(
                  metrics.estimated_completion_time
                ).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Processing Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {metrics.average_processing_time}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Average days per order
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Orders</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics.orders_this_week}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              This week's total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Capacity Settings */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Production Capacity</CardTitle>
            <CardDescription>
              Configure your daily production limits and capabilities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                Daily Capacity (Orders)
              </label>
              <Input
                type="number"
                value={capacitySettings.daily_capacity}
                onChange={(e) =>
                  setCapacitySettings((prev) => ({
                    ...prev,
                    daily_capacity: parseInt(e.target.value) || 0,
                  }))
                }
                placeholder="100"
              />
              <p className="mt-1 text-xs text-gray-500">
                Maximum orders you can process per day
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">
                Auto-Pause Threshold (%)
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                value={capacitySettings.auto_pause_threshold}
                onChange={(e) =>
                  setCapacitySettings((prev) => ({
                    ...prev,
                    auto_pause_threshold: parseInt(e.target.value) || 0,
                  }))
                }
                placeholder="90"
              />
              <p className="mt-1 text-xs text-gray-500">
                Automatically pause new orders when utilization reaches this
                percentage
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={capacitySettings.rush_orders}
                  onChange={(e) =>
                    setCapacitySettings((prev) => ({
                      ...prev,
                      rush_orders: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                <label className="text-sm font-medium">
                  Accept Rush Orders
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={capacitySettings.bulk_discounts}
                  onChange={(e) =>
                    setCapacitySettings((prev) => ({
                      ...prev,
                      bulk_discounts: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                <label className="text-sm font-medium">
                  Offer Bulk Discounts
                </label>
              </div>
            </div>

            <Button
              onClick={saveCapacitySettings}
              disabled={saving}
              className="w-full"
            >
              <Settings className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Working Hours</CardTitle>
            <CardDescription>
              Configure your operational schedule
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Time</label>
                <Input
                  type="time"
                  value={capacitySettings.working_hours.start}
                  onChange={(e) =>
                    setCapacitySettings((prev) => ({
                      ...prev,
                      working_hours: {
                        ...prev.working_hours,
                        start: e.target.value,
                      },
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Time</label>
                <Input
                  type="time"
                  value={capacitySettings.working_hours.end}
                  onChange={(e) =>
                    setCapacitySettings((prev) => ({
                      ...prev,
                      working_hours: {
                        ...prev.working_hours,
                        end: e.target.value,
                      },
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Working Days</label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={capacitySettings.working_days.includes(day)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCapacitySettings((prev) => ({
                            ...prev,
                            working_days: [...prev.working_days, day],
                          }));
                        } else {
                          setCapacitySettings((prev) => ({
                            ...prev,
                            working_days: prev.working_days.filter(
                              (d) => d !== day
                            ),
                          }));
                        }
                      }}
                      className="rounded"
                    />
                    <label className="text-sm">{day}</label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Capacity Alerts */}
      {metrics.current_utilization >= capacitySettings.auto_pause_threshold && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>High Capacity Alert:</strong> You're at{" "}
            {metrics.current_utilization}% capacity. Consider pausing new orders
            or increasing your daily capacity limit.
          </AlertDescription>
        </Alert>
      )}

      {metrics.peak_capacity_reached && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Peak Capacity Reached:</strong> You've reached your maximum
            daily capacity. New orders are automatically paused until tomorrow
            or capacity is increased.
          </AlertDescription>
        </Alert>
      )}

      {/* Capacity Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Capacity Analytics</CardTitle>
          <CardDescription>
            Historical capacity utilization and trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <BarChart3 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="text-gray-500">Capacity analytics coming soon</p>
            <p className="mt-1 text-sm text-gray-400">
              Historical trends and capacity optimization insights will be
              available here
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
