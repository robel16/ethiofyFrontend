"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  MapPin,
  Building2,
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

// Mock data
const providers = [
  {
    id: "prov_123",
    companyName: "Acme Prints Ltd",
    email: "ops@acme.example",
    country: "DE",
    status: "active",
    kyc: {
      vatId: "DE123456789",
      businessRegistrationNumber: "HRB12345",
      verifiedAt: "2025-09-12T10:00:00Z",
    },
    performance: {
      avgFulfillmentHours: 48,
      returnRate: 0.02,
      rating: 4.6,
    },
    totalOrders: 1247,
    totalRevenue: 28450,
    joinedAt: "2024-03-15",
  },
  {
    id: "prov_124",
    companyName: "PrintCraft Pro",
    email: "hello@printcraft.com",
    country: "US",
    status: "pending",
    kyc: {
      vatId: null,
      businessRegistrationNumber: "LLC-789456",
      verifiedAt: null,
    },
    performance: {
      avgFulfillmentHours: 36,
      returnRate: 0.015,
      rating: 4.8,
    },
    totalOrders: 892,
    totalRevenue: 21340,
    joinedAt: "2024-08-22",
  },
  {
    id: "prov_125",
    companyName: "Quality Prints Inc",
    email: "support@qualityprints.co.uk",
    country: "GB",
    status: "suspended",
    kyc: {
      vatId: "GB987654321",
      businessRegistrationNumber: "12345678",
      verifiedAt: "2024-01-20T15:30:00Z",
    },
    performance: {
      avgFulfillmentHours: 72,
      returnRate: 0.08,
      rating: 3.2,
    },
    totalOrders: 156,
    totalRevenue: 4890,
    joinedAt: "2023-11-10",
  },
];

const statusConfig = {
  active: {
    label: "Active",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  suspended: {
    label: "Suspended",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
  rejected: {
    label: "Rejected",
    color: "bg-gray-100 text-gray-800",
    icon: XCircle,
  },
};

export function ProvidersList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");

  const filteredProviders = providers.filter((provider) => {
    const matchesSearch =
      provider.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || provider.status === statusFilter;
    const matchesCountry =
      countryFilter === "all" || provider.country === countryFilter;

    return matchesSearch && matchesStatus && matchesCountry;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Providers
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage your print providers and their performance
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Provider
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Providers
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  247
                </p>
              </div>
              <Building2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Active
                </p>
                <p className="text-2xl font-bold text-green-600">189</p>
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
                  Avg Rating
                </p>
                <p className="text-2xl font-bold text-purple-600">4.2</p>
              </div>
              <Star className="h-8 w-8 text-purple-500" />
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
                placeholder="Search providers..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="DE">Germany</SelectItem>
                <SelectItem value="GB">United Kingdom</SelectItem>
                <SelectItem value="CA">Canada</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Providers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Providers ({filteredProviders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProviders.map((provider) => {
                const statusInfo =
                  statusConfig[provider.status as keyof typeof statusConfig];
                const StatusIcon = statusInfo.icon;

                return (
                  <TableRow key={provider.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
                          <span className="text-sm font-medium text-white">
                            {provider.companyName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {provider.companyName}
                          </p>
                          <div className="mt-1 flex items-center space-x-2">
                            <p className="text-sm text-gray-500">
                              {provider.email}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              <MapPin className="mr-1 h-3 w-3" />
                              {provider.country}
                            </Badge>
                          </div>
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
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Star className="h-3 w-3 fill-current text-yellow-400" />
                          <span className="text-sm">
                            {provider.performance.rating}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {provider.performance.avgFulfillmentHours}h avg •{" "}
                          {(provider.performance.returnRate * 100).toFixed(1)}%
                          returns
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {provider.totalOrders.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        ${provider.totalRevenue.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">
                        {new Date(provider.joinedAt).toLocaleDateString()}
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
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Provider
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Suspend Provider
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
