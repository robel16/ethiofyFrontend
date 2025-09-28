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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loading } from "@/components/ui/loading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Package,
  Search,
  Filter,
  Eye,
  CheckCircle,
  X,
  Clock,
  Truck,
  AlertCircle,
  RefreshCw,
  Download,
  Upload,
  Camera,
  FileText,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Star,
  MessageSquare,
  Image as ImageIcon,
  Printer,
  Settings,
  DollarSign,
} from "lucide-react";
import { OrderService, Order } from "@/services/order.service";
import { FulfillmentService } from "@/services/fulfillment.service";
import { useAuth } from "@/contexts/auth-context";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { OrderQueueStats } from "./order-queue-stats";

interface OrderFilters {
  status: string;
  fulfillment_status: string;
  search: string;
  date_from: string;
  date_to: string;
  priority: string;
  sort_by: string;
  sort_order: "asc" | "desc";
}

export function OrderManagement() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [statusUpdate, setStatusUpdate] = useState({
    status: "",
    notes: "",
    photos: [] as File[],
  });
  const [filters, setFilters] = useState<OrderFilters>({
    status: "",
    fulfillment_status: "",
    search: "",
    date_from: "",
    date_to: "",
    priority: "",
    sort_by: "created_at",
    sort_order: "desc",
  });
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    has_more: false,
  });

  const orderService = OrderService.getInstance();
  const fulfillmentService = FulfillmentService.getInstance();

  useEffect(() => {
    loadOrders();
  }, [filters]);

  const loadOrders = async () => {
    try {
      setLoading(true);

      // Mock provider ID - in real app, get from user profile
      const providerId = "provider_123";

      const { orders: orderData, pagination: paginationData } =
        await orderService.getProviderOrders(providerId, {
          status: filters.status || undefined,
          fulfillment_status: filters.fulfillment_status || undefined,
          date_from: filters.date_from || undefined,
          date_to: filters.date_to || undefined,
          limit: pagination.limit,
          offset: pagination.offset,
        });

      setOrders(orderData);
      setPagination(paginationData);
    } catch (error: any) {
      console.error("Error loading orders:", error);
      toast.error("Failed to load orders");

      // Use mock data for demo
      setOrders([
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
              quantity: 2,
              unit_price: 14.99,
              total_price: 29.98,
              customization: {
                design_id: "design_1",
                text: "Custom Text",
                color: "black",
                size: "M",
              },
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
            phone: "+1234567890",
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
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          tracking_info: {
            tracking_number: "TRACK123456",
            carrier: "FedEx",
          },
        },
        {
          id: "order_2",
          order_number: "ORD-2024-002",
          status: "pending",
          fulfillment_status: "pending",
          total_amount: 45.99,
          currency: "USD",
          items: [
            {
              product_id: "prod_2",
              variant_id: "var_2",
              quantity: 1,
              unit_price: 45.99,
              total_price: 45.99,
              customization: {
                design_id: "design_2",
                color: "white",
                size: "L",
              },
              merchant_id: "merchant_2",
              store_id: "store_2",
            },
          ],
          shipping_address: {
            first_name: "Jane",
            last_name: "Smith",
            address_line_1: "456 Oak Ave",
            city: "Los Angeles",
            state: "CA",
            postal_code: "90210",
            country: "US",
          },
          billing_address: {
            first_name: "Jane",
            last_name: "Smith",
            address_line_1: "456 Oak Ave",
            city: "Los Angeles",
            state: "CA",
            postal_code: "90210",
            country: "US",
          },
          payment_info: {
            payment_method: "stripe",
            payment_id: "pi_456",
            amount: 45.99,
            currency: "USD",
            status: "completed",
            transaction_id: "txn_456",
          },
          created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    newStatus: string,
    notes?: string
  ) => {
    try {
      setUpdating(orderId);

      await orderService.updateOrderStatus(orderId, newStatus, notes);

      // Update local state
      setOrders(
        orders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: newStatus as any,
                updated_at: new Date().toISOString(),
              }
            : order
        )
      );

      toast.success(`Order ${newStatus} successfully`);
    } catch (error: any) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdating(null);
    }
  };

  const acceptOrder = (orderId: string) => {
    updateOrderStatus(orderId, "processing", "Order accepted by provider");
  };

  const rejectOrder = async (orderId: string, reason: string) => {
    try {
      setUpdating(orderId);
      await updateOrderStatus(
        orderId,
        "cancelled",
        `Order rejected: ${reason}`
      );
      setShowRejectDialog(false);
      setRejectReason("");
      setSelectedOrder(null);
    } finally {
      setUpdating(null);
    }
  };

  const markAsShipped = (orderId: string) => {
    updateOrderStatus(orderId, "shipped", "Order has been shipped");
  };

  const updateOrderWithPhotos = async (
    orderId: string,
    status: string,
    notes: string,
    photos: File[]
  ) => {
    try {
      setUpdating(orderId);

      // In a real implementation, you would upload photos first
      // For now, we'll just update the status
      await updateOrderStatus(orderId, status, notes);

      setShowStatusDialog(false);
      setStatusUpdate({ status: "", notes: "", photos: [] });
      toast.success("Order status updated with photos");
    } catch (error: any) {
      console.error("Error updating order with photos:", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdating(null);
    }
  };

  const downloadDesignFiles = (order: Order) => {
    // Mock download functionality
    toast.success("Design files download started");
  };

  const getOrderPriority = (order: Order): "high" | "medium" | "low" => {
    const hoursOld =
      (Date.now() - new Date(order.created_at).getTime()) / (1000 * 60 * 60);
    if (hoursOld > 48) return "high";
    if (hoursOld > 24) return "medium";
    return "low";
  };

  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "processing":
        return <Package className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <X className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filteredAndSortedOrders = orders
    .filter((order) => {
      if (
        filters.search &&
        !order.order_number.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }
      if (filters.priority) {
        const orderPriority = getOrderPriority(order);
        if (orderPriority !== filters.priority) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sort_by) {
        case "created_at":
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case "total_amount":
          aValue = a.total_amount;
          bValue = b.total_amount;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[getOrderPriority(a)];
          bValue = priorityOrder[getOrderPriority(b)];
          break;
        default:
          aValue = a.order_number;
          bValue = b.order_number;
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
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="mt-2 text-gray-600">
            Manage and track your print orders
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadOrders}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Order Queue Statistics */}
      <OrderQueueStats orders={orders} />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="Search orders..."
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
                <SelectValue placeholder="Order Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.fulfillment_status}
              onValueChange={(value) =>
                setFilters({ ...filters, fulfillment_status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Fulfillment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Fulfillment</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.priority}
              onValueChange={(value) =>
                setFilters({ ...filters, priority: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Select
              value={filters.sort_by}
              onValueChange={(value) =>
                setFilters({ ...filters, sort_by: value })
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date Created</SelectItem>
                <SelectItem value="total_amount">Order Value</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
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

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({filteredAndSortedOrders.length})</CardTitle>
          <CardDescription>
            Manage your print orders and update their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loading />
            </div>
          ) : filteredAndSortedOrders.length === 0 ? (
            <div className="py-8 text-center">
              <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-gray-500">No orders found</p>
              <p className="mt-1 text-sm text-gray-400">
                Orders will appear here when customers place them
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-lg border p-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                        {getStatusIcon(order.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">
                            {order.order_number}
                          </h3>
                          <Badge
                            variant={getStatusBadgeVariant(order.status)}
                            className="capitalize"
                          >
                            {order.status}
                          </Badge>
                          <div
                            className={`rounded-full border px-2 py-1 text-xs font-medium ${getPriorityColor(getOrderPriority(order))}`}
                          >
                            {getOrderPriority(order)} priority
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          {order.items.length} item
                          {order.items.length !== 1 ? "s" : ""} • $
                          {order.total_amount.toFixed(2)} •
                          {order.shipping_address.first_name}{" "}
                          {order.shipping_address.last_name}
                        </p>
                        <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                          <span>
                            {formatDistanceToNow(new Date(order.created_at), {
                              addSuffix: true,
                            })}
                          </span>
                          <span>•</span>
                          <span className="flex items-center">
                            <MapPin className="mr-1 h-3 w-3" />
                            {order.shipping_address.city},{" "}
                            {order.shipping_address.state}
                          </span>
                          {order.tracking_info && (
                            <>
                              <span>•</span>
                              <span className="flex items-center">
                                <Truck className="mr-1 h-3 w-3" />
                                {order.tracking_info.tracking_number}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {order.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => acceptOrder(order.id)}
                            disabled={updating === order.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Accept
                          </Button>
                          <Dialog
                            open={showRejectDialog}
                            onOpenChange={setShowRejectDialog}
                          >
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowRejectDialog(true);
                                }}
                                disabled={updating === order.id}
                                className="border-red-600 text-red-600 hover:bg-red-50"
                              >
                                <X className="mr-1 h-4 w-4" />
                                Reject
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reject Order</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <p>
                                  Please provide a reason for rejecting order{" "}
                                  {selectedOrder?.order_number}:
                                </p>
                                <Textarea
                                  placeholder="Enter rejection reason..."
                                  value={rejectReason}
                                  onChange={(e) =>
                                    setRejectReason(e.target.value)
                                  }
                                  rows={3}
                                />
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setShowRejectDialog(false);
                                    setRejectReason("");
                                    setSelectedOrder(null);
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() =>
                                    selectedOrder &&
                                    rejectOrder(selectedOrder.id, rejectReason)
                                  }
                                  disabled={
                                    !rejectReason.trim() ||
                                    updating === selectedOrder?.id
                                  }
                                >
                                  Reject Order
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}

                      {order.status === "processing" && (
                        <>
                          <Dialog
                            open={showStatusDialog}
                            onOpenChange={setShowStatusDialog}
                          >
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setStatusUpdate({
                                    status: "shipped",
                                    notes: "",
                                    photos: [],
                                  });
                                  setShowStatusDialog(true);
                                }}
                                disabled={updating === order.id}
                                className="border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
                              >
                                <Upload className="mr-1 h-4 w-4" />
                                Update Status
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Update Order Status</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">
                                    Status
                                  </label>
                                  <Select
                                    value={statusUpdate.status}
                                    onValueChange={(value) =>
                                      setStatusUpdate({
                                        ...statusUpdate,
                                        status: value,
                                      })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="processing">
                                        In Production
                                      </SelectItem>
                                      <SelectItem value="shipped">
                                        Shipped
                                      </SelectItem>
                                      <SelectItem value="delivered">
                                        Delivered
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">
                                    Notes
                                  </label>
                                  <Textarea
                                    placeholder="Add notes about the status update..."
                                    value={statusUpdate.notes}
                                    onChange={(e) =>
                                      setStatusUpdate({
                                        ...statusUpdate,
                                        notes: e.target.value,
                                      })
                                    }
                                    rows={3}
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">
                                    Upload Photos (Optional)
                                  </label>
                                  <div className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center">
                                    <Camera className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                                    <p className="text-sm text-gray-600">
                                      Upload production photos or proof images
                                    </p>
                                    <Input
                                      type="file"
                                      multiple
                                      accept="image/*"
                                      className="mt-2"
                                      onChange={(e) => {
                                        const files = Array.from(
                                          e.target.files || []
                                        );
                                        setStatusUpdate({
                                          ...statusUpdate,
                                          photos: files,
                                        });
                                      }}
                                    />
                                  </div>
                                  {statusUpdate.photos.length > 0 && (
                                    <div className="mt-2">
                                      <p className="text-sm text-gray-600">
                                        {statusUpdate.photos.length} photo(s)
                                        selected
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setShowStatusDialog(false);
                                    setStatusUpdate({
                                      status: "",
                                      notes: "",
                                      photos: [],
                                    });
                                    setSelectedOrder(null);
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() =>
                                    selectedOrder &&
                                    updateOrderWithPhotos(
                                      selectedOrder.id,
                                      statusUpdate.status,
                                      statusUpdate.notes,
                                      statusUpdate.photos
                                    )
                                  }
                                  disabled={
                                    !statusUpdate.status ||
                                    updating === selectedOrder?.id
                                  }
                                >
                                  Update Status
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button
                            size="sm"
                            onClick={() => markAsShipped(order.id)}
                            disabled={updating === order.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Truck className="mr-1 h-4 w-4" />
                            Quick Ship
                          </Button>
                        </>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadDesignFiles(order)}
                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                      >
                        <Download className="mr-1 h-4 w-4" />
                        Files
                      </Button>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="mr-1 h-4 w-4" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>
                              Order Details - {order.order_number}
                            </DialogTitle>
                          </DialogHeader>
                          {selectedOrder && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="mb-2 font-medium">
                                    Order Information
                                  </h4>
                                  <div className="space-y-1 text-sm">
                                    <p>
                                      <span className="font-medium">
                                        Status:
                                      </span>{" "}
                                      {selectedOrder.status}
                                    </p>
                                    <p>
                                      <span className="font-medium">
                                        Total:
                                      </span>{" "}
                                      ${selectedOrder.total_amount.toFixed(2)}
                                    </p>
                                    <p>
                                      <span className="font-medium">
                                        Items:
                                      </span>{" "}
                                      {selectedOrder.items.length}
                                    </p>
                                    <p>
                                      <span className="font-medium">
                                        Created:
                                      </span>{" "}
                                      {new Date(
                                        selectedOrder.created_at
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="mb-2 font-medium">
                                    Shipping Address
                                  </h4>
                                  <div className="text-sm">
                                    <p>
                                      {
                                        selectedOrder.shipping_address
                                          .first_name
                                      }{" "}
                                      {selectedOrder.shipping_address.last_name}
                                    </p>
                                    <p>
                                      {
                                        selectedOrder.shipping_address
                                          .address_line_1
                                      }
                                    </p>
                                    {selectedOrder.shipping_address
                                      .address_line_2 && (
                                      <p>
                                        {
                                          selectedOrder.shipping_address
                                            .address_line_2
                                        }
                                      </p>
                                    )}
                                    <p>
                                      {selectedOrder.shipping_address.city},{" "}
                                      {selectedOrder.shipping_address.state}{" "}
                                      {
                                        selectedOrder.shipping_address
                                          .postal_code
                                      }
                                    </p>
                                    <p>
                                      {selectedOrder.shipping_address.country}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="mb-2 font-medium">
                                  Order Items
                                </h4>
                                <div className="space-y-2">
                                  {selectedOrder.items.map((item, index) => (
                                    <div
                                      key={index}
                                      className="rounded border p-3"
                                    >
                                      <div className="flex justify-between">
                                        <div>
                                          <p className="font-medium">
                                            Product ID: {item.product_id}
                                          </p>
                                          <p className="text-sm text-gray-600">
                                            Quantity: {item.quantity}
                                          </p>
                                          {item.customization && (
                                            <div className="mt-1 text-sm text-gray-600">
                                              {item.customization.text && (
                                                <p>
                                                  Text:{" "}
                                                  {item.customization.text}
                                                </p>
                                              )}
                                              {item.customization.color && (
                                                <p>
                                                  Color:{" "}
                                                  {item.customization.color}
                                                </p>
                                              )}
                                              {item.customization.size && (
                                                <p>
                                                  Size:{" "}
                                                  {item.customization.size}
                                                </p>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                        <div className="text-right">
                                          <p className="font-medium">
                                            ${item.total_price.toFixed(2)}
                                          </p>
                                          <p className="text-sm text-gray-600">
                                            ${item.unit_price.toFixed(2)} each
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {selectedOrder.tracking_info && (
                                <div>
                                  <h4 className="mb-2 font-medium">
                                    Tracking Information
                                  </h4>
                                  <div className="text-sm">
                                    <p>
                                      <span className="font-medium">
                                        Tracking Number:
                                      </span>{" "}
                                      {
                                        selectedOrder.tracking_info
                                          .tracking_number
                                      }
                                    </p>
                                    <p>
                                      <span className="font-medium">
                                        Carrier:
                                      </span>{" "}
                                      {selectedOrder.tracking_info.carrier}
                                    </p>
                                    {selectedOrder.tracking_info
                                      .estimated_delivery && (
                                      <p>
                                        <span className="font-medium">
                                          Estimated Delivery:
                                        </span>{" "}
                                        {new Date(
                                          selectedOrder.tracking_info.estimated_delivery
                                        ).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
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
    </div>
  );
}
