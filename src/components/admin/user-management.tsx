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
import { Textarea } from "@/components/ui/textarea";
import { Loading } from "@/components/ui/loading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  Search,
  Filter,
  Eye,
  Ban,
  CheckCircle,
  AlertTriangle,
  Mail,
  Calendar,
  Activity,
  MoreHorizontal,
  UserCheck,
  UserX,
  Shield,
  RefreshCw,
  Download,
} from "lucide-react";
import { UserService, User } from "@/services/user.service";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

interface UserFilters {
  role: string;
  status: string;
  search: string;
  date_from: string;
  date_to: string;
  sort_by: string;
  sort_order: "asc" | "desc";
}

interface UserAction {
  type: "suspend" | "activate" | "delete" | "promote" | "demote";
  reason: string;
  duration?: number; // for suspensions
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [userAction, setUserAction] = useState<UserAction>({
    type: "suspend",
    reason: "",
  });

  const [filters, setFilters] = useState<UserFilters>({
    role: "",
    status: "",
    search: "",
    date_from: "",
    date_to: "",
    sort_by: "created_at",
    sort_order: "desc",
  });

  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    has_more: false,
  });

  const [stats, setStats] = useState({
    total_users: 0,
    active_users: 0,
    suspended_users: 0,
    new_users_today: 0,
    customers: 0,
    providers: 0,
    admins: 0,
  });

  const userService = UserService.getInstance();

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);

      // Mock data for demo - in real app, use actual API
      const mockUsers: User[] = [
        {
          id: "user_1",
          email: "john.doe@example.com",
          name: "John Doe",
          role: "customer",
          status: "active",
          created_at: new Date(
            Date.now() - 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          updated_at: new Date().toISOString(),
          last_login: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          profile: {
            phone: "+1234567890",
            address: {
              street: "123 Main St",
              city: "New York",
              state: "NY",
              zipCode: "10001",
              country: "US",
            },
          },
        },
        {
          id: "user_2",
          email: "jane.smith@printco.com",
          name: "Jane Smith",
          role: "print_provider",
          status: "active",
          created_at: new Date(
            Date.now() - 60 * 24 * 60 * 60 * 1000
          ).toISOString(),
          updated_at: new Date().toISOString(),
          last_login: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          profile: {
            phone: "+1987654321",
            company: "Premium Print Co",
          },
        },
        {
          id: "user_3",
          email: "mike.wilson@example.com",
          name: "Mike Wilson",
          role: "customer",
          status: "suspended",
          created_at: new Date(
            Date.now() - 15 * 24 * 60 * 60 * 1000
          ).toISOString(),
          updated_at: new Date().toISOString(),
          last_login: new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          suspension: {
            reason: "Multiple policy violations",
            suspended_at: new Date(
              Date.now() - 3 * 24 * 60 * 60 * 1000
            ).toISOString(),
            suspended_by: "admin_1",
            expires_at: new Date(
              Date.now() + 4 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
        },
      ];

      setUsers(mockUsers);
      setStats({
        total_users: mockUsers.length,
        active_users: mockUsers.filter((u) => u.status === "active").length,
        suspended_users: mockUsers.filter((u) => u.status === "suspended")
          .length,
        new_users_today: 5,
        customers: mockUsers.filter((u) => u.role === "customer").length,
        providers: mockUsers.filter((u) => u.role === "print_provider").length,
        admins: mockUsers.filter((u) => u.role === "admin").length,
      });
    } catch (error: any) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const executeUserAction = async (userId: string, action: UserAction) => {
    try {
      setUpdating(userId);

      switch (action.type) {
        case "suspend":
          await userService.suspendUser(userId, action.reason, action.duration);
          break;
        case "activate":
          await userService.activateUser(userId);
          break;
        case "delete":
          await userService.deleteUser(userId, action.reason);
          break;
        default:
          throw new Error(`Unsupported action: ${action.type}`);
      }

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === userId
            ? {
                ...user,
                status:
                  action.type === "suspend"
                    ? "suspended"
                    : action.type === "activate"
                      ? "active"
                      : user.status,
                updated_at: new Date().toISOString(),
              }
            : user
        )
      );

      setShowActionDialog(false);
      setSelectedUser(null);
      setUserAction({ type: "suspend", reason: "" });

      toast.success(`User ${action.type}d successfully`);
    } catch (error: any) {
      console.error(`Error ${action.type}ing user:`, error);
      toast.error(`Failed to ${action.type} user`);
    } finally {
      setUpdating(null);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "print_provider":
        return "default";
      case "customer":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "secondary";
      case "suspended":
        return "destructive";
      case "pending":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "suspended":
        return <Ban className="h-4 w-4 text-red-600" />;
      case "pending":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredAndSortedUsers = users
    .filter((user) => {
      if (
        filters.search &&
        !user.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !user.email.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }
      if (filters.role && user.role !== filters.role) {
        return false;
      }
      if (filters.status && user.status !== filters.status) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sort_by) {
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "email":
          aValue = a.email;
          bValue = b.email;
          break;
        case "role":
          aValue = a.role;
          bValue = b.role;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "last_login":
          aValue = new Date(a.last_login || 0).getTime();
          bValue = new Date(b.last_login || 0).getTime();
          break;
        default:
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
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
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">
            Manage platform users and their permissions
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadUsers}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Users
          </Button>
        </div>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_users}</div>
            <p className="text-xs text-muted-foreground">
              {stats.new_users_today} new today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.active_users}
            </div>
            <p className="text-xs text-muted-foreground">
              {((stats.active_users / stats.total_users) * 100).toFixed(1)}% of
              total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.suspended_users}
            </div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">By Role</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Customers</span>
                <span>{stats.customers}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Providers</span>
                <span>{stats.providers}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Admins</span>
                <span>{stats.admins}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="Search users..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="pl-10"
              />
            </div>

            <Select
              value={filters.role}
              onValueChange={(value) => setFilters({ ...filters, role: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Roles</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="print_provider">Print Provider</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>

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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
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
                <SelectItem value="created_at">Date Created</SelectItem>
                <SelectItem value="last_login">Last Login</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="role">Role</SelectItem>
                <SelectItem value="status">Status</SelectItem>
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

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredAndSortedUsers.length})</CardTitle>
          <CardDescription>
            Manage user accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loading />
            </div>
          ) : filteredAndSortedUsers.length === 0 ? (
            <div className="py-8 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-gray-500">No users found</p>
              <p className="mt-1 text-sm text-gray-400">
                Try adjusting your search criteria
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedUsers.map((user) => (
                <div
                  key={user.id}
                  className="rounded-lg border p-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                        <Users className="h-6 w-6 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{user.name}</h3>
                          <Badge
                            variant={getRoleBadgeVariant(user.role)}
                            className="capitalize"
                          >
                            {user.role.replace("_", " ")}
                          </Badge>
                          <Badge
                            variant={getStatusBadgeVariant(user.status)}
                            className="capitalize"
                          >
                            {user.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            Joined{" "}
                            {formatDistanceToNow(new Date(user.created_at), {
                              addSuffix: true,
                            })}
                          </span>
                          {user.last_login && (
                            <>
                              <span>•</span>
                              <span className="flex items-center">
                                <Activity className="mr-1 h-3 w-3" />
                                Last login{" "}
                                {formatDistanceToNow(
                                  new Date(user.last_login),
                                  { addSuffix: true }
                                )}
                              </span>
                            </>
                          )}
                          {user.suspension && (
                            <>
                              <span>•</span>
                              <span className="text-red-600">
                                Suspended: {user.suspension.reason}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Dialog
                        open={showUserDetails && selectedUser?.id === user.id}
                        onOpenChange={(open) => {
                          setShowUserDetails(open);
                          if (!open) setSelectedUser(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserDetails(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>User Details</DialogTitle>
                          </DialogHeader>
                          {selectedUser && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">
                                    Name
                                  </label>
                                  <p className="text-sm text-gray-600">
                                    {selectedUser.name}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">
                                    Email
                                  </label>
                                  <p className="text-sm text-gray-600">
                                    {selectedUser.email}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">
                                    Role
                                  </label>
                                  <Badge
                                    variant={getRoleBadgeVariant(
                                      selectedUser.role
                                    )}
                                    className="capitalize"
                                  >
                                    {selectedUser.role.replace("_", " ")}
                                  </Badge>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">
                                    Status
                                  </label>
                                  <Badge
                                    variant={getStatusBadgeVariant(
                                      selectedUser.status
                                    )}
                                    className="capitalize"
                                  >
                                    {selectedUser.status}
                                  </Badge>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">
                                    Created
                                  </label>
                                  <p className="text-sm text-gray-600">
                                    {new Date(
                                      selectedUser.created_at
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">
                                    Last Login
                                  </label>
                                  <p className="text-sm text-gray-600">
                                    {selectedUser.last_login
                                      ? new Date(
                                          selectedUser.last_login
                                        ).toLocaleDateString()
                                      : "Never"}
                                  </p>
                                </div>
                              </div>

                              {selectedUser.profile && (
                                <div>
                                  <label className="text-sm font-medium">
                                    Profile Information
                                  </label>
                                  <div className="mt-2 rounded-lg bg-gray-50 p-3">
                                    {selectedUser.profile.phone && (
                                      <p className="text-sm">
                                        Phone: {selectedUser.profile.phone}
                                      </p>
                                    )}
                                    {selectedUser.profile.company && (
                                      <p className="text-sm">
                                        Company: {selectedUser.profile.company}
                                      </p>
                                    )}
                                    {selectedUser.profile.address && (
                                      <p className="text-sm">
                                        Address:{" "}
                                        {selectedUser.profile.address.street},{" "}
                                        {selectedUser.profile.address.city}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}

                              {selectedUser.suspension && (
                                <Alert variant="destructive">
                                  <AlertTriangle className="h-4 w-4" />
                                  <AlertDescription>
                                    <strong>Suspended:</strong>{" "}
                                    {selectedUser.suspension.reason}
                                    <br />
                                    <span className="text-xs">
                                      Suspended on{" "}
                                      {new Date(
                                        selectedUser.suspension.suspended_at
                                      ).toLocaleDateString()}
                                      {selectedUser.suspension.expires_at &&
                                        ` • Expires ${new Date(selectedUser.suspension.expires_at).toLocaleDateString()}`}
                                    </span>
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Dialog
                        open={showActionDialog && selectedUser?.id === user.id}
                        onOpenChange={(open) => {
                          setShowActionDialog(open);
                          if (!open) {
                            setSelectedUser(null);
                            setUserAction({ type: "suspend", reason: "" });
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowActionDialog(true);
                            }}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>User Actions</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">
                                Action
                              </label>
                              <Select
                                value={userAction.type}
                                onValueChange={(value: any) =>
                                  setUserAction({ ...userAction, type: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {user.status === "active" && (
                                    <SelectItem value="suspend">
                                      Suspend User
                                    </SelectItem>
                                  )}
                                  {user.status === "suspended" && (
                                    <SelectItem value="activate">
                                      Activate User
                                    </SelectItem>
                                  )}
                                  <SelectItem value="delete">
                                    Delete User
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <label className="text-sm font-medium">
                                Reason
                              </label>
                              <Textarea
                                value={userAction.reason}
                                onChange={(e) =>
                                  setUserAction({
                                    ...userAction,
                                    reason: e.target.value,
                                  })
                                }
                                placeholder="Enter reason for this action..."
                                rows={3}
                              />
                            </div>

                            {userAction.type === "suspend" && (
                              <div>
                                <label className="text-sm font-medium">
                                  Duration (days)
                                </label>
                                <Input
                                  type="number"
                                  value={userAction.duration || ""}
                                  onChange={(e) =>
                                    setUserAction({
                                      ...userAction,
                                      duration:
                                        parseInt(e.target.value) || undefined,
                                    })
                                  }
                                  placeholder="Leave empty for indefinite"
                                />
                              </div>
                            )}
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setShowActionDialog(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant={
                                userAction.type === "delete"
                                  ? "destructive"
                                  : "default"
                              }
                              onClick={() =>
                                executeUserAction(user.id, userAction)
                              }
                              disabled={
                                !userAction.reason.trim() ||
                                updating === user.id
                              }
                            >
                              {updating === user.id
                                ? "Processing..."
                                : `${userAction.type} User`}
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
    </div>
  );
}
