import { api } from "@/lib/api";

export interface ApiUser {
  id?: string;
  user_id?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: "customer" | "merchant" | "print_provider" | "admin";
  avatar_url?: string;
  timezone?: string;
  language?: string;
  preferences?: {
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
      marketing?: boolean;
    };
    currency?: string;
    measurement_unit?: string;
  };
  addresses?: any[];
  profile?: {
    first_name?: string;
    last_name?: string;
    timezone?: string;
    language?: string;
  };
  metadata?: {
    login_count?: number;
    registration_source?: string;
    last_login?: string;
  };
  _id?: string;
  email_verified?: boolean;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  email: string;
  role: "customer" | "merchant" | "print_provider" | "admin";
  name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  timezone?: string;
  language?: string;
  profile?: ApiUser["profile"];
  preferences?: ApiUser["preferences"];
  metadata?: ApiUser["metadata"];
  addresses?: any[];
  email_verified?: boolean;
  status?: string;
}

// Transform API user to our User interface
function transformApiUser(apiUser: ApiUser): User {
  console.log("transformApiUser: Input apiUser:", apiUser);

  // Use direct fields first, then fallback to profile fields
  const firstName = apiUser.first_name || apiUser.profile?.first_name;
  const lastName = apiUser.last_name || apiUser.profile?.last_name;

  const transformed = {
    id: apiUser.id || apiUser.user_id || apiUser._id || "",
    email: apiUser.email,
    role: apiUser.role,
    name:
      firstName && lastName
        ? `${firstName} ${lastName}`.trim()
        : firstName || lastName || undefined,
    first_name: firstName,
    last_name: lastName,
    phone: apiUser.phone,
    avatar_url: apiUser.avatar_url,
    timezone: apiUser.timezone || apiUser.profile?.timezone,
    language: apiUser.language || apiUser.profile?.language,
    profile: apiUser.profile,
    preferences: apiUser.preferences,
    metadata: apiUser.metadata,
    addresses: apiUser.addresses,
    email_verified: apiUser.email_verified,
    status: apiUser.status,
  };

  console.log("transformApiUser: Output transformed:", transformed);
  return transformed;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirm_password: string;
  role?: "customer" | "merchant" | "print_provider";
  first_name?: string;
  last_name?: string;
  terms_accepted: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: ApiUser;
    tokens: AuthTokens;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export class AuthService {
  private static instance: AuthService;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  constructor() {
    // Load tokens from localStorage on initialization
    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("access_token");
      this.refreshToken = localStorage.getItem("refresh_token");
    }
  }

  async login(credentials: LoginRequest): Promise<{
    success: boolean;
    message: string;
    data: { user: User; tokens: AuthTokens };
  }> {
    try {
      const response = await api.post<AuthResponse>("/auth/login", credentials);

      if (response.data.success) {
        this.setTokens(response.data.data.tokens);
        return {
          success: response.data.success,
          message: response.data.message,
          data: {
            user: transformApiUser(response.data.data.user),
            tokens: response.data.data.tokens,
          },
        };
      }

      return {
        success: false,
        message: response.data.message,
        data: {
          user: transformApiUser(response.data.data.user),
          tokens: response.data.data.tokens,
        },
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  }

  async register(userData: RegisterRequest): Promise<{
    success: boolean;
    message: string;
    data: { user: User; tokens: AuthTokens };
  }> {
    try {
      const response = await api.post<AuthResponse>("/auth/register", userData);

      if (response.data.success) {
        this.setTokens(response.data.data.tokens);
        return {
          success: response.data.success,
          message: response.data.message,
          data: {
            user: transformApiUser(response.data.data.user),
            tokens: response.data.data.tokens,
          },
        };
      }

      return {
        success: false,
        message: response.data.message,
        data: {
          user: transformApiUser(response.data.data.user),
          tokens: response.data.data.tokens,
        },
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.accessToken) {
        await api.post(
          "/auth/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
          }
        );
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.clearTokens();
    }
  }

  async refreshAccessToken(): Promise<string | null> {
    if (!this.refreshToken) {
      return null;
    }

    try {
      const response = await api.post<ApiResponse<AuthTokens>>(
        "/auth/refresh-token",
        {
          refresh_token: this.refreshToken,
        }
      );

      if (response.data.success && response.data.data) {
        this.setTokens(response.data.data);
        return response.data.data.access_token;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      this.clearTokens();
    }

    return null;
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.accessToken) {
      return null;
    }

    try {
      const response = await api.get<ApiResponse<ApiUser>>("/users/profile", {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      console.log("AuthService: Raw API response:", response.data);
      console.log("AuthService: Response success:", response.data.success);
      console.log("AuthService: Response data exists:", !!response.data.data);

      if (response.data.success && response.data.data) {
        // Handle both nested user structure and direct user structure
        const userData = response.data.data.user || response.data.data;
        console.log("AuthService: API user data:", userData);
        console.log("AuthService: API user data keys:", Object.keys(userData));

        // Transform the user data to match our expected structure
        const apiUser: ApiUser = {
          user_id: userData.id || userData.user_id,
          email: userData.email,
          role: userData.role,
          profile: userData.profile,
          preferences: userData.preferences,
          metadata: userData.metadata,
          _id: userData._id,
          email_verified: userData.email_verified,
          status: userData.status,
          addresses: userData.addresses,
          created_at: userData.created_at,
          updated_at: userData.updated_at,
        };

        const transformedUser = transformApiUser(apiUser);
        console.log("AuthService: Transformed user:", transformedUser);
        return transformedUser;
      } else {
        console.log("AuthService: API response not successful or no user data");
        console.log("AuthService: Success:", response.data.success);
        console.log("AuthService: Data:", response.data.data);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Try to refresh token
        console.log("Access token expired, attempting refresh...");
        const newToken = await this.refreshAccessToken();
        if (newToken) {
          // Retry with new token
          console.log(
            "Token refreshed successfully, retrying getCurrentUser..."
          );
          return this.getCurrentUser();
        } else {
          console.log("Token refresh failed, user needs to login again");
        }
      } else {
        console.error("Get current user failed with non-401 error:", error);
        // For non-401 errors, don't clear tokens - could be network issue
        throw error;
      }
    }

    return null;
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      const response = await api.post<ApiResponse>(
        "/auth/password-reset/request",
        {
          email,
        }
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Password reset request failed"
        );
      }
    } catch (error: unknown) {
      throw new Error(
        error.response?.data?.message || "Password reset request failed"
      );
    }
  }

  async resetPassword(
    token: string,
    password: string,
    confirmPassword: string
  ): Promise<void> {
    try {
      const response = await api.post<ApiResponse>(
        "/auth/password-reset/confirm",
        {
          token,
          password,
          confirm_password: confirmPassword,
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Password reset failed");
      }
    } catch (error: unknown) {
      throw new Error(error.response?.data?.message || "Password reset failed");
    }
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      const response = await api.post<ApiResponse>("/auth/verify-email", {
        token,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Email verification failed");
      }
    } catch (error: unknown) {
      throw new Error(
        error.response?.data?.message || "Email verification failed"
      );
    }
  }

  private setTokens(tokens: AuthTokens): void {
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token;

    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", tokens.access_token);
      localStorage.setItem("refresh_token", tokens.refresh_token);
    }
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;

    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }
}
