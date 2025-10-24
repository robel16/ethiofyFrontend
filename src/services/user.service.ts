import { api } from "@/lib/api";

export interface UserProfile {
  user: any;
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: "customer" | "merchant" | "print_provider";
  avatar_url?: string | null;
  timezone?: string;
  language?: string;
  date_of_birth?: string;
  company?: string;
  preferences?: UserPreferences;
  addresses?: Address[];
}

export interface UserPreferences {
  notifications?: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
  };
  currency?: string;
  measurement_unit?: "imperial" | "metric";
}

export interface Address {
  id: string;
  type: "billing" | "shipping";
  first_name: string;
  last_name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  street: string;
  state?: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  timezone?: string;
  language?: string;
  date_of_birth?: string;
  company?: string;
}

export interface UpdatePreferencesRequest {
  notifications?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
    marketing?: boolean;
  };
  currency?: string;
  measurement_unit?: "imperial" | "metric";
}

export interface AddAddressRequest {
  type: "billing" | "shipping";
  first_name: string;
  last_name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  street: string;
  state?: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default?: boolean;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export class UserService {
  private static instance: UserService;

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async getProfile(): Promise<UserProfile> {
    try {
      const response =
        await api.get<ApiResponse<UserProfile>>("/users/profile");

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Failed to get profile");
      }

      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to get profile");
    }
  }

  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    try {
      const response = await api.put<ApiResponse<UserProfile>>(
        "/users/profile",
        data
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Failed to update profile");
      }

      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  }

  async updatePreferences(
    data: UpdatePreferencesRequest
  ): Promise<UserPreferences> {
    try {
      console.log("Calling updatePreferences API with data:", data);

      // Try the preferences endpoint first
      const response = await api.put<ApiResponse<UserPreferences>>(
        "/users/preferences",
        data
      );

      console.log("updatePreferences API response:", response.data);

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || "Failed to update preferences"
        );
      }

      return response.data.data;
    } catch (error: any) {
      console.error("updatePreferences API error:", error);
      console.error("Error response:", error.response?.data);

      // If the preferences endpoint doesn't exist, try updating through profile
      if (error.response?.status === 404) {
        console.log("Preferences endpoint not found, trying profile endpoint");
        try {
          const profileResponse = await api.put<ApiResponse<UserProfile>>(
            "/users/profile",
            { preferences: data }
          );

          if (!profileResponse.data.success || !profileResponse.data.data) {
            throw new Error("Failed to update preferences via profile");
          }

          return profileResponse.data.data.preferences || data;
        } catch (profileError: any) {
          console.error("Profile update also failed:", profileError);
          throw new Error(
            profileError.response?.data?.message ||
              "Failed to update preferences"
          );
        }
      }

      throw new Error(
        error.response?.data?.message || "Failed to update preferences"
      );
    }
  }

  async addAddress(data: AddAddressRequest): Promise<Address> {
    try {
      const response = await api.post<ApiResponse<Address>>(
        "/users/addresses",
        data
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Failed to add address");
      }

      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to add address");
    }
  }

  async updateAddress(
    addressId: string,
    data: Partial<AddAddressRequest>
  ): Promise<Address> {
    try {
      const response = await api.put<ApiResponse<Address>>(
        `/users/addresses/${addressId}`,
        data
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Failed to update address");
      }

      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update address"
      );
    }
  }

  async getUserAddresses(userId: string): Promise<ApiResponse<Address[]>> {
    try {
      const response = await api.get<ApiResponse<Address[]>>(
        `/users/${userId}/addresses`
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to get addresses");
      }

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to get addresses"
      );
    }
  }

  async setDefaultAddress(addressId: string): Promise<void> {
    try {
      const response = await api.put<ApiResponse>(
        `/users/addresses/${addressId}/default`
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to set default address"
        );
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to set default address"
      );
    }
  }

  async deleteAddress(addressId: string): Promise<void> {
    try {
      const response = await api.delete<ApiResponse>(
        `/users/addresses/${addressId}`
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete address");
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to delete address"
      );
    }
  }

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    try {
      const response = await api.put<ApiResponse>("/users/password", data);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to change password");
      }
    } catch (error: unknown) {
      throw new Error(
        error.response?.data?.message || "Failed to change password"
      );
    }
  }

  async removeAvatar(): Promise<void> {
    try {
      // First, get the current user profile to get the avatar URL
      const profile = await this.getProfile();

      if (!profile.avatar_url) {
        throw new Error("No avatar to remove");
      }

      // Extract file ID from avatar URL
      let fileId: string | null = null;

      // Handle different URL formats
      if (profile.avatar_url.includes("/api/files/")) {
        // Extract from localhost proxy URL: /api/files/fileId
        const match = profile.avatar_url.match(/\/api\/files\/([^\/\?]+)/);
        if (match) {
          fileId = match[1];
        }
      } else if (profile.avatar_url.includes("/public/")) {
        // Extract from public URL: /public/fileId
        const match = profile.avatar_url.match(/\/public\/([^\/\?]+)/);
        if (match) {
          fileId = match[1];
        }
      } else if (
        profile.avatar_url.includes("ethiofy.obsv3.et-global-1.ethiotelecom.et")
      ) {
        // For direct OBS URLs, extract the file ID from the path
        const match = profile.avatar_url.match(
          /\/([^\/]+)\.(jpg|jpeg|png|gif|webp)$/i
        );
        if (match) {
          fileId = match[1];
        }
      }

      if (!fileId) {
        throw new Error("Could not extract file ID from avatar URL");
      }

      // Delete the file using the files API
      const deleteResponse = await api.delete<ApiResponse>(`/files/${fileId}`);

      if (!deleteResponse.data.success) {
        throw new Error(
          deleteResponse.data.message || "Failed to delete avatar file"
        );
      }

      // Update the user profile to remove the avatar reference
      await this.updateProfile({ avatar_url: "" });
    } catch (error: unknown) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to remove avatar"
      );
    }
  }

  async deactivateAccount(): Promise<void> {
    try {
      const response = await api.delete<ApiResponse>("/users/account");

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to deactivate account"
        );
      }
    } catch (error: unknown) {
      throw new Error(
        error.response?.data?.message || "Failed to deactivate account"
      );
    }
  }
}

export const userService = UserService.getInstance();
