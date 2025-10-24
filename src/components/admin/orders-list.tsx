"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  RefreshCw,
  XCircle,
  CheckCircle,
  Clock,
  Truck,
  Package,
  AlertTriangle,
  FileText,
  DollarSign,
  MapPin,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// Mock order data
const orders = [
  {
    id: "order_567",
    merchantId: "m_901",
    customerName: "John Smith",
    customerEmail: "john@example.com",
    status: "processing",
    items: [
      {
        productId: "prod_234",
        sku: "CT-001-S",
        qty: 2,
        unitPrice: 12.5,
        productName: "Classic Tee",
      },
    ],
    shipping: {
      carrier: "DHL",
      service: "express",
      cost: 6.5,
      tracking: "DHL123456789",
      address: "123 Main St, New York, NY",
    },
    taxes: [{ type: "VAT", rate: 0.19, amount: 4.75 }],
    fees: [{ type: "service", description: "platform fee", amount: 2.5 }],
    total: 37.25,
    placedAt: "2025-10-20T14:12:00Z",
    providerId: "prov_123",
    providerName: "Acme Prints Ltd",
    country: "US",
  },
  {
    id: "order_568",
    merchantId: "m_902",
    customerName: "Sarah Johnson",
    customerEmail: "sarah@example.com",
    status: "fulfilled",
    items: [
      {
        productId: "prod_235",
        sku: "HD-001-M",
        qty: 1,
        unitPrice: 35.0,
        productName: "Premium Hoodie",
      },
    ],
    shipping: {
      carrier: "UPS",
      service: "standard",
      cost: 8.0,
      tracking: "UPS987654321",
      address: "456 Oak Ave, Los Angeles, CA",
    },
    taxes: [{ type: "VAT", rate: 0.08, amount: 2.8 }],
    fees: [{ type: "service", description: "platform fee", amount: 3.5 }],
    total: 49.3,
    placedAt: "2025-10-19T09:30:00Z",
    providerId: "prov_124",
    providerName: "PrintCraft Pro",
    country: "US",
  },
  {
    id: "order_569",
    merchantId: "m_903",
    customerName: "Mike Wilson",
    customerEmail: "mike@example.com",
    status: "pending",
    items: [
      {
        productId: "prod_236",
        sku: "MG-001",
        qty: 3,
        unitPrice: 8.5,
        productName: "Ceramic Mug",
      },
    ],
    shipping: {
      carrier: "FedEx",
      service: "overnight",
      cost: 12.0,
      tracking: null,
      address: "789 Pine St, Chicago, IL",
    },
    taxes: [{ type: "VAT", rate: 0.06, amount: 1.53 }],
    fees: [{ type: "service", description: "platform fee", amount: 2.55 }],
    total: 41.58,
    placedAt: "2025-10-21T16:45:00Z",
    providerId: "prov_125",
    providerName: "Quality Prints Inc",
    country: "US",
  },
  {
    id: "order_570",
    merchantId: "m_904",
    customerName: "Emma Davis",
    customerEmail: "emma@example.com",
    status: "cancelled",
    items: [
      {
        productId: "prod_237",
        sku: "TB-001",
        qty: 2,
        unitPrice: 15.0,
        productName: "Canvas Tote Bag",
      },
    ],
    shipping: {
      carrier: "USPS",
      service: "priority",
      cost: 5.5,
      tracking: null,
      address: "321 Elm St, Miami, FL",
    },
    taxes: [{ type: "VAT", rate: 0.07, amount: 2.1 }],
    fees: [{ type: "service", description: "platform fee", amount: 3.0 }],
    total: 40.6,
    placedAt: "2025-10-18T11:20:00Z",
    providerId: "prov_123",
    providerName: "Acme Prints Ltd",
    country: "US",
  },
];

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  processing: {
    label: "Processing",
    color: "bg-blue-100 text-blue-800",
    icon: Package,
  },
  fulfilled: {
    label: "Fulfilled",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
  refunded: {
    label: "Refunded",
    color: "bg-gray-100 text-gray-800",
    icon: RefreshCw,
  },
};

export function OrdersList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    const matchesProvider =
      providerFilter === "all" || order.providerId === providerFilter;

    return matchesSearch && matchesStatus && matchesProvider;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(filteredOrders.map((order) => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders([...selectedOrders, orderId]);
    } else {
      setSelectedOrders(selectedOrders.filter((id) => id !== orderId));
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Orders
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage and track all platform orders
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  1,247
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pending
                </p>
                <p className="text-2xl font-bold text-yellow-600">42</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Processing
                </p>
                <p className="text-2xl font-bold text-blue-600">189</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Fulfilled
                </p>
                <p className="text-2xl font-bold text-green-600">956</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Revenue
                </p>
                <p className="text-2xl font-bold text-purple-600">$284K</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="fulfilled">Fulfilled</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                <SelectItem value="prov_123">Acme Prints Ltd</SelectItem>
                <SelectItem value="prov_124">PrintCraft Pro</SelectItem>
                <SelectItem value="prov_125">Quality Prints Inc</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedOrders.length} order(s) selected
              </span>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Truck className="mr-2 h-4 w-4" />
                  Update Shipping
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Bulk Refund
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedOrders.length === filteredOrders.length &&
                      filteredOrders.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const statusInfo =
                  statusConfig[order.status as keyof typeof statusConfig];
                const StatusIcon = statusInfo.icon;
                const isSelected = selectedOrders.includes(order.id);

                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleSelectOrder(order.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {order.id}
                        </p>
                        {order.shipping.tracking && (
                          <p className="text-sm text-gray-500">
                            Tracking: {order.shipping.tracking}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-blue-500">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {order.customerName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.customerEmail}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusInfo.color}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">
                          {order.providerName}
                        </p>
                        <div className="mt-1 flex items-center space-x-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {order.country}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">
                          {order.items.reduce((sum, item) => sum + item.qty, 0)}{" "}
                          items
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.items[0]?.productName}
                          {order.items.length > 1 &&
                            ` +${order.items.length - 1} more`}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        ${order.total.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">
                        {new Date(order.placedAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Truck className="mr-2 h-4 w-4" />
                            Update Shipping
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            Download Invoice
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel Order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
