import { api } from "@/lib/api";

export interface ApiUser {
  user_id: string;
  email: string;
  role: "customer" | "merchant" | "print_provider" | "admin";
  profile?: {
    first_name?: string;
    last_name?: string;
    timezone?: string;
    language?: string;
  };
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
  metadata?: {
    login_count?: number;
    registration_source?: string;
    last_login?: string;
  };
  _id?: string;
  email_verified?: boolean;
  status?: string;
  addresses?: any[];
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
  profile?: ApiUser["profile"];
  preferences?: ApiUser["preferences"];
  metadata?: ApiUser["metadata"];
  email_verified?: boolean;
  status?: string;
}

// Transform API user to our User interface
function transformApiUser(apiUser: ApiUser): User {
  return {
    id: apiUser.user_id,
    email: apiUser.email,
    role: apiUser.role,
    name: apiUser.profile
      ? `${apiUser.profile.first_name || ""} ${apiUser.profile.last_name || ""}`.trim()
      : undefined,
    first_name: apiUser.profile?.first_name,
    last_name: apiUser.profile?.last_name,
    profile: apiUser.profile,
    preferences: apiUser.preferences,
    metadata: apiUser.metadata,
    email_verified: apiUser.email_verified,
    status: apiUser.status,
  };
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

  async login(
    credentials: LoginRequest
  ): Promise<{
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

  async register(
    userData: RegisterRequest
  ): Promise<{
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
      const response = await api.get<ApiResponse<ApiUser>>("/auth/me", {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (response.data.success && response.data.data) {
        return transformApiUser(response.data.data);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Try to refresh token
        const newToken = await this.refreshAccessToken();
        if (newToken) {
          // Retry with new token
          return this.getCurrentUser();
        }
      }
      console.error("Get current user failed:", error);
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
    } catch (error: any) {
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
    } catch (error: any) {
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
    } catch (error: any) {
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

  private clearTokens(): void {
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
