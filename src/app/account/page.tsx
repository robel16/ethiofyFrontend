"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Bell,
  Globe,
  Camera,
  Edit3,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Settings,
  LogOut,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { userService } from "@/services/user.service";
import toast from "react-hot-toast";

// Validation schemas
const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  company: z.string().optional(),
  date_of_birth: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
});

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain uppercase, lowercase, number and special character"
      ),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

const addressSchema = z.object({
  type: z.enum(["shipping", "billing"]),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  company: z.string().optional(),
  address_line_1: z.string().min(1, "Address is required"),
  address_line_2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  postal_code: z.string().min(1, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
  phone: z.string().optional(),
  is_default: z.boolean().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;
type AddressFormData = z.infer<typeof addressSchema>;

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
  avatar_url?: string;
  timezone?: string;
  language?: string;
  date_of_birth?: string;
  company?: string;
  preferences: {
    notifications?: {
      email: boolean;
      sms: boolean;
      push: boolean;
      marketing: boolean;
    };
    currency?: string;
    measurement_unit?: string;
  };
  addresses: Address[];
}

interface Address {
  id: string;
  type: "shipping" | "billing";
  first_name: string;
  last_name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
}

export default function AccountPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Form hooks
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const addressForm = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  });

  // Load profile data
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profile = await userService.getProfile();
      setProfile(profile);

      // Populate form with existing data
      profileForm.reset({
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        phone: response.data.phone || "",
        company: response.data.company || "",
        date_of_birth: response.data.date_of_birth || "",
        timezone: response.data.timezone || "",
        language: response.data.language || "",
      });
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("access_level", "private");
      formData.append("folder", `user-profiles/${user?.id}/avatar`);
      formData.append("tags", "profile-image,avatar,customer");
      formData.append("generate_thumbnail", "true");
      formData.append("generate_preview", "true");

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Update profile with new avatar URL
        await userService.updateProfile({ avatar_url: result.data.url });
        setProfile((prev) =>
          prev ? { ...prev, avatar_url: result.data.url } : null
        );
        toast.success("Avatar updated successfully");
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast.error("Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handle profile update
  const onUpdateProfile = async (data: ProfileFormData) => {
    try {
      await userService.updateProfile(data);
      toast.success("Profile updated successfully");
      loadProfile();
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  // Handle password change
  const onChangePassword = async (data: PasswordFormData) => {
    try {
      await userService.changePassword(data);
      toast.success("Password changed successfully");
      passwordForm.reset();
      setShowPasswordForm(false);
    } catch (error) {
      toast.error("Failed to change password");
    }
  };

  // Handle preferences update
  const updatePreferences = async (preferences: any) => {
    try {
      await userService.updatePreferences(preferences);
      toast.success("Preferences updated successfully");
      loadProfile();
    } catch (error) {
      toast.error("Failed to update preferences");
    }
  };

  // Handle address operations
  const onAddAddress = async (data: AddressFormData) => {
    try {
      await userService.addAddress(data);
      toast.success("Address added successfully");
      addressForm.reset();
      setShowAddressForm(false);
      loadProfile();
    } catch (error) {
      toast.error("Failed to add address");
    }
  };

  const onUpdateAddress = async (data: AddressFormData) => {
    if (!editingAddress) return;

    try {
      await userService.updateAddress(editingAddress.id, data);
      toast.success("Address updated successfully");
      addressForm.reset();
      setEditingAddress(null);
      setShowAddressForm(false);
      loadProfile();
    } catch (error) {
      toast.error("Failed to update address");
    }
  };

  const onDeleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      await userService.deleteAddress(addressId);
      toast.success("Address deleted successfully");
      loadProfile();
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  // Handle account deactivation
  const handleDeactivateAccount = async () => {
    if (
      !confirm(
        "Are you sure you want to deactivate your account? This action cannot be undone."
      )
    )
      return;

    try {
      await userService.deactivateAccount();
      toast.success("Account deactivated successfully");
      // Redirect to login or home page
      window.location.href = "/";
    } catch (error) {
      toast.error("Failed to deactivate account");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            Account Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account preferences and settings
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Addresses
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Preferences
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  My Profile
                </CardTitle>
                <CardDescription>
                  Update your personal information and profile picture
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-10 w-10 text-primary" />
                      )}
                    </div>
                    <label className="absolute -bottom-2 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary/90">
                      <Camera className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={uploadingAvatar}
                      />
                    </label>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {profile?.first_name} {profile?.last_name}
                    </h3>
                    <p className="text-muted-foreground">{profile?.email}</p>
                    <p className="text-sm capitalize text-muted-foreground">
                      {profile?.role}
                    </p>
                  </div>
                </div>

                {/* Profile Form */}
                <form
                  onSubmit={profileForm.handleSubmit(onUpdateProfile)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        {...profileForm.register("first_name")}
                        className="h-11"
                      />
                      {profileForm.formState.errors.first_name && (
                        <p className="text-sm text-destructive">
                          {profileForm.formState.errors.first_name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        {...profileForm.register("last_name")}
                        className="h-11"
                      />
                      {profileForm.formState.errors.last_name && (
                        <p className="text-sm text-destructive">
                          {profileForm.formState.errors.last_name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        {...profileForm.register("phone")}
                        className="h-11"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        {...profileForm.register("company")}
                        className="h-11"
                        placeholder="Your company name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth">Date of Birth</Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        {...profileForm.register("date_of_birth")}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select
                        onValueChange={(value) =>
                          profileForm.setValue("timezone", value)
                        }
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/New_York">
                            Eastern Time
                          </SelectItem>
                          <SelectItem value="America/Chicago">
                            Central Time
                          </SelectItem>
                          <SelectItem value="America/Denver">
                            Mountain Time
                          </SelectItem>
                          <SelectItem value="America/Los_Angeles">
                            Pacific Time
                          </SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button type="submit" className="w-full md:w-auto">
                    Update Profile
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Account Security
                </CardTitle>
                <CardDescription>
                  Manage your password and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Section */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email Address</p>
                      <p className="text-sm text-muted-foreground">
                        {profile?.email}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Change Email
                  </Button>
                </div>

                {/* Password Section */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Password</p>
                      <p className="text-sm text-muted-foreground">
                        ••••••••••••
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                  >
                    Change Password
                  </Button>
                </div>

                {/* Password Change Form */}
                {showPasswordForm && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Change Password</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form
                        onSubmit={passwordForm.handleSubmit(onChangePassword)}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="current_password">
                            Current Password
                          </Label>
                          <div className="relative">
                            <Input
                              id="current_password"
                              type={showPassword ? "text" : "password"}
                              {...passwordForm.register("current_password")}
                              className="h-11 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                          {passwordForm.formState.errors.current_password && (
                            <p className="text-sm text-destructive">
                              {
                                passwordForm.formState.errors.current_password
                                  .message
                              }
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="new_password">New Password</Label>
                          <div className="relative">
                            <Input
                              id="new_password"
                              type={showNewPassword ? "text" : "password"}
                              {...passwordForm.register("new_password")}
                              className="h-11 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowNewPassword(!showNewPassword)
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                          {passwordForm.formState.errors.new_password && (
                            <p className="text-sm text-destructive">
                              {
                                passwordForm.formState.errors.new_password
                                  .message
                              }
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirm_password">
                            Confirm New Password
                          </Label>
                          <div className="relative">
                            <Input
                              id="confirm_password"
                              type={showConfirmPassword ? "text" : "password"}
                              {...passwordForm.register("confirm_password")}
                              className="h-11 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                          {passwordForm.formState.errors.confirm_password && (
                            <p className="text-sm text-destructive">
                              {
                                passwordForm.formState.errors.confirm_password
                                  .message
                              }
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button type="submit">Change Password</Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowPasswordForm(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {/* Danger Zone */}
                <Card className="border-destructive/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-5 w-5" />
                      Danger Zone
                    </CardTitle>
                    <CardDescription>
                      Irreversible and destructive actions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between rounded-lg border border-destructive/20 p-4">
                      <div>
                        <p className="font-medium text-destructive">
                          Deactivate Account
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete your account and all associated
                          data
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeactivateAccount}
                      >
                        Deactivate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Saved Addresses
                    </CardTitle>
                    <CardDescription>
                      Manage your shipping and billing addresses
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => {
                      setEditingAddress(null);
                      addressForm.reset();
                      setShowAddressForm(true);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Address
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Address List */}
                {profile?.addresses?.map((address) => (
                  <div key={address.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {address.first_name} {address.last_name}
                          </span>
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${
                              address.type === "shipping"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {address.type}
                          </span>
                          {address.is_default && (
                            <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                              Default
                            </span>
                          )}
                        </div>
                        {address.company && (
                          <p className="text-sm text-muted-foreground">
                            {address.company}
                          </p>
                        )}
                        <p className="text-sm">
                          {address.address_line_1}
                          {address.address_line_2 &&
                            `, ${address.address_line_2}`}
                        </p>
                        <p className="text-sm">
                          {address.city}, {address.state} {address.postal_code}
                        </p>
                        <p className="text-sm">{address.country}</p>
                        {address.phone && (
                          <p className="text-sm text-muted-foreground">
                            {address.phone}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingAddress(address);
                            addressForm.reset(address);
                            setShowAddressForm(true);
                          }}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeleteAddress(address.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {(!profile?.addresses || profile.addresses.length === 0) && (
                  <div className="py-8 text-center">
                    <MapPin className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No addresses saved yet
                    </p>
                    <Button
                      onClick={() => setShowAddressForm(true)}
                      className="mt-4"
                    >
                      Add Your First Address
                    </Button>
                  </div>
                )}

                {/* Address Form */}
                {showAddressForm && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {editingAddress ? "Edit Address" : "Add New Address"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form
                        onSubmit={addressForm.handleSubmit(
                          editingAddress ? onUpdateAddress : onAddAddress
                        )}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="address_type">Address Type</Label>
                            <Select
                              onValueChange={(value) =>
                                addressForm.setValue(
                                  "type",
                                  value as "shipping" | "billing"
                                )
                              }
                            >
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="shipping">
                                  Shipping
                                </SelectItem>
                                <SelectItem value="billing">Billing</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="address_first_name">
                              First Name
                            </Label>
                            <Input
                              id="address_first_name"
                              {...addressForm.register("first_name")}
                              className="h-11"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="address_last_name">Last Name</Label>
                            <Input
                              id="address_last_name"
                              {...addressForm.register("last_name")}
                              className="h-11"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="address_company">
                              Company (Optional)
                            </Label>
                            <Input
                              id="address_company"
                              {...addressForm.register("company")}
                              className="h-11"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="address_line_1">Address Line 1</Label>
                          <Input
                            id="address_line_1"
                            {...addressForm.register("address_line_1")}
                            className="h-11"
                            placeholder="Street address"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="address_line_2">
                            Address Line 2 (Optional)
                          </Label>
                          <Input
                            id="address_line_2"
                            {...addressForm.register("address_line_2")}
                            className="h-11"
                            placeholder="Apartment, suite, etc."
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label htmlFor="address_city">City</Label>
                            <Input
                              id="address_city"
                              {...addressForm.register("city")}
                              className="h-11"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="address_state">
                              State/Province
                            </Label>
                            <Input
                              id="address_state"
                              {...addressForm.register("state")}
                              className="h-11"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="address_postal_code">
                              Postal Code
                            </Label>
                            <Input
                              id="address_postal_code"
                              {...addressForm.register("postal_code")}
                              className="h-11"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="address_country">Country</Label>
                            <Select
                              onValueChange={(value) =>
                                addressForm.setValue("country", value)
                              }
                            >
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="US">
                                  United States
                                </SelectItem>
                                <SelectItem value="CA">Canada</SelectItem>
                                <SelectItem value="GB">
                                  United Kingdom
                                </SelectItem>
                                <SelectItem value="AU">Australia</SelectItem>
                                <SelectItem value="DE">Germany</SelectItem>
                                <SelectItem value="FR">France</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="address_phone">
                              Phone (Optional)
                            </Label>
                            <Input
                              id="address_phone"
                              type="tel"
                              {...addressForm.register("phone")}
                              className="h-11"
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="is_default"
                            {...addressForm.register("is_default")}
                            className="rounded border-border"
                          />
                          <Label htmlFor="is_default" className="text-sm">
                            Set as default address
                          </Label>
                        </div>

                        <div className="flex gap-2">
                          <Button type="submit">
                            {editingAddress ? "Update Address" : "Add Address"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowAddressForm(false);
                              setEditingAddress(null);
                              addressForm.reset();
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose how you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive order updates and important announcements
                      </p>
                    </div>
                    <Switch
                      checked={
                        profile?.preferences?.notifications?.email ?? true
                      }
                      onCheckedChange={(checked) =>
                        updatePreferences({
                          notifications: {
                            ...profile?.preferences?.notifications,
                            email: checked,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Get text messages for urgent updates
                      </p>
                    </div>
                    <Switch
                      checked={
                        profile?.preferences?.notifications?.sms ?? false
                      }
                      onCheckedChange={(checked) =>
                        updatePreferences({
                          notifications: {
                            ...profile?.preferences?.notifications,
                            sms: checked,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Browser notifications for real-time updates
                      </p>
                    </div>
                    <Switch
                      checked={
                        profile?.preferences?.notifications?.push ?? true
                      }
                      onCheckedChange={(checked) =>
                        updatePreferences({
                          notifications: {
                            ...profile?.preferences?.notifications,
                            push: checked,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Marketing Communications</p>
                      <p className="text-sm text-muted-foreground">
                        Promotional emails and special offers
                      </p>
                    </div>
                    <Switch
                      checked={
                        profile?.preferences?.notifications?.marketing ?? false
                      }
                      onCheckedChange={(checked) =>
                        updatePreferences({
                          notifications: {
                            ...profile?.preferences?.notifications,
                            marketing: checked,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Regional Preferences
                </CardTitle>
                <CardDescription>
                  Set your currency and measurement preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select
                      value={profile?.preferences?.currency || "USD"}
                      onValueChange={(value) =>
                        updatePreferences({ currency: value })
                      }
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="CAD">
                          CAD - Canadian Dollar
                        </SelectItem>
                        <SelectItem value="AUD">
                          AUD - Australian Dollar
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Measurement Unit</Label>
                    <Select
                      value={profile?.preferences?.measurement_unit || "metric"}
                      onValueChange={(value) =>
                        updatePreferences({ measurement_unit: value })
                      }
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="metric">Metric (cm, kg)</SelectItem>
                        <SelectItem value="imperial">
                          Imperial (in, lb)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
