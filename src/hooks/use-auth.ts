"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { AuthService } from "@/services/auth.service";
import {
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "@/lib/validations";

export function useAuthActions() {
  const router = useRouter();
  const {
    login: contextLogin,
    register: contextRegister,
    logout: contextLogout,
  } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const authService = AuthService.getInstance();

  const login = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      await contextLogin(data.email, data.password, data.remember_me);
      toast.success("Login successful!");

      // Add a small delay to ensure auth context is updated
      setTimeout(() => {
        router.push("/dashboard");
      }, 100);

      return { success: true };
    } catch (error: any) {
      const message = error.message || "Login failed";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      await contextRegister({
        email: data.email,
        password: data.password,
        confirm_password: data.confirm_password,
        role: data.role,
        first_name: data.first_name,
        last_name: data.last_name,
        terms_accepted: data.terms_accepted,
      });
      toast.success("Registration successful!");
      router.push("/dashboard");
      return { success: true };
    } catch (error: any) {
      const message = error.message || "Registration failed";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await contextLogout();
      toast.success("Logged out successfully");
      router.push("/");
      return { success: true };
    } catch (error: any) {
      toast.error("Logout failed");
      return { success: false, error: "Logout failed" };
    }
  };

  const forgotPassword = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    try {
      await authService.requestPasswordReset(data.email);
      toast.success("Password reset email sent!");
      return { success: true };
    } catch (error: any) {
      const message = error.message || "Failed to send reset email";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (data: ResetPasswordInput) => {
    setIsLoading(true);
    try {
      await authService.resetPassword(
        data.token,
        data.password,
        data.confirm_password
      );
      toast.success("Password reset successful! Please login.");
      router.push("/auth/login");
      return { success: true };
    } catch (error: any) {
      const message = error.message || "Password reset failed";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (token: string) => {
    setIsLoading(true);
    try {
      await authService.verifyEmail(token);
      toast.success("Email verified successfully!");
      return { success: true };
    } catch (error: any) {
      const message = error.message || "Email verification failed";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    isLoading,
  };
}

export { useAuth };
