"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { AuthService, User } from "@/services/auth.service";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    confirm_password: string;
    role?: "customer" | "merchant" | "print_provider";
    first_name?: string;
    last_name?: string;
    terms_accepted: boolean;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authService = AuthService.getInstance();

  useEffect(() => {
    // Check if user is already authenticated on mount
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          console.log("AuthContext: Tokens found, getting current user...");
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            console.log("AuthContext: User data retrieved:", currentUser);
            setUser(currentUser);
          } else {
            // If we can't get user data but have tokens, try one more time after a short delay
            console.log("AuthContext: Unable to get user data, retrying...");
            setTimeout(async () => {
              try {
                const retryUser = await authService.getCurrentUser();
                if (retryUser) {
                  console.log("AuthContext: Retry successful:", retryUser);
                  setUser(retryUser);
                } else {
                  console.log("AuthContext: Retry failed, clearing tokens");
                  authService.clearTokens();
                }
              } catch (retryError) {
                console.error("AuthContext: Retry failed:", retryError);
                authService.clearTokens();
              }
            }, 1000);
          }
        } else {
          console.log("AuthContext: No tokens found, user not authenticated");
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        // Don't immediately clear tokens on first failure - could be network issue
        console.log(
          "Network error during auth initialization, keeping tokens for retry"
        );
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [authService]); // Empty dependency array since we only want this to run once on mount

  // Add a periodic check to see if tokens have been cleared by API interceptor
  useEffect(() => {
    const checkTokens = () => {
      if (user && !authService.isAuthenticated()) {
        console.log("AuthContext: Tokens were cleared, logging out user");
        setUser(null);
      }
    };

    const interval = setInterval(checkTokens, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [user, authService]);

  const login = async (email: string, password: string, rememberMe = false) => {
    setIsLoading(true);
    try {
      const response = await authService.login({
        email,
        password,
        remember_me: rememberMe,
      });

      if (response.success) {
        setUser(response.data.user);
      } else {
        throw new Error(response.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    confirm_password: string;
    role?: "customer" | "merchant" | "print_provider" | "admin";
    first_name?: string;
    last_name?: string;
    terms_accepted: boolean;
  }) => {
    setIsLoading(true);
    try {
      // Filter out admin role for registration as it's not allowed in the API
      const { role, ...registrationData } = userData;
      const allowedRole = role === "admin" ? "customer" : role;

      const response = await authService.register({
        ...registrationData,
        role: allowedRole,
      });

      if (response.success) {
        setUser(response.data.user);
      } else {
        throw new Error(response.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    if (authService.isAuthenticated()) {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to refresh user:", error);
        setUser(null);
      }
    } else {
      // If not authenticated, clear user state
      setUser(null);
    }
  };

  const isAuthenticated = !!user && authService.isAuthenticated();

  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
