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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Search,
  Filter,
  RefreshCw,
  Download,
  Upload,
  BarChart3,
  Eye,
  Settings,
  CheckCircle,
  X,
  AlertCircle,
  Clock,
  Warehouse,
  Box,
  Activity,
} from "lucide-react";
import {
  InventoryService,
  InventoryItem,
  InventoryAlert,
} from "@/services/inventory.service";
import { useAuth } from "@/contexts/auth-context";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

interface InventoryFilters {
  status: string;
  product_id: string;
  search: string;
  sort_by: string;
  sort_order: "asc" | "desc";
}

interface NewInventoryItem {
  product_id: string;
  variant_id: string;
  quantity: number;
  reorder_point: number;
  max_stock_level: number;
  cost_per_unit: number;
  location: string;
  sku: string;
  metadata: Record<string, any>;
}

export function InventoryManagement() {
  const { user } = useAuth();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [activeTab, setActiveTab] = useState<
    "inventory" | "alerts" | "analytics"
  >("inventory");

  const [filters, setFilters] = useState<InventoryFilters>({
    status: "",
    product_id: "",
    search: "",
    sort_by: "updated_at",
    sort_order: "desc",
  });

  const [newItem, setNewItem] = useState<NewInventoryItem>({
    product_id: "",
    variant_id: "",
    quantity: 0,
    reorder_point: 10,
    max_stock_level: 100,
    cost_per_unit: 0,
    location: "",
    sku: "",
    metadata: {},
  });

  const [editItem, setEditItem] = useState<Partial<InventoryItem>>({});
  const [stats, setStats] = useState({
    total_items: 0,
    total_quantity: 0,
    total_value: 0,
    in_stock: 0,
    low_stock: 0,
    out_of_stock: 0,
  });

  const inventoryService = InventoryService.getInstance();

  useEffect(() => {
    loadInventoryData();
  }, [filters]);

  const loadInventoryData = async () => {
    try {
      setLoading(true);

      // Mock provider ID - in real app, get from user profile
      const providerId = "provider_123";

      // Load inventory items
      const inventoryData = await inventoryService.getProviderInventory(
        providerId,
        {
          status: filters.status || undefined,
          product_id: filters.product_id || undefined,
          limit: 100,
          offset: 0,
        }
      );

      setInventoryItems(inventoryData.inventory_items);
      setStats(inventoryData.summary);

      // Load alerts
      const alertsData = await inventoryService.getUnresolvedAlerts({
        provider_id: providerId,
      });

      setAlerts(alertsData.alerts);
    } catch (error: any) {
      console.error("Error loading inventory data:", error);

      // Use mock data for demo
      const mockItems: InventoryItem[] = [
        {
          id: "inv_1",
          product_id: "prod_1",
          variant_id: "var_1",
          provider_id: "provider_123",
          quantity: 85,
          reserved_quantity: 15,
          available_quantity: 70,
          reorder_point: 20,
          max_stock_level: 500,
          cost_per_unit: 12.5,
          location: "Warehouse A - Shelf 15",
          sku: "SKU-TSHIRT-M-BLK-001",
          status: "in_stock",
          metadata: {
            color: "black",
            size: "M",
            material: "100% cotton",
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "inv_2",
          product_id: "prod_2",
          variant_id: "var_2",
          provider_id: "provider_123",
          quantity: 5,
          reserved_quantity: 0,
          available_quantity: 5,
          reorder_point: 20,
          max_stock_level: 200,
          cost_per_unit: 18.99,
          location: "Warehouse B - Shelf 8",
          sku: "SKU-HOODIE-L-RED-001",
          status: "low_stock",
          metadata: {
            color: "red",
            size: "L",
            material: "80% cotton, 20% polyester",
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const mockAlerts: InventoryAlert[] = [
        {
          id: "alert_1",
          type: "low_stock",
          severity: "medium",
          inventory_item_id: "inv_2",
          product_id: "prod_2",
          variant_id: "var_2",
          provider_id: "provider_123",
          message: "Stock level (5) is below reorder point (20)",
          current_quantity: 5,
          reorder_point: 20,
          created_at: new Date().toISOString(),
          status: "active",
        },
      ];

      setInventoryItems(mockItems);
      setAlerts(mockAlerts);
      setStats({
        total_items: 2,
        total_quantity: 90,
        total_value: 1157.45,
        in_stock: 1,
        low_stock: 1,
        out_of_stock: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const createInventoryItem = async () => {
    try {
      setUpdating("creating");

      const itemData = {
        ...newItem,
        provider_id: "provider_123", // Mock provider ID
      };

      await inventoryService.createInventoryItem(itemData);

      setShowAddDialog(false);
      setNewItem({
        product_id: "",
        variant_id: "",
        quantity: 0,
        reorder_point: 10,
        max_stock_level: 100,
        cost_per_unit: 0,
        location: "",
        sku: "",
        metadata: {},
      });

      toast.success("Inventory item created successfully");
      await loadInventoryData();
    } catch (error: any) {
      console.error("Error creating inventory item:", error);
      toast.error("Failed to create inventory item");
    } finally {
      setUpdating(null);
    }
  };

  const updateInventoryItem = async (
    itemId: string,
    updates: Partial<InventoryItem>
  ) => {
    try {
      setUpdating(itemId);

      await inventoryService.updateInventoryItem(itemId, updates);

      // Update local state
      setInventoryItems((items) =>
        items.map((item) =>
          item.id === itemId
            ? { ...item, ...updates, updated_at: new Date().toISOString() }
            : item
        )
      );

      setShowEditDialog(false);
      setSelectedItem(null);
      setEditItem({});

      toast.success("Inventory item updated successfully");
    } catch (error: any) {
      console.error("Error updating inventory item:", error);
      toast.error("Failed to update inventory item");
    } finally {
      setUpdating(null);
    }
  };

  const resolveAlert = async (alertId: string, notes: string) => {
    try {
      await inventoryService.resolveAlert(alertId, {
        resolution_notes: notes,
        action_taken: "manual_resolution",
      });

      // Remove alert from local state
      setAlerts((alerts) => alerts.filter((alert) => alert.id !== alertId));

      toast.success("Alert resolved successfully");
    } catch (error: any) {
      console.error("Error resolving alert:", error);
      toast.error("Failed to resolve alert");
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "in_stock":
        return "secondary";
      case "low_stock":
        return "outline";
      case "out_of_stock":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_stock":
        return "text-green-600";
      case "low_stock":
        return "text-yellow-600";
      case "out_of_stock":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const filteredAndSortedItems = inventoryItems
    .filter((item) => {
      if (
        filters.search &&
        !item.sku.toLowerCase().includes(filters.search.toLowerCase()) &&
        !item.product_id.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sort_by) {
        case "quantity":
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "sku":
          aValue = a.sku;
          bValue = b.sku;
          break;
        default:
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
      }

      if (filters.sort_order === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Inventory Management
          </h1>
          <p className="mt-2 text-gray-600">
            Monitor and manage your product inventory
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadInventoryData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Inventory Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Product ID</label>
                    <Input
                      value={newItem.product_id}
                      onChange={(e) =>
                        setNewItem({ ...newItem, product_id: e.target.value })
                      }
                      placeholder="prod_123"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Variant ID</label>
                    <Input
                      value={newItem.variant_id}
                      onChange={(e) =>
                        setNewItem({ ...newItem, variant_id: e.target.value })
                      }
                      placeholder="var_456"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Quantity</label>
                    <Input
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          quantity: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Reorder Point</label>
                    <Input
                      type="number"
                      value={newItem.reorder_point}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          reorder_point: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">
                      Max Stock Level
                    </label>
                    <Input
                      type="number"
                      value={newItem.max_stock_level}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          max_stock_level: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Cost per Unit</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newItem.cost_per_unit}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          cost_per_unit: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="12.50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">SKU</label>
                    <Input
                      value={newItem.sku}
                      onChange={(e) =>
                        setNewItem({ ...newItem, sku: e.target.value })
                      }
                      placeholder="SKU-TSHIRT-M-BLK"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Location</label>
                    <Input
                      value={newItem.location}
                      onChange={(e) =>
                        setNewItem({ ...newItem, location: e.target.value })
                      }
                      placeholder="Warehouse A - Shelf 15"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={createInventoryItem}
                  disabled={
                    !newItem.product_id ||
                    !newItem.sku ||
                    updating === "creating"
                  }
                >
                  {updating === "creating" ? "Creating..." : "Create Item"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex w-fit space-x-1 rounded-lg bg-gray-100 p-1">
        <Button
          variant={activeTab === "inventory" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("inventory")}
        >
          <Package className="mr-2 h-4 w-4" />
          Inventory
        </Button>
        <Button
          variant={activeTab === "alerts" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("alerts")}
        >
          <AlertTriangle className="mr-2 h-4 w-4" />
          Alerts ({alerts.length})
        </Button>
        <Button
          variant={activeTab === "analytics" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("analytics")}
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          Analytics
        </Button>
      </div>

      {/* Inventory Overview Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_items}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total_quantity} total units
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.total_value.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Inventory value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.in_stock}
            </div>
            <p className="text-xs text-muted-foreground">Items available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Needs Attention
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.low_stock + stats.out_of_stock}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.low_stock} low, {stats.out_of_stock} out
            </p>
          </CardContent>
        </Card>
      </div>

      {activeTab === "inventory" && (
        <>
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  <Input
                    placeholder="Search SKU or Product ID..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                    className="pl-10"
                  />
                </div>

                <Select
                  value={filters.status}
                  onValueChange={(value) =>
                    setFilters({ ...filters, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="in_stock">In Stock</SelectItem>
                    <SelectItem value="low_stock">Low Stock</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.sort_by}
                  onValueChange={(value) =>
                    setFilters({ ...filters, sort_by: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updated_at">Last Updated</SelectItem>
                    <SelectItem value="quantity">Quantity</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="sku">SKU</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFilters({
                      ...filters,
                      sort_order: filters.sort_order === "asc" ? "desc" : "asc",
                    })
                  }
                >
                  {filters.sort_order === "asc" ? "↑" : "↓"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Items */}
          <Card>
            <CardHeader>
              <CardTitle>
                Inventory Items ({filteredAndSortedItems.length})
              </CardTitle>
              <CardDescription>
                Manage your product inventory and stock levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loading />
                </div>
              ) : filteredAndSortedItems.length === 0 ? (
                <div className="py-8 text-center">
                  <Warehouse className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p className="text-gray-500">No inventory items found</p>
                  <p className="mt-1 text-sm text-gray-400">
                    Add your first inventory item to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAndSortedItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border p-4 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                            <Package className="h-6 w-6 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold">{item.sku}</h3>
                              <Badge
                                variant={getStatusBadgeVariant(item.status)}
                                className={`capitalize ${getStatusColor(item.status)}`}
                              >
                                {item.status.replace("_", " ")}
                              </Badge>
                              {item.quantity <= item.reorder_point && (
                                <Badge
                                  variant="outline"
                                  className="border-yellow-600 text-yellow-600"
                                >
                                  Reorder needed
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              Product: {item.product_id} • Variant:{" "}
                              {item.variant_id || "N/A"}
                            </p>
                            <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                              <span>Available: {item.available_quantity}</span>
                              <span>•</span>
                              <span>Reserved: {item.reserved_quantity}</span>
                              <span>•</span>
                              <span>
                                Location: {item.location || "Not set"}
                              </span>
                              <span>•</span>
                              <span>
                                Cost: $
                                {item.cost_per_unit?.toFixed(2) || "0.00"}
                              </span>
                            </div>
                            <div className="mt-2">
                              <div className="flex items-center space-x-2 text-xs">
                                <span>Stock Level:</span>
                                <div className="max-w-32 flex-1">
                                  <Progress
                                    value={
                                      (item.quantity /
                                        (item.max_stock_level || 100)) *
                                      100
                                    }
                                    className="h-2"
                                  />
                                </div>
                                <span>
                                  {item.quantity}/{item.max_stock_level || 100}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Dialog
                            open={
                              showEditDialog && selectedItem?.id === item.id
                            }
                            onOpenChange={(open) => {
                              setShowEditDialog(open);
                              if (!open) {
                                setSelectedItem(null);
                                setEditItem({});
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedItem(item);
                                  setEditItem({
                                    quantity: item.quantity,
                                    reorder_point: item.reorder_point,
                                    max_stock_level: item.max_stock_level,
                                    cost_per_unit: item.cost_per_unit,
                                    location: item.location,
                                  });
                                  setShowEditDialog(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Inventory Item</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">
                                      Quantity
                                    </label>
                                    <Input
                                      type="number"
                                      value={editItem.quantity || 0}
                                      onChange={(e) =>
                                        setEditItem({
                                          ...editItem,
                                          quantity:
                                            parseInt(e.target.value) || 0,
                                        })
                                      }
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">
                                      Reorder Point
                                    </label>
                                    <Input
                                      type="number"
                                      value={editItem.reorder_point || 0}
                                      onChange={(e) =>
                                        setEditItem({
                                          ...editItem,
                                          reorder_point:
                                            parseInt(e.target.value) || 0,
                                        })
                                      }
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">
                                      Max Stock Level
                                    </label>
                                    <Input
                                      type="number"
                                      value={editItem.max_stock_level || 0}
                                      onChange={(e) =>
                                        setEditItem({
                                          ...editItem,
                                          max_stock_level:
                                            parseInt(e.target.value) || 0,
                                        })
                                      }
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">
                                      Cost per Unit
                                    </label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={editItem.cost_per_unit || 0}
                                      onChange={(e) =>
                                        setEditItem({
                                          ...editItem,
                                          cost_per_unit:
                                            parseFloat(e.target.value) || 0,
                                        })
                                      }
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="text-sm font-medium">
                                    Location
                                  </label>
                                  <Input
                                    value={editItem.location || ""}
                                    onChange={(e) =>
                                      setEditItem({
                                        ...editItem,
                                        location: e.target.value,
                                      })
                                    }
                                    placeholder="Warehouse A - Shelf 15"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setShowEditDialog(false)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() =>
                                    updateInventoryItem(item.id, editItem)
                                  }
                                  disabled={updating === item.id}
                                >
                                  {updating === item.id
                                    ? "Updating..."
                                    : "Update Item"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === "alerts" && (
        <Card>
          <CardHeader>
            <CardTitle>Inventory Alerts ({alerts.length})</CardTitle>
            <CardDescription>Alerts requiring your attention</CardDescription>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <div className="py-8 text-center">
                <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-400" />
                <p className="text-gray-500">No active alerts</p>
                <p className="mt-1 text-sm text-gray-400">
                  All inventory levels are within normal ranges
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`rounded-lg border p-4 ${getAlertSeverityColor(alert.severity)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-5 w-5" />
                        <div>
                          <h4 className="font-medium capitalize">
                            {alert.type.replace("_", " ")} Alert
                          </h4>
                          <p className="text-sm">{alert.message}</p>
                          <p className="mt-1 text-xs">
                            Created{" "}
                            {formatDistanceToNow(new Date(alert.created_at), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="capitalize">
                          {alert.severity}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() =>
                            resolveAlert(
                              alert.id,
                              "Manually resolved by provider"
                            )
                          }
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Resolve
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Stock Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">In Stock</span>
                <span className="font-semibold text-green-600">
                  {stats.in_stock} items
                </span>
              </div>
              <Progress
                value={(stats.in_stock / stats.total_items) * 100}
                className="h-2"
              />

              <div className="flex items-center justify-between">
                <span className="text-sm">Low Stock</span>
                <span className="font-semibold text-yellow-600">
                  {stats.low_stock} items
                </span>
              </div>
              <Progress
                value={(stats.low_stock / stats.total_items) * 100}
                className="h-2"
              />

              <div className="flex items-center justify-between">
                <span className="text-sm">Out of Stock</span>
                <span className="font-semibold text-red-600">
                  {stats.out_of_stock} items
                </span>
              </div>
              <Progress
                value={(stats.out_of_stock / stats.total_items) * 100}
                className="h-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Bulk Import Inventory
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Inventory Report
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Configure Reorder Rules
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Movement History
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
