"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  MapPin,
  Building2,
  Shield,
  Ban,
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
import { toast } from "react-hot-toast";
import { providerService, Provider } from "@/services/provider.service";
import { ProviderRegistrationForm } from "./provider-registration-form";

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
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    avgRating: 0,
  });

  // Fetch providers data
  const fetchProviders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await providerService.getAllProviders({
        status: statusFilter !== "all" ? statusFilter : undefined,
        page: 1,
        limit: 50,
      });

      if (response.success) {
        setProviders(response.data.providers);

        // Calculate stats
        const total = response.data.providers.length;
        const active = response.data.providers.filter(
          (p) => p.status === "active"
        ).length;
        const pending = response.data.providers.filter(
          (p) => p.status === "pending"
        ).length;
        const avgRating =
          response.data.providers.reduce(
            (sum, p) => sum + (p.performance.rating || 0),
            0
          ) / total;

        setStats({
          total,
          active,
          pending,
          avgRating: Number(avgRating.toFixed(1)),
        });
      }
    } catch (error) {
      console.error("Failed to fetch providers:", error);
      toast.error("Failed to load providers");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]); // Only depend on statusFilter

  // Fetch providers on component mount and when status filter changes
  useEffect(() => {
    fetchProviders();
  }, [fetchProviders, statusFilter]); // Remove fetchProviders from dependencies to prevent infinite loop

  const handleVerifyProvider = async (providerId: string) => {
    try {
      await providerService.verifyProvider(providerId);
      toast.success("Provider verified successfully");
      fetchProviders(); // Refresh the list
    } catch (error) {
      toast.error("Failed to verify provider");
    }
  };

  const handleSuspendProvider = async (providerId: string, reason: string) => {
    try {
      await providerService.suspendProvider(providerId, reason);
      toast.success("Provider suspended successfully");
      fetchProviders(); // Refresh the list
    } catch (error) {
      toast.error("Failed to suspend provider");
    }
  };

  const filteredProviders = providers.filter((provider) => {
    const matchesSearch =
      provider.company_info.company_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      provider.company_info.contact_email
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || provider.status === statusFilter;
    const matchesCountry =
      countryFilter === "all" ||
      provider.company_info.address.country === countryFilter;

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
        <Button onClick={() => setShowRegistrationForm(true)}>
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
                  {stats.total}
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
                <p className="text-2xl font-bold text-green-600">
                  {stats.active}
                </p>
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
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pending}
                </p>
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
                <p className="text-2xl font-bold text-purple-600">
                  {stats.avgRating}
                </p>
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
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
                <p className="mt-2 text-sm text-gray-500">
                  Loading providers...
                </p>
              </div>
            </div>
          ) : (
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
                    <TableRow key={provider.provider_id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
                            <span className="text-sm font-medium text-white">
                              {provider.company_info.company_name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {provider.company_info.company_name}
                            </p>
                            <div className="mt-1 flex items-center space-x-2">
                              <p className="text-sm text-gray-500">
                                {provider.company_info.contact_email}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                <MapPin className="mr-1 h-3 w-3" />
                                {provider.company_info.address.country}
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
                            {provider.performance.avg_fulfillment_hours || 0}h
                            avg •{" "}
                            {(
                              (provider.performance.return_rate || 0) * 100
                            ).toFixed(1)}
                            % returns
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {provider.performance.total_orders.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">$0</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {new Date(provider.created_at).toLocaleDateString()}
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
                            {provider.verification.status === "pending" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleVerifyProvider(provider.provider_id)
                                }
                                className="text-green-600"
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                Verify Provider
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {provider.status === "active" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleSuspendProvider(
                                    provider.provider_id,
                                    "Administrative action"
                                  )
                                }
                                className="text-red-600"
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                Suspend Provider
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Provider Registration Form */}
      <ProviderRegistrationForm
        open={showRegistrationForm}
        onOpenChange={setShowRegistrationForm}
        onSuccess={fetchProviders}
      />
    </div>
  );
}
