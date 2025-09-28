import { api } from "@/lib/api";

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: "customer" | "merchant" | "print_provider";
  avatar_url?: string;
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
      const response = await api.put<ApiResponse<UserPreferences>>(
        "/users/preferences",
        data
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || "Failed to update preferences"
        );
      }

      return response.data.data;
    } catch (error: any) {
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
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to change password"
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
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to deactivate account"
      );
    }
  }
}
