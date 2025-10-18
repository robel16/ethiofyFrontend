"use client";

import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useUserPreferences,
  useUpdateNotificationPreferences,
} from "@/hooks/use-user-preferences";
import {
  User,
  Bell,
  Camera,
  Eye,
  EyeOff,
  Settings,
  ArrowLeft,
  MapPin,
  LogOut,
  Plus,
  Monitor,
  Moon,
  Sun,
  Globe,
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
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/auth-context";
import { userService } from "@/services/user.service";
import toast from "react-hot-toast";
import { AddressCard } from "./address-card";

// Validation schemas
const profileSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
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
  type: z.enum(["billing", "shipping"]),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  company: z.string().optional(),
  address_line_1: z.string().min(1, "Address is required"),
  address_line_2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postal_code: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().optional(),
  is_default: z.boolean().default(false),
  street: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;
type AddressFormData = z.infer<typeof addressSchema>;

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: string;
  avatar_url?: string;
  timezone?: string;
  language?: string;
  date_of_birth?: string;
  company?: string;
  profile?: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    company?: string;
    avatar_url?: string;
    timezone?: string;
    language?: string;
    date_of_birth?: string;
  };
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
  addresses: unknown[];
}

interface Address {
  id: string;
  type: "billing" | "shipping";
  first_name: string;
  last_name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
  street: string;
}

interface AccountSettingsProps {
  onBack: () => void;
}

// Address Form Component (moved outside of AccountSettings)
function AddressForm({
  address,
  onSubmit,
  onCancel,
}: {
  address: Address | null;
  onSubmit: (data: AddressFormData) => void;
  onCancel: () => void;
}) {
  const addressForm = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: address || {
      type: "shipping",
      first_name: "",
      last_name: "",
      address_line_1: "",
      city: "",
      state: "",
      postal_code: "",
      country: "",
      is_default: false,
    },
  });

  // Use useEffect to reset form when 'address' prop changes
  useEffect(() => {
    addressForm.reset(
      address || {
        type: "shipping",
        first_name: "",
        last_name: "",
        address_line_1: "",
        city: "",
        state: "",
        postal_code: "",
        country: "",
        is_default: false,
      }
    );
  }, [address, addressForm]);

  return (
    <form onSubmit={addressForm.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="address_type">Type</Label>
          <select
            id="address_type"
            {...addressForm.register("type")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="billing">Billing</option>
            <option value="shipping">Shipping</option>
          </select>
        </div>
        <div className="mt-6 flex items-center space-x-2">
          <Switch
            id="is_default"
            checked={addressForm.watch("is_default")}
            onCheckedChange={(checked) =>
              addressForm.setValue("is_default", checked)
            }
          />
          <Label htmlFor="is_default">Set as default</Label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="address_first_name">First Name</Label>
          <Input
            id="address_first_name"
            {...addressForm.register("first_name")}
            placeholder="Enter first name"
            className="dark:bg-gray-700 dark:text-white"
          />
          {addressForm.formState.errors.first_name && (
            <p className="text-sm text-red-600">
              {addressForm.formState.errors.first_name.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="address_last_name">Last Name</Label>
          <Input
            id="address_last_name"
            {...addressForm.register("last_name")}
            placeholder="Enter last name"
            className="dark:bg-gray-700 dark:text-white"
          />
          {addressForm.formState.errors.last_name && (
            <p className="text-sm text-red-600">
              {addressForm.formState.errors.last_name.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="address_company">Company (Optional)</Label>
        <Input
          id="address_company"
          {...addressForm.register("company")}
          placeholder="Enter company name"
          className="dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <Label htmlFor="address_line_1">Address Line 1</Label>
        <Input
          id="address_line_1"
          {...addressForm.register("address_line_1")}
          placeholder="Enter street address"
          className="dark:bg-gray-700 dark:text-white"
        />
        {addressForm.formState.errors.address_line_1 && (
          <p className="text-sm text-red-600">
            {addressForm.formState.errors.address_line_1.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="address_line_2">Address Line 2 (Optional)</Label>
        <Input
          id="address_line_2"
          {...addressForm.register("address_line_2")}
          placeholder="Apartment, suite, etc."
          className="dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="address_city">City</Label>
          <Input
            id="address_city"
            {...addressForm.register("city")}
            placeholder="Enter city"
            className="dark:bg-gray-700 dark:text-white"
          />
          {addressForm.formState.errors.city && (
            <p className="text-sm text-red-600">
              {addressForm.formState.errors.city.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="address_state">State</Label>
          <Input
            id="address_state"
            {...addressForm.register("state")}
            placeholder="Enter state"
            className="dark:bg-gray-700 dark:text-white"
          />
          {addressForm.formState.errors.state && (
            <p className="text-sm text-red-600">
              {addressForm.formState.errors.state.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="address_postal_code">Postal Code</Label>
          <Input
            id="address_postal_code"
            {...addressForm.register("postal_code")}
            placeholder="Enter postal code"
            className="dark:bg-gray-700 dark:text-white"
          />
          {addressForm.formState.errors.postal_code && (
            <p className="text-sm text-red-600">
              {addressForm.formState.errors.postal_code.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="address_country">Country</Label>
          <Input
            id="address_country"
            {...addressForm.register("country")}
            placeholder="Enter country"
            className="dark:bg-gray-700 dark:text-white"
          />
          {addressForm.formState.errors.country && (
            <p className="text-sm text-red-600">
              {addressForm.formState.errors.country.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="address_phone">Phone (Optional)</Label>
          <Input
            id="address_phone"
            {...addressForm.register("phone")}
            placeholder="Enter phone number"
            className="dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
          {address ? "Update Address" : "Add Address"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function AccountSettings({ onBack }: AccountSettingsProps) {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isLoadingRef = useRef(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [activeSection, setActiveSection] = useState("account");
  const [showNotificationSettings, setShowNotificationSettings] =
    useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [darkMode, setDarkMode] = useState<"light" | "dark" | "system">(
    "system"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false); // Declared variable
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarBlobUrl, setAvatarBlobUrl] = useState<string | null>(null);

  // Form hooks
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  // Notification preferences hook
  const { data: preferences, isLoading: preferencesLoading } =
    useUserPreferences();
  const updateNotificationMutation = useUpdateNotificationPreferences();

  // Load avatar - simplified to use public URLs directly
  const loadAvatar = async (avatarUrl: string) => {
    try {
      console.log("Loading avatar from URL:", avatarUrl);

      // If it's an OBS URL (direct cloud storage), use it directly
      if (avatarUrl.includes("ethiofy.obsv3.et-global-1.ethiotelecom.et")) {
        console.log("Using direct OBS URL:", avatarUrl);
        setAvatarBlobUrl(avatarUrl);
        console.log("Avatar blob URL set to:", avatarUrl);
        return;
      }

      // If it's already a localhost public URL, use it directly
      if (avatarUrl.includes("/api/files/public/")) {
        console.log("Using localhost public URL:", avatarUrl);
        setAvatarBlobUrl(avatarUrl);
        return;
      }

      // Extract file ID from localhost proxy URL and convert to public URL
      let fileId = null;
      if (avatarUrl.includes("/api/files/")) {
        const match = avatarUrl.match(/\/api\/files\/([^/]+)/);
        if (match) {
          fileId = match[1];
        }
      }

      if (fileId) {
        const publicUrl = `http://localhost:3005/api/files/public/${fileId}`;
        console.log("Using converted public URL:", publicUrl);
        setAvatarBlobUrl(publicUrl);
      } else {
        // Fallback to direct URL
        console.log("Using direct URL as fallback:", avatarUrl);
        setAvatarBlobUrl(avatarUrl);
      }
    } catch (error) {
      console.error("Failed to load avatar:", error);
      // Fallback to direct URL
      setAvatarBlobUrl(avatarUrl);
    }
  };

  // Load profile data
  const loadProfile = useCallback(async () => {
    if (isLoadingRef.current) return; // Prevent multiple simultaneous calls

    try {
      isLoadingRef.current = true;
      setLoading(true);

      // Try to get profile from API
      try {
        const response = await userService.getProfile();

        console.log(" Full API response:", response);
        console.log("Addresses in response:", response.addresses);

        // Ensure preferences have default values if missing
        const profileWithDefaults = {
          ...response,
          preferences: {
            notifications: {
              email: response.preferences?.notifications?.email ?? true,
              sms: response.preferences?.notifications?.sms ?? false,
              push: response.preferences?.notifications?.push ?? true,
              marketing:
                response.preferences?.notifications?.marketing ?? false,
            },
            currency: response.preferences?.currency ?? "USD",
            measurement_unit:
              response.preferences?.measurement_unit ?? "metric",
            ...response.preferences,
          },
        };

        // Flatten the profile structure for easier access
        const flattenedProfile = {
          ...profileWithDefaults,
          first_name:
            profileWithDefaults.first_name ||
            profileWithDefaults.profile?.first_name,
          last_name:
            profileWithDefaults.last_name ||
            profileWithDefaults.profile?.last_name,
          avatar_url:
            profileWithDefaults.avatar_url ||
            profileWithDefaults.profile?.avatar_url,
          phone:
            profileWithDefaults.phone || profileWithDefaults.profile?.phone,
          company:
            profileWithDefaults.company || profileWithDefaults.profile?.company,
          timezone:
            profileWithDefaults.timezone ||
            profileWithDefaults.profile?.timezone,
          language:
            profileWithDefaults.language ||
            profileWithDefaults.profile?.language,
          date_of_birth:
            profileWithDefaults.date_of_birth ||
            profileWithDefaults.profile?.date_of_birth,
          // Ensure addresses are preserved
          addresses: profileWithDefaults.addresses || [],
        };

        setProfile(flattenedProfile);
        console.log(" Flattened profile:", flattenedProfile);
        console.log(
          " Profile loaded with preferences:",
          profileWithDefaults.preferences
        );

        console.log(" Checking addresses in response:", {
          exists: !!response.addresses,
          isArray: Array.isArray(response.addresses),
          length: response.addresses?.length,
          data: response.addresses,
        });

        // Extract addresses from response - handle both direct and nested structures
        let addressesToSet: Address[] = [];

        if (
          response.user?.addresses &&
          Array.isArray(response.user.addresses) &&
          response.user.addresses.length > 0
        ) {
          console.log(
            " Loading addresses from response.user.addresses:",
            response.user.addresses
          );
          addressesToSet = response.user.addresses as Address[];
        } else {
          console.log(" No addresses found in response.user.addresses");
          addressesToSet = [];
        }

        console.log(" Setting addresses to state:", addressesToSet);
        setAddresses(addressesToSet);

        const avatarUrl = response.user?.profile?.avatar_url;
        console.log(
          " Avatar URL from response.user.profile.avatar_url:",
          avatarUrl
        );
        if (avatarUrl) {
          console.log(" Loading avatar from profile:", avatarUrl);
          loadAvatar(avatarUrl);
        }

        // Populate form with existing data - check both direct fields and profile object
        const profileData = response.profile || {};
        console.log(" Form data population:", {
          response_first_name: response.first_name,
          profile_first_name: profileData.first_name,
          response_avatar: response.avatar_url,
          profile_avatar: profileData.avatar_url,
        });
        profileForm.reset({
          first_name: response.first_name || profileData.first_name || "",
          last_name: response.last_name || profileData.last_name || "",
          phone: response.phone || profileData.phone || "",
          company: response.company || profileData.company || "",
          date_of_birth:
            response.date_of_birth || profileData.date_of_birth || "",
          timezone: response.timezone || profileData.timezone || "",
          language: response.language || profileData.language || "en",
        });
      } catch (error) {
        // If profile API fails, show error and don't create mock data
        console.error(" Profile API error:", error);
        toast.error("Failed to load profile data");
        setProfile(null);
        setAddresses([]);
      }
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [profileForm]);

  // Load profile data on mount
  useEffect(() => {
    if (!profile) {
      loadProfile();
    }
  }, [loadProfile, profile]);

  // Load dark mode preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as
      | "light"
      | "dark"
      | "system"
      | null;
    if (savedTheme) {
      setDarkMode(savedTheme);
      // Apply the theme immediately
      const root = document.documentElement;
      root.classList.remove("light", "dark");

      if (savedTheme === "system") {
        const systemPrefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        root.classList.add(systemPrefersDark ? "dark" : "light");
      } else {
        root.classList.add(savedTheme);
      }
    } else {
      // Default to system preference if no saved theme
      setDarkMode("system");
      const root = document.documentElement;
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      root.classList.remove("light", "dark");
      root.classList.add(systemPrefersDark ? "dark" : "light");
    }
  }, []);

  // Handle dark mode changes
  const handleDarkModeChange = (mode: "light" | "dark" | "system") => {
    setDarkMode(mode);
    localStorage.setItem("theme", mode);

    const root = document.documentElement;
    root.classList.remove("light", "dark");

    if (mode === "system") {
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      root.classList.add(systemPrefersDark ? "dark" : "light");
    } else {
      root.classList.add(mode);
    }

    // Force a re-render to update the UI
    setTimeout(() => {
      window.dispatchEvent(new Event("storage"));
    }, 0);
  };

  // Monitor avatarBlobUrl changes
  useEffect(() => {
    console.log("Avatar blob URL changed:", avatarBlobUrl);
  }, [avatarBlobUrl]);

  // Monitor addresses changes
  useEffect(() => {
    console.log("Addresses state changed:", addresses);
  }, [addresses]);

  // Clean up avatar blob URL on unmount
  useEffect(() => {
    return () => {
      if (avatarBlobUrl && avatarBlobUrl.startsWith("blob:")) {
        URL.revokeObjectURL(avatarBlobUrl);
      }
    };
  }, [avatarBlobUrl]);

  // Handle avatar upload
  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);

      // Check for valid authentication
      const token = localStorage.getItem("access_token");

      if (!token || token === "null" || token === "undefined") {
        toast.error("Authentication required. Please log in again.");
        window.location.href = "/auth/login";
        return;
      }

      console.log("Token found, proceeding with upload");

      // Validate file type and size
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      if (!user?.id) {
        console.warn("User ID not available, using fallback");
      }

      // Create FormData with just the file - the endpoint handles everything else
      const formData = new FormData();
      formData.append("file", file); // Field name MUST be 'file'

      // Use the dedicated avatar upload endpoint
      const response = await fetch(
        "http://localhost:3005/api/files/upload/avatar",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (result.success) {
        // Avatar uploaded and user profile automatically updated
        // Use the direct OBS URL instead of the localhost proxy
        const directUrl = result.data.url; // This is the actual OBS URL
        const proxyUrl = result.data.avatar_url; // This is the localhost proxy

        console.log("Avatar upload successful!");
        console.log("Direct OBS URL:", directUrl);
        console.log("Proxy URL:", proxyUrl);

        // IMPORTANT: We should use the direct OBS URL, but the backend is saving the proxy URL
        // For now, we'll use the direct URL for display, but we need to fix the backend
        const avatarUrl = directUrl; // Prefer direct URL

        // TODO: Backend fix needed - the avatar upload endpoint should save the direct OBS URL
        // instead of the localhost proxy URL in the user profile

        setProfile((prev) =>
          prev
            ? {
                ...prev,
                avatar_url: avatarUrl,
                profile: {
                  ...prev.profile,
                  avatar_url: avatarUrl,
                },
              }
            : null
        );

        // Load the new avatar using the direct URL
        if (avatarUrl) {
          console.log("Loading avatar with URL:", avatarUrl);
          setAvatarBlobUrl(avatarUrl); // Use direct URL, no need for loadAvatar processing
        }

        toast.success("Avatar updated successfully");
      } else {
        throw new Error(
          result.error?.message || result.message || "Upload failed"
        );
      }
    } catch (error: any) {
      console.error("Avatar upload error:", error);

      // Handle authentication errors
      if (
        error.message?.includes("401") ||
        error.message?.includes("Unauthorized")
      ) {
        await logout(); // Use the logout function from useAuth hook
        toast.error("Session expired. Please log in again.");
        return;
      }

      toast.error(error.message || "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handle profile form submission
  const onSubmitProfile = async (data: ProfileFormData) => {
    try {
      // Filter out empty optional fields
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([key, value]) => {
          if (key === "first_name" || key === "last_name") return true; // Required fields
          return value && value.trim() !== ""; // Only include non-empty optional fields
        })
      );

      await userService.updateProfile(cleanData);

      // Update local state instead of reloading from API
      if (profile) {
        setProfile({
          ...profile,
          ...cleanData,
          profile: {
            ...profile.profile,
            ...cleanData,
          },
        });
      }

      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  // Handle password form submission
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

  // Load addresses
  const loadAddresses = async () => {
    try {
      // Get addresses from the profile since there's no separate addresses endpoint
      const profileData = await userService.getProfile();
      if (profileData.addresses) {
        setAddresses(profileData.addresses as Address[]);
      }
    } catch (error) {
      console.error("Failed to load addresses:", error);
    }
  };

  // Add address
  const addAddress = async (addressData: Omit<Address, "id">) => {
    try {
      await userService.addAddress(addressData);
      await loadProfile(); // Reload entire profile including addresses
      toast.success("Address added successfully");
      setShowAddressForm(false);
      setEditingAddress(null); // Reset editing state
      passwordForm.reset(); // Reset password form as well just in case
    } catch (error: any) {
      toast.error(error.message || "Failed to add address");
    }
  };

  // Update address
  const updateAddress = async (
    addressId: string,
    addressData: Omit<Address, "id">
  ) => {
    try {
      await userService.updateAddress(addressId, addressData);
      await loadProfile(); // Reload entire profile including addresses
      toast.success("Address updated successfully");
      setEditingAddress(null);
      setShowAddressForm(false);
    } catch (error: unknown) {
      toast.error(error.message || "Failed to update address");
    }
  };

  // Delete address
  const deleteAddress = async (addressId: string) => {
    try {
      await userService.deleteAddress(addressId);
      await loadProfile(); // Reload entire profile including addresses
      toast.success("Address deleted successfully");
    } catch (error: unknown) {
      toast.error(error.message || "Failed to delete address");
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
    } catch {
      toast.error("Failed to deactivate account");
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  // Handle notification toggle
  const handleNotificationToggle = async (type: string, enabled: boolean) => {
    try {
      const currentNotifications = profile?.preferences?.notifications || {
        email: true,
        sms: false,
        push: true,
        marketing: false,
      };

      const updatedNotifications = {
        ...currentNotifications,
        [type]: enabled,
      };

      await updateNotificationMutation.mutateAsync(updatedNotifications);

      // Update local state
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              preferences: {
                ...prev.preferences,
                notifications: updatedNotifications,
              },
            }
          : null
      );

      toast.success("Notification preferences updated");
    } catch (error) {
      toast.error("Failed to update notification preferences");
    }
  };

  // Handle address form submission
  const onSubmitAddress = async (data: AddressFormData) => {
    if (editingAddress) {
      await updateAddress(editingAddress.id, data);
    } else {
      await addAddress(data);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Account Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account preferences and settings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <Button
                variant={activeSection === "account" ? "secondary" : "ghost"}
                className="h-auto w-full justify-start px-3 py-2 text-left dark:text-gray-300 dark:hover:bg-gray-700"
                onClick={() => setActiveSection("account")}
              >
                <User className="mr-3 h-4 w-4" />
                My Profile
              </Button>
              <Button
                variant={
                  activeSection === "notifications" ? "secondary" : "ghost"
                }
                className="h-auto w-full justify-start px-3 py-2 text-left dark:text-gray-300 dark:hover:bg-gray-700"
                onClick={() => setActiveSection("notifications")}
              >
                <Bell className="mr-3 h-4 w-4" />
                Notifications
              </Button>
              <Button
                variant={activeSection === "addresses" ? "secondary" : "ghost"}
                className="h-auto w-full justify-start px-3 py-2 text-left dark:text-gray-300 dark:hover:bg-gray-700"
                onClick={() => setActiveSection("addresses")}
              >
                <MapPin className="mr-3 h-4 w-4" />
                Addresses
              </Button>
              <Button
                variant={activeSection === "system" ? "secondary" : "ghost"}
                className="h-auto w-full justify-start px-3 py-2 text-left dark:text-gray-300 dark:hover:bg-gray-700"
                onClick={() => setActiveSection("system")}
              >
                <Settings className="mr-3 h-4 w-4" />
                System Settings
              </Button>
              <Button
                variant={activeSection === "danger" ? "secondary" : "ghost"}
                className="h-auto w-full justify-start px-3 py-2 text-left dark:text-gray-300 dark:hover:bg-gray-700"
                onClick={() => setActiveSection("danger")}
              >
                <LogOut className="mr-3 h-4 w-4" />
                Danger Zone
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Profile Section */}
          {activeSection === "account" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  My Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                      {console.log("Avatar render check:", {
                        avatarBlobUrl,
                        profile: profile?.profile?.first_name,
                      })}
                      {avatarBlobUrl ? (
                        <img
                          src={avatarBlobUrl || "/placeholder.svg"}
                          alt="Profile"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            console.error(
                              "Image failed to load:",
                              avatarBlobUrl
                            );
                            console.error("Error event:", e);
                            // Clear the avatar URL so fallback is shown
                            setAvatarBlobUrl(null);
                          }}
                          onLoad={() => {
                            console.log(
                              "Image loaded successfully:",
                              avatarBlobUrl
                            );
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          {profile?.first_name ? (
                            <span className="text-2xl font-semibold text-purple-600">
                              {profile.first_name.charAt(0).toUpperCase()}
                            </span>
                          ) : user?.first_name ? (
                            <span className="text-2xl font-semibold text-purple-600">
                              {user.first_name.charAt(0).toUpperCase()}
                            </span>
                          ) : user?.email ? (
                            <span className="text-2xl font-semibold text-purple-600">
                              {user.email.charAt(0).toUpperCase()}
                            </span>
                          ) : (
                            <User className="h-8 w-8 text-purple-600" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <Button
                        size="sm"
                        className="bg-gray-900 text-white hover:bg-gray-800"
                        onClick={() =>
                          document.getElementById("avatar-upload")?.click()
                        }
                        disabled={uploadingAvatar}
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        {uploadingAvatar ? "Uploading..." : "Change Image"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            // Check if there's actually an avatar to remove
                            const hasAvatar =
                              avatarBlobUrl ||
                              profile?.avatar_url ||
                              profile?.profile?.avatar_url;

                            if (!hasAvatar) {
                              toast.success("No avatar to remove");
                              return;
                            }

                            await userService.removeAvatar(); // Call the service to remove avatar
                            setAvatarBlobUrl(null); // Clear local avatar URL
                            setProfile((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    avatar_url: null,
                                    profile: {
                                      ...prev.profile,
                                      avatar_url: null,
                                    },
                                  }
                                : null
                            );
                            toast.success("Avatar removed successfully");
                          } catch (error: any) {
                            // Handle specific error messages
                            const errorMessage =
                              error?.message ||
                              error?.toString() ||
                              "Unknown error";

                            if (
                              errorMessage.includes("No avatar to remove") ||
                              errorMessage.includes("not found")
                            ) {
                              // Clear local state even if backend says no avatar
                              setAvatarBlobUrl(null);
                              setProfile((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      avatar_url: null,
                                      profile: {
                                        ...prev.profile,
                                        avatar_url: null,
                                      },
                                    }
                                  : null
                              );
                              toast.success("Avatar cleared successfully");
                            } else {
                              toast.error(
                                `Failed to remove avatar: ${errorMessage}`
                              );
                            }
                          }
                        }}
                        disabled={
                          !avatarBlobUrl &&
                          !profile?.avatar_url &&
                          !profile?.profile?.avatar_url
                        } // Disable if no avatar exists
                      >
                        Remove Image
                      </Button>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      We support PNG, JPEG and GIF under 2MB
                    </p>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Profile Form */}
                <form
                  onSubmit={profileForm.handleSubmit(onSubmitProfile)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        {...profileForm.register("first_name")}
                        placeholder="Enter your first name"
                        className="dark:bg-gray-700 dark:text-white"
                      />
                      {profileForm.formState.errors.first_name && (
                        <p className="text-sm text-red-600">
                          {profileForm.formState.errors.first_name.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        {...profileForm.register("last_name")}
                        placeholder="Enter your last name"
                        className="dark:bg-gray-700 dark:text-white"
                      />
                      {profileForm.formState.errors.last_name && (
                        <p className="text-sm text-red-600">
                          {profileForm.formState.errors.last_name.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        {...profileForm.register("phone")}
                        placeholder="Enter your phone number"
                        className="dark:bg-gray-700 dark:text-white"
                      />
                      {profileForm.formState.errors.phone && (
                        <p className="text-sm text-red-600">
                          {profileForm.formState.errors.phone.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        {...profileForm.register("company")}
                        placeholder="Enter your company name"
                        className="dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="date_of_birth">Date of Birth</Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        {...profileForm.register("date_of_birth")}
                        className="dark:bg-gray-700 dark:text-white"
                      />
                      {profileForm.formState.errors.date_of_birth && (
                        <p className="text-sm text-red-600">
                          {profileForm.formState.errors.date_of_birth.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Input
                        id="timezone"
                        {...profileForm.register("timezone")}
                        placeholder="Enter your timezone"
                        className="dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Save Changes
                  </Button>
                </form>

                {/* Password Change Section */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Password</h3>
                      <p className="text-sm text-gray-600">
                        Change your account password
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowPasswordForm(!showPasswordForm)}
                    >
                      {showPasswordForm ? "Cancel" : "Change Password"}
                    </Button>
                  </div>

                  {showPasswordForm && (
                    <form
                      onSubmit={passwordForm.handleSubmit(onChangePassword)}
                      className="mt-4 space-y-4"
                    >
                      <div>
                        <Label htmlFor="current_password">
                          Current Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="current_password"
                            type={showCurrentPassword ? "text" : "password"}
                            {...passwordForm.register("current_password")}
                            placeholder="Enter your current password"
                            className="dark:bg-gray-700 dark:text-white"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {passwordForm.formState.errors.current_password && (
                          <p className="text-sm text-red-600">
                            {
                              passwordForm.formState.errors.current_password
                                .message
                            }
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="new_password">New Password</Label>
                        <div className="relative">
                          <Input
                            id="new_password"
                            type={showNewPassword ? "text" : "password"}
                            {...passwordForm.register("new_password")}
                            placeholder="Enter your new password"
                            className="dark:bg-gray-700 dark:text-white"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {passwordForm.formState.errors.new_password && (
                          <p className="text-sm text-red-600">
                            {passwordForm.formState.errors.new_password.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="confirm_password">
                          Confirm New Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirm_password"
                            type={showConfirmPassword ? "text" : "password"}
                            {...passwordForm.register("confirm_password")}
                            placeholder="Confirm your new password"
                            className="dark:bg-gray-700 dark:text-white"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {passwordForm.formState.errors.confirm_password && (
                          <p className="text-sm text-red-600">
                            {
                              passwordForm.formState.errors.confirm_password
                                .message
                            }
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Change Password
                      </Button>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "notifications" && (
            <NotificationSettings
              notifications={
                profile?.preferences?.notifications || {
                  email: true,
                  sms: false,
                  push: true,
                  marketing: false,
                }
              }
              onToggle={handleNotificationToggle}
              isLoading={updateNotificationMutation.isPending}
            />
          )}

          {activeSection === "addresses" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
                      <MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <CardTitle className="text-xl">Addresses</CardTitle>
                  </div>
                  <Button
                    onClick={() => {
                      setEditingAddress(null);
                      setShowAddressForm(true);
                    }}
                    className="bg-purple-600 text-white hover:bg-purple-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Address
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showAddressForm ? (
                  <div className="space-y-4">
                    <div className="mb-4 flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowAddressForm(false);
                          setEditingAddress(null);
                        }}
                        className="text-gray-600 dark:text-gray-400"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Addresses
                      </Button>
                    </div>
                    <AddressForm
                      address={editingAddress}
                      onSubmit={onSubmitAddress}
                      onCancel={() => {
                        setShowAddressForm(false);
                        setEditingAddress(null);
                      }}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {addresses.length === 0 ? (
                      <div className="flex flex-col items-center justify-center px-4 py-16">
                        <div className="mb-6 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 p-6 dark:from-purple-900/30 dark:to-purple-900/10">
                          <MapPin className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                          No addresses added yet
                        </h3>
                        <p className="mb-8 max-w-sm text-center leading-relaxed text-gray-600 dark:text-gray-400">
                          Add your first address to get started with faster
                          checkout and deliveries
                        </p>
                        <Button
                          onClick={() => {
                            setEditingAddress(null);
                            setShowAddressForm(true);
                          }}
                          className="bg-purple-600 text-white hover:bg-purple-700"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Your First Address
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                          {addresses.length} address
                          {addresses.length !== 1 ? "es" : ""} saved
                        </p>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                          {addresses.map((address) => (
                            <AddressCard
                              key={address.id}
                              address={address}
                              onEdit={(addr) => {
                                setEditingAddress(addr);
                                setShowAddressForm(true);
                              }}
                              onDelete={deleteAddress}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeSection === "system" && (
            <div className="space-y-6">
              {/* Theme Settings Card */}
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    System Settings
                  </CardTitle>
                  <CardDescription>
                    Customize your app experience and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Theme Section */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        Theme
                      </h3>
                      <div className="grid gap-3">
                        {/* Light Mode */}
                        <div
                          className={`group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                            darkMode === "light"
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                          }`}
                          onClick={() => handleDarkModeChange("light")}
                        >
                          <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-4">
                              <div
                                className={`rounded-full p-2 ${
                                  darkMode === "light"
                                    ? "bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300"
                                    : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                                }`}
                              >
                                <Sun className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  Light Mode
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Use light theme
                                </p>
                              </div>
                            </div>
                            <div
                              className={`rounded-full px-3 py-1 text-sm font-medium ${
                                darkMode === "light"
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {darkMode === "light" ? "Active" : "Select"}
                            </div>
                          </div>
                          {darkMode === "light" && (
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                          )}
                        </div>

                        {/* Dark Mode */}
                        <div
                          className={`group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                            darkMode === "dark"
                              ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                              : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                          }`}
                          onClick={() => handleDarkModeChange("dark")}
                        >
                          <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-4">
                              <div
                                className={`rounded-full p-2 ${
                                  darkMode === "dark"
                                    ? "bg-purple-100 text-purple-600 dark:bg-purple-800 dark:text-purple-300"
                                    : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                                }`}
                              >
                                <Moon className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  Dark Mode
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Use dark theme
                                </p>
                              </div>
                            </div>
                            <div
                              className={`rounded-full px-3 py-1 text-sm font-medium ${
                                darkMode === "dark"
                                  ? "bg-purple-500 text-white"
                                  : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {darkMode === "dark" ? "Active" : "Select"}
                            </div>
                          </div>
                          {darkMode === "dark" && (
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-purple-400 to-purple-600"></div>
                          )}
                        </div>

                        {/* System Mode */}
                        <div
                          className={`group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                            darkMode === "system"
                              ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                              : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                          }`}
                          onClick={() => handleDarkModeChange("system")}
                        >
                          <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-4">
                              <div
                                className={`rounded-full p-2 ${
                                  darkMode === "system"
                                    ? "bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-300"
                                    : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                                }`}
                              >
                                <Monitor className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  System
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Use system preference
                                </p>
                              </div>
                            </div>
                            <div
                              className={`rounded-full px-3 py-1 text-sm font-medium ${
                                darkMode === "system"
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {darkMode === "system" ? "Active" : "Select"}
                            </div>
                          </div>
                          {darkMode === "system" && (
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-green-400 to-green-600"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Language & Region Card */}
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-700">
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Language & Region
                  </CardTitle>
                  <CardDescription>
                    Set your preferred language and regional settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="language"
                        className="text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Language
                      </Label>
                      <select
                        id="language"
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                        defaultValue="en"
                      >
                        <option value="en">English</option>
                        <option value="am">አማርኛ (Amharic)</option>
                        <option value="or">Oromiffa</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="currency"
                        className="text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Currency
                      </Label>
                      <select
                        id="currency"
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                        defaultValue="ETB"
                      >
                        <option value="ETB">Ethiopian Birr (ETB)</option>
                        <option value="USD">US Dollar (USD)</option>
                        <option value="EUR">Euro (EUR)</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "danger" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <LogOut className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logout */}
                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700 dark:bg-gray-800">
                  <div>
                    <h3 className="font-medium">Logout</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Sign out of your account
                    </p>
                  </div>
                  <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>

                {/* Account Deactivation */}
                <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/30">
                  <div>
                    <h3 className="font-medium text-red-600">
                      Deactivate Account
                    </h3>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      Permanently deactivate your account. This action cannot be
                      undone.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={handleDeactivateAccount}
                  >
                    Deactivate
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Notification Settings Component
function NotificationSettings({
  notifications,
  onToggle,
  isLoading,
}: {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
  };
  onToggle: (type: string, enabled: boolean) => void;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium">Email Notifications</Label>
            <p className="text-sm text-gray-600">
              Receive notifications via email
            </p>
          </div>
          <Switch
            checked={notifications.email}
            onCheckedChange={(checked) => onToggle("email", checked)}
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium">SMS Notifications</Label>
            <p className="text-sm text-gray-600">
              Receive notifications via SMS
            </p>
          </div>
          <Switch
            checked={notifications.sms}
            onCheckedChange={(checked) => onToggle("sms", checked)}
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium">Push Notifications</Label>
            <p className="text-sm text-gray-600">
              Receive push notifications in your browser
            </p>
          </div>
          <Switch
            checked={notifications.push}
            onCheckedChange={(checked) => onToggle("push", checked)}
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium">
              Marketing Communications
            </Label>
            <p className="text-sm text-gray-600">
              Receive marketing emails and promotions
            </p>
          </div>
          <Switch
            checked={notifications.marketing}
            onCheckedChange={(checked) => onToggle("marketing", checked)}
            disabled={isLoading}
          />
        </div>
      </CardContent>
    </Card>
  );
}
